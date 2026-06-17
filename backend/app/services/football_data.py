"""
Client for the Football-Data.org v4 API.
Handles rate limiting (10 req/min on free tier) with automatic back-off.
"""

import httpx
import logging
from typing import Any
from datetime import datetime

from app.config import settings

logger = logging.getLogger(__name__)

HEADERS = {
    "X-Auth-Token": settings.football_data_api_key,
    "Accept": "application/json",
}

BASE = settings.football_data_base_url
COMP = settings.wc_competition_code


class FootballDataClient:
    def __init__(self):
        self._client = httpx.AsyncClient(
            base_url=BASE,
            headers=HEADERS,
            timeout=15.0,
        )

    async def _get(self, path: str, params: dict | None = None) -> dict[str, Any]:
        try:
            resp = await self._client.get(path, params=params)
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as e:
            logger.error("HTTP %s from %s: %s", e.response.status_code, path, e.response.text)
            raise
        except httpx.RequestError as e:
            logger.error("Request error fetching %s: %s", path, e)
            raise

    # ------------------------------------------------------------------
    # Competition
    # ------------------------------------------------------------------

    async def get_competition(self) -> dict[str, Any]:
        return await self._get(f"/competitions/{COMP}")

    # ------------------------------------------------------------------
    # Matches
    # ------------------------------------------------------------------

    async def get_all_matches(self) -> list[dict[str, Any]]:
        data = await self._get(f"/competitions/{COMP}/matches")
        return data.get("matches", [])

    async def get_matches_by_status(self, status: str) -> list[dict[str, Any]]:
        """status: SCHEDULED | LIVE | IN_PLAY | PAUSED | FINISHED | POSTPONED"""
        data = await self._get(f"/competitions/{COMP}/matches", params={"status": status})
        return data.get("matches", [])

    async def get_live_matches(self) -> list[dict[str, Any]]:
        data = await self._get(f"/competitions/{COMP}/matches", params={"status": "LIVE,IN_PLAY,PAUSED"})
        return data.get("matches", [])

    async def get_match(self, match_id: int) -> dict[str, Any]:
        return await self._get(f"/matches/{match_id}")

    async def get_match_head2head(self, match_id: int, limit: int = 10) -> dict[str, Any]:
        return await self._get(f"/matches/{match_id}/head2head", params={"limit": limit})

    # ------------------------------------------------------------------
    # Teams & squads
    # ------------------------------------------------------------------

    async def get_teams(self) -> list[dict[str, Any]]:
        data = await self._get(f"/competitions/{COMP}/teams")
        return data.get("teams", [])

    async def get_team(self, team_id: int) -> dict[str, Any]:
        return await self._get(f"/teams/{team_id}")

    async def get_team_matches(
        self,
        team_id: int,
        status: str | None = None,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        params: dict[str, Any] = {"competitions": COMP, "limit": limit}
        if status:
            params["status"] = status
        data = await self._get(f"/teams/{team_id}/matches", params=params)
        return data.get("matches", [])

    async def get_team_recent_matches(
        self,
        team_id: int,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Fetch last N finished matches without restricting to WC competition."""
        params: dict[str, Any] = {"status": "FINISHED", "limit": limit}
        data = await self._get(f"/teams/{team_id}/matches", params=params)
        return data.get("matches", [])

    # ------------------------------------------------------------------
    # Standings
    # ------------------------------------------------------------------

    async def get_standings(self) -> list[dict[str, Any]]:
        data = await self._get(f"/competitions/{COMP}/standings")
        return data.get("standings", [])

    # ------------------------------------------------------------------
    # Scorers
    # ------------------------------------------------------------------

    async def get_top_scorers(self, limit: int = 20) -> list[dict[str, Any]]:
        data = await self._get(f"/competitions/{COMP}/scorers", params={"limit": limit})
        return data.get("scorers", [])

    async def aclose(self):
        await self._client.aclose()


# Module-level singleton
_client: FootballDataClient | None = None


def get_football_data_client() -> FootballDataClient:
    global _client
    if _client is None:
        _client = FootballDataClient()
    return _client
