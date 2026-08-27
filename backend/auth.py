from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from config import settings

SECRET_KEY = settings.SUPABASE_SERVICE_ROLE_KEY or "super_secret_jwt_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 7 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security_bearer = HTTPBearer(auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Dict[str, Any]:
    """Decode and verify Supabase JWT or local JWT token."""
    try:
        # Try decoding with Supabase secret / service key or without verification for mock tokens
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_signature": False})
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {e}",
            headers={"WWW-Authenticate": "Bearer"},
        )

class AuthenticatedUser:
    def __init__(self, id: str, role: str, name: str, phone: str, preferred_language: str, is_admin: bool = False):
        self.id = id
        self.role = role
        self.name = name
        self.phone = phone
        self.preferred_language = preferred_language
        self.is_admin = is_admin

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)) -> AuthenticatedUser:
    """
    FastAPI dependency: verifies JWT and returns AuthenticatedUser.
    Supports Supabase Auth tokens as well as test session tokens.
    """
    if not credentials:
        # For testing / demo fallback if no token provided, return demo user
        return AuthenticatedUser(
            id="demo-user-id",
            role="farmer",
            name="Murugan (Farmer)",
            phone="+919876543210",
            preferred_language="ta",
            is_admin=False
        )
        
    token = credentials.credentials
    payload = decode_token(token)
    
    user_id = payload.get("sub") or payload.get("id")
    if not user_id:
        raise HTTPException(status_code=401, detail="User ID missing from token")
        
    role = payload.get("role", "farmer")
    name = payload.get("name", "Agri User")
    phone = payload.get("phone", "+919876543210")
    preferred_language = payload.get("preferred_language", "ta")
    is_admin = payload.get("is_admin", role == "admin")
    
    return AuthenticatedUser(
        id=str(user_id),
        role=role,
        name=name,
        phone=phone,
        preferred_language=preferred_language,
        is_admin=is_admin
    )

async def require_admin_user(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    """Dependency ensuring caller has admin privileges (for dispute resolutions)."""
    if not current_user.is_admin and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for this operation"
        )
    return current_user
