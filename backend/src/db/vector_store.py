import numpy as np
from src.db.supabase import supabase


def add_document(text, embedding, metadata=None, user_id=None):

    embedding_list = np.array(
        embedding,
        dtype=np.float32
    ).tolist()

    meta = metadata or {}

    if user_id:
        meta["user_id"] = user_id

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

    query = (
        supabase
        .table("documents")
        .select("metadata, created_at")
        .order(
            "created_at",
            desc=True
        )
    )

    if user_id:

        query = query.eq(
            "metadata->>user_id",
            user_id
        )

    response = (
        query
        .limit(100)
        .execute()
    )

    seen_files = set()
    uploads = []

    for row in response.data:

        meta = row.get(
            "metadata",
            {}
        )

        filename = meta.get(
            "filename"
        )

        if (
            filename
            and filename not in seen_files
        ):

            seen_files.add(
                filename
            )

            if (
                "created_at" in row
                and "created_at" not in meta
            ):
                meta["created_at"] = row[
                    "created_at"
                ]

            uploads.append(
                meta
            )

    return uploads


def delete_document(
    filename: str,
    user_id: str = None
):

    query = (
        supabase
        .table("documents")
        .delete()
        .eq(
            "metadata->>filename",
            filename
        )
    )

    if user_id:

        query = query.eq(
            "metadata->>user_id",
            user_id
        )

    query.execute()

    notice_query = (
        supabase
        .table("notices")
        .delete()
        .eq(
            "filename",
            filename
        )
    )

    if user_id:

        notice_query = (
            notice_query.eq(
                "uploaded_by",
                user_id
            )
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

    query_emb = get_embedding(
        query_text
    )

    trusted_results = []
    low_trust_results = []

    try:

        # Balance retrieval across selected files
        if (
            selected_docs
            and len(selected_docs) > 0
        ):

            docs_count = len(
                selected_docs
            )

            chunks_per_doc = max(
                1,
                top_k // docs_count
            )

            for filename in selected_docs:

                params = {
                    "query_embedding": query_emb,
                    "match_threshold": 0.5,
                    "match_count": chunks_per_doc,
                    "filter_user_id": user_id,
                    "filter_filenames": [
                        filename
                    ]
                }

                response = (
                    supabase
                    .rpc(
                        "match_documents",
                        params
                    )
                    .execute()
                )

                matches = (
                    response.data
                    or []
                )

                for match in matches:

                    metadata = match.get(
                        "metadata",
                        {}
                    )

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

                    formatted = (
                        f"[Source: {source_name}]\n"
                        f"{content}"
                    )

                    if trust_score >= 50:

                        trusted_results.append(
                            formatted
                        )

                    else:

                        low_trust_results.append(
                            f"[Low-confidence source: "
                            f"{trust_score}%]\n"
                            f"{formatted}"
                        )

        else:

            params = {
                "query_embedding": query_emb,
                "match_threshold": 0.5,
                "match_count": top_k,
                "filter_user_id": user_id,
            }

            response = (
                supabase
                .rpc(
                    "match_documents",
                    params
                )
                .execute()
            )

            matches = (
                response.data
                or []
            )

            for match in matches:

                metadata = match.get(
                    "metadata",
                    {}
                )

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

                formatted = (
                    f"[Source: {source_name}]\n"
                    f"{content}"
                )

                if trust_score >= 50:

                    trusted_results.append(
                        formatted
                    )

                else:

                    low_trust_results.append(
                        f"[Low-confidence source: "
                        f"{trust_score}%]\n"
                        f"{formatted}"
                    )

        final_results = (
            trusted_results
            if trusted_results
            else low_trust_results
        )

        return "\n\n".join(
            final_results
        )

    except Exception as e:

        print(
            f"Error querying documents: {e}"
        )

        return ""