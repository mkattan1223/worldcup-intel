from pydantic import BaseModel
from typing import Optional


class Squad(BaseModel):
    id: int
    name: str
    position: Optional[str] = None
    dateOfBirth: Optional[str] = None
    nationality: Optional[str] = None


class Team(BaseModel):
    id: int
    name: str
    shortName: Optional[str] = None
    tla: Optional[str] = None
    crest: Optional[str] = None
    address: Optional[str] = None
    website: Optional[str] = None
    founded: Optional[int] = None
    clubColors: Optional[str] = None
    venue: Optional[str] = None
    squad: list[Squad] = []
