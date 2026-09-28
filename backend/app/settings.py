from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./civilapp_demo.db"
    secret_key: str = "change-this-in-production"
    access_token_expire_minutes: int = 720

    enable_demo_seed: bool = False
    bootstrap_infra_email: str | None = None
    bootstrap_infra_password: str | None = None
    bootstrap_build_email: str | None = None
    bootstrap_build_password: str | None = None

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
