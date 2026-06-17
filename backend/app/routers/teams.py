import logging
from fastapi import APIRouter, HTTPException, Query
from app.database import get_supabase
from app.services.football_data import get_football_data_client
from app.services.six_sigma import imr_control_limits
from app.data.csv_loader import find_form
from app.data.team_name_map import TEAM_NAME_MAP, resolve_csv_name

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/teams", tags=["teams"])


def _resolve_csv_name(team_id: int) -> str | None:
    return TEAM_NAME_MAP.get(team_id)


@router.get("/")
async def list_teams():
    db = get_supabase()
    result = db.table("teams").select("*").order("name").execute()
    return result.data


@router.get("/standings")
async def standings():
    db = get_supabase()
    result = db.table("standings").select("*").order("group,position").execute()
    return result.data


@router.get("/{team_id}")
async def get_team(team_id: int):
    db = get_supabase()
    result = db.table("teams").select("*").eq("id", team_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Team not found")
    return result.data


@router.get("/{team_id}/matches")
async def team_matches(team_id: int, status: str | None = Query(None)):
    db = get_supabase()
    query = (
        db.table("matches")
        .select("*")
        .or_(f"home_team_id.eq.{team_id},away_team_id.eq.{team_id}")
        .order("utc_date", desc=True)
        .limit(20)
    )
    if status:
        query = query.eq("status", status)
    result = query.execute()
    return result.data or []


@router.get("/{team_id}/recent-matches")
async def team_recent_matches(team_id: int, limit: int = Query(10)):
    """Last N finished matches for a team across ALL competitions (Football-Data.org)."""
    client = get_football_data_client()
    raw = await client.get_team_recent_matches(team_id, limit=limit)
    results = []
    for m in raw:
        ft = (m.get("score") or {}).get("fullTime") or {}
        is_home = (m.get("homeTeam") or {}).get("id") == team_id
        results.append({
            "id": m.get("id"),
            "utc_date": m.get("utcDate"),
            "competition": (m.get("competition") or {}).get("name"),
            "home_team_name": (m.get("homeTeam") or {}).get("name"),
            "away_team_name": (m.get("awayTeam") or {}).get("name"),
            "ft_home": ft.get("home"),
            "ft_away": ft.get("away"),
            "is_home": is_home,
            "goals_scored": ft.get("home") if is_home else ft.get("away"),
            "goals_conceded": ft.get("away") if is_home else ft.get("home"),
        })
    return results


@router.get("/{team_id}/form-matches")
async def team_form_matches(team_id: int, since: str = Query("2025-01-01")):
    """All matches since a given date from results.csv — qualifiers, friendlies, Nations League, WC."""
    csv_name = _resolve_csv_name(team_id)
    if not csv_name:
        raise HTTPException(status_code=404, detail=f"No CSV name mapping for team {team_id}")

    rows = find_form(csv_name, since=since)
    results = []
    for r in rows:
        is_home = r["home_team"] == csv_name
        gs = r["home_score"] if is_home else r["away_score"]
        gc = r["away_score"] if is_home else r["home_score"]
        opponent = r["away_team"] if is_home else r["home_team"]
        if gs > gc:
            result = "W"
        elif gs == gc:
            result = "D"
        else:
            result = "L"
        results.append({
            "date": r["date"],
            "opponent": opponent,
            "is_home": is_home,
            "goals_scored": gs,
            "goals_conceded": gc,
            "result": result,
            "tournament": r.get("tournament", ""),
            "city": r.get("city", ""),
            "country": r.get("country", ""),
        })
    return {"csv_name": csv_name, "matches": results}


@router.get("/{team_id}/control-chart")
async def team_control_chart(
    team_id: int,
    metric: str = Query("goals_scored", description="goals_scored|goals_conceded"),
):
    """Six Sigma I-MR chart powered by results.csv (all competitions since Jan 2025)."""
    csv_name = _resolve_csv_name(team_id)
    values: list[float] = []

    if csv_name:
        rows = find_form(csv_name, since="2025-01-01")
        for r in rows:
            is_home = r["home_team"] == csv_name
            if metric == "goals_scored":
                v = r["home_score"] if is_home else r["away_score"]
            else:
                v = r["away_score"] if is_home else r["home_score"]
            values.append(float(v))

    # Fallback: Supabase WC matches (when team has no CSV mapping or CSV returns nothing)
    if len(values) < 2:
        db = get_supabase()
        result = (
            db.table("matches")
            .select("utc_date,ft_home,ft_away,home_team_id,away_team_id")
            .or_(f"home_team_id.eq.{team_id},away_team_id.eq.{team_id}")
            .eq("status", "FINISHED")
            .order("utc_date")
            .execute()
        )
        for m in result.data:
            is_home = m["home_team_id"] == team_id
            if metric == "goals_scored":
                v = m["ft_home"] if is_home else m["ft_away"]
            else:
                v = m["ft_away"] if is_home else m["ft_home"]
            if v is not None:
                values.append(float(v))

    if len(values) < 2:
        return {"error": "Not enough finished matches for control chart", "values": values}

    return imr_control_limits(values)
