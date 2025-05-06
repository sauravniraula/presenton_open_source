from typing import List
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from graph_processor.models import GraphModel
from ppt_generator.fix_validation_errors import get_validated_response
from ppt_generator.models.edited_slide_model import SlideEditConfigModel
from ppt_generator.models.slide_model import SlideModel


model = ChatOpenAI(model="gpt-4o")


prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
                Analyze the provided Input Data, follow mentioned steps and notes and create a sturctured output.

                # Slide Types
                - **1**:
                    - contains title, description and an image.
                    - contains 1 item in body.
                - **2**:
                    - contains title and list of items.
                    - contains 2 to 4 items in body.
                - **4**:
                    - contains title, list of items each having an image.
                    - contains 2 to 3 items in body.
                - **5**:
                    - contains title, description and a graph.
                    - contains 1 item in body.
                - **6**:
                    - contains title, description and list of items.
                    - contains 2 to 3 items in body.
                - **7**:
                    - contains title and list of items each having an icon.
                    - contains 2 to 4 items in body.
                - **8**:
                    - contains title, description and list of items each having an icon.
                    - contains 2 to 3 items in body.
                - **9**:
                    - contains title, list of items and a graph.
                    - contains 2 to 3 items in body.

                # Steps
                1. Analyze the prompt.
                2. Remove **graph_id** if specified in prompt.
                3. Select new **graph_id** if prompt mentioned to use new or another graph.
                4. Set **edit_graph** to **True** if graph **type** or **data** is to be changed.
                5. Select slide **type**.

                # Notes
                - Slide **Type** is also referred as **Layout** or **Design**.
                - If prompt mentioned to include images or icons, select slide **type** accordingly.
                - If slide contains **graph_id** after edit, select slide **type** with graph.
                - Make sure slide **type** contains everything mentioned in prompt.
                - Only pick type **5** and **9** if **graph_id** is not null.
                - Graphs can be edited from one type to another by editing.
                - Edit same graph, if prompt asked to change graph type to another type.

                **Go through every steps and notes and make sure each of them are followed**
            """,
        ),
        (
            "user",
            """
                # Input Data
                - Prompt: {prompt}
                - Slide: {slide}
                - Available Graphs: {available_graphs}
            """,
        ),
    ]
)


async def generate_slide_edit_config(
    prompt: str, slide_model: SlideModel, graphs: List[GraphModel]
) -> SlideEditConfigModel:
    structured_model = model.with_structured_output(
        SlideEditConfigModel.model_json_schema()
    )
    chain = prompt_template | structured_model

    graphs_with_title_type_id = [
        {
            "id": each.id,
            "name": each.name,
            "type": each.type.value,
        }
        for each in graphs
    ]

    slide = {
        "title": slide_model.content.title,
        "type": slide_model.type,
        "graph_id": slide_model.graph_id,
    }

    return await get_validated_response(
        chain,
        {
            "prompt": prompt,
            "slide": slide,
            "available_graphs": graphs_with_title_type_id,
        },
        SlideEditConfigModel,
    )
