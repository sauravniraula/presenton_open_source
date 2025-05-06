import json
from typing import List, Optional
import uuid
from pydantic import BaseModel

from graph_processor.models import GraphModel
from ppt_generator.models.other_models import SlideType
from ppt_generator.models.content_type_models import (
    CONTENT_TYPE_MAPPING,
    SlideUpdateContentModel,
    Type1Content,
    Type2Content,
    Type3Content,
    Type4Content,
    Type5Content,
    Type6Content,
    Type7Content,
    Type8Content,
    Type9Content,
    Type10Content,
    Type11Content,
)
from ppt_generator.models.base_content_type_models import BaseType1Content, BaseType2Content, BaseType3Content, BaseType4Content, BaseType5Content, BaseType6Content, BaseType7Content, BaseType8Content, BaseType9Content, BaseType10Content, BaseType11Content

class SlideModel(BaseModel):
    id: Optional[str] = None
    index: int
    type: SlideType
    design_index: Optional[int] = None
    images: Optional[List[str]] = None
    icons: Optional[List[str]] = None
    presentation: str
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
        | Type10Content
        | Type11Content
    )
    properties: Optional[dict] = None

    @classmethod
    def from_dict(cls, data):
        slide_model = cls(**data)
        content = data["content"]
        slide_model.content = CONTENT_TYPE_MAPPING[slide_model.type](**content)
        return slide_model

    def to_create_dict(self, auto_id: bool = False):
        temp = self.model_dump(mode="json")
        if not self.id:
            if auto_id:
                temp["id"] = str(uuid.uuid4())
            else:
                temp.pop("id")
        return temp

    @property
    def images_count(self):
        if not hasattr(self.content, "image_prompts"):
            return 0
        return len(self.content.image_prompts)

    @property
    def icons_count(self):
        if not hasattr(self.content, "icon_queries"):
            return 0
        return len(self.content.icon_queries)

class BaseSlideModel(BaseModel):
    type: SlideType
    content: (
       BaseType1Content
       | BaseType2Content
       | BaseType3Content
       | BaseType4Content
       | BaseType5Content
       | BaseType6Content
       | BaseType7Content
       | BaseType8Content
    )

class BasePresentation(BaseModel):
    title: str
    n_slides: int
    titles: list[str]
    slides: list[BaseSlideModel]



class SlideUpdateModel(SlideModel):
    content: SlideUpdateContentModel

    def get_slide_model(self) -> SlideModel:
        images = self.images or []
        icons = self.icons or []

        image_prompts = self.content.image_prompts or []
        icon_queries = self.content.icon_queries or []
        icon_queries = list(
            map(lambda x: [x] if isinstance(x, str) else x, icon_queries)
        )

        if images:
            images_len = len(images)
            image_prompts_len = len(image_prompts)
            if image_prompts_len < images_len:
                image_prompts.extend([""] * (images_len - image_prompts_len))
            elif image_prompts_len > images_len:
                image_prompts = image_prompts[:images_len]

        if icons:
            icons_len = len(icons)
            icon_queries_len = len(icon_queries)
            if icon_queries_len < icons_len:
                icon_queries.extend([[""]] * (icons_len - icon_queries_len))
            elif icon_queries_len > icons_len:
                icon_queries = icon_queries[:images_len]

        self.content.image_prompts = image_prompts if image_prompts else None
        self.content.icon_queries = icon_queries if icon_queries else None


        print(self.type)

        content_model_type = CONTENT_TYPE_MAPPING[self.type]

        print(content_model_type)
        print(self.content.model_dump(mode="json"))

        slide_model_dict = self.model_dump(mode="json")
        slide_model_dict["content"] = content_model_type(
            **self.content.model_dump(mode="json")
        )

        return SlideModel(**slide_model_dict)
