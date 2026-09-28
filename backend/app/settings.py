from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    database_url: str = "sqlite:///./civilapp_demo.db"
    secret_key: str = "change-this-in-production"
    access_token_expire_minutes: int = 720
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
