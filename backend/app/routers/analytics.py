from fastapi import APIRouter
from app.services.football_data import get_football_data_client

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/scorers")
async def top_scorers(limit: int = 20):
    client = get_football_data_client()
    return await client.get_top_scorers(limit=limit)


@router.get("/competition")
async def competition_info():
    client = get_football_data_client()
    return await client.get_competition()
