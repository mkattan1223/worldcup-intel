from fastapi import APIRouter, HTTPException, Query
from app.database import get_supabase
from app.services.football_data import get_football_data_client
from app.services.six_sigma import imr_control_limits

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
    client = get_football_data_client()
    return await client.get_team_matches(team_id, status=status)


@router.get("/{team_id}/control-chart")
async def team_control_chart(
    team_id: int,
    metric: str = Query("goals_scored", description="goals_scored|goals_conceded|points"),
):
    """Six Sigma I-MR chart for a team's per-match metric."""
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
