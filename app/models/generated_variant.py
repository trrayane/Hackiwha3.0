import uuid

from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.models.base import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import GenerationStatus


class GeneratedVariant(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "generated_variants"

    generation_request_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("generation_requests.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    audio_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    lyrics: Mapped[str | None] = mapped_column(Text, nullable=True)
    duration_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    generation_time_ms: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[GenerationStatus] = mapped_column(
        Enum(GenerationStatus, name="generation_status"),
        default=GenerationStatus.PENDING,
        nullable=False,
        index=True,
    )

    generation_request: Mapped["GenerationRequest"] = relationship(back_populates="variants")
    feedback_entries: Mapped[list["Feedback"]] = relationship(
        back_populates="variant", cascade="all, delete-orphan"
    )
