from typing import List, Mapping
from pydantic import BaseModel, Field

from ppt_generator.models.other_models import SlideType
from graph_processor.models import GraphModel


class HeadingModel(BaseModel):
    heading: str = Field(
        description="List item heading to show in slide body", max_length="35"
    )
    description: str = Field(
        description="Description of list item in less than 20 words.",
        max_length=180,
        min_length=100,
    )

    @property
    def texts(self):
        return [self.heading, self.description]


class IconQueryCollectionModel(BaseModel):
    queries: List[str] = Field(
        description="Multiple queries to generate simillar icons matching heading and description"
    )


class SlideContentModel(BaseModel):
    title: str = Field(description="Title of the slide")

    @classmethod
    def get_notes(cls) -> str:
        return ""


class Type1Content(SlideContentModel):
    body: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide.",
        max_length=230,
        min_length=150,
    )
    image_prompts: List[str] = Field(
        description="Prompt used to generate image for this slide. Only one prompt is allowed.",
        min_length=1,
        max_length=1,
    )

    @property
    def texts(self):
        return [self.title, self.body]


class Type2Content(SlideContentModel):
    body: List[HeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=4,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 4 HeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class Type3Content(SlideContentModel):
    body: List[HeadingModel] = Field(
        "List items to show in slide's body",
        min_length=3,
        max_length=3,
    )
    image_prompts: List[str] = Field(
        description="Prompt used to generate image for this slide",
        min_length=1,
        max_length=1,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **3 HeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class Type4Content(SlideContentModel):
    body: List[HeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=3,
    )
    image_prompts: List[str] = Field(
        description="Prompts used to generate image for each item in body",
        min_length=1,
        max_length=3,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 HeadingModels**.  
        - **Image prompts** should contain one prompt for each item in body.
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class Type5Content(SlideContentModel):
    body: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide.",
        max_length=230,
        min_length=150,
    )
    graph: GraphModel = Field(description="Graph to show in slide")


class Type6Content(SlideContentModel):
    description: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide.",
    )
    body: List[HeadingModel] = Field(
        description="List items to show in slide's body",
        min_length=1,
        max_length=3,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 HeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class Type7Content(SlideContentModel):
    body: List[HeadingModel] = Field(
        description="List items to show in slide's body",
        min_length=1,
        max_length=4,
    )
    icon_queries: List[IconQueryCollectionModel] = Field(
        description="One icon query collection model for every item in body to search icon",
        min_length=1,
        max_length=4,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 4 HeadingModels**.  
        - Each **IconQueryCollectionModel** must contain 3 *queries*.
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class Type8Content(SlideContentModel):
    description: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide.",
        max_length=230,
        min_length=150,
    )
    body: List[HeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=3,
    )
    icon_queries: List[IconQueryCollectionModel] = Field(
        description="One icon query collection model for every item in body to search icon"
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 HeadingModels**.  
        - Each **IconQueryCollectionModel** must contain 3 *queries*.
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class Type9Content(SlideContentModel):
    body: List[HeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=3,
    )
    graph: GraphModel = Field(description="Graph to show in slide")

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 HeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


CONTENT_TYPE_MAPPING: Mapping[SlideType, SlideContentModel] = {
    SlideType.type1: Type1Content,
    SlideType.type2: Type2Content,
    SlideType.type3: Type3Content,
    SlideType.type4: Type4Content,
    SlideType.type5: Type5Content,
    SlideType.type6: Type6Content,
    SlideType.type7: Type7Content,
    SlideType.type8: Type8Content,
    SlideType.type9: Type9Content,
}
