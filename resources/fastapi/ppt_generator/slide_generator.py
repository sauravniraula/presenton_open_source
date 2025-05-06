from typing import List, Optional
from api.routers.presentation.models import SlideEditRequest
from graph_processor.models import GraphModel
from ppt_generator.fix_validation_errors import get_validated_response
from ppt_generator.models.content_type_models import (
    CONTENT_TYPE_MAPPING,
    InfographicChartModel,
    SlideContentModel,
)

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

from ppt_config_generator.models import BasicSlideConfiguration
from ppt_generator.models.other_models import SlideType, SlideTypeModel
from ppt_generator.models.slide_model import SlideModel

from ppt_generator.models.content_type_models import MultipleInfographicModel

model = ChatOpenAI(model="gpt-4o")

prompt_template_from_config = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
                You are a data presenter with experience in creating presentations that clearly communicate data and information.
                Generate a structured slide JSON from the provided slide title and info by following the steps and notes.

                # Steps

                1. Analyze Provided Title and Info
                2. Learn More About the Slide
                3. Create Image Prompts and Icon Queries
                4. Create Structured JSON Output
                5. Add graphs or infographics if in the *Graphs of Infographics* without any change

                # Notes
                - Provide output in language mentioned in **Input**.
                - The final output should be a structured JSON format suitable for a slide.
                - Ensure there are no line breaks in the JSON.
                - Make sure graphs or infographics data are added from the provided *Graphs of Infographics* without any change in number of series or data. 
                - Highlighting in markdown format should be used to emphasize numbers and data.
                - Specify **don't include text in image** in image prompt.
                - Image prompt should cleary define how image should look like.
                - Image prompt should not ask to generate **numbers, graphs, dashboard and report**.
                - Examples of image prompts: 
                    - a travel agent presenting a detailed itinerary with photos of destinations, showcasing specific experiences, highlighting travel highlights
                    - a person smiling while traveling, with a beautiful background scenery, such as mountains, beach, or city,  golden hour lighting
                    - a humanoid robot standing tall, gazing confidently at the horizon, bathed in warm sunlight, the background showing a futuristic cityscape with sleek buildings and flying vehicles
                - Descriptions should be clear and to the point.
                - Descriptions should not use words like "This slide", "This presentation".
                - If **body** contains items, *choose number of items randomly between mentioned constraints.*
                - **Icon queries** must be a generic **single word noun**.
                - Provide 3 icon query for each icon where,
                    - First one should be specific like "Led bulb".
                    - Second one should be more generic that first like "bulb".
                    - Third one should be simplest like "light".
                {notes}

                **Go through all notes and steps and make sure they are followed, including mentioned constraints**
            """,
        ),
        (
            "user",
            """
                **Input:**

                - Title: {title}
                - Output Language: {language}
                - Image Prompts and Icon Queries Language: English
                - Info: {info}
                - Graphs or Infographics: {infographics_or_graph}
                - Supporting Document: {additional_documents}
        """,
        ),
    ]
)

prompt_template_from_slide = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
                Edit Slide data based on provided prompt, follow mentioned steps and notes and provide structured output.

                # Notes
                - Provide output in language mentioned in **Input**.
                - The goal is to change Slide data based on the provided prompt.
                - Do not change **Image prompts** and **Icon queries** if not asked for in prompt.
                - Generate **Image prompts** and **Icon queries** if asked to generate or change image or icons in prompt.
                - Ensure there are no line breaks in the JSON.
                - Do not use special characters for highlighting.
                {notes}

                **Go through all notes and steps and make sure they are followed, including mentioned constraints**
            """,
        ),
        (
            "user",
            """
            - Prompt: {prompt}
            - Output Language: {language}
            - Image Prompts and Icon Queries Language: English
            - Theme: {theme}
            - Slide data: {slide_data}
        """,
        ),
    ]
)


prompt_template_from_slide_type = ChatPromptTemplate.from_messages( 
    [
        ("system", """
            Select a Slide Type based on provided user prompt and current slide data.

            Select slide based on following slide description and make sure it matches user requirement:
            # Slide Types (Slide Type : Slide Description)
                - **1**: contains title, description and image.
                - **2**: contains title and list of items.
                - **4**: contains title and list of items with images.
                - **5**: contains title, description and a graph.
                - **6**: contains title, description and list of items.
                - **7**: contains title and list of items with icons.
                - **8**: contains title, description and list of items with icons.
                - **9**: contains title, list of items and a graph.
                - **10**: contains title, list of inforgraphic charts with supporting information.
                - **11**: contains title, a single inforgraphic chart and description.

            # Notes
            - Do not select different slide type than current unless absolutely necessary as per user prompt.

            **Go through all notes and steps and make sure they are followed, including mentioned constraints**
        """),
        ("user", """
            - User Prompt: {prompt}
            - Current Slide Data: {slide_data}
            - Current Slide Type: {slide_type}
        """),
    ]
)

async def generate_slide_from_config(
    config: BasicSlideConfiguration,
    related_documents: Optional[List[Document]] = None,
    language: Optional[str] = None,
    infographics_or_graph: Optional[GraphModel | MultipleInfographicModel] = None,
) -> SlideContentModel:
    content_type_model_type = CONTENT_TYPE_MAPPING[config.type]

    chain = prompt_template_from_config | model.with_structured_output(
        content_type_model_type.model_json_schema()
    )

    additional_documents = ""
    if related_documents:
        for each in related_documents:
            additional_documents += f"{each.page_content}\n"

    return await get_validated_response(
        chain,
        {
            "title": config.title,
            "info": config.info,
            "language": language or "English",
            "additional_documents": additional_documents,
            "notes": content_type_model_type.get_notes(),
            "infographics_or_graph": "" if not infographics_or_graph else infographics_or_graph.model_dump_json()
        },
        content_type_model_type,
    )


async def get_edited_slide_content_model(
    prompt: str,
    slide_type: SlideType,
    slide: SlideModel,
    theme: Optional[dict] = None,
    language: Optional[str] = None,
):
    content_type_model_type = CONTENT_TYPE_MAPPING[slide_type]
    chain = prompt_template_from_slide | model.with_structured_output(
        content_type_model_type.model_json_schema()
    )
    slide_data = slide.content.model_dump_json()
    return await get_validated_response(
        chain,
        {
            "prompt": prompt,
            "language": language or "English",
            "theme": theme,
            "slide_data": slide_data,
            "notes": content_type_model_type.get_notes(),
        },
        content_type_model_type,
    )


async def get_slide_type_from_prompt(
    prompt: str,
    slide: SlideModel,
) -> SlideTypeModel:
    chain = prompt_template_from_slide_type | model.with_structured_output(
        SlideTypeModel.model_json_schema()
    )
    slide_data = slide.content.model_dump_json()
    return await get_validated_response(
        chain,
        {
            "prompt": prompt,
            "slide_data": slide_data,
            "slide_type": slide.type,
        },
        SlideTypeModel,
    )