"""
Polling service: fetches World Cup 2026 data from Football-Data.org
every POLL_INTERVAL_SECONDS and upserts into Supabase.
"""

import logging
from datetime import datetime, timezone

from app.config import settings
from app.database import get_supabase
from app.services.football_data import get_football_data_client

logger = logging.getLogger(__name__)


def _normalize_match(raw: dict) -> dict:
    """Flatten a Football-Data.org match object for Supabase storage."""
    score = raw.get("score", {})
    ft = score.get("fullTime", {})
    ht = score.get("halfTime", {})
    home = raw.get("homeTeam", {})
    away = raw.get("awayTeam", {})

    return {
        "id": raw["id"],
        "utc_date": raw["utcDate"],
        "status": raw["status"],
        "matchday": raw.get("matchday"),
        "stage": raw.get("stage"),
        "group": raw.get("group"),
        "venue": raw.get("venue"),
        "home_team_id": home.get("id"),
        "home_team_name": home.get("name"),
        "home_team_tla": home.get("tla"),
        "home_team_crest": home.get("crest"),
        "away_team_id": away.get("id"),
        "away_team_name": away.get("name"),
        "away_team_tla": away.get("tla"),
        "away_team_crest": away.get("crest"),
        "score_winner": score.get("winner"),
        "score_duration": score.get("duration"),
        "ft_home": ft.get("home"),
        "ft_away": ft.get("away"),
        "ht_home": ht.get("home"),
        "ht_away": ht.get("away"),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


def _normalize_team(raw: dict) -> dict:
    return {
        "id": raw["id"],
        "name": raw.get("name"),
        "short_name": raw.get("shortName"),
        "tla": raw.get("tla"),
        "crest": raw.get("crest"),
        "address": raw.get("address"),
        "website": raw.get("website"),
        "founded": raw.get("founded"),
        "club_colors": raw.get("clubColors"),
        "venue": raw.get("venue"),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


async def sync_matches() -> int:
    client = get_football_data_client()
    db = get_supabase()

    matches_raw = await client.get_all_matches()
    if not matches_raw:
        logger.warning("No matches returned from API")
        return 0

    rows = [_normalize_match(m) for m in matches_raw]
    result = db.table("matches").upsert(rows, on_conflict="id").execute()
    logger.info("Upserted %d matches", len(rows))
    return len(rows)


async def sync_teams() -> int:
    client = get_football_data_client()
    db = get_supabase()

    teams_raw = await client.get_teams()
    if not teams_raw:
        logger.warning("No teams returned from API")
        return 0

    rows = [_normalize_team(t) for t in teams_raw]
    result = db.table("teams").upsert(rows, on_conflict="id").execute()
    logger.info("Upserted %d teams", len(rows))
    return len(rows)


async def sync_standings() -> None:
    client = get_football_data_client()
    db = get_supabase()

    standings_raw = await client.get_standings()
    rows = []
    fetched_at = datetime.now(timezone.utc).isoformat()

    for table in standings_raw:
        stage = table.get("stage")
        group = table.get("group")
        for entry in table.get("table", []):
            team = entry.get("team", {})
            rows.append({
                "team_id": team.get("id"),
                "team_name": team.get("name"),
                "team_tla": team.get("tla"),
                "stage": stage,
                "group": group,
                "position": entry.get("position"),
                "played": entry.get("playedGames"),
                "won": entry.get("won"),
                "draw": entry.get("draw"),
                "lost": entry.get("lost"),
                "goals_for": entry.get("goalsFor"),
                "goals_against": entry.get("goalsAgainst"),
                "goal_difference": entry.get("goalDifference"),
                "points": entry.get("points"),
                "fetched_at": fetched_at,
            })

    if rows:
        db.table("standings").upsert(rows, on_conflict="team_id,stage,group").execute()
        logger.info("Upserted %d standing rows", len(rows))


async def run_full_sync() -> dict:
    logger.info("Starting full sync at %s", datetime.now(timezone.utc).isoformat())
    results = {}
    try:
        results["matches"] = await sync_matches()
    except Exception as e:
        logger.error("Match sync failed: %s", e)
        results["matches_error"] = str(e)

    try:
        results["teams"] = await sync_teams()
    except Exception as e:
        logger.error("Team sync failed: %s", e)
        results["teams_error"] = str(e)

    try:
        await sync_standings()
        results["standings"] = "ok"
    except Exception as e:
        logger.error("Standings sync failed: %s", e)
        results["standings_error"] = str(e)

    logger.info("Full sync complete: %s", results)
    return results
