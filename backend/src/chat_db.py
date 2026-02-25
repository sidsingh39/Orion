import uuid
from typing import List, Dict, Optional
from src.db.supabase import supabase

def create_session(title: str = "New Chat", user_id: str = None) -> str:
    session_id = str(uuid.uuid4())
    data = {
        "id": session_id,
        "title": title,
        "user_id": user_id
    }
    supabase.table("chat_sessions").insert(data).execute()
    return session_id

def get_all_sessions(user_id: str = None) -> List[Dict]:
    query = supabase.table("chat_sessions").select("*").order("created_at", desc=True)
    if user_id:
        query = query.eq("user_id", user_id)
    
    response = query.execute()
    return response.data

def get_session(session_id: str, user_id: str = None) -> Optional[Dict]:
    query = supabase.table("chat_sessions").select("*").eq("id", session_id)
    if user_id:
        query = query.eq("user_id", user_id)
    
    response = query.execute()
    return response.data[0] if response.data else None

def delete_session(session_id: str, user_id: str = None):
    query = supabase.table("chat_sessions").delete().eq("id", session_id)
    if user_id:
        query = query.eq("user_id", user_id)
    
    query.execute()

def add_message(session_id: str, role: str, content: str):
    data = {
        "session_id": session_id,
        "role": role,
        "content": content
    }
    supabase.table("chat_messages").insert(data).execute()

def get_messages_by_session(session_id: str) -> List[Dict]:
    response = supabase.table("chat_messages") \
        .select("*") \
        .eq("session_id", session_id) \
        .order("created_at", desc=False) \
        .execute()
    return response.data
