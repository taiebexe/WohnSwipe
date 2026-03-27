from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://wohnswipe:password@localhost:5432/wohnswipe"
    scrape_interval_hours: int = 4
    max_listings_per_run: int = 30
    scrape_start_hour: int = 6   # Berlin time
    scrape_end_hour: int = 22    # Berlin time
    min_delay_seconds: float = 3.0
    max_delay_seconds: float = 8.0

    class Config:
        env_prefix = ""


settings = Settings()
