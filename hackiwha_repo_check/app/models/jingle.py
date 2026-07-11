import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.models.base import SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.enums import JingleStatus, Platform, TargetAgeRange


class Jingle(UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin, Base):
    __tablename__ = "jingles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    current_step: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    status: Mapped[JingleStatus] = mapped_column(
        Enum(JingleStatus, name="jingle_status"), default=JingleStatus.DRAFT, nullable=False, index=True
    )

    # Step 1 - Brand Basics
    brand_name: Mapped[str] = mapped_column(String(150), nullable=False)
    brand_tone: Mapped[str] = mapped_column(String(50), nullable=False)
    brand_description: Mapped[str | None] = mapped_column(String(500), nullable=True)

    # Step 2 - Audience & Context
    target_age_range: Mapped[TargetAgeRange | None] = mapped_column(
        Enum(TargetAgeRange, name="target_age_range"), nullable=True
    )
    mood_context: Mapped[str | None] = mapped_column(String(150), nullable=True)

    # Step 3 - Platform Selection
    platform: Mapped[Platform | None] = mapped_column(Enum(Platform, name="platform"), nullable=True)

    # Step 4 - Creative Direction
    sound_description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    voice_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    voice_gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    voice_name: Mapped[str | None] = mapped_column(String(30), nullable=True)
    language: Mapped[str | None] = mapped_column(String(20), nullable=True)

    is_archived: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    owner: Mapped["User"] = relationship(back_populates="jingles")
    generation_requests: Mapped[list["GenerationRequest"]] = relationship(
        back_populates="jingle", cascade="all, delete-orphan"
    )
    favorites: Mapped[list["FavoriteJingle"]] = relationship(
        back_populates="jingle", cascade="all, delete-orphan"
    )
    reference_audio: Mapped["ReferenceAudio | None"] = relationship(
        back_populates="jingle", cascade="all, delete-orphan", uselist=False
    )
