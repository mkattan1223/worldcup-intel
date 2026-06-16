import asyncio
import logging
import os
from contextlib import asynccontextmanager

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import matches, teams, analytics
from app.services.ingestion import run_full_sync

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def _background_sync():
    """Run initial sync then start the recurring scheduler."""
    logger.info("Background sync starting...")
    try:
        result = await run_full_sync()
        logger.info("Initial sync complete: %s", result)
    except Exception as exc:
        logger.error("Initial sync failed: %s", exc)

    scheduler.add_job(
        run_full_sync,
        "interval",
        seconds=settings.poll_interval_seconds,
        id="full_sync",
        replace_existing=True,
    )
    scheduler.start()
    logger.info("Scheduler started: polling every %ds", settings.poll_interval_seconds)


@asynccontextmanager
async def lifespan(app: FastAPI):
    port = os.environ.get("PORT", "8000")
    logger.info("WorldCup Intel API starting on port %s", port)

    # Fire sync in background — app is ready to serve requests immediately
    asyncio.create_task(_background_sync())

    yield

    if scheduler.running:
        scheduler.shutdown()
    logger.info("Scheduler stopped")


app = FastAPI(
    title="WorldCup Intel API",
    version="1.0.0",
    description="Live World Cup 2026 match intelligence",
    lifespan=lifespan,
)

ALLOWED_ORIGINS = [
    settings.frontend_url,
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(matches.router)
app.include_router(teams.router)
app.include_router(analytics.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/")
async def root():
    return {
        "status": "ok",
        "env": settings.env,
        "poll_interval_seconds": settings.poll_interval_seconds,
    }


@app.post("/sync", tags=["admin"])
async def manual_sync():
    result = await run_full_sync()
    return result
