import uuid

from fastapi import APIRouter, Depends, File, Response, UploadFile, status

from app.dependencies.auth import get_current_user
from app.dependencies.services import (
    get_generation_service,
    get_jingle_service,
    get_reference_audio_service,
    get_storage_service,
)
from app.integrations.storage import StorageService
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.generation import GenerationRequestOut
from app.schemas.jingle import (
    ArchiveToggleOut,
    FavoriteToggleOut,
    JingleAudienceUpdate,
    JingleCreate,
    JingleCreativeDirectionUpdate,
    JingleOut,
    JinglePlatformUpdate,
    JingleUpdate,
)
from app.schemas.reference_audio import ReferenceAudioOut
from app.services.generation_service import GenerationService
from app.services.jingle_service import JingleService
from app.services.reference_audio_service import ReferenceAudioService
from app.utils.presenters import to_jingle_out as _to_jingle_out
from app.utils.presenters import to_reference_audio_out as _to_reference_audio_out
from app.utils.query_params import JingleListParams, jingle_list_params

router = APIRouter(prefix="/jingles", tags=["jingles"])


@router.post("", response_model=JingleOut, status_code=status.HTTP_201_CREATED)
async def create_draft(
    payload: JingleCreate,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> JingleOut:
    jingle = await jingle_service.create_draft(
        current_user.id, payload.brand_name, payload.brand_tone, payload.brand_description
    )
    return _to_jingle_out(jingle, storage)


@router.patch("/{jingle_id}/audience", response_model=JingleOut)
async def update_audience(
    jingle_id: uuid.UUID,
    payload: JingleAudienceUpdate,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> JingleOut:
    jingle = await jingle_service.update_audience(
        current_user.id,
        jingle_id,
        payload.target_age_range,
        payload.mood_context,
    )
    return _to_jingle_out(jingle, storage)


@router.patch("/{jingle_id}/platform", response_model=JingleOut)
async def update_platform(
    jingle_id: uuid.UUID,
    payload: JinglePlatformUpdate,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> JingleOut:
    jingle = await jingle_service.update_platform(current_user.id, jingle_id, payload.platform)
    return _to_jingle_out(jingle, storage)


@router.patch("/{jingle_id}/creative-direction", response_model=JingleOut)
async def update_creative_direction(
    jingle_id: uuid.UUID,
    payload: JingleCreativeDirectionUpdate,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> JingleOut:
    jingle = await jingle_service.update_creative_direction(
        current_user.id,
        jingle_id,
        payload.sound_description,
        payload.voice_enabled,
        payload.voice_gender,
        payload.voice_name,
        payload.language,
    )
    return _to_jingle_out(jingle, storage)


@router.post("/{jingle_id}/generate", response_model=GenerationRequestOut)
async def generate(
    jingle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    generation_service: GenerationService = Depends(get_generation_service),
) -> GenerationRequestOut:
    return await generation_service.generate(current_user.id, jingle_id)


@router.get("/{jingle_id}/generations", response_model=list[GenerationRequestOut])
async def list_generations(
    jingle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    generation_service: GenerationService = Depends(get_generation_service),
) -> list[GenerationRequestOut]:
    return await generation_service.list_for_jingle(current_user.id, jingle_id)


@router.get("/{jingle_id}/generations/{request_id}", response_model=GenerationRequestOut)
async def get_generation(
    jingle_id: uuid.UUID,
    request_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    generation_service: GenerationService = Depends(get_generation_service),
) -> GenerationRequestOut:
    return await generation_service.get(current_user.id, jingle_id, request_id)


@router.post("/{jingle_id}/generations/{request_id}/cancel", response_model=GenerationRequestOut)
async def cancel_generation(
    jingle_id: uuid.UUID,
    request_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    generation_service: GenerationService = Depends(get_generation_service),
) -> GenerationRequestOut:
    return await generation_service.cancel(current_user.id, jingle_id, request_id)


@router.post("/{jingle_id}/approve", response_model=JingleOut)
async def approve_jingle(
    jingle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> JingleOut:
    jingle = await jingle_service.approve(current_user.id, jingle_id)
    return _to_jingle_out(jingle, storage)


@router.get("", response_model=PaginatedResponse[JingleOut])
async def list_jingles(
    params: JingleListParams = Depends(jingle_list_params),
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> PaginatedResponse[JingleOut]:
    items, total = await jingle_service.list(
        current_user.id,
        search=params.search,
        platform=params.platform,
        is_archived=params.is_archived,
        status=params.status,
        favorites_only=params.favorites_only,
        date_from=params.date_from,
        date_to=params.date_to,
        min_feedback_score=params.min_feedback_score,
        sort_by=params.sort_by,
        sort_dir=params.sort_dir,
        page=params.page,
        page_size=params.page_size,
    )
    return PaginatedResponse(
        items=[_to_jingle_out(item, storage) for item in items],
        total=total,
        page=params.page,
        page_size=params.page_size,
    )


@router.get("/{jingle_id}", response_model=JingleOut)
async def get_jingle(
    jingle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> JingleOut:
    jingle = await jingle_service.get(current_user.id, jingle_id)
    return _to_jingle_out(jingle, storage)


@router.patch("/{jingle_id}", response_model=JingleOut)
async def update_jingle(
    jingle_id: uuid.UUID,
    payload: JingleUpdate,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> JingleOut:
    jingle = await jingle_service.update(
        current_user.id, jingle_id, **payload.model_dump(exclude_unset=True)
    )
    return _to_jingle_out(jingle, storage)


@router.delete("/{jingle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_jingle(
    jingle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
) -> Response:
    await jingle_service.delete(current_user.id, jingle_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{jingle_id}/duplicate", response_model=JingleOut, status_code=status.HTTP_201_CREATED)
async def duplicate_jingle(
    jingle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
    storage: StorageService = Depends(get_storage_service),
) -> JingleOut:
    jingle = await jingle_service.duplicate(current_user.id, jingle_id)
    return _to_jingle_out(jingle, storage)


@router.post("/{jingle_id}/favorite", response_model=FavoriteToggleOut)
async def toggle_favorite(
    jingle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
) -> FavoriteToggleOut:
    is_favorite = await jingle_service.toggle_favorite(current_user.id, jingle_id)
    return FavoriteToggleOut(jingle_id=jingle_id, is_favorite=is_favorite)


@router.post("/{jingle_id}/archive", response_model=ArchiveToggleOut)
async def toggle_archive(
    jingle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    jingle_service: JingleService = Depends(get_jingle_service),
) -> ArchiveToggleOut:
    is_archived = await jingle_service.toggle_archive(current_user.id, jingle_id)
    return ArchiveToggleOut(jingle_id=jingle_id, is_archived=is_archived)


@router.post(
    "/{jingle_id}/reference-audio",
    response_model=ReferenceAudioOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_reference_audio(
    jingle_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    audio_service: ReferenceAudioService = Depends(get_reference_audio_service),
    storage: StorageService = Depends(get_storage_service),
) -> ReferenceAudioOut:
    audio = await audio_service.upload(current_user.id, jingle_id, file)
    return _to_reference_audio_out(audio, storage)


@router.put("/{jingle_id}/reference-audio", response_model=ReferenceAudioOut)
async def replace_reference_audio(
    jingle_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    audio_service: ReferenceAudioService = Depends(get_reference_audio_service),
    storage: StorageService = Depends(get_storage_service),
) -> ReferenceAudioOut:
    audio = await audio_service.replace(current_user.id, jingle_id, file)
    return _to_reference_audio_out(audio, storage)


@router.get("/{jingle_id}/reference-audio", response_model=ReferenceAudioOut)
async def get_reference_audio(
    jingle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    audio_service: ReferenceAudioService = Depends(get_reference_audio_service),
    storage: StorageService = Depends(get_storage_service),
) -> ReferenceAudioOut:
    audio = await audio_service.get(current_user.id, jingle_id)
    return _to_reference_audio_out(audio, storage)


@router.delete("/{jingle_id}/reference-audio", status_code=status.HTTP_204_NO_CONTENT)
async def delete_reference_audio(
    jingle_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    audio_service: ReferenceAudioService = Depends(get_reference_audio_service),
) -> Response:
    await audio_service.delete(current_user.id, jingle_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
