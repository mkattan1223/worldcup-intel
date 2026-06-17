import logging
import httpx
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Query
from app.database import get_supabase
from app.services.football_data import get_football_data_client
from app.services.poisson import score_probability_grid
from app.data.csv_loader import find_h2h, find_form
from app.data.team_name_map import TEAM_NAME_MAP, resolve_csv_name
from app.data.espn_team_map import ESPN_TEAM_MAP

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("/")
async def list_matches(
    status: str | None = Query(None),
    stage: str | None = Query(None),
):
    db = get_supabase()
    query = db.table("matches").select("*").order("utc_date")
    if status:
        query = query.eq("status", status)
    if stage:
        query = query.eq("stage", stage)
    result = query.execute()
    return result.data or []


@router.get("/live")
async def live_matches():
    client = get_football_data_client()
    return await client.get_live_matches()


@router.get("/{match_id}")
async def get_match(match_id: int):
    db = get_supabase()
    result = db.table("matches").select("*").eq("id", match_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Match not found")
    return result.data


def _parse_espn_roster(roster: dict) -> dict:
    """Parse a single ESPN roster object into {formation, lineup, bench}."""
    empty = {"formation": None, "lineup": [], "bench": []}
    if not roster:
        return empty
    formation = roster.get("formation") or None
    entries = roster.get("roster", roster.get("entries", []))
    lineup, bench = [], []
    for e in entries:
        athlete = e.get("athlete", {})
        pos_obj = e.get("position", athlete.get("position", {}))
        pos = pos_obj.get("abbreviation", "") if isinstance(pos_obj, dict) else str(pos_obj)
        player = {
            "id": athlete.get("id"),
            "name": athlete.get("displayName", athlete.get("fullName", "")),
            "shirtNumber": e.get("jersey", athlete.get("jersey")),
            "position": pos,
        }
        if e.get("starter") is True:
            lineup.append(player)
        else:
            bench.append(player)
    return {"formation": formation, "lineup": lineup, "bench": bench}


async def _espn_fetch_rosters(event_id: str) -> list[dict]:
    """Fetch rosters for a known ESPN event ID."""
    url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary?event={event_id}"
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.get(url)
    if resp.status_code != 200:
        return []
    return resp.json().get("rosters", [])


async def _espn_find_event(match_date_str: str, home_name: str) -> str | None:
    """Find ESPN event ID for a match by date + home team name. Tries UTC date and UTC-1."""
    if not match_date_str:
        return None
    base = datetime.strptime(match_date_str[:10].replace("-", ""), "%Y%m%d")
    dates_to_try = [base.strftime("%Y%m%d"), (base - timedelta(days=1)).strftime("%Y%m%d")]
    async with httpx.AsyncClient(timeout=10) as client:
        for d in dates_to_try:
            resp = await client.get(
                f"https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates={d}"
            )
            if resp.status_code != 200:
                continue
            for ev in resp.json().get("events", []):
                comps = ev.get("competitions", [])
                if not comps:
                    continue
                teams = {c.get("team", {}).get("displayName", "").lower()
                         for c in comps[0].get("competitors", [])}
                if home_name.lower() in teams or any(home_name.lower()[:5] in t for t in teams):
                    return str(ev["id"])
    return None


async def _espn_rosters_for_match(match_date: str, home_name: str) -> list[dict]:
    """Convenience: find event + fetch its rosters."""
    event_id = await _espn_find_event(match_date, home_name)
    if not event_id:
        return []
    return await _espn_fetch_rosters(event_id)


def _assign_sides(rosters: list[dict], home_name: str) -> tuple[dict, dict]:
    """Split ESPN rosters into home/away dicts."""
    empty = {"formation": None, "lineup": [], "bench": []}
    home_side: dict = {}
    away_side: dict = {}
    for r in rosters:
        dn = r.get("team", {}).get("displayName", "")
        if home_name.lower()[:5] in dn.lower():
            home_side = _parse_espn_roster(r)
        else:
            away_side = _parse_espn_roster(r)
    if not home_side and len(rosters) >= 2:
        home_side = _parse_espn_roster(rosters[0])
        away_side = _parse_espn_roster(rosters[1])
    return home_side or empty, away_side or empty


async def _fetch_predicted_side(fdb_team_id: int, team_name: str) -> tuple[dict, str]:
    """Fetch the lineup from a team's most recent WC match as a predicted lineup.
    Returns (side_dict, based_on_string)."""
    empty = {"formation": None, "lineup": [], "bench": []}
    espn_id = ESPN_TEAM_MAP.get(fdb_team_id)
    if not espn_id:
        return empty, ""
    try:
        url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/{espn_id}/schedule"
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(url)
        if resp.status_code != 200:
            return empty, ""
        events = resp.json().get("events", [])
        # Find the most recent completed event
        finished = [ev for ev in events
                    if ev.get("competitions", [{}])[0].get("status", {})
                       .get("type", {}).get("completed", False)]
        if not finished:
            return empty, ""
        last = finished[-1]
        last_event_id = str(last["id"])
        last_date = last.get("date", "")[:10]
        # Get opponent name for the based_on message
        comps = last.get("competitions", [{}])[0].get("competitors", [])
        opp = next(
            (c["team"]["displayName"] for c in comps
             if c.get("team", {}).get("displayName", "").lower()[:5] not in team_name.lower()[:5]),
            "previous match"
        )
        rosters = await _espn_fetch_rosters(last_event_id)
        # Find this team's side
        for r in rosters:
            dn = r.get("team", {}).get("displayName", "")
            if team_name.lower()[:5] in dn.lower() or dn.lower()[:5] in team_name.lower():
                return _parse_espn_roster(r), f"vs {opp} on {last_date}"
        # Fallback: if we can't match by name, try homeAway=home side
        if rosters:
            return _parse_espn_roster(rosters[0]), f"vs {opp} on {last_date}"
    except Exception as exc:
        logger.warning("Predicted lineup fetch failed for %s: %s", team_name, exc)
    return empty, ""


@router.get("/{match_id}/lineups")
async def match_lineups(match_id: int):
    """Smart lineup endpoint:
    - FINISHED / IN_PLAY: returns actual lineup from ESPN
    - SCHEDULED ≤ 20 min to kickoff: tries ESPN for official, falls back to predicted
    - SCHEDULED > 20 min to kickoff: returns predicted lineup from team's last WC match
    """
    db = get_supabase()
    match_result = db.table("matches").select("*").eq("id", match_id).single().execute()
    if not match_result.data:
        raise HTTPException(status_code=404, detail="Match not found")
    match = match_result.data

    utc_date = match.get("utc_date", "")
    home_name = match.get("home_team_name", "")
    away_name = match.get("away_team_name", "")
    status = match.get("status", "SCHEDULED")
    home_id = match.get("home_team_id")
    away_id = match.get("away_team_id")
    empty = {"formation": None, "lineup": [], "bench": []}

    # Compute minutes until kickoff
    minutes_until: float | None = None
    try:
        kickoff = datetime.fromisoformat(utc_date.replace("Z", "+00:00"))
        minutes_until = (kickoff - datetime.now(timezone.utc)).total_seconds() / 60
    except Exception:
        pass

    is_live_or_done = status in ("LIVE", "IN_PLAY", "PAUSED", "FINISHED")

    # ── Live / Finished: actual lineup ───────────────────────────────────────
    if is_live_or_done:
        try:
            rosters = await _espn_rosters_for_match(utc_date, home_name)
            if rosters:
                home_side, away_side = _assign_sides(rosters, home_name)
                if home_side.get("lineup"):
                    return {
                        "home": home_side, "away": away_side,
                        "status": status, "source": "espn",
                        "isPredicted": False, "isOfficial": True,
                    }
        except Exception as exc:
            logger.warning("ESPN lineup for live/done match %s failed: %s", match_id, exc)
        return {"home": empty, "away": empty, "status": status, "isPredicted": False, "isOfficial": False}

    # ── Within 20 min: try ESPN for official lineup ───────────────────────────
    if minutes_until is not None and minutes_until <= 20:
        try:
            rosters = await _espn_rosters_for_match(utc_date, home_name)
            if rosters:
                home_side, away_side = _assign_sides(rosters, home_name)
                if home_side.get("lineup"):
                    return {
                        "home": home_side, "away": away_side,
                        "status": status, "source": "espn",
                        "isPredicted": False, "isOfficial": True,
                        "minutesUntilKickoff": int(minutes_until),
                    }
        except Exception:
            pass
        # Official not yet available — fall through to predicted

    # ── Predicted: use last WC match lineup ──────────────────────────────────
    try:
        home_pred, home_based = await _fetch_predicted_side(home_id, home_name)
        away_pred, away_based = await _fetch_predicted_side(away_id, away_name)
        has_prediction = bool(home_pred.get("lineup") or away_pred.get("lineup"))
        based_on = f"{home_name}: {home_based}; {away_name}: {away_based}".strip("; ")
        return {
            "home": home_pred if home_pred.get("lineup") else empty,
            "away": away_pred if away_pred.get("lineup") else empty,
            "status": status,
            "isPredicted": has_prediction,
            "isOfficial": False,
            "awaitingOfficial": minutes_until is not None and minutes_until <= 20,
            "basedOn": based_on if has_prediction else None,
            "minutesUntilKickoff": int(minutes_until) if minutes_until is not None else None,
            "source": "espn-predicted",
        }
    except Exception as exc:
        logger.warning("Predicted lineup failed for match %s: %s", match_id, exc)

    return {"home": empty, "away": empty, "status": status, "isPredicted": False, "isOfficial": False}


def _csv_team_name(team_id: int, supabase_name: str) -> str:
    """Resolve a team's CSV name from their FDB id or Supabase display name."""
    if team_id in TEAM_NAME_MAP:
        return TEAM_NAME_MAP[team_id]
    # Try alias map
    resolved = resolve_csv_name(supabase_name)
    return resolved


def _team_stats_from_csv(team_id: int, team_name: str) -> dict:
    """Compute avg goals scored/conceded from 2025+ CSV form data."""
    csv_name = _csv_team_name(team_id, team_name)
    rows = find_form(csv_name, since="2025-01-01")
    scored, conceded = [], []
    for r in rows:
        is_home = r["home_team"] == csv_name
        gs = r["home_score"] if is_home else r["away_score"]
        gc = r["away_score"] if is_home else r["home_score"]
        scored.append(float(gs))
        conceded.append(float(gc))
    n = len(scored)
    return {
        "avg_scored": round(sum(scored) / n, 3) if n else 1.2,
        "avg_conceded": round(sum(conceded) / n, 3) if n else 1.1,
        "matches_used": n,
        "csv_name": csv_name,
    }


@router.get("/{match_id}/auto-analysis")
async def auto_analysis(match_id: int):
    """
    Auto-calculate xG using 2025+ form data from results.csv (all competitions).
    Frontend applies Bayesian blend with static scouting ratings.
    """
    db = get_supabase()

    match_result = db.table("matches").select("*").eq("id", match_id).single().execute()
    if not match_result.data:
        raise HTTPException(status_code=404, detail="Match not found")
    match = match_result.data

    home_id = match["home_team_id"]
    away_id = match["away_team_id"]

    home_stats = _team_stats_from_csv(home_id, match["home_team_name"])
    away_stats = _team_stats_from_csv(away_id, match["away_team_name"])

    # Dixon-Coles inspired: blend attack vs opponent defence
    home_lambda = round((home_stats["avg_scored"] + away_stats["avg_conceded"]) / 2, 3)
    away_lambda = round((away_stats["avg_scored"] + home_stats["avg_conceded"]) / 2, 3)
    home_lambda = max(0.3, min(home_lambda, 5.0))
    away_lambda = max(0.3, min(away_lambda, 5.0))

    grid = score_probability_grid(home_lambda, away_lambda, max_goals=5)

    return {
        **grid,
        "home_lambda": home_lambda,
        "away_lambda": away_lambda,
        "home_stats": home_stats,
        "away_stats": away_stats,
        "home_team_name": match["home_team_name"],
        "away_team_name": match["away_team_name"],
        "home_team_crest": match.get("home_team_crest"),
        "away_team_crest": match.get("away_team_crest"),
    }


@router.get("/{match_id}/head2head")
async def head2head(match_id: int, limit: int = Query(50)):
    """Fetch H2H history and normalize to snake_case for the frontend."""
    client = get_football_data_client()
    raw = await client.get_match_head2head(match_id, limit=limit)

    matches = []
    for m in raw.get("matches", []):
        score = m.get("score", {})
        ft = score.get("fullTime", {})
        matches.append({
            "id": m.get("id"),
            "utc_date": m.get("utcDate"),
            "status": m.get("status"),
            "competition": m.get("competition", {}).get("name"),
            "stage": m.get("stage"),
            "home_team_id": m.get("homeTeam", {}).get("id"),
            "home_team_name": m.get("homeTeam", {}).get("name"),
            "home_team_crest": m.get("homeTeam", {}).get("crest"),
            "away_team_id": m.get("awayTeam", {}).get("id"),
            "away_team_name": m.get("awayTeam", {}).get("name"),
            "away_team_crest": m.get("awayTeam", {}).get("crest"),
            "ft_home": ft.get("home"),
            "ft_away": ft.get("away"),
            "venue": m.get("venue"),
        })

    agg = raw.get("aggregates", {})
    return {"matches": matches, "aggregates": agg}


@router.get("/{match_id}/head2head-full")
async def head2head_full(match_id: int):
    """Full H2H history from results.csv — all competitions, all time."""
    db = get_supabase()
    match_result = db.table("matches").select("*").eq("id", match_id).single().execute()
    if not match_result.data:
        raise HTTPException(status_code=404, detail="Match not found")
    match = match_result.data

    team_a_id = match["home_team_id"]
    team_b_id = match["away_team_id"]
    team_a_name_db = match["home_team_name"]
    team_b_name_db = match["away_team_name"]

    team_a_csv = _csv_team_name(team_a_id, team_a_name_db)
    team_b_csv = _csv_team_name(team_b_id, team_b_name_db)

    rows = find_h2h(team_a_csv, team_b_csv)

    # Compute aggregates from actual data
    a_wins = draws = b_wins = 0
    for r in rows:
        hs, as_ = int(r["home_score"]), int(r["away_score"])
        team_a_is_home = r["home_team"] == team_a_csv
        team_a_score = hs if team_a_is_home else as_
        team_b_score = as_ if team_a_is_home else hs
        if team_a_score > team_b_score:
            a_wins += 1
        elif team_a_score == team_b_score:
            draws += 1
        else:
            b_wins += 1

    return {
        "team_a_name": team_a_name_db,
        "team_b_name": team_b_name_db,
        "team_a_csv": team_a_csv,
        "team_b_csv": team_b_csv,
        "matches": rows,
        "aggregates": {
            "total_matches": len(rows),
            "team_a_wins": a_wins,
            "draws": draws,
            "team_b_wins": b_wins,
        },
    }


@router.get("/{match_id}/poisson")
async def match_poisson(
    match_id: int,
    home_xg: float = Query(..., gt=0),
    away_xg: float = Query(..., gt=0),
    max_goals: int = Query(5, ge=3, le=10),
):
    return score_probability_grid(home_xg, away_xg, max_goals)
