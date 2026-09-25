from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.models.enums import SourceTier


class SearchResultItem:
    def __init__(
        self,
        title: str,
        url: str,
        snippet: str,
        tier: SourceTier,
        organization: Optional[str] = None,
        retrieved_at: Optional[datetime] = None,
    ):
        self.title = title
        self.url = url
        self.snippet = snippet
        self.tier = tier
        self.organization = organization
        self.retrieved_at = retrieved_at or datetime.utcnow()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "title": self.title,
            "url": self.url,
            "snippet": self.snippet,
            "tier": self.tier.value,
            "organization": self.organization,
            "retrieved_at": self.retrieved_at.isoformat(),
        }


class SearchProvider(ABC):
    @abstractmethod
    async def search(
        self,
        query: str,
        max_results: int = 5,
    ) -> List[SearchResultItem]:
        """Perform web search and return structured source results with reliability tiers."""
        pass
