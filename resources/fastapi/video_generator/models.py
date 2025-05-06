from pydantic import BaseModel
from typing import List, Union, Literal


class SlideScript(BaseModel):
    index: int
    script: str

class PresentationScript(BaseModel):
    """
    Just format data for presentation script.
    """
    slides: List[SlideScript]

class TextItem(BaseModel):
    """
    Represents a text item with an ID and content.
    """
    text_id: str
    text: str

class ScriptSegment(BaseModel):
    """
    Represents a single script segment with associated texts.
    """
    script_segment: str
    texts: List[TextItem]

class ScriptSegments(BaseModel):
    """
    Top-level container for script segments.
    """
    segments: List[ScriptSegment]

class UpdateTextItem(BaseModel):
    """
    Represents a single animation with an ID and content.
    """
    animation: str
    text_id: str
    text: str

class UpdateScriptSegment(BaseModel):
    """
    Top-level container for animations.
    """
    script_segment: str
    texts: List[UpdateTextItem]


class UpdateScriptSegments(BaseModel):
    """
    Represents a single result with an ID and content.
    """
    segments: List[UpdateScriptSegment]


class SlideInfo(BaseModel):
    image: str
    seconds: int
    index: int

class ScriptRequest(BaseModel):
    slides: List[SlideInfo]
    tone: str
    user_prompt: str = ""



