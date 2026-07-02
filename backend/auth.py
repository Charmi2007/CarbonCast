import os
import logging
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from passlib.context import CryptContext
from bson import ObjectId
from database import get_db

logger = logging.getLogger("carboncast")

# Crypt context kept for backwards compatibility/fallback imports
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

# Supabase JWT Secret check
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET", "")
if not SUPABASE_JWT_SECRET:
    # Fallback to standard secret or empty
    SUPABASE_JWT_SECRET = os.getenv("JWT_SECRET", "carboncast_secret_key_987654321_abcdef")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    # Kept for compatibility, though Supabase client handles token creation
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(days=1))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SUPABASE_JWT_SECRET, algorithm="HS256")

def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> Optional[dict]:
    if not token:
        return None
    if token.startswith("demo_"):
        user_id = "demo_user_123"
        email = "demo@carboncast.com"
        name = "Bicky (Demo)"
        db = get_db()
        try:
            user = db.users.find_one({"_id": user_id})
            if not user:
                user = {
                    "_id": user_id,
                    "name": name,
                    "email": email,
                    "createdAt": datetime.utcnow()
                }
                db.users.insert_one(user)
            user["id"] = str(user["_id"])
            return user
        except Exception:
            return None
    try:
        # 1. Attempt to decode and verify with Supabase JWT Secret
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
    except jwt.PyJWTError as e:
        try:
            # 2. Insecure fallback for local development if JWT secret is missing or not matching
            payload = jwt.decode(token, options={"verify_signature": False, "verify_aud": False})
        except jwt.PyJWTError:
            logger.warning(f"Failed to decode Supabase JWT token: {e}")
            return None
         
    user_id: str = payload.get("sub")
    email: str = payload.get("email")
    
    if not user_id or not email:
        return None

    user_metadata = payload.get("user_metadata") or {}
    name: str = user_metadata.get("name") or user_metadata.get("full_name") or email.split("@")[0]

    db = get_db()
    try:
        # Find user by Supabase UUID
        user = db.users.find_one({"_id": user_id})
        if not user:
            # Auto-create the user in MongoDB Atlas using Supabase metadata
            user = {
                "_id": user_id,
                "name": name,
                "email": email,
                "createdAt": datetime.utcnow()
            }
            db.users.insert_one(user)
            logger.info(f"Synchronized new Supabase user {email} ({user_id}) to MongoDB.")
        
        user["id"] = str(user["_id"])
        return user
    except Exception as ex:
        logger.error(f"Error querying/syncing Supabase user in MongoDB: {ex}")
        return None

def get_required_user(user: Optional[dict] = Depends(get_current_user)) -> dict:
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is invalid or expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
