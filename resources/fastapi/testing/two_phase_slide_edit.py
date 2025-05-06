from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from graph_processor.models import GraphModel
from ppt_generator.models.content_type_models import Type5Content
from ppt_generator.models.edited_slide_model import SlideEditConfigModel
from ppt_generator.models.other_models import SlideType
from ppt_generator.models.slide_model import SlideModel


model = ChatOpenAI(model="gpt-4o")

graphs = [
    GraphModel.from_dict(
        {
            "id": "1178a33f-f0b5-4845-9354-14517b99ec33",
            "name": "Flavor Preferences By Gender",
            "type": "bar",
            "presentation": "392f1eed-7841-4291-9935-f92d3b54e2ee",
            "postfix": None,
            "data": {
                "categories": ["Chocolate", "Strawberry", "Vanilla"],
                "series": [
                    {"name": "Female", "data": [37, 17.12, 31.9]},
                    {"name": "Male", "data": [20.9, 31.9, 11]},
                ],
            },
        }
    ),
    GraphModel.from_dict(
        {
            "id": "mfal0e1-f0b5-4845-9354-51902951",
            "name": "Flavor Preferences By Country",
            "type": "bar",
            "presentation": "392f1eed-7841-4291-9935-f92d3b54e2ee",
            "postfix": None,
            "data": {
                "categories": ["Chocolate", "Strawberry", "Vanilla"],
                "series": [
                    {"name": "Nepal", "data": [71, 5.12, 40.9]},
                    {"name": "India", "data": [30.9, 1.9, 11]},
                ],
            },
        }
    ),
    GraphModel.from_dict(
        {
            "id": "adfagjae-f0b5-4845-9354-51902951",
            "name": "Flavor Preferences By Continent",
            "type": "bar",
            "presentation": "392f1eed-7841-4291-9935-f92d3b54e2ee",
            "postfix": None,
            "data": {
                "categories": ["Chocolate", "Strawberry", "Vanilla"],
                "series": [
                    {"name": "Asia", "data": [71, 5.12, 40.9]},
                    {"name": "Europe", "data": [30.9, 1.9, 11]},
                ],
            },
        }
    ),
    GraphModel.from_dict(
        {
            "id": "jf010jda0f-f0b5-4845-9354-51902951",
            "name": "Flavor Preferences By Cities",
            "type": "bar",
            "presentation": "392f1eed-7841-4291-9935-f92d3b54e2ee",
            "postfix": None,
            "data": {
                "categories": ["Chocolate", "Strawberry", "Vanilla"],
                "series": [
                    {"name": "Delhi", "data": [71, 5.12, 40.9]},
                    {"name": "Kathmandu", "data": [30.9, 1.9, 11]},
                ],
            },
        }
    ),
]

slide_model_1 = SlideModel(
    id="41241-faa12a-12fa-3fa3r",
    index=0,
    type=SlideType.type5,
    graph_id="1178a33f-f0b5-4845-9354-14517b99ec33",
    presentation="1jkl1k-1lk231-nl1k23-1lk41",
    content=Type5Content(
        title="Chocolate: Gender Insights",
        body="An analysis of how gender influences chocolate flavor preferences, exploring the differences observed between males and females.",
    ),
)

slide_model_2 = SlideModel(
    id="fa0930a-faa12a-12fa-3fa3r",
    index=0,
    type=SlideType.type1,
    presentation="1jkl1k-1lk231-nl1k23-1lk41",
    content=Type5Content(
        title="Chocolate: Gender Insights",
        body="An analysis of how gender influences chocolate flavor preferences, exploring the differences observed between males and females.",
    ),
)

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
                Analyze the provided Input Data, follow mentioned steps and notes and create a sturctured output.

                # Slide Types
                - **1**: contains title, description and an image.
                - **2**: contains title and list of items.
                - **4**: contains title, list of items each having an image.
                - **5**: contains title, description and a graph.
                - **6**: contains title, description and list of items.
                - **7**: contains title and list of items each having an icon.
                - **8**: contains title, description and list of items each having an icon.
                - **9**: contains title, list of items and a graph.

                # Steps
                1. Analyze the prompt.
                2. Change/Remove **graph_id** according to the prompt.
                3. Set **edit_graph** to true if prompt asked to change data of new graph.
                4. Select slide **type**.

                # Notes
                - If prompt mentioned to include images or icons, select slide **type** accordingly.
                - If slide contains **graph_id** after edit, select slide **type** with graph.
                - Make sure slide **type** contains everything mentioned in prompt.
                - Only pick type **5** and **9** if **graph_id** is not null.

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


def run_test():
    structured_model = model.with_structured_output(SlideEditConfigModel)
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
        "title": slide_model_1.content.title,
        "type": slide_model_1.type,
        "graph_id": slide_model_1.graph_id,
    }

    response = chain.invoke(
        {
            "prompt": "Remove graph and add image and list of items with icons",
            "slide": slide,
            "available_graphs": graphs_with_title_type_id,
        }
    )

    print(response)
