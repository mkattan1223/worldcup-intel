import sys
import logging

from pydantic import ValidationError
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    football_data_api_key: str
    supabase_url: str
    supabase_key: str
    poll_interval_seconds: int = 60
    env: str = "production"
    frontend_url: str = "https://worldcup-intel-gsl8.vercel.app"

    wc_competition_code: str = "WC"
    football_data_base_url: str = "https://api.football-data.org/v4"


try:
    settings = Settings()
except ValidationError as exc:
    print("=" * 60, flush=True)
    print("STARTUP FAILED — missing required environment variables:", flush=True)
    for err in exc.errors():
        field = err["loc"][0] if err["loc"] else "unknown"
        print(f"  • {str(field).upper()} — {err['msg']}", flush=True)
    print("", flush=True)
    print("Fix: add these to the Railway Variables tab and redeploy.", flush=True)
    print("=" * 60, flush=True)
    sys.exit(1)
