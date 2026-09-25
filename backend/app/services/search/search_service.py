import re
import logging
import httpx
from typing import List
from datetime import datetime
from app.config import settings
from app.models.enums import SourceTier
from app.services.search.base import SearchProvider, SearchResultItem

logger = logging.getLogger(__name__)

# Tier 1 Official domains and patterns
TIER_1_PATTERNS = [
    r"\.edu$",
    r"\.edu\.[a-z]{2}$",
    r"\.ac\.[a-z]{2}$",
    r"\.gov$",
    r"\.gov\.[a-z]{2}$",
    r"daad\.de",
    r"chevening\.org",
    r"fulbrightprogram\.org",
    r"erasmus-plus\.ec\.europa\.eu",
    r"si\.se",
    r"campusfrance\.org",
    r"studyinsweden\.se",
    r"tum\.de",
    r"ethz\.ch",
    r"utoronto\.ca",
    r"unimelb\.edu\.au",
    r"ox\.ac\.uk",
    r"cam\.ac\.uk",
    r"epfl\.ch",
    r"uu\.se",
    r"lu\.se",
    r"uni-heidelberg\.de",
    r"lmu\.de",
    r"rwth-aachen\.de",
]

TIER_2_PATTERNS = [
    r"topuniversities\.com",
    r"timeshighereducation\.com",
    r"studyportals\.com",
    r"mastersportal\.com",
    r"findamasters\.com",
]


def classify_url_tier(url: str) -> SourceTier:
    """Classify URL into Tier 1 (Official), Tier 2 (Recognized educational org), or Tier 3 (Other)."""
    url_lower = url.lower()
    for pattern in TIER_1_PATTERNS:
        if re.search(pattern, url_lower):
            return SourceTier.TIER_1
    for pattern in TIER_2_PATTERNS:
        if re.search(pattern, url_lower):
            return SourceTier.TIER_2
    return SourceTier.TIER_3


class TavilySearchProvider(SearchProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.endpoint = "https://api.tavily.com/search"

    async def search(self, query: str, max_results: int = 5) -> List[SearchResultItem]:
        headers = {"Content-Type": "application/json"}
        payload = {
            "api_key": self.api_key,
            "query": query,
            "search_depth": "advanced",
            "max_results": max_results,
            "include_domains": ["daad.de", "chevening.org", "tum.de", "ethz.ch", "utoronto.ca", "ox.ac.uk", "si.se"],
        }
        items = []
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(self.endpoint, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    for r in data.get("results", []):
                        url = r.get("url", "")
                        tier = classify_url_tier(url)
                        items.append(
                            SearchResultItem(
                                title=r.get("title", ""),
                                url=url,
                                snippet=r.get("content", ""),
                                tier=tier,
                            )
                        )
        except Exception as e:
            logger.error(f"Tavily search error: {e}")
        return items


class CuratedVerifiedSearchProvider(SearchProvider):
    """
    Curated search provider with Tier-1 verified institutional registry.
    Ensures zero hallucinated sources when external search keys are not provided.
    """

    VERIFIED_DIRECTORY = [
        {
            "title": "DAAD Helmut-Schmidt-Programme (Master's Scholarships in Public Policy and Good Governance)",
            "url": "https://www.daad.de/en/study-and-research-in-germany/scholarships/daad-scholarships/helmut-schmidt/",
            "snippet": "Fully funded master scholarships for students from developing countries at renowned German universities. Monthly stipend 934 EUR, health insurance, travel allowance, and German language course.",
            "tier": SourceTier.TIER_1,
            "organization": "German Academic Exchange Service (DAAD)",
            "country": "Germany",
        },
        {
            "title": "Erasmus Mundus Joint Master Degrees (EMJM)",
            "url": "https://erasmus-plus.ec.europa.eu/opportunities/opportunities-for-individuals/students/erasmus-mundus-joint-masters",
            "snippet": "Prestigious, integrated international study programs jointly delivered by international consortiums of higher education institutions with full EU scholarships covering tuition, travel, and installation costs.",
            "tier": SourceTier.TIER_1,
            "organization": "European Commission",
            "country": "European Union",
        },
        {
            "title": "Swedish Institute Scholarships for Global Professionals (SISGP)",
            "url": "https://si.se/en/apply/scholarships/swedish-institute-scholarships-for-global-professionals/",
            "snippet": "Covers tuition fees, living expenses (12,000 SEK/month), travel grant, and health insurance for full-time master's studies in Sweden.",
            "tier": SourceTier.TIER_1,
            "organization": "Swedish Institute",
            "country": "Sweden",
        },
        {
            "title": "ETH Zurich Excellence Scholarship & Opportunity Programme (ESOP)",
            "url": "https://ethz.ch/students/en/studies/financial/scholarships/excellencescholarship.html",
            "snippet": "Covers full study and living costs (CHF 12,000 per semester) as well as a tuition fee waiver for outstanding students pursuing a Master's degree at ETH Zurich.",
            "tier": SourceTier.TIER_1,
            "organization": "ETH Zurich",
            "country": "Switzerland",
        },
        {
            "title": "Technical University of Munich (TUM) Admissions & Scholarships",
            "url": "https://www.tum.de/en/studies/fees-and-financial-aid/scholarships",
            "snippet": "Official TUM portal for international students applying to Master of Science programs in Informatics, Data Engineering, and Robotics. Information on semester fees and merit waivers.",
            "tier": SourceTier.TIER_1,
            "organization": "Technical University of Munich",
            "country": "Germany",
        },
        {
            "title": "Chevening Scholarships — UK Government International Awards",
            "url": "https://www.chevening.org/scholarships/",
            "snippet": "Fully funded scholarship for one-year master's degrees in the UK funded by the Foreign, Commonwealth & Development Office and partner organisations.",
            "tier": SourceTier.TIER_1,
            "organization": "Foreign, Commonwealth & Development Office",
            "country": "United Kingdom",
        },
        {
            "title": "Fulbright Foreign Student Program",
            "url": "https://foreign.fulbrightonline.org/",
            "snippet": "Enables graduate students, young professionals and artists from abroad to study and conduct research in the United States. Operates in more than 160 countries worldwide.",
            "tier": SourceTier.TIER_1,
            "organization": "U.S. Department of State",
            "country": "United States",
        },
        {
            "title": "University of Toronto International Scholar Award",
            "url": "https://future.utoronto.ca/finances/scholarships/",
            "snippet": "Renewable merit-based awards for exceptional international students admitted to undergraduate and graduate programs across Arts & Science and Applied Science & Engineering.",
            "tier": SourceTier.TIER_1,
            "organization": "University of Toronto",
            "country": "Canada",
        },
    ]

    async def search(self, query: str, max_results: int = 5) -> List[SearchResultItem]:
        query_words = [w.lower() for w in re.findall(r"\w+", query) if len(w) > 2]
        scored_items = []

        for item in self.VERIFIED_DIRECTORY:
            text = f"{item['title']} {item['snippet']} {item['country']} {item['organization']}".lower()
            score = sum(1 for w in query_words if w in text)
            scored_items.append((score, item))

        scored_items.sort(key=lambda x: x[0], reverse=True)
        results = []
        for score, item in scored_items[:max_results]:
            results.append(
                SearchResultItem(
                    title=item["title"],
                    url=item["url"],
                    snippet=item["snippet"],
                    tier=item["tier"],
                    organization=item["organization"],
                )
            )
        return results


def get_search_provider() -> SearchProvider:
    if settings.SEARCH_PROVIDER == "tavily" and settings.SEARCH_API_KEY:
        return TavilySearchProvider(api_key=settings.SEARCH_API_KEY)
    return CuratedVerifiedSearchProvider()
