import uuid

from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.dependencies.services import get_feedback_service
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackOut
from app.services.feedback_service import FeedbackService

router = APIRouter(prefix="/jingles/{jingle_id}/variants/{variant_id}/feedback", tags=["feedback"])


@router.post("", response_model=FeedbackOut, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    jingle_id: uuid.UUID,
    variant_id: uuid.UUID,
    payload: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    feedback_service: FeedbackService = Depends(get_feedback_service),
) -> FeedbackOut:
    return await feedback_service.create(
        current_user.id,
        jingle_id,
        variant_id,
        payload.rating,
        payload.comment,
    )


@router.get("", response_model=list[FeedbackOut])
async def list_feedback(
    jingle_id: uuid.UUID,
    variant_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    feedback_service: FeedbackService = Depends(get_feedback_service),
) -> list[FeedbackOut]:
    return await feedback_service.list_for_variant(current_user.id, jingle_id, variant_id)
