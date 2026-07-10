import uuid
from dataclasses import dataclass

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.enums import GenerationStatus, JingleStatus
from app.models.generated_variant import GeneratedVariant
from app.models.generation_request import GenerationRequest
from app.models.jingle import Jingle
from app.repositories.generation_request_repository import GenerationRequestRepository
from app.repositories.jingle_repository import JingleRepository
from app.repositories.user_repository import UserRepository


@dataclass
class DashboardSummary:
    total_projects: int
    total_generated_jingles: int
    draft_count: int
    in_review_count: int
    approved_count: int
    pending_requests: int
    completed_requests: int
    failed_requests: int
    jingle_quota: int
    jingles_used: int
    top_platforms: list[tuple[str, int]]
    recent_activity: list[GenerationRequest]


class DashboardService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.jingles = JingleRepository(session)
        self.requests = GenerationRequestRepository(session)
        self.users = UserRepository(session)

    async def summary(self, user_id: uuid.UUID) -> DashboardSummary:
        total_projects = await self.jingles.count_for_user(user_id)

        total_variants_result = await self.session.execute(
            select(func.count())
            .select_from(GeneratedVariant)
            .join(GenerationRequest, GenerationRequest.id == GeneratedVariant.generation_request_id)
            .join(Jingle, Jingle.id == GenerationRequest.jingle_id)
            .where(
                Jingle.user_id == user_id,
                Jingle.deleted_at.is_(None),
                GeneratedVariant.deleted_at.is_(None),
            )
        )
        total_generated_jingles = total_variants_result.scalar_one()

        draft_count = await self.jingles.count_by_status(user_id, JingleStatus.DRAFT)
        in_review_count = await self.jingles.count_by_status(user_id, JingleStatus.IN_REVIEW)
        approved_count = await self.jingles.count_by_status(user_id, JingleStatus.APPROVED)

        pending = await self.requests.count_by_status(user_id, GenerationStatus.PENDING)
        processing = await self.requests.count_by_status(user_id, GenerationStatus.PROCESSING)
        completed = await self.requests.count_by_status(user_id, GenerationStatus.COMPLETED)
        failed = await self.requests.count_by_status(user_id, GenerationStatus.FAILED)

        top_platforms = await self.requests.top_platforms(user_id)
        recent_activity = await self.requests.list_for_user(user_id, limit=10)

        user = await self.users.get_by_id(user_id)
        jingle_quota = user.jingle_quota if user else 0

        return DashboardSummary(
            total_projects=total_projects,
            total_generated_jingles=total_generated_jingles,
            draft_count=draft_count,
            in_review_count=in_review_count,
            approved_count=approved_count,
            pending_requests=pending + processing,
            completed_requests=completed,
            failed_requests=failed,
            jingle_quota=jingle_quota,
            jingles_used=total_projects,
            top_platforms=top_platforms,
            recent_activity=recent_activity,
        )
