from typing import Dict, Any
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
import asyncio
from api.routers.video.models import AnimationRequest, MultiAnimationRequest, AudioRequest, UpdateAnimationRequest
from video_generator.models import SlideInfo, ScriptRequest

from video_generator.generate_animation import generate_animation
from video_generator.generate_script import generate_script_from_slides
from video_generator.generate_audio import generate_audio
from video_generator.update_animation import update_animation

video_router = APIRouter(prefix="/video")

async def process_animation(animation_request: AnimationRequest) -> Dict[str, Any]:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, 
        generate_animation,
        animation_request.slide,
        animation_request.script,
        animation_request.thumbnail
    )

@video_router.post("/generate-animation")
async def create_animation(request: AnimationRequest):
    try:
        result = generate_animation(
            slide=request.slide,
            script=request.script,
            thumbnail=request.thumbnail
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@video_router.post("/generate-animations")
async def create_animations(request: MultiAnimationRequest):
    try:
        print(f"Processing {len(request.slides)} slides in parallel")
        animations = await asyncio.gather(*[
            process_animation(slide_request)
            for slide_request in request.slides
        ])
        return animations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@video_router.post("/generate-script")
async def create_script(request: ScriptRequest):
    result = await generate_script_from_slides(
        slides=request.slides,
        tone=request.tone,
        user_prompt=request.user_prompt
    )
    return result

@video_router.post("/generate-audio")
async def create_audio(request: AudioRequest):
    try:
        result = await generate_audio(
            slides=request.slides,
            voice=request.voice,
            delay_time=request.delay_time
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@video_router.post("/update-animation")
async def update_slide_animation(request: UpdateAnimationRequest):
    try:
        result = update_animation(
            request.slide,
            request.script,
            request.thumbnail,
            request.animation,
            request.user_feedback
        )
        return result
    except Exception as e:
        print(f"Error in update_animation: {e}")
        raise HTTPException(status_code=500, detail=str(e))
