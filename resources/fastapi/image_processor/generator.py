import os
from typing import List, Optional, Tuple
import uuid
import aiohttp
from fastapi import HTTPException
import replicate

from api.services.instances import temp_file_service
from api.utils import download_file
from ppt_generator.models.query_and_prompt_models import (
    IconCategoryEnum,
    IconQueryCollectionWithData,
    ImagePromptWithAspectRatio,
)
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores.upstash import UpstashVectorStore
from upstash_redis import Redis
import json


embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

vector_store = UpstashVectorStore(
    embedding=embeddings,
    index_url=os.getenv("UPSTASH_VECTOR_REST_URL_ICONS"),
    index_token=os.getenv("UPSTASH_VECTOR_REST_TOKEN_ICONS"),
)

redis = Redis(
    url=os.getenv("UPSTASH_REDIS_REST_URL"), token=os.getenv("UPSTASH_REDIS_REST_TOKEN")
)

IMAGE_GEN_MODEL = "black-forest-labs/flux-schnell"
IMAGE_GEN_OUTPUT_FORMAT = "jpg"
IMAGE_GEN_NUM_OUTPUTS = 1


async def generate_image(input: ImagePromptWithAspectRatio, output_path: str) -> str:
    print(f"Request - Generating Image for {input.image_prompt}")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    replicate_client = replicate.Client(timeout=50)
    try:
        output = await replicate_client.async_run(
            IMAGE_GEN_MODEL,
            input={
                "prompt": f"{input.image_prompt}, {input.theme_prompt}",
                "aspect_ratio": input.aspect_ratio.value,
                "output_format": IMAGE_GEN_OUTPUT_FORMAT,
                "num_outputs": IMAGE_GEN_NUM_OUTPUTS,
            },
        )
        print(f"Resposne - Generated Image for {input.image_prompt}")
        file_bytes = output[0].read()
        with open(output_path, "wb") as f:
            f.write(file_bytes)
    except Exception as e:
        print("******** Error while generate image")
        with open("assets/images/placeholder.jpg", "rb") as f_a:
            with open(output_path, "wb") as f_b:
                f_b.write(f_a.read())


async def get_images(query: str, page: int, limit: int) -> List[str]:
    search_url = f"https://api.pexels.com/v1/search"

    headers = {"Authorization": os.getenv("PEXELS_API_KEY")}
    async with aiohttp.ClientSession() as client:
        response = await client.get(
            search_url,
            headers=headers,
            params={"query": query, "page": page, "per_page": limit},
        )
        if response.status != 200:
            raise HTTPException(400, "Error occured while searching images")

        response = await response.json()
        photos = response.get("photos")
        if photos:
            return list(map(lambda x: x["src"]["large"], response["photos"]))

        return []


async def get_serp_images(query: str, page: int, limit: int) -> List[str]:
    search_url = "https://api.search.brave.com/res/v1/images/search"
    headers = {"X-Subscription-Token": os.getenv("BRAVE_SEARCH_API_KEY")}
    print(headers)
    async with aiohttp.ClientSession() as client:
        response = await client.get(
            search_url,
            headers=headers,
            params={
                "q": query,
                "count": limit,
                "search_lang": "en",
                "country": "us",
                "spellcheck": 1,
            },
        )
        print(response)
        print(response.text)
        if response.status != 200:
            raise HTTPException(400, "Error occured while searching images")

        response = await response.json()
        results = response.get("results")
        if results:
            return list(map(lambda x: x["thumbnail"]["src"], results))

        return []


async def get_icon(input: IconQueryCollectionWithData, output_path: str) -> str:
    icon_url = None
    query = input.icon_query.queries[0]
    print(f"Request - Fetching Icon for {input.icon_query}")
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    results = redis.get(query)
    if results:
        print(results)
        results = json.loads(results)
        icon = results[0]["name"]
        print("Icon fetched from redis")
    else:
        async with aiohttp.ClientSession() as client:
            retries = 4
            while retries:
                try:
                    results = await vector_store.asimilarity_search(query=query, k=20)
                except Exception as e:
                    print(f"Error while fetching icon: {e}")
                    retries -= 1
                    continue
                break
            if not results:
                raise Exception("Issue with searching through icons embeddings")
            redis.set(query, [{"name": icon.metadata["name"]} for icon in results])
            icon = results[0].metadata["name"]
            print("Icon fetched from vector store")
    icon_url = (
        f"https://presenton-icons.s3.ap-south-1.amazonaws.com/bold/{icon}-bold.png"
    )
    print(f"Response - Fetched Icon for {icon_url}")

    success = await download_file(icon_url, output_path, {})
    if not success:
        with open(output_path, "wb") as f_a:
            with open("assets/icons/placeholder.png", "rb") as f_b:
                f_a.write(f_b.read())


async def get_icons(
    query: str, page: int, limit: int, category: Optional[IconCategoryEnum] = None
) -> List[str]:
    # Get more results than needed to have a buffer for pagination
    fetch_limit = max(
        20, page * limit
    )  # Fetch at least 20 or whatever is needed for current page
    results = redis.get(query)
    print(results)
    if results:
        results = json.loads(results)
        print("Icon fetched from redis")
    else:
        results = await vector_store.asimilarity_search(query=query, k=fetch_limit)
        results = [{"name": result.metadata["name"]} for result in results]
        redis.set(query, results)
        print("Icon fetched from vector store")

    # Calculate start and end indices for pagination
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit

    # Slice the results according to pagination parameters
    paginated_results = results[start_idx:end_idx]

    icons = [
        f"https://presenton-icons.s3.ap-south-1.amazonaws.com/bold/{result['name']}-bold.png"
        for result in paginated_results
    ]
    return icons
