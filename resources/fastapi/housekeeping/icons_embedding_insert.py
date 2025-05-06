import getpass
import os
import time
import json

from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.upstash import UpstashVectorStore
from uuid import uuid4

from langchain_core.documents import Document

embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

# Create a vector store instance
vector_store = UpstashVectorStore(embedding=embeddings, index_url = os.getenv("UPSTASH_VECTOR_REST_URL_ICONS"), index_token=os.getenv("UPSTASH_VECTOR_REST_TOKEN_ICONS"))

# with open("icons.json", "r") as file:
#     data = json.load(file)
#     icons = data["icons"]

# documents = []

# i = 1
# for icon in icons:
#     if "-" in icon['name']:
#         if 'bold' in icon['name'] or 'thin' in icon['name'] or 'light' in icon['name'] or 'fill' in icon['name'] or 'duotone' in icon['name']:
#             continue
#     documents.append(Document(id = i, metadata = {"name": icon["name"]} , page_content=f"{icon['name']} - {' '.join(icon['tags'].replace('*new*', '').replace('*updated*', '').split(','))}"))
#     i += 1

# print(documents[0])
# print(len(documents))

# vector_store.add_documents(documents=documents)

for query in ["impact", "health", "economy", "gradient", "biomaterial", "bio cell", "cartilage", "mechanism", "treatment", "mechanics", "strength", "tissue", "profit", "marginality", "clients", "experience", "partnership", "inertia", "testing", "engineering"]:
    t1 = time.time()
    print("Query: ", query)
    results = vector_store.similarity_search(query=query, k=5)
    for doc in results:
        print(f"* {doc.page_content}  [{doc.metadata}]")
    print("\n Time Taken: ", time.time() - t1)
    print("\n"*3)


