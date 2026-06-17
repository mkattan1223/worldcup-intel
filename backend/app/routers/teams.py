import logging
from fastapi import APIRouter, HTTPException, Query
from app.database import get_supabase
from app.services.football_data import get_football_data_client
from app.services.six_sigma import imr_control_limits

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/teams", tags=["teams"])


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
    # Query Supabase (snake_case, matches Match type) rather than Football-Data.org (camelCase)
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


@router.get("/{team_id}/control-chart")
async def team_control_chart(
    team_id: int,
    metric: str = Query("goals_scored", description="goals_scored|goals_conceded"),
):
    """Six Sigma I-MR chart — fetches last 10 finished matches from Football-Data.org (all competitions),
    falling back to Supabase WC-only data if the API call fails or returns too few matches."""
    values: list[float] = []

    # Primary: Football-Data.org (no competition filter = includes qualifiers & friendlies)
    try:
        client = get_football_data_client()
        matches = await client.get_team_recent_matches(team_id, limit=10)
        for m in matches:
            ft = (m.get("score") or {}).get("fullTime") or {}
            is_home = (m.get("homeTeam") or {}).get("id") == team_id
            if metric == "goals_scored":
                v = ft.get("home") if is_home else ft.get("away")
            elif metric == "goals_conceded":
                v = ft.get("away") if is_home else ft.get("home")
            else:
                continue
            if v is not None:
                values.append(float(v))
    except Exception as exc:
        logger.warning("Football-Data.org control-chart fetch failed, falling back to Supabase: %s", exc)

    # Fallback: Supabase WC matches
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
        values = []
        for m in result.data:
            is_home = m["home_team_id"] == team_id
            if metric == "goals_scored":
                v = m["ft_home"] if is_home else m["ft_away"]
            elif metric == "goals_conceded":
                v = m["ft_away"] if is_home else m["ft_home"]
            else:
                continue
            if v is not None:
                values.append(float(v))

    if len(values) < 2:
        return {"error": "Not enough finished matches for control chart", "values": values}

    return imr_control_limits(values)
