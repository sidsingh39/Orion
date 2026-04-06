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
    query = supabase.table("documents").select("metadata, created_at").order("created_at", desc=True)

    if user_id:
        query = query.eq("metadata->>user_id", user_id)

    response = query.limit(100).execute()

    seen_files = set()
    uploads = []

    for row in response.data:
        meta = row.get("metadata", {})
        filename = meta.get("filename")

        if filename and filename not in seen_files:
            seen_files.add(filename)

            if "created_at" in row and "created_at" not in meta:
                meta["created_at"] = row["created_at"]

            uploads.append(meta)

    return uploads


def delete_document(filename: str, user_id: str = None):
    query = supabase.table("documents").delete().eq("metadata->>filename", filename)

    if user_id:
        query = query.eq("metadata->>user_id", user_id)

    response = query.execute()
    return True


def query_documents(query_text: str, top_k=5, user_id: str = None):
    from src.core.embeddings import get_embedding

    query_emb = get_embedding(query_text)

    params = {
        "query_embedding": query_emb,
        "match_threshold": 0.5,
        "match_count": top_k
    }

    if user_id:
        params["filter_user_id"] = user_id

    try:
        response = supabase.rpc("match_documents", params).execute()

        # trust-aware filtering
        trusted_results = []
        low_trust_results = []

        for match in response.data:
            metadata = match.get("metadata", {})
            trust_score = metadata.get("trust_score", 0)
            content = match.get("content", "")

            if trust_score >= 50:
                trusted_results.append(content)
            else:
                warning_content = f"[Low-confidence source: {trust_score}%] {content}"
                low_trust_results.append(warning_content)

        # prefer trusted content first
        final_results = trusted_results if trusted_results else low_trust_results

        return "\n\n".join(final_results)

    except Exception as e:
        print(f"Error querying documents: {e}")
        return ""