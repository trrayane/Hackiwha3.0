from abc import ABC, abstractmethod
from dataclasses import dataclass

from app.models.enums import Platform, TargetAgeRange


@dataclass
class JingleGenerationInput:
    brand_name: str
    brand_tone: str
    brand_description: str | None
    target_age_range: TargetAgeRange | None
    mood_context: str | None
    platform: Platform | None
    sound_description: str | None
    voice_enabled: bool
    voice_gender: str | None = None
    voice_name: str | None = None
    language: str | None = None
    reference_audio_url: str | None = None


@dataclass
class JingleGenerationResult:
    provider: str
    audio_url: str
    lyrics: str
    duration_seconds: int
    generation_time_ms: int


class AIProviderService(ABC):
    """Contract for any jingle-generation backend (ElevenLabs, Suno, OpenAI, ...).

    The AI team implements this interface and the instance returned by
    app.dependencies.services.get_ai_provider() is swapped for the real one.
    Nothing else in the codebase needs to change.
    """

    @abstractmethod
    async def generate_jingle(self, payload: JingleGenerationInput) -> JingleGenerationResult:
        raise NotImplementedError


class NotImplementedAIProviderService(AIProviderService):
    """Default wiring until the AI team plugs in a real provider.

    generate_jingle() raises so no fake audio/lyrics ever get stored. The
    generation workflow already treats provider errors as a normal outcome:
    the GenerationRequest is saved with status=FAILED and this message, so
    the rest of the API (history, dashboard, jingle CRUD) is fully usable
    and testable without any AI implementation present.
    """

    provider_name = "not-configured"

    async def generate_jingle(self, payload: JingleGenerationInput) -> JingleGenerationResult:
        raise NotImplementedError("AI provider is not configured yet")
