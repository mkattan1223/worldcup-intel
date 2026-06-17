"""Loads results.csv once at startup and provides query helpers."""
import csv
import os
from pathlib import Path

_CSV_PATH = Path(__file__).parent / "results.csv"

# Loaded once at import time: list of dicts with keys
# date, home_team, away_team, home_score, away_score, tournament, city, country, neutral
_ROWS: list[dict] = []

def _load() -> None:
    if not _CSV_PATH.exists():
        return
    with open(_CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                row["home_score"] = int(row["home_score"])
                row["away_score"] = int(row["away_score"])
            except (ValueError, KeyError):
                continue
            _ROWS.append(row)

_load()


def get_rows() -> list[dict]:
    return _ROWS


def find_h2h(team_a: str, team_b: str) -> list[dict]:
    """Return all historical matches between two teams, newest first."""
    results = []
    for row in _ROWS:
        ht, at = row["home_team"], row["away_team"]
        if (ht == team_a and at == team_b) or (ht == team_b and at == team_a):
            results.append(row)
    results.sort(key=lambda r: r["date"], reverse=True)
    return results


def find_form(team_name: str, since: str = "2025-01-01") -> list[dict]:
    """Return all matches for a team since a given date, oldest first."""
    results = []
    for row in _ROWS:
        if row["date"] < since:
            continue
        if row["home_team"] == team_name or row["away_team"] == team_name:
            results.append(row)
    results.sort(key=lambda r: r["date"])
    return results
