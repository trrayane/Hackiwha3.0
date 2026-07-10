from fastapi import APIRouter, Depends

from app.dependencies.auth import get_current_user
from app.dependencies.services import get_dashboard_service
from app.models.user import User
from app.schemas.dashboard import DashboardSummaryOut, PlatformCount
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummaryOut)
async def summary(
    current_user: User = Depends(get_current_user),
    dashboard_service: DashboardService = Depends(get_dashboard_service),
) -> DashboardSummaryOut:
    result = await dashboard_service.summary(current_user.id)
    return DashboardSummaryOut(
        total_projects=result.total_projects,
        total_generated_jingles=result.total_generated_jingles,
        draft_count=result.draft_count,
        in_review_count=result.in_review_count,
        approved_count=result.approved_count,
        pending_requests=result.pending_requests,
        completed_requests=result.completed_requests,
        failed_requests=result.failed_requests,
        jingle_quota=result.jingle_quota,
        jingles_used=result.jingles_used,
        top_platforms=[
            PlatformCount(platform=platform, count=count) for platform, count in result.top_platforms
        ],
        recent_activity=result.recent_activity,
    )
