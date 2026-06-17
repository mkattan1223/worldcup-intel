import logging
import httpx
from fastapi import APIRouter, HTTPException, Query
from app.database import get_supabase
from app.services.football_data import get_football_data_client
from app.services.poisson import score_probability_grid
from app.data.csv_loader import find_h2h, find_form
from app.data.team_name_map import TEAM_NAME_MAP, resolve_csv_name

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


@router.get("/{match_id}/lineups")
async def match_lineups(match_id: int):
    """Try ESPN API for real lineups; fall back to graceful empty response."""
    db = get_supabase()
    match_result = db.table("matches").select("*").eq("id", match_id).single().execute()
    match = match_result.data or {}

    utc_date = match.get("utc_date", "")
    home_name = match.get("home_team_name", "")
    away_name = match.get("away_team_name", "")

    # Build ESPN date string (YYYYMMDD)
    espn_date = utc_date[:10].replace("-", "") if utc_date else ""

    empty = {"formation": None, "lineup": [], "bench": []}

    async def try_espn() -> dict | None:
        if not espn_date:
            return None
        try:
            # Many WC games are played in US evenings → UTC date is day+1
            # Try both UTC date and UTC date-1 to cover both cases
            from datetime import datetime, timedelta
            dt = datetime.strptime(espn_date, "%Y%m%d")
            dates_to_try = [espn_date, (dt - timedelta(days=1)).strftime("%Y%m%d")]

            espn_event_id = None
            for d in dates_to_try:
                scoreboard_url = (
                    f"https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard"
                    f"?dates={d}"
                )
                async with httpx.AsyncClient(timeout=8) as client:
                    sb = await client.get(scoreboard_url)
                if sb.status_code != 200:
                    continue
                events = sb.json().get("events", [])

                # Find matching event by team name similarity
                for ev in events:
                    comps = ev.get("competitions", [{}])
                    if not comps:
                        continue
                    comp = comps[0]
                    teams = {c.get("team", {}).get("displayName", "").lower() for c in comp.get("competitors", [])}
                    if (home_name.lower() in teams or any(home_name.lower()[:5] in t for t in teams)):
                        espn_event_id = ev.get("id")
                        break
                if espn_event_id:
                    break

            if not espn_event_id:
                return None

            summary_url = (
                f"https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/summary"
                f"?event={espn_event_id}"
            )
            async with httpx.AsyncClient(timeout=8) as client:
                sm = await client.get(summary_url)
            if sm.status_code != 200:
                return None

            rosters = sm.json().get("rosters", [])
            if not rosters:
                return None

            def parse_side(roster: dict) -> dict:
                formation = roster.get("formation", None)
                # ESPN uses "roster" key (not "entries")
                entries = roster.get("roster", roster.get("entries", []))
                lineup, bench = [], []
                for e in entries:
                    athlete = e.get("athlete", {})
                    pos_obj = e.get("position", athlete.get("position", {}))
                    if isinstance(pos_obj, dict):
                        pos = pos_obj.get("abbreviation", "")
                    else:
                        pos = str(pos_obj)
                    player = {
                        "id": athlete.get("id"),
                        "name": athlete.get("displayName", athlete.get("fullName", "")),
                        "shirtNumber": e.get("jersey", athlete.get("jersey")),
                        "position": pos,
                    }
                    # ESPN uses starter:true boolean (not position string)
                    if e.get("starter") is True:
                        lineup.append(player)
                    else:
                        bench.append(player)
                return {"formation": formation, "lineup": lineup, "bench": bench}

            # Determine home / away from ESPN team names
            home_side = {}
            away_side = {}
            for r in rosters:
                team_name = r.get("team", {}).get("displayName", "")
                if home_name.lower()[:5] in team_name.lower():
                    home_side = parse_side(r)
                else:
                    away_side = parse_side(r)

            if not home_side and len(rosters) >= 2:
                home_side = parse_side(rosters[0])
                away_side = parse_side(rosters[1])

            return {"home": home_side or empty, "away": away_side or empty, "status": match.get("status", "SCHEDULED"), "source": "espn"}
        except Exception as exc:
            logger.warning("ESPN lineup fetch failed for match %s: %s", match_id, exc)
            return None

    espn_result = await try_espn()
    if espn_result:
        return espn_result

    # FDB fallback (free tier rarely returns lineup data)
    try:
        client = get_football_data_client()
        raw = await client.get_match(match_id)

        def extract_side(team: dict) -> dict:
            return {
                "formation": team.get("formation"),
                "lineup": [
                    {"id": p.get("id"), "name": p.get("name"),
                     "shirtNumber": p.get("shirtNumber"), "position": p.get("position")}
                    for p in (team.get("lineup") or [])
                ],
                "bench": [
                    {"id": p.get("id"), "name": p.get("name"),
                     "shirtNumber": p.get("shirtNumber"), "position": p.get("position")}
                    for p in (team.get("bench") or [])
                ],
            }

        return {
            "home": extract_side(raw.get("homeTeam", {})),
            "away": extract_side(raw.get("awayTeam", {})),
            "status": raw.get("status"),
        }
    except Exception:
        return {"home": empty, "away": empty, "status": "unavailable"}


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
