from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from src.chat_db import create_session, get_all_sessions, get_session, delete_session, get_messages_by_session
from src.api.auth import get_current_user

router = APIRouter()

class SessionBase(BaseModel):
    title: str

class SessionResponse(BaseModel):
    id: str
    title: str
    created_at: str

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    created_at: str

@router.get("/sessions", response_model=List[SessionResponse])
async def list_sessions(current_user = Depends(get_current_user)):
    sessions = get_all_sessions(user_id=current_user.id)
    return sessions

@router.post("/sessions", response_model=SessionResponse)
async def create_new_session(session: SessionBase, current_user = Depends(get_current_user)):
    session_id = create_session(session.title, user_id=current_user.id)
    created_session = get_session(session_id, user_id=current_user.id)
    if not created_session:
        raise HTTPException(status_code=500, detail="Failed to create session")
    return created_session

@router.get("/sessions/{session_id}", response_model=List[MessageResponse])
async def get_session_history(session_id: str, current_user = Depends(get_current_user)):
    # Verify session belongs to user
    session = get_session(session_id, user_id=current_user.id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    messages = get_messages_by_session(session_id)
    return messages

@router.delete("/sessions/{session_id}")
async def delete_chat_session(session_id: str, current_user = Depends(get_current_user)):
    delete_session(session_id, user_id=current_user.id)
    return {"status": "deleted"}
