import numpy as np
from src.db.supabase import supabase


def add_document(text, embedding, metadata=None, user_id=None):
    # =========================================
    # CONVERT EMBEDDING FOR SUPABASE
    # =========================================

    embedding_list = np.array(
        embedding,
        dtype=np.float32
    ).tolist()

    meta = metadata or {}

    # =========================================
    # ATTACH USER ID
    # =========================================

    if user_id:
        meta["user_id"] = user_id

    # =========================================
    # DOCUMENT PAYLOAD
    # =========================================

    data = {
        "content": text,
        "metadata": meta,
        "embedding": embedding_list,
    }

    response = (
        supabase
        .table("documents")
        .insert(data)
        .execute()
    )

    return response


def get_all_uploads(user_id: str = None):
    # =========================================
    # FETCH DOCUMENTS
    # =========================================

    query = (
        supabase
        .table("documents")
        .select("metadata, created_at")
        .order("created_at", desc=True)
    )

    # =========================================
    # USER FILTER
    # =========================================

    if user_id:
        query = query.eq(
            "metadata->>user_id",
            user_id
        )

    response = query.limit(100).execute()

    seen_files = set()
    uploads = []

    # =========================================
    # REMOVE DUPLICATES
    # =========================================

    for row in response.data:
        meta = row.get("metadata", {})

        filename = meta.get("filename")

        if filename and filename not in seen_files:
            seen_files.add(filename)

            # Add created_at into metadata
            if (
                "created_at" in row
                and "created_at" not in meta
            ):
                meta["created_at"] = row["created_at"]

            uploads.append(meta)

    return uploads


def delete_document(filename: str, user_id: str = None):

    # =========================================
    # DELETE VECTOR DOCUMENTS
    # =========================================

    query = (
        supabase
        .table("documents")
        .delete()
        .eq("metadata->>filename", filename)
    )

    if user_id:
        query = query.eq(
            "metadata->>user_id",
            user_id
        )

    query.execute()

    # =========================================
    # DELETE NOTICE ENTRY
    # =========================================

    notice_query = (
        supabase
        .table("notices")
        .delete()
        .eq("filename", filename)
    )

    if user_id:
        notice_query = notice_query.eq(
            "uploaded_by",
            user_id
        )

    notice_query.execute()

    return True

def query_documents(
    query_text: str,
    top_k=5,
    user_id: str = None,
    selected_docs: list[str] = None,
):
    from src.core.embeddings import get_embedding

    # =========================================
    # GENERATE QUERY EMBEDDING
    # =========================================

    query_emb = get_embedding(query_text)

    # =========================================
    # RPC PARAMETERS
    # =========================================

    params = {
        "query_embedding": query_emb,
        "match_threshold": 0.5,
        "match_count": top_k,
        "filter_user_id": user_id,
    }

    # =========================================
    # MULTI DOCUMENT FILTER
    # =========================================

    if selected_docs and len(selected_docs) > 0:
        params["filter_filenames"] = selected_docs

    try:

        # =========================================
        # VECTOR SEARCH
        # =========================================

        response = (
            supabase
            .rpc("match_documents", params)
            .execute()
        )

        trusted_results = []
        low_trust_results = []

        # =========================================
        # PROCESS MATCHES
        # =========================================

        for match in response.data:

            metadata = match.get("metadata", {})

            trust_score = metadata.get(
                "trust_score",
                0
            )

            content = match.get(
                "content",
                ""
            )

            source_name = metadata.get(
                "filename",
                "Unknown Source"
            )

            formatted_content = (
                f"[Source: {source_name}]\n"
                f"{content}"
            )

            # =========================================
            # TRUST FILTERING
            # =========================================

            if trust_score >= 50:

                trusted_results.append(
                    formatted_content
                )

            else:

                warning_content = (
                    f"[Low-confidence source: "
                    f"{trust_score}%]\n"
                    f"{formatted_content}"
                )

                low_trust_results.append(
                    warning_content
                )

        # =========================================
        # PRIORITIZE TRUSTED RESULTS
        # =========================================

        final_results = (
            trusted_results
            if trusted_results
            else low_trust_results
        )

        return "\n\n".join(final_results)

    except Exception as e:

        print(f"Error querying documents: {e}")

        return ""