from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional

from src.services.chat_service import handle_chat_stream
from src.api.auth import get_current_user

router = APIRouter()


class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

    # MULTI-DOCUMENT SUPPORT
    selected_docs: List[str] = []


@router.post("/chat")
def chat_endpoint(
    request: ChatRequest,
    current_user=Depends(get_current_user),
):
    return StreamingResponse(
        handle_chat_stream(
            query=request.query,
            session_id=request.session_id,
            user_id=current_user.id,

            # DOCUMENT FILTERS
            selected_docs=request.selected_docs,
        ),
        media_type="text/plain",
    )