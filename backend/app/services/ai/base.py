from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional


class AIProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None,
    ) -> str:
        """Generate response given a prompt and optional context."""
        pass

    @abstractmethod
    async def extract_structured_json(
        self,
        text: str,
        schema_description: str,
    ) -> Dict[str, Any]:
        """Extract structured JSON from free-form text or document."""
        pass

    @abstractmethod
    async def parse_search_intent(
        self,
        natural_query: str,
    ) -> Dict[str, Any]:
        """Parse natural language search query into structured search filters."""
        pass
