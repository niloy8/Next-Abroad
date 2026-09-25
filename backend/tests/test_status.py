import pytest
from app.models.enums import OpportunityStatus, SourceTier
from app.services.search.search_service import classify_url_tier


def test_classify_url_tier():
    # Tier 1 official domains
    assert classify_url_tier("https://www.daad.de/scholarships") == SourceTier.TIER_1
    assert classify_url_tier("https://www.tum.de/admissions") == SourceTier.TIER_1
    assert classify_url_tier("https://ethz.ch/studies") == SourceTier.TIER_1
    assert classify_url_tier("https://harvard.edu") == SourceTier.TIER_1
    assert classify_url_tier("https://ox.ac.uk") == SourceTier.TIER_1

    # Tier 2 recognized portals
    assert classify_url_tier("https://www.topuniversities.com/rankings") == SourceTier.TIER_2
    assert classify_url_tier("https://www.mastersportal.com") == SourceTier.TIER_2

    # Tier 3 aggregator / blogs
    assert classify_url_tier("https://randomscholarshipblog.com/post-1") == SourceTier.TIER_3


@pytest.mark.asyncio
async def test_search_discovery_endpoint(client):
    res = await client.post("/api/search/discover", json={"query": "Master's in Germany computer science"})
    assert res.status_code == 200
    data = res.json()
    assert data["total_found"] > 0
    assert "results" in data
    # Check that each result contains a valid status
    for item in data["results"]:
        assert item["status"] in ["OPEN", "UPCOMING", "EXPIRED", "ROLLING", "UNKNOWN"]
        assert item["source_tier"] in ["TIER_1", "TIER_2", "TIER_3"]
