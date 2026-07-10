from dataclasses import dataclass
from datetime import datetime

from fastapi import Query

from app.models.enums import JingleStatus, Platform


@dataclass
class JingleListParams:
    search: str | None
    platform: Platform | None
    is_archived: bool | None
    status: JingleStatus | None
    favorites_only: bool
    date_from: datetime | None
    date_to: datetime | None
    min_feedback_score: float | None
    sort_by: str
    sort_dir: str
    page: int
    page_size: int


def jingle_list_params(
    search: str | None = Query(default=None, description="search by brand name"),
    platform: Platform | None = Query(default=None),
    is_archived: bool | None = Query(default=None),
    status: JingleStatus | None = Query(
        default=None, description="filter by draft/in_review/approved status"
    ),
    favorites_only: bool = Query(default=False),
    date_from: datetime | None = Query(default=None, description="created_at lower bound"),
    date_to: datetime | None = Query(default=None, description="created_at upper bound"),
    min_feedback_score: float | None = Query(default=None, ge=0, le=5),
    sort_by: str = Query(default="created_at", pattern="^(created_at|updated_at|brand_name)$"),
    sort_dir: str = Query(default="desc", pattern="^(asc|desc)$"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
) -> JingleListParams:
    return JingleListParams(
        search=search,
        platform=platform,
        is_archived=is_archived,
        status=status,
        favorites_only=favorites_only,
        date_from=date_from,
        date_to=date_to,
        min_feedback_score=min_feedback_score,
        sort_by=sort_by,
        sort_dir=sort_dir,
        page=page,
        page_size=page_size,
    )
