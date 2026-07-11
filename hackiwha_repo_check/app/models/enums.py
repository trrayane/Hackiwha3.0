import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class GenerationStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class JingleStatus(str, enum.Enum):
    DRAFT = "draft"
    IN_REVIEW = "in_review"
    APPROVED = "approved"


class TargetAgeRange(str, enum.Enum):
    TEENS = "13-24"
    ADULTS = "25-40"
    SENIORS = "41+"


class Platform(str, enum.Enum):
    TIKTOK = "tiktok"
    INSTAGRAM_REELS = "instagram_reels"
    SPOTIFY_ADS = "spotify_ads"
    YOUTUBE = "youtube"
    CLASSIC_RADIO = "classic_radio"
    IN_STORE = "in_store"
