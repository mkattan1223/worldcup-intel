import logging
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import matches, teams, analytics
from app.services.ingestion import run_full_sync

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up — running initial sync")
    await run_full_sync()

    scheduler.add_job(
        run_full_sync,
        "interval",
        seconds=settings.poll_interval_seconds,
        id="full_sync",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started: polling every %ds", settings.poll_interval_seconds)

    yield

    scheduler.shutdown()
    logger.info("Scheduler stopped")


app = FastAPI(
    title="WorldCup Intel API",
    version="1.0.0",
    description="Live World Cup 2026 match intelligence",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(matches.router)
app.include_router(teams.router)
app.include_router(analytics.router)


@app.get("/")
async def root():
    return {"status": "ok", "poll_interval_seconds": settings.poll_interval_seconds}


@app.post("/sync", tags=["admin"])
async def manual_sync():
    result = await run_full_sync()
    return result
