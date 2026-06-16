#!/usr/bin/env python3
"""
Standalone script: fetch all World Cup 2026 matches from Football-Data.org
and print a summary. Run with:  python fetch_matches.py

Requires .env to be present in the project root (one level up)
or in the same directory as this script.
"""

import asyncio
import json
import sys
from pathlib import Path

# Allow running from the backend/ directory
sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")
load_dotenv(Path(__file__).parent / ".env")  # fallback

from app.services.football_data import FootballDataClient


async def main():
    client = FootballDataClient()
    try:
        print("Fetching competition info...")
        comp = await client.get_competition()
        print(f"  Competition : {comp.get('name')} ({comp.get('code')})")
        print(f"  Area        : {comp.get('area', {}).get('name')}")
        print(f"  Season      : {comp.get('currentSeason', {}).get('startDate')} -> "
              f"{comp.get('currentSeason', {}).get('endDate')}")
        print()

        print("Fetching all matches...")
        matches = await client.get_all_matches()
        print(f"  Total matches returned: {len(matches)}")
        print()

        by_status: dict[str, list] = {}
        by_stage: dict[str, list] = {}
        for m in matches:
            by_status.setdefault(m["status"], []).append(m)
            by_stage.setdefault(m.get("stage", "UNKNOWN"), []).append(m)

        print("By status:")
        for status, ms in sorted(by_status.items()):
            print(f"  {status:<15} {len(ms):>3} matches")

        print("\nBy stage:")
        for stage, ms in sorted(by_stage.items()):
            print(f"  {stage:<30} {len(ms):>3} matches")

        print("\nFirst 5 matches:")
        for m in matches[:5]:
            home = m.get("homeTeam", {}).get("name", "TBD")
            away = m.get("awayTeam", {}).get("name", "TBD")
            date = m.get("utcDate", "")[:10]
            status = m.get("status", "")
            ft = m.get("score", {}).get("fullTime", {})
            score_str = (
                f"{ft.get('home')} - {ft.get('away')}"
                if ft.get("home") is not None
                else "vs"
            )
            print(f"  [{date}] {home} {score_str} {away}  ({status})")

        live = [m for m in matches if m["status"] in ("LIVE", "IN_PLAY", "PAUSED")]
        if live:
            print(f"\nLive matches right now: {len(live)}")
            for m in live:
                home = m.get("homeTeam", {}).get("name")
                away = m.get("awayTeam", {}).get("name")
                ft = m.get("score", {}).get("fullTime", {})
                print(f"  LIVE: {home} {ft.get('home')} - {ft.get('away')} {away}")
        else:
            print("\nNo live matches at this moment.")

    finally:
        await client.aclose()


if __name__ == "__main__":
    asyncio.run(main())
