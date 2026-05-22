from fastapi import APIRouter, Depends, HTTPException
from src.api.auth import get_current_user
from src.db.supabase import supabase

router = APIRouter()


# ============================================
# GET LATEST NOTICES
# ============================================

@router.get("/notices/latest")
def get_latest_notices(current_user=Depends(get_current_user)):

    response = (
        supabase
        .table("notices")
        .select("*")
        .order("created_at", desc=True)
        .limit(20)
        .execute()
    )

    return response.data


# ============================================
# GET SINGLE NOTICE
# ============================================

@router.get("/notices/{notice_id}")
def get_notice(
    notice_id: str,
    current_user=Depends(get_current_user)
):

    response = (
        supabase
        .table("notices")
        .select("*")
        .eq("id", notice_id)
        .execute()
    )

    if not response.data:
        raise HTTPException(
            status_code=404,
            detail="Notice not found"
        )

    return response.data[0]