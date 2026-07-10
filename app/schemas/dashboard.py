from pydantic import BaseModel

from app.schemas.generation import GenerationRequestOut


class PlatformCount(BaseModel):
    platform: str
    count: int


class DashboardSummaryOut(BaseModel):
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
    top_platforms: list[PlatformCount]
    recent_activity: list[GenerationRequestOut]
