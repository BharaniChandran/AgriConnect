from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    SUPABASE_URL: str = Field(..., description="Backend connection to Supabase project")
    SUPABASE_ANON_KEY: str = Field(..., description="Frontend/public Supabase client calls")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(..., description="Backend-only privileged operations")
    SUPABASE_DB_PASSWORD: str = Field(..., description="Direct Postgres connection")
    RAZORPAY_KEY_ID: str = Field(..., description="Payment capture, refunds, payouts")
    RAZORPAY_KEY_SECRET: str = Field(..., description="Payment capture, refunds, payouts secret")
    DATA_GOV_IN_API_KEY: str = Field(..., description="Live Agmarknet mandi price ingestion")
    SMS_PROVIDER_SID: str = Field(..., description="Phone-OTP login + SMS notifications")
    SMS_PROVIDER_AUTH_TOKEN: str = Field(..., description="Phone-OTP login token")
    MAPS_API_KEY: str | None = Field(None, description="Real distance/transport-cost calculation")

    model_config = SettingsConfigDict(
        env_file="../.env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

try:
    settings = Settings()
except Exception as e:
    print(f"FATAL ERROR: Failed to load required environment variables.\n{e}")
    exit(1)
