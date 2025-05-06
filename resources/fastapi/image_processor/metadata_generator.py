from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from image_processor.models import ImagesMetaDataModel
from ppt_generator.fix_validation_errors import get_validated_response

model = ChatOpenAI(model="gpt-4o").with_structured_output(
    ImagesMetaDataModel.model_json_schema()
)

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
                Extract data from provided images and provide structured output by following provided steps and notes.

                # Steps
                1. Divide the image into 4 quadrants using yellow lines.
                2. Extract details from every quadrant.
                3. Create 4 ImageMetaDataModel, each for every quadrant starting from top left.
                4. Populate the content field with extracted details for each quadrant.
                5. Check if each quadrant contains readable graph and set is_graph accordingly.
                6. Do not provide `content` if quadrant does not contain any image.

                # Notes
                * Quadrant 1 is top left, Quadrant 2 is top right, Quadrant 3 is bottom left and Quadrant 4 is bottom right.
                * Do not specify the quadrant in the content field.
                * Output must contain 4 ImageMetaDataModel each for every quadrant.
                * Only Bar graph, Pie chart, Bubble chart, Scatter Chart and Line graph are considered as graphs.
                * If quadrant graph could not be accurately read, set is_graph to false.
                * If quadrant contains multiple graphs, set is_graph to false.
                * 'content' field is required if image is detected in the quadrant.
                * `is_graph` field is required in every ImageMetaDataModel.

                **Ensure every notes are followed**
            """,
        ),
        (
            "user",
            [
                {
                    "type": "image",
                    "image_url": "{image_url}",
                },
            ],
        ),
    ]
)

chain = prompt_template | model


async def generate_images_metadata(image: str) -> ImagesMetaDataModel:
    return await get_validated_response(
        chain, {"image_url": image}, ImagesMetaDataModel
    )
