from pydantic import Field
from typing import List
from pydantic import BaseModel
from ppt_generator.models.content_type_models import (
    SlideContentModel,
    IconQueryCollectionModel,
    GraphModel,
    InfographicChartModel,
)


class BaseHeadingModel(BaseModel):
    heading: str = Field(
        description="List item heading to show in slide body", max_length="35"
    )
    description: str = Field(
        description="Description of list item in less than 20 words.", max_length=180, min_length=100
    )

    @property
    def texts(self):
        return [self.heading, self.description]


class BaseType1Content(SlideContentModel):
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


class BaseType2Content(SlideContentModel):
    body: List[BaseHeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=4,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 4 BaseHeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """

class BaseType3Content(SlideContentModel):
    body: List[BaseHeadingModel] = Field(
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
        - The **Body** should include **3 BaseHeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class BaseType4Content(SlideContentModel):
    body: List[BaseHeadingModel] = Field(
        description="List items to show in slide's body",
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
        - The **Body** should include **1 to 3 BaseHeadingModels**.  
        - **Image prompts** should contain one prompt for each item in body.
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """


class BaseType5Content(SlideContentModel):
    body: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide.",
        max_length=230,
        min_length=150,
    )
    graph: GraphModel = Field(description="Graph to show in slide")


class BaseType6Content(SlideContentModel):
    description: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide."
    )
    body: List[BaseHeadingModel] = Field(
        description="List items to show in slide's body",
        min_length=1,
        max_length=3,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 BaseHeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """

class BaseType7Content(SlideContentModel):
    body: List[BaseHeadingModel] = Field(
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
        - The **Body** should include **1 to 4 BaseHeadingModels**.  
        - Each **IconQueryCollectionModel** must contain 3 *queries*.
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.   
        """

class BaseType8Content(SlideContentModel):
    description: str = Field(
        description="Slide content summary in less than 15 words. This will be shown in text box in slide.",
        max_length=230,
        min_length=150,
    )
    body: List[BaseHeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=3,
    )
    icon_queries: List[IconQueryCollectionModel] = Field(
        description="One icon query collection model for every item in body to search icon",
        min_length=1,
        max_length=3,
    )

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 BaseHeadingModels**.  
        - Each **IconQueryCollectionModel** must contain 3 *queries*.
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """

class BaseType9Content(SlideContentModel):
    body: List[BaseHeadingModel] = Field(
        "List items to show in slide's body",
        min_length=1,
        max_length=3,
    )
    graph: GraphModel = Field(description="Graph to show in slide")

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 BaseHeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """

class BaseType10Content(SlideContentModel):
    infographics: List[InfographicChartModel] = Field(
        description="List of infographic charts to show in slide. Same infographics chart should be used for all items in list.",
        max_length=4,
    )

    @classmethod
    def get_notes(cls):
        # ? Removed Progress Bar from the list of infographic charts
        # - Progress Bar (Linear Progress Indicator) – Best for showing sequential progress, such as workflow steps, task completion, or event timelines. Useful for illustrating phased achievements.
        return """
        - You should follow these guidelines while selecting the infographic chart:
            - Progress Dial (Gauge Chart) – Use when comparing actual performance against a fixed target, such as sales goals or system performance metrics. Best for dashboards and quick-glance overviews.
            - Radial Progress (Semi-Circle Progress Chart) – Ideal for highlighting a single percentage of completion, like project progress or survey results. Works well when emphasizing key statistics.
            - Progress Ring (Circular Progress Indicator) – Use when showing cyclic or iterative processes, such as task completion rates or system uptime. Best for side-by-side comparisons of multiple percentages.
            - Just Text (Numbers in Big Font) – Use when you don't need any infographic chart and just have to show numbers in big form.
        - Compulsorily use same infographic chart for all items in a slide
        - It should have **minimum of 2 and maximum of 4 infographic charts**
        """


class BaseType11Content(SlideContentModel):
    description: str = Field(
        description="Slide content summary in about 30 words. This will be shown in text box in slide.",
        max_length=230,
        min_length=150,
    )
    infographics: List[InfographicChartModel] = Field(
        description="Infographic chart to show in slide. Same infographic chart should be used for all items in list."
    )

    @classmethod
    def get_notes(cls):
        return """
        - You should follow these guidelines while selecting the infographic chart:
            - Progress Dial (Gauge Chart) – Use when comparing actual performance against a fixed target, such as sales goals or system performance metrics. Best for dashboards and quick-glance overviews.
            - Radial Progress (Semi-Circle Progress Chart) – Ideal for highlighting a single percentage of completion, like project progress or survey results. Works well when emphasizing key statistics.
            - Progress Ring (Circular Progress Indicator) – Use when showing cyclic or iterative processes, such as task completion rates or system uptime. Best for side-by-side comparisons of multiple percentages.
            - Icon Infographics (Any Symbolic Representation) – Use when visually representing proportions, demographics, or categories (e.g., number of satisfied customers using star icons, product distribution using package icons). Enhances engagement by making abstract data more relatable.
            - Progress Bar (Linear Progress Indicator) – Best for showing sequential progress, such as workflow steps, task completion, or event timelines. Useful for illustrating phased achievements.
            - Just Text (Numbers in Big Font) – Use when you don't need any infographic chart.
        - Try to use same infographic chart for all items in a slide
        """
