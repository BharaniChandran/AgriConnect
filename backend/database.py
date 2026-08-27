import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import NullPool
from supabase import create_client, Client
from functools import lru_cache
from config import settings
import urllib.parse

# Construct the Supavisor Pooler URL (Transaction Mode - Port 6543)
# Note: You might need to update the host if your Supabase project uses a different pooler URL (e.g. aws-0-us-east-1.pooler.supabase.com)
project_ref = settings.SUPABASE_URL.replace("https://", "").split(".")[0]
encoded_password = urllib.parse.quote_plus(settings.SUPABASE_DB_PASSWORD)
# Assuming a standard pooler format or fallback to db.project_ref
DB_HOST = os.environ.get("SUPABASE_POOLER_HOST", f"aws-0-eu-central-1.pooler.supabase.com")
SQLALCHEMY_DATABASE_URL = f"postgresql+asyncpg://postgres.{project_ref}:{encoded_password}@{DB_HOST}:6543/postgres"

# Engine setup: poolclass=NullPool and statement_cache_size=0 as per instructions
engine = create_async_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=NullPool,
    connect_args={"statement_cache_size": 0}
)

AsyncSessionLocal = sessionmaker(
    autocommit=False, 
    autoflush=False, 
    bind=engine, 
    class_=AsyncSession
)

Base = declarative_base()

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

@lru_cache()
def get_supabase_admin_client() -> Client:
    """Cached Supabase client using the Service Role Key for backend-privileged operations."""
    return create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY
    )
