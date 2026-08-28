from pathlib import Path
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent

class Settings(BaseSettings):
    SUPABASE_URL: str = Field(default="https://qzblitdwibzwlzkasskp.supabase.co", description="Backend connection to Supabase project")
    SUPABASE_ANON_KEY: str = Field(default="", description="Frontend/public Supabase client calls")
    SUPABASE_SERVICE_ROLE_KEY: str = Field(default="", description="Backend-only privileged operations")
    SUPABASE_DB_PASSWORD: str = Field(default="", description="Direct Postgres connection")
    RAZORPAY_KEY_ID: str = Field(default="mock_rzp_key", description="Payment capture, refunds, payouts")
    RAZORPAY_KEY_SECRET: str = Field(default="mock_rzp_secret", description="Payment capture, refunds, payouts secret")
    DATA_GOV_IN_API_KEY: str = Field(default="", description="Live Agmarknet mandi price ingestion")
    SMS_PROVIDER_SID: str = Field(default="", description="Phone-OTP login + SMS notifications")
    SMS_PROVIDER_AUTH_TOKEN: str = Field(default="", description="Phone-OTP login token")
    MAPS_API_KEY: str | None = Field(default=None, description="Real distance/transport-cost calculation")
    ORS_API_KEY: str | None = Field(default=None, description="HeiGIT openrouteservice API key for Matrix & Geocoding")

    model_config = SettingsConfigDict(
        env_file=(str(ENV_DIR / ".env"), str(BACKEND_DIR / ".env"), ".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

try:
    settings = Settings()
except Exception as e:
    print(f"FATAL ERROR: Failed to load required environment variables.\n{e}")
    exit(1)
