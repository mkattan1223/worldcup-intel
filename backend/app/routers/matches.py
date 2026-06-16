from fastapi import APIRouter, HTTPException, Query
from app.database import get_supabase
from app.services.football_data import get_football_data_client
from app.services.poisson import score_probability_grid

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
    """Fetch starting lineups and formations from Football-Data.org."""
    client = get_football_data_client()
    raw = await client.get_match(match_id)

    def extract_side(team: dict) -> dict:
        return {
            "formation": team.get("formation"),
            "lineup": [
                {
                    "id": p.get("id"),
                    "name": p.get("name"),
                    "shirtNumber": p.get("shirtNumber"),
                    "position": p.get("position"),
                }
                for p in (team.get("lineup") or [])
            ],
            "bench": [
                {
                    "id": p.get("id"),
                    "name": p.get("name"),
                    "shirtNumber": p.get("shirtNumber"),
                    "position": p.get("position"),
                }
                for p in (team.get("bench") or [])
            ],
        }

    return {
        "home": extract_side(raw.get("homeTeam", {})),
        "away": extract_side(raw.get("awayTeam", {})),
        "status": raw.get("status"),
    }


@router.get("/{match_id}/auto-analysis")
async def auto_analysis(match_id: int):
    """
    Auto-calculate xG for each team from their last 10 WC matches in Supabase,
    then return the full Poisson probability grid with no manual input needed.
    """
    db = get_supabase()

    match_result = db.table("matches").select("*").eq("id", match_id).single().execute()
    if not match_result.data:
        raise HTTPException(status_code=404, detail="Match not found")
    match = match_result.data

    home_id = match["home_team_id"]
    away_id = match["away_team_id"]

    def team_stats(team_id: int) -> dict:
        res = (
            db.table("matches")
            .select("ft_home,ft_away,home_team_id,away_team_id")
            .or_(f"home_team_id.eq.{team_id},away_team_id.eq.{team_id}")
            .eq("status", "FINISHED")
            .order("utc_date", desc=True)
            .limit(10)
            .execute()
        )
        rows = res.data or []
        scored, conceded = [], []
        for m in rows:
            if m["ft_home"] is None or m["ft_away"] is None:
                continue
            is_home = m["home_team_id"] == team_id
            scored.append(m["ft_home"] if is_home else m["ft_away"])
            conceded.append(m["ft_away"] if is_home else m["ft_home"])
        avg_s = round(sum(scored) / len(scored), 3) if scored else 1.2
        avg_c = round(sum(conceded) / len(conceded), 3) if conceded else 1.1
        return {"avg_scored": avg_s, "avg_conceded": avg_c, "matches_used": len(scored)}

    home_stats = team_stats(home_id)
    away_stats = team_stats(away_id)

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
async def head2head(match_id: int, limit: int = Query(20)):
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


@router.get("/{match_id}/poisson")
async def match_poisson(
    match_id: int,
    home_xg: float = Query(..., gt=0),
    away_xg: float = Query(..., gt=0),
    max_goals: int = Query(5, ge=3, le=10),
):
    return score_probability_grid(home_xg, away_xg, max_goals)
