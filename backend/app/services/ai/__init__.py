from app.config import settings
from app.services.ai.base import AIProvider
from app.services.ai.gemini_provider import GeminiProvider
from app.services.ai.openai_provider import OpenAIProvider
from app.services.ai.mock_provider import MockAIProvider


def get_ai_provider() -> AIProvider:
    """Factory returning configured AI Provider based on settings and available API keys."""
    provider_name = settings.AI_PROVIDER.lower()

    if provider_name == "gemini" and settings.AI_API_KEY:
        return GeminiProvider(api_key=settings.AI_API_KEY, model_name=settings.AI_MODEL)
    elif provider_name == "openai" and settings.OPENAI_API_KEY:
        return OpenAIProvider(api_key=settings.OPENAI_API_KEY, model_name=settings.OPENAI_MODEL)
    elif settings.OPENAI_API_KEY:
        return OpenAIProvider(api_key=settings.OPENAI_API_KEY, model_name=settings.OPENAI_MODEL)
    elif settings.AI_API_KEY:
        return GeminiProvider(api_key=settings.AI_API_KEY, model_name=settings.AI_MODEL)
    else:
        # Default safe mock/deterministic provider
        return MockAIProvider()
