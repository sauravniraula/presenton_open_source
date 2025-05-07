from pydantic import BaseModel

from ppt_generator.models.content_type_models import (
    Type1Content,
    Type2Content,
    Type3Content,
    Type4Content,
    Type5Content,
    Type6Content,
    Type7Content,
    Type8Content,
    Type9Content,
)
from ppt_generator.models.other_models import SlideType


class LLMSlideModel(BaseModel):
    type: SlideType
    content: (
        Type1Content
        | Type2Content
        | Type3Content
        | Type4Content
        | Type5Content
        | Type6Content
        | Type7Content
        | Type8Content
        | Type9Content
    )


class LLMPresentationModel(BaseModel):
    title: str
    n_slides: int
    titles: list[str]
    slides: list[LLMSlideModel]
