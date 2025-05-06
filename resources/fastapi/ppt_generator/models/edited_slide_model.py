from typing import Optional
from pydantic import BaseModel, Field

from ppt_generator.models.content_type_models import (
    Type1Content,
    Type2Content,
    Type4Content,
    Type5Content,
    Type6Content,
    Type7Content,
    Type8Content,
    Type9Content,
)
from ppt_generator.models.other_models import SlideType


class EditedSlideModel(BaseModel):
    type: SlideType
    content: (
        Type1Content
        | Type2Content
        | Type4Content
        | Type5Content
        | Type6Content
        | Type7Content
        | Type8Content
        | Type9Content
    )


class SlideEditConfigModel(BaseModel):
    type: SlideType = Field(description="Type of slide after edit")
    graph_id: Optional[str] = Field(
        None, description="Graph Id of graph to show in this slide after edit"
    )
    edit_graph: bool = Field(
        False, description="Whether prompt asks to edit data for selected graph"
    )
