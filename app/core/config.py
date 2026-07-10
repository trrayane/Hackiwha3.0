from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Jingle Engine"
    environment: str = "development"
    cors_origins: str = "http://localhost:3000"

    database_url: str

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    reset_token_expire_minutes: int = 30
    reset_resend_cooldown_seconds: int = 60

    smtp_host: str
    smtp_port: int = 587
    smtp_user: str
    smtp_password: str
    smtp_from_email: str
    smtp_from_name: str = "Jingle Engine"
    smtp_use_tls: bool = True

    redis_url: str = "redis://localhost:6379/0"

    upload_dir: str = "uploads/reference_audio"
    public_base_url: str = "http://localhost:8000"
    max_upload_size_mb: int = 20
    allowed_audio_extensions: str = ".mp3,.wav,.ogg,.m4a,.aac"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def allowed_audio_extensions_list(self) -> list[str]:
        return [ext.strip().lower() for ext in self.allowed_audio_extensions.split(",") if ext.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
