import os
from typing import List, Dict
import requests
from io import BytesIO
from PIL import Image
import base64
import asyncio
import aiohttp

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage


async def download_and_resize_image_async(session: aiohttp.ClientSession, image_url: str, target_size: tuple = (512, 512)) -> str:
    async with session.get(image_url) as response:
        img_data = await response.read()
    
    img = Image.open(BytesIO(img_data))
    if img.mode == 'RGBA':
        img = img.convert('RGB')
    
    img.thumbnail(target_size, Image.Resampling.LANCZOS)
    
    img_byte_arr = BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr = img_byte_arr.getvalue()
    base64_image = base64.b64encode(img_byte_arr).decode('utf-8')
    
    return f"data:image/jpeg;base64,{base64_image}"

def process_slide_images(slide_images: List[str]) -> List[str]:
    """Synchronous wrapper for async image processing"""
    async def _process_images():
        async with aiohttp.ClientSession() as session:
            tasks = [
                download_and_resize_image_async(session, image_url)
                for image_url in slide_images
            ]
            return await asyncio.gather(*tasks)
    
    # Run async code in sync context
    return asyncio.run(_process_images())
