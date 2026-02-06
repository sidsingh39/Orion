from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from src.services.chat_service import handle_chat_stream

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    session_id: str = None

@router.post("/chat")
def chat_endpoint(request: ChatRequest):
    return StreamingResponse(
        handle_chat_stream(request.query, request.session_id), 
        media_type="text/plain"
    )
