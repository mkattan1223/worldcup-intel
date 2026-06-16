from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    football_data_api_key: str
    supabase_url: str
    supabase_key: str
    poll_interval_seconds: int = 60
    env: str = "development"

    # Football-Data.org World Cup 2026 competition code
    wc_competition_code: str = "WC"
    football_data_base_url: str = "https://api.football-data.org/v4"


settings = Settings()
