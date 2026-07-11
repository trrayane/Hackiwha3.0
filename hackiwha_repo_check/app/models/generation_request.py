import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import GenerationStatus


class GenerationRequest(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "generation_requests"

    jingle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jingles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[GenerationStatus] = mapped_column(
        Enum(GenerationStatus, name="generation_status"),
        default=GenerationStatus.PENDING,
        nullable=False,
        index=True,
    )
    provider: Mapped[str | None] = mapped_column(String(50), nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(500), nullable=True)
    progress_percent: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    stage_message: Mapped[str | None] = mapped_column(String(200), nullable=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    jingle: Mapped["Jingle"] = relationship(back_populates="generation_requests")
    variants: Mapped[list["GeneratedVariant"]] = relationship(
        back_populates="generation_request", cascade="all, delete-orphan"
    )
