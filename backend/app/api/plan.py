from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models.user import User
from app.models.application import SavedOpportunity, ApplicationTask
from app.models.enums import TaskStatus
from app.schemas.application import (
    SavedOpportunityCreate,
    SavedOpportunityResponse,
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    PlanSummaryResponse,
)
from app.utils.security import get_current_user

router = APIRouter(prefix="/plan", tags=["Application Roadmap"])

DEFAULT_ROADMAP_TASKS = [
    ("Check Eligibility & Degree Prerequisites", "Eligibility", "Verify course credits and GPA conversion."),
    ("Prepare Academic Transcripts & Translations", "Documents", "Obtain certified official English translations."),
    ("Verify Passport Validity", "Documents", "Ensure at least 6 months validity beyond intake start."),
    ("Book and Take English Proficiency Test", "Testing", "Aim for target band score (IELTS 6.5+ or TOEFL 90+)."),
    ("Draft Academic CV / Resume", "Documents", "Format in Europass or international academic layout."),
    ("Write Statement of Purpose / Motivation Letter", "Documents", "Tailor to faculty research and career goals."),
    ("Request 2 Academic Recommendation Letters", "Documents", "Reach out to undergraduate professors with early notice."),
    ("Submit University Application Portal Entry", "Submission", "Upload all verified materials before deadline."),
    ("Submit Dedicated Scholarship Application", "Submission", "Include financial statements and motivation essay."),
    ("Prepare Financial Proof / Blocked Account", "Visa", "Deposit mandatory living funds or provide guarantee."),
    ("Submit Student Visa Application", "Visa", "Schedule embassy appointment with all accepted offer letters."),
]


@router.get("/summary", response_model=PlanSummaryResponse)
async def get_plan_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Fetch tasks
    t_res = await db.execute(
        select(ApplicationTask)
        .where(ApplicationTask.user_id == user.id)
        .order_by(ApplicationTask.order_index)
    )
    tasks = t_res.scalars().all()

    # If user has no tasks yet, initialize default roadmap
    if not tasks:
        new_tasks = []
        for idx, (title, cat, desc) in enumerate(DEFAULT_ROADMAP_TASKS):
            nt = ApplicationTask(
                user_id=user.id,
                title=title,
                category=cat,
                description=desc,
                status=TaskStatus.PENDING,
                order_index=idx,
                is_custom=False,
            )
            db.add(nt)
            new_tasks.append(nt)
        await db.commit()
        t_res = await db.execute(
            select(ApplicationTask)
            .where(ApplicationTask.user_id == user.id)
            .order_by(ApplicationTask.order_index)
        )
        tasks = t_res.scalars().all()

    # Fetch saved count
    s_res = await db.execute(
        select(SavedOpportunity).where(SavedOpportunity.user_id == user.id)
    )
    saved_items = s_res.scalars().all()

    total = len(tasks)
    completed = sum(1 for t in tasks if t.status == TaskStatus.COMPLETED)
    pct = int((completed / total) * 100) if total > 0 else 0

    upcoming = [t for t in tasks if t.status != TaskStatus.COMPLETED and t.deadline]

    return PlanSummaryResponse(
        total_tasks=total,
        completed_tasks=completed,
        progress_percentage=pct,
        saved_opportunities_count=len(saved_items),
        upcoming_deadlines=upcoming,
        tasks=tasks,
    )


@router.post("/saved", response_model=SavedOpportunityResponse)
async def save_opportunity(
    item_in: SavedOpportunityCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check if already saved
    existing = await db.execute(
        select(SavedOpportunity).where(
            SavedOpportunity.user_id == user.id,
            SavedOpportunity.opportunity_type == item_in.opportunity_type,
            SavedOpportunity.opportunity_id == item_in.opportunity_id,
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Opportunity is already saved to your plan.")

    saved = SavedOpportunity(
        user_id=user.id,
        opportunity_type=item_in.opportunity_type,
        opportunity_id=item_in.opportunity_id,
        title=item_in.title,
        subtitle=item_in.subtitle,
        country=item_in.country,
        deadline=item_in.deadline,
        notes=item_in.notes,
    )
    db.add(saved)
    await db.commit()
    await db.refresh(saved)
    return saved


@router.get("/saved", response_model=List[SavedOpportunityResponse])
async def list_saved_opportunities(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(SavedOpportunity)
        .where(SavedOpportunity.user_id == user.id)
        .order_by(SavedOpportunity.saved_at.desc())
    )
    return res.scalars().all()


@router.delete("/saved/{saved_id}")
async def delete_saved_opportunity(
    saved_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(SavedOpportunity).where(
            SavedOpportunity.id == saved_id,
            SavedOpportunity.user_id == user.id,
        )
    )
    item = res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Saved opportunity not found.")
    await db.delete(item)
    await db.commit()
    return {"message": "Opportunity removed from saved list."}


@router.post("/tasks", response_model=TaskResponse)
async def create_custom_task(
    task_in: TaskCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    task = ApplicationTask(
        user_id=user.id,
        opportunity_id=task_in.opportunity_id,
        title=task_in.title,
        category=task_in.category,
        description=task_in.description,
        deadline=task_in.deadline,
        order_index=task_in.order_index,
        is_custom=True,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.patch("/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_in: TaskUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(ApplicationTask).where(
            ApplicationTask.id == task_id,
            ApplicationTask.user_id == user.id,
        )
    )
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")

    update_dict = task_in.model_dump(exclude_unset=True)
    if "status" in update_dict:
        if update_dict["status"] == TaskStatus.COMPLETED:
            task.completed_at = datetime.utcnow()
        else:
            task.completed_at = None

    for k, v in update_dict.items():
        setattr(task, k, v)

    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.delete("/tasks/{task_id}")
async def delete_task(
    task_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(ApplicationTask).where(
            ApplicationTask.id == task_id,
            ApplicationTask.user_id == user.id,
        )
    )
    task = res.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found.")
    await db.delete(task)
    await db.commit()
    return {"message": "Task deleted."}
