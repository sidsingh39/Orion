from src.core.llm import ask_llm, ask_llm_stream
from src.db.vector_store import query_documents
from src.chat_db import (
    add_message,
    get_messages_by_session,
    get_session,
)


def handle_chat_stream(
    query: str,
    session_id: str = None,
    user_id: str = None,
    selected_docs: list[str] = None,
):
    # =========================================
    # VERIFY SESSION OWNERSHIP
    # =========================================

    if session_id and user_id:
        session = get_session(session_id, user_id=user_id)

        if not session:
            yield "Error: Session not found or access denied."
            return

    # =========================================
    # SAVE USER MESSAGE
    # =========================================

    if session_id:
        add_message(session_id, "user", query)

    # =========================================
    # DOCUMENT RETRIEVAL
    # =========================================

    context = query_documents(
        query_text=query,
        user_id=user_id,
        selected_docs=selected_docs,
    )

    # =========================================
    # CONVERSATION HISTORY
    # =========================================

    history_text = ""

    if session_id:
        messages = get_messages_by_session(session_id)

        # Exclude latest user message
        recent_messages = messages[:-1][-10:]

        if recent_messages:
            history_text = "\nConversation History:\n"

            for msg in recent_messages:
                role = "User" if msg["role"] == "user" else "AI"

                history_text += f"{role}: {msg['content']}\n"

    # =========================================
    # ACTIVE DOCUMENT INFO
    # =========================================

    active_doc_text = ""

    if selected_docs and len(selected_docs) > 0:
        active_doc_text = (
            f"\nCurrently selected document(s): {', '.join(selected_docs)}\n"
        )

    # =========================================
    # PROMPT BUILDING
    # =========================================

    if context:
        prompt = f"""
You are ORION, an intelligent academic assistant.

Use the provided context carefully.

IMPORTANT RULES:
- Use uploaded document context when available.
- If context contains [Low-confidence source: X%],
  clearly mention that the information may not be fully verified.
- Prefer verified information whenever possible.
- If a specific document is selected, prioritize information only from that document.
- Do not hallucinate document contents.

{active_doc_text}

Context:
{context}

{history_text}

User Question:
{query}
"""
    else:
        prompt = f"""
You are ORION, an intelligent academic assistant.

IMPORTANT:
- If no document context exists,
  clearly say you could not find relevant uploaded document information.
- Do not pretend to access files you cannot retrieve.

{active_doc_text}

{history_text}

User Question:
{query}
"""

    print(
        f"\nSending prompt to Groq "
        f"(Context: {len(context) if context else 0}, "
        f"History: {len(history_text)} chars)\n"
    )

    # =========================================
    # STREAM RESPONSE
    # =========================================

    full_response = ""

    for chunk in ask_llm_stream(prompt):
        full_response += chunk
        yield chunk

    # =========================================
    # SAVE AI RESPONSE
    # =========================================

    if session_id:
        add_message(session_id, "assistant", full_response)