from typing import List, Optional, Dict, Any
from pydantic import BaseModel

class AnimationRequest(BaseModel):
    slide: List[Dict[str, Any]]
    script: str
    thumbnail: str

class AudioSlide(BaseModel):
    index: int
    script: str

class AudioRequest(BaseModel):
    slides: List[AudioSlide]
    voice: str = "alloy"
    delay_time: float = 0.0

class MultiAnimationRequest(BaseModel):
    slides: List[AnimationRequest]

class UpdateAnimationRequest(BaseModel):
    slide: List[Dict[str, Any]]
    script: str
    thumbnail: str
    animation: Dict[str, Any]
    user_feedback: str