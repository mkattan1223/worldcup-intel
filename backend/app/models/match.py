from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TeamRef(BaseModel):
    id: int
    name: str
    shortName: Optional[str] = None
    tla: Optional[str] = None
    crest: Optional[str] = None


class Score(BaseModel):
    home: Optional[int] = None
    away: Optional[int] = None


class MatchScore(BaseModel):
    winner: Optional[str] = None
    duration: Optional[str] = None
    fullTime: Score = Score()
    halfTime: Score = Score()


class Match(BaseModel):
    id: int
    utcDate: datetime
    status: str
    matchday: Optional[int] = None
    stage: str
    group: Optional[str] = None
    homeTeam: TeamRef
    awayTeam: TeamRef
    score: MatchScore
    venue: Optional[str] = None
    referees: list[dict] = []
