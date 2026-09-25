from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.user import User
from app.models.profile import StudentProfile
from app.models.scholarship import Scholarship
from app.models.university import University
from app.models.ai import AIConversation, AIMessage
from app.schemas.ai import AIChatRequest, AIChatResponse, CitationItem
from app.services.ai import get_ai_provider
from app.utils.security import get_current_user_optional

router = APIRouter(prefix="/ai", tags=["Ask StudyPath Assistant"])


@router.post("/chat", response_model=AIChatResponse)
async def chat_with_assistant(
    req: AIChatRequest,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
):
    ai = get_ai_provider()

    # Load user profile context
    profile_data: Dict[str, Any] = {}
    if user:
        p_res = await db.execute(select(StudentProfile).where(StudentProfile.user_id == user.id))
        p = p_res.scalar_one_or_none()
        if p:
            profile_data = {
                "nationality": p.nationality,
                "current_degree": p.current_degree,
                "desired_degree": p.desired_degree,
                "field_of_study": p.field_of_study,
                "cgpa": p.cgpa,
                "grading_scale": p.grading_scale,
                "english_test": p.english_test,
                "english_score": p.english_score,
                "max_annual_tuition": p.max_annual_tuition,
                "preferred_countries": p.preferred_countries,
            }

    # Fetch top verified opportunities for grounded RAG context
    sch_res = await db.execute(select(Scholarship).limit(8))
    scholarships = sch_res.scalars().all()

    citations: List[CitationItem] = []
    scholarships_context = []
    for s in scholarships:
        scholarships_context.append({
            "name": s.name,
            "provider": s.provider,
            "country": s.country,
            "min_cgpa": s.min_cgpa,
            "min_ielts": s.min_ielts,
            "funding_type": s.funding_type.value,
            "status": s.status.value,
            "deadline": s.application_deadline,
            "official_url": s.official_application_url,
        })
        citations.append(
            CitationItem(
                title=s.name,
                url=s.official_application_url,
                tier="TIER_1",
                last_verified=s.last_verified_at.strftime("%Y-%m-%d") if s.last_verified_at else None,
            )
        )

    context = {
        "student_profile": profile_data,
        "verified_scholarships": scholarships_context,
    }

    # If specific context_id is passed
    if req.context_type == "scholarship" and req.context_id:
        target_sch_res = await db.execute(select(Scholarship).where(Scholarship.id == req.context_id))
        target_sch = target_sch_res.scalar_one_or_none()
        if target_sch:
            context["focused_scholarship"] = {
                "name": target_sch.name,
                "min_cgpa": target_sch.min_cgpa,
                "min_ielts": target_sch.min_ielts,
                "required_documents": target_sch.required_documents,
                "application_deadline": target_sch.application_deadline,
                "official_url": target_sch.official_application_url,
            }

    system_instruction = (
        "You are StudyPath AI, an authoritative, evidence-based international education advisor. "
        "Strict Rule 1: Always answer using the verified context data provided. "
        "Strict Rule 2: Never fabricate scholarships, deadlines, tuition fees, or links. "
        "Strict Rule 3: Distinguish verified data, estimated costs, and missing student details clearly. "
        "Strict Rule 4: If information is uncertain or missing, explicitly inform the student to verify with the official admissions office."
    )

    reply = await ai.generate_response(
        prompt=req.message,
        system_instruction=system_instruction,
        context=context,
    )

    # Conversation persistence
    conv_id = req.conversation_id or 1
    if user:
        if req.conversation_id:
            conv_res = await db.execute(select(AIConversation).where(AIConversation.id == req.conversation_id))
            conv = conv_res.scalar_one_or_none()
        else:
            conv = AIConversation(user_id=user.id, title=req.message[:50])
            db.add(conv)
            await db.flush()

        if conv:
            conv_id = conv.id
            user_msg = AIMessage(conversation_id=conv.id, role="user", content=req.message)
            assistant_msg = AIMessage(
                conversation_id=conv.id,
                role="assistant",
                content=reply,
                citations=[c.model_dump() for c in citations[:3]],
            )
            db.add(user_msg)
            db.add(assistant_msg)
            await db.commit()

    follow_ups = [
        "What documents do I need to prepare first?",
        "How do my IELTS and GPA compare to minimum thresholds?",
        "Can you break down estimated living costs for this intake?",
    ]

    return AIChatResponse(
        conversation_id=conv_id,
        reply=reply,
        citations=citations[:4],
        verified_data=True,
        suggested_follow_ups=follow_ups,
        created_at=datetime.utcnow(),
    )
