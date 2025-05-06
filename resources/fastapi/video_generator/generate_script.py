import json
import asyncio
import aiohttp
import base64
import math
from io import BytesIO
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from typing import List, Dict, Any
from .utils import process_slide_images
from .models import PresentationScript
from openai import OpenAI
from .schema import SCRIPT_SCHEMA
from time import time
from langsmith import wrappers
from .models import SlideInfo

# Add new utility function for downloading and converting images
async def download_and_encode_image(session, url) -> str:
    async with session.get(url) as response:
        if response.status != 200:
            raise Exception(f"Failed to download image: {url}")
        image_data = await response.read()
        base64_image = base64.b64encode(image_data).decode('utf-8')
        return f"data:image/png;base64,{base64_image}"

async def generate_script_from_slides(
    slides: List[SlideInfo],
    tone: str,
    user_prompt: str = ""
) -> Dict[str, Any]:
    try:
        client = wrappers.wrap_openai(OpenAI())

        # Process images in parallel
        async with aiohttp.ClientSession() as session:
            tasks = [download_and_encode_image(session, slide.image) for slide in slides]
            base64_images = await asyncio.gather(*tasks)

        script_length_prompt = "For each slide, the script length should be as follows:\n"
        for slide in slides:
            script_length_prompt += f"\nSlide with index {slide.index} should have exactly {math.ceil(slide.seconds * 2.2)} words.\n"

        content = [
            {
                "type": "text",
                "text": f"Tone of the scripts should be '{tone}'. {script_length_prompt} User request about the script is: '{user_prompt}'."
            }
        ]

        # Use base64 encoded images
        for base64_image in base64_images:
            content.append({
                "type": "image_url",
                "image_url": {
                    "url": base64_image,
                }
            })

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": [
                        {
                            "type": "text",
                            "text": "Generate a JSON script for each slide in a presentation based on the given images, adhering strictly to the specified word count for each slide's script. Ensure the script matches the provided tone and incorporates any user comments or requests. For slides with bullet points, provide an explanation for each bullet, separated by a punctuation mark. Explain the bullet points sequentially.\n\n# Steps\n\n1. Review the image of the slide to extract the content and context.\n2. Analyze the tone and any specific requests provided.\n3. For slides with bullet points, identify each bullet and generate a sequential explanation for each. Ensure each explanation is separated by a punctuation mark.\n4. Adhere strictly to the specified word count for each slide's script. If word count is not specified, use a default of 60 words per slide.\n5. Construct the script in a JSON format, ensuring clarity and adherence to requests.\n\n# Output Format\n\nThe output should be structured as a JSON, clearly indicating each slide and its corresponding script content. Each slide script should strictly comply with the provided word count."
                        }
                    ]
                },
                {
                    "role": "user",
                    "content": content
                },
            ],
            temperature=1,
            max_tokens=2048,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            response_format=SCRIPT_SCHEMA
        )

        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(e)
        raise e

# Test code remains the same
if __name__ == "__main__":
    data = {
        "slides": [
            {
                "image": "https://present-for-me.s3.amazonaws.com/processed/da1e291c-7b72-4d51-ba25-7c121972bc95.pptx/slide_0/thumbnail.png",
                "index": 0
            }
        ],
        "tone": "professional",
        "user_prompt": "",
        "length": "20 Seconds"
    }
    start_time = time()
    asyncio.run(generate_script_from_slides(
        data["slides"], 
        data["tone"], 
        data["length"], 
        data["user_prompt"]
    ))
    end_time = time()
    print(f"Time taken: {end_time - start_time} seconds")
