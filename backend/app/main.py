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


@asynccontextmanager
async def lifespan(app: FastAPI):
    port = os.environ.get("PORT", "8000")
    logger.info("Starting WorldCup Intel API on port %s (env=%s)", port, settings.env)
    logger.info(
        "Config: supabase_url=%s frontend_url=%s poll_interval=%ds",
        settings.supabase_url[:40] + "..." if len(settings.supabase_url) > 40 else settings.supabase_url,
        settings.frontend_url,
        settings.poll_interval_seconds,
    )

    logger.info("Running initial data sync...")
    try:
        result = await run_full_sync()
        logger.info("Initial sync complete: %s", result)
    except Exception as exc:
        logger.error("Initial sync failed (app will still start): %s", exc)

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


@app.get("/")
async def root():
    return {
        "status": "ok",
        "env": settings.env,
        "poll_interval_seconds": settings.poll_interval_seconds,
        "frontend_url": settings.frontend_url,
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


@app.post("/sync", tags=["admin"])
async def manual_sync():
    result = await run_full_sync()
    return result
