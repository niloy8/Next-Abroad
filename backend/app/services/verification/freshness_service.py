from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.scholarship import Scholarship
from app.models.university import University, Program
from app.models.enums import OpportunityStatus
from app.schemas.admin import FreshnessReportResponse, FreshnessAuditItem


class FreshnessService:
    @staticmethod
    async def audit_data_freshness(db: AsyncSession) -> FreshnessReportResponse:
        """
        Scans all scholarships and programs to detect stale records (>30 days since verification)
        and expired application deadlines.
        """
        now = datetime.utcnow()
        thirty_days_ago = now - timedelta(days=30)
        today_str = now.strftime("%Y-%m-%d")

        # Query scholarships
        res_sch = await db.execute(select(Scholarship))
        scholarships = res_sch.scalars().all()

        total = len(scholarships)
        fresh_count = 0
        stale_count = 0
        expired_count = 0
        items_needing_review: List[FreshnessAuditItem] = []

        for s in scholarships:
            days = (now - s.last_verified_at).days if s.last_verified_at else 999
            
            # Check deadline expiry
            is_deadline_passed = False
            if s.application_deadline and s.application_deadline < today_str:
                is_deadline_passed = True
                if s.status != OpportunityStatus.EXPIRED:
                    s.status = OpportunityStatus.EXPIRED
                    s.status_reason = f"Application deadline ({s.application_deadline}) has passed for current intake."
                    db.add(s)

            if s.status == OpportunityStatus.EXPIRED or is_deadline_passed:
                expired_count += 1
            elif days > 30:
                stale_count += 1
            else:
                fresh_count += 1

            needs_recheck = days > 30 or is_deadline_passed
            if needs_recheck:
                items_needing_review.append(
                    FreshnessAuditItem(
                        id=s.id,
                        type="scholarship",
                        name=s.name,
                        source_url=s.official_application_url,
                        last_verified_at=s.last_verified_at,
                        days_since_verification=days,
                        status=s.status,
                        needs_recheck=needs_recheck,
                    )
                )

        await db.commit()

        return FreshnessReportResponse(
            total_records=total,
            fresh_count=fresh_count,
            stale_count=stale_count,
            expired_count=expired_count,
            items_needing_review=items_needing_review[:20],
        )

    @staticmethod
    async def recheck_source(db: AsyncSession, scholarship_id: int) -> bool:
        """Updates verification timestamp and checks freshness."""
        result = await db.execute(select(Scholarship).where(Scholarship.id == scholarship_id))
        sch = result.scalar_one_or_none()
        if not sch:
            return False

        sch.last_verified_at = datetime.utcnow()
        today_str = datetime.utcnow().strftime("%Y-%m-%d")
        if sch.application_deadline and sch.application_deadline >= today_str:
            sch.status = OpportunityStatus.OPEN
            sch.status_reason = "Verified open for current academic year"
        else:
            sch.status = OpportunityStatus.EXPIRED
            sch.status_reason = "Application deadline passed"

        db.add(sch)
        await db.commit()
        return True
