import json
import numpy as np
from src.db.supabase import supabase

def add_document(text, embedding, metadata=None, user_id=None):
    # Convert numpy array to list for Supabase
    embedding_list = np.array(embedding, dtype=np.float32).tolist()
    
    meta = metadata or {}
    if user_id:
        meta["user_id"] = user_id
        
    data = {
        "content": text,
        "metadata": meta,
        "embedding": embedding_list
    }
    
    response = supabase.table("documents").insert(data).execute()
    return response

def get_all_uploads(user_id: str = None):
    # Fetch metadata and created_at
    query = supabase.table("documents").select("metadata, created_at").order("created_at", desc=True)
    
    # Filter by user_id if provided
    if user_id:
        # Assuming metadata is a JSONB column and we store user_id inside it
        query = query.eq("metadata->>user_id", user_id)
        
    response = query.limit(100).execute()
    
    # Setup a set to track unique filenames
    seen_files = set()
    uploads = []
    
    for row in response.data:
        meta = row.get("metadata", {})
        filename = meta.get("filename")
        if filename and filename not in seen_files:
            seen_files.add(filename)
            # Add timestamp if not in metadata but in row
            if "created_at" in row and "created_at" not in meta:
                meta["created_at"] = row["created_at"]
            uploads.append(meta)
            
    return uploads

def delete_document(filename: str, user_id: str = None):
    # Filter by filename and user_id in metadata
    query = supabase.table("documents").delete().eq("metadata->>filename", filename)
    
    if user_id:
        query = query.eq("metadata->>user_id", user_id)
        
    response = query.execute()
    return True

def query_documents(query_text: str, top_k=5, user_id: str = None):
    from src.core.embeddings import get_embedding
    
    query_emb = get_embedding(query_text)
    
    # Call the RPC function 'match_documents'
    # We need to ensure the SQL function 'match_documents' accepts a filter or update it.
    # For now, we will pass user_id as a parameter if the function supports it.
    params = {
        "query_embedding": query_emb,
        "match_threshold": 0.5, 
        "match_count": top_k
    }
    
    # If our match_documents RPC takes a 'filter_user_id' parameter:
    if user_id:
        params["filter_user_id"] = user_id
    
    try:
        response = supabase.rpc("match_documents", params).execute()
        
        results = []
        for match in response.data:
            results.append(match.get("content", ""))
            
        return "\n\n".join(results)
    except Exception as e:
        print(f"Error querying documents: {e}")
        # Fallback: if user_id was passed but RPC failed, it might not support it yet.
        # But we should aim for strict privacy.
        return ""
