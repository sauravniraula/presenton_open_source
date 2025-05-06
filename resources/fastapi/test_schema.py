# import json
# from ppt_generator.models.slide_model import SlideModel, BaseSlideModel, BasePresentation


# with open("data.json", "r") as f:
#     data = json.load(f)
#     presentation =  BasePresentation(**data)
#     print(presentation)
from langchain_community.vectorstores.upstash import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings
import asyncio
import os
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

# Create a vector store instance
vector_store = UpstashVectorStore(embedding=embeddings, index_url = os.getenv("UPSTASH_VECTOR_REST_URL_ICONS"), index_token=os.getenv("UPSTASH_VECTOR_REST_TOKEN_ICONS"))

async def get_language(language):
    print(language)
    language = await vector_store.asimilarity_search(query=language, k=5)
    print(language)
    return language[0].page_content


if __name__ == "__main__":
    asyncio.run(get_language("English"))
