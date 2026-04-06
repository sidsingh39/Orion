from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordBearer
from src.db.supabase import supabase

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        # Verify token with Supabase
        user_response = supabase.auth.get_user(token)

        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_response.user

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.get("/me")
def read_users_me(current_user=Depends(get_current_user)):
    # Extract metadata safely
    metadata = current_user.user_metadata or {}

    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": metadata.get("username", current_user.email.split("@")[0]),
        "role": metadata.get("role", "student")
    }