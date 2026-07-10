import uuid

from sqlalchemy import ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.session import Base
from app.models.base import TimestampMixin, UUIDPrimaryKeyMixin


class FavoriteJingle(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "favorite_jingles"
    __table_args__ = (UniqueConstraint("user_id", "jingle_id", name="uq_favorite_user_jingle"),)

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    jingle_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("jingles.id", ondelete="CASCADE"), nullable=False, index=True
    )

    jingle: Mapped["Jingle"] = relationship(back_populates="favorites")
