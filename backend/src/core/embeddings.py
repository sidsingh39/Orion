from fastembed import TextEmbedding

# Lightweight embedding model
MODEL_NAME = "BAAI/bge-small-en-v1.5"

print(f"Embedding model configured: {MODEL_NAME}")

# Global variable initially empty
model = None


def get_model():
    """
    Load model only when needed.
    Prevents Railway startup issues and repeated loading.
    """
    global model

    if model is None:
        print(f"Loading embedding model: {MODEL_NAME}")
        model = TextEmbedding(
            model_name=MODEL_NAME,
            threads=1
        )

    return model


def get_embedding(text: str):
    """
    Generate embedding for input text
    """
    embedding_model = get_model()

    embeddings = list(
        embedding_model.embed([text])
    )

    return embeddings[0].tolist()