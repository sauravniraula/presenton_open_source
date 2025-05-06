from typing import List, Mapping, Optional, Literal
from pydantic import BaseModel, Field

from ppt_generator.models.other_models import SlideType
from graph_processor.models import GraphModel


class HeadingModel(BaseModel):
    heading: str = Field(description="List item heading to show in slide body")
    description: str = Field(description="Description of list item in about 10 words")

    @property
    def texts(self):
        return [self.heading, self.description]


class FractionModel(BaseModel):
    number_type: Literal["fraction"] = Field(
        description="Type of the number to represent in infographic chart"
    )
    numerator: int = Field(description="Numerator of the fraction")
    denominator: int = Field(description="Denominator of the fraction")

    @property
    def texts(self):
        return [f"{self.numerator}/{self.denominator}"]


class PercentageModel(BaseModel):
    number_type: Literal["percentage"] = Field(
        description="Type of the number to represent in infographic chart"
    )
    percentage: float = Field(
        description="Percentage to represent in infographic chart"
    )

    @property
    def texts(self):
        return [f"{self.percentage}%"]


class NumericalModel(BaseModel):
    number_type: Literal["numerical"] = Field(
        description="Type of the number to represent in infographic chart"
    )
    numerical: float = Field(
        description="Numerical value to represent in infographic chart"
    )
    suffix: str = Field(
        description="Suffix content to represent the number. Example: x, times, million dollars, etc"
    )

    @property
    def texts(self):
        return [f"{self.numerical}"]


class ProgressDialModel(BaseModel):
    chart_type: Literal["progress-dial"] = Field(
        description="Type of the infographic chart"
    )
    value: FractionModel | PercentageModel = Field(
        description="Fraction or percentage value to represent in progress dial"
    )


class RadialProgressModel(BaseModel):
    chart_type: Literal["radial-progress"] = Field(
        description="Type of the infographic chart"
    )
    value: FractionModel | PercentageModel = Field(
        description="Fraction or percentage value to represent in radial progress"
    )


class ProgressRingModel(BaseModel):
    chart_type: Literal["progress-ring"] = Field(
        description="Type of the infographic chart"
    )
    value: FractionModel | PercentageModel = Field(
        description="Fraction or percentage value to represent in progress ring"
    )


class IconInfographicModel(BaseModel):
    chart_type: Literal["icon-infographic"] = Field(
        description="Type of the infographic chart"
    )
    value: FractionModel | PercentageModel = Field(
        description="Fraction or percentage value to represent in icon infographic"
    )
    icon: Literal[
        "person",
        "female_person",
        "male_person",
        "baby",
        "hand",
        "tree",
        "star",
        "corn",
        "meal",
        "drink_bottle",
        "cup",
        "droplet",
        "house",
        "building",
        "tent",
        "car",
        "bicycle",
        "clock",
        "banknote",
        "briefcase",
        "truck",
        "airplane",
        "laptop_computer",
        "mobile_phone",
        "light_bulb",
        "spanner",
        "fire",
        "mortarboard",
        "book",
        "syringe",
        "first_aid",
        "globe",
    ] = Field(
        description="Icon to show in infographic chart. leave it blank if icon-infographic chart is not selected"
    )


class ProgressBarModel(BaseModel):
    chart_type: Literal["progress-bar"] = Field(
        description="Type of the infographic chart"
    )
    value: FractionModel | PercentageModel = Field(
        description="Fraction or percentage value to represent in progress bar"
    )


class TextInfographicModel(BaseModel):
    chart_type: Literal["text"] = Field(description="Type of the infographic chart")
    value: NumericalModel = Field(
        description="Numerical value to represent in text infographic"
    )


class InfographicChartModel(BaseModel):
    title: str = Field(description="Title of the infographic chart")
    # chart: ProgressDialModel | RadialProgressModel | ProgressRingModel | IconInfographicModel | ProgressBarModel | TextInfographicModel = Field(description="Infographic chart to show in slide")
    chart: (
        ProgressDialModel
        | RadialProgressModel
        | ProgressRingModel
        | IconInfographicModel
        | TextInfographicModel
    ) = Field(description="Infographic chart to show in slide")
    description: str = Field(description="Description of the infographic chart")


class MultipleInfographicModel(BaseModel):
    infographic_charts: List[InfographicChartModel]


class SingleInfographicModel(BaseModel):
    title: str = Field(description="Title of the infographic chart")
    chart: IconInfographicModel = Field(
        description="Infographic chart to show in slide"
    )
    description: str = Field(description="Description of the infographic chart")


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
        description="Slide content summary in about 15 words. This will be shown in text box in slide."
    )
    image_prompts: List[str] = Field(
        description="Prompt used to generate image for this slide. Only one prompt is allowed."
    )

    @property
    def texts(self):
        return [self.title, self.body]


class Type2Content(SlideContentModel):
    body: List[HeadingModel] = Field(
        "List items to show in slide's body"
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
        "List items to show in slide's body"
    )
    image_prompts: List[str] = Field(
        description="Prompt used to generate image for this slide"
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
        description="List items to show in slide's body"
    )
    image_prompts: List[str] = Field(
        description="Prompts used to generate image for each item in body"
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
        description="Slide content summary in about 15 words. This will be shown in text box in slide."
    )
    graph: GraphModel = Field(description="Graph to show in slide")


class Type6Content(SlideContentModel):
    description: str = Field(
        description="Slide content summary in about 15 words. This will be shown in text box in slide."
    )
    body: List[HeadingModel] = Field(
        description="List items to show in slide's body"
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
        description="List items to show in slide's body"
    )
    icon_queries: List[IconQueryCollectionModel] = Field(
        description="One icon query collection model for every item in body to search icon"
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
        description="Slide content summary in about 15 words. This will be shown in text box in slide."
    )
    body: List[HeadingModel] = Field(
        "List items to show in slide's body"
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
        "List items to show in slide's body"
    )
    graph: GraphModel = Field(description="Graph to show in slide")

    @classmethod
    def get_notes(cls):
        return """
        - The **Body** should include **1 to 3 HeadingModels**.  
        - Each **Heading** must consist of **1 to 3 words**.  
        - Each item **Description** can be upto 10 words.
        """

class Type10Content(SlideContentModel):
    infographics: List[InfographicChartModel] = Field(
        description="List of infographic charts to show in slide. Same infographics chart should be used for all items in list.",
        max_length=4,
    )

    @classmethod
    def get_notes(cls):
        return """
        - You should follow these guidelines while selecting the infographic chart:
            - Progress Dial (Gauge Chart) – Use when comparing actual performance against a fixed target, such as sales goals or system performance metrics. Best for dashboards and quick-glance overviews.
            - Radial Progress (Semi-Circle Progress Chart) – Ideal for highlighting a single percentage of completion, like project progress or survey results. Works well when emphasizing key statistics.
            - Progress Ring (Circular Progress Indicator) – Use when showing cyclic or iterative processes, such as task completion rates or system uptime. Best for side-by-side comparisons of multiple percentages.
            - Progress Bar (Linear Progress Indicator) – Best for showing sequential progress, such as workflow steps, task completion, or event timelines. Useful for illustrating phased achievements.
            - Just Text (Numbers in Big Font) – Use when you don't need any infographic chart and just have to show numbers in big form.
        - Compulsorily use same infographic chart for all items in a slide
        - It should have **minimum of 2 and maximum of 4 infographic charts**
        """


class Type11Content(SlideContentModel):
    description: str = Field(
        description="Slide content summary in about 15 words. This will be shown in text box in slide."
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


class SlideUpdateContentModel(BaseModel):
    title: str
    description: Optional[str] = None
    body: Optional[str | List[HeadingModel]] = ""
    image_prompts: Optional[List[str]] = None
    icon_queries: Optional[List] = None
    infographics: Optional[List[InfographicChartModel]] = None
    graphs: Optional[List[GraphModel]] = None


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
    SlideType.type10: Type10Content,
    SlideType.type11: Type11Content,
}

