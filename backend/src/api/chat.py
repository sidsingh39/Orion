from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from src.services.chat_service import handle_chat_stream
from src.api.auth import get_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    session_id: str = None

@router.post("/chat")
def chat_endpoint(request: ChatRequest, current_user = Depends(get_current_user)):
    return StreamingResponse(
        handle_chat_stream(request.query, request.session_id, user_id=current_user.id), 
        media_type="text/plain"
    )
