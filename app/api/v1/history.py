from fastapi import APIRouter, Depends, Query

from app.dependencies.auth import get_current_user
from app.dependencies.services import (
    get_generation_service,
    get_jingle_service,
    get_storage_service,
)
from app.integrations.storage import StorageService
from app.models.user import User
from app.schemas.generation import GenerationRequestOut
from app.schemas.jingle import JingleOut
from app.services.generation_service import GenerationService
from app.services.jingle_service import JingleService
from app.utils.presenters import to_jingle_out

router = APIRouter(prefix="/history", tags=["history"])


@router.get("/generations", response_model=list[GenerationRequestOut])
async def generation_history(
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    generation_service: GenerationService = Depends(get_generation_service),
) -> list[GenerationRequestOut]:
    return await generation_service.list_for_user(current_user.id, limit=limit)


@router.get("/recent-activity", response_model=list[GenerationRequestOut])
async def recent_activity(
    limit: int = Query(default=10, ge=1, le=50),
    current_user: User = Depends(get_current_user),
    generation_service: GenerationService = Depends(get_generation_service),
) -> list[GenerationRequestOut]:
    return await generation_service.list_for_user(current_user.id, limit=limit)


@router.get("/favorites", response_model=list[JingleOut])
async def favorites(
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> list[JingleOut]:
    items, _ = await jingle_service.list(
        current_user.id,
        search=None,
        platform=None,
        is_archived=None,
        status=None,
        favorites_only=True,
        sort_by="created_at",
        sort_dir="desc",
        page=1,
        page_size=100,
    )
    return [to_jingle_out(item, storage) for item in items]


@router.get("/archived", response_model=list[JingleOut])
async def archived(
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> list[JingleOut]:
    items, _ = await jingle_service.list(
        current_user.id,
        search=None,
        platform=None,
        is_archived=True,
        status=None,
        favorites_only=False,
        sort_by="created_at",
        sort_dir="desc",
        page=1,
        page_size=100,
    )
    return [to_jingle_out(item, storage) for item in items]
