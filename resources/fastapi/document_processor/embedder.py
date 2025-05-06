from typing import List
from langchain_core.documents import Document
from langchain_openai import OpenAIEmbeddings

EMBEDDING_MODEL = OpenAIEmbeddings(model="text-embedding-3-small")


async def get_embeddings_from_documents(documents: List[Document]) -> List[List[float]]:
    return await EMBEDDING_MODEL.aembed_documents(
        [document.page_content for document in documents]
    )


async def get_embeddings_from_query(query: str) -> List[float]:
    return await EMBEDDING_MODEL.aembed_query(query)
