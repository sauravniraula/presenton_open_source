import os
from typing import List, Optional

from ppt_generator.models.query_and_prompt_models import (
    IconCategoryEnum,
    IconQueryCollectionWithData,
    ImagePromptWithThemeAndAspectRatio,
)


async def generate_image(
    input: ImagePromptWithThemeAndAspectRatio, output_path: str
) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    print(f"Request - Generating Image for {input.image_prompt}")

    with open("assets/images/placeholder.jpg", "rb") as f_a:
        with open(output_path, "wb") as f_b:
            f_b.write(f_a.read())


async def get_images(query: str, page: int, limit: int) -> List[str]:
    search_url = f"https://api.pexels.com/v1/search"

    # headers = {"Authorization": os.getenv("PEXELS_API_KEY")}
    # async with aiohttp.ClientSession() as client:
    #     response = await client.get(
    #         search_url,
    #         headers=headers,
    #         params={"query": query, "page": page, "per_page": limit},
    #     )
    #     if response.status != 200:
    #         raise HTTPException(400, "Error occured while searching images")

    #     response = await response.json()
    #     photos = response.get("photos")
    #     if photos:
    #         return list(map(lambda x: x["src"]["large"], response["photos"]))

    return []


async def get_serp_images(query: str, page: int, limit: int) -> List[str]:
    search_url = "https://api.search.brave.com/res/v1/images/search"
    # headers = {"X-Subscription-Token": os.getenv("BRAVE_SEARCH_API_KEY")}
    # print(headers)
    # async with aiohttp.ClientSession() as client:
    #     response = await client.get(
    #         search_url,
    #         headers=headers,
    #         params={
    #             "q": query,
    #             "count": limit,
    #             "search_lang": "en",
    #             "country": "us",
    #             "spellcheck": 1,
    #         },
    #     )
    #     print(response)
    #     print(response.text)
    #     if response.status != 200:
    #         raise HTTPException(400, "Error occured while searching images")

    #     response = await response.json()
    #     results = response.get("results")
    #     if results:
    #         return list(map(lambda x: x["thumbnail"]["src"], results))

    return []


async def get_icon(input: IconQueryCollectionWithData, output_path: str) -> str:
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    # results = redis.get(query)
    # if results:
    #     print(results)
    #     results = json.loads(results)
    #     icon = results[0]["name"]
    #     print("Icon fetched from redis")
    # else:
    #     async with aiohttp.ClientSession() as client:
    #         retries = 4
    #         while retries:
    #             try:
    #                 results = await vector_store.asimilarity_search(query=query, k=20)
    #             except Exception as e:
    #                 print(f"Error while fetching icon: {e}")
    #                 retries -= 1
    #                 continue
    #             break
    #         if not results:
    #             raise Exception("Issue with searching through icons embeddings")
    #         redis.set(query, [{"name": icon.metadata["name"]} for icon in results])
    #         icon = results[0].metadata["name"]
    #         print("Icon fetched from vector store")
    # icon_url = (
    #     f"https://presenton-icons.s3.ap-south-1.amazonaws.com/bold/{icon}-bold.png"
    # )
    with open(output_path, "wb") as f_a:
        with open("assets/icons/placeholder.png", "rb") as f_b:
            f_a.write(f_b.read())


async def get_icons(
    query: str, page: int, limit: int, category: Optional[IconCategoryEnum] = None
) -> List[str]:
    # # Get more results than needed to have a buffer for pagination
    # fetch_limit = max(
    #     20, page * limit
    # )  # Fetch at least 20 or whatever is needed for current page
    # results = redis.get(query)
    # print(results)
    # if results:
    #     results = json.loads(results)
    #     print("Icon fetched from redis")
    # else:
    #     results = await vector_store.asimilarity_search(query=query, k=fetch_limit)
    #     results = [{"name": result.metadata["name"]} for result in results]
    #     redis.set(query, results)
    #     print("Icon fetched from vector store")

    # # Calculate start and end indices for pagination
    # start_idx = (page - 1) * limit
    # end_idx = start_idx + limit

    # # Slice the results according to pagination parameters
    # paginated_results = results[start_idx:end_idx]

    # icons = [
    #     f"https://presenton-icons.s3.ap-south-1.amazonaws.com/bold/{result['name']}-bold.png"
    #     for result in paginated_results
    # ]
    # return icons
    return []
