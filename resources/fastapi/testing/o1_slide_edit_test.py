from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from ppt_generator.models.content_type_models import CONTENT_TYPE_MAPPING
from ppt_generator.models.slide_model import SlideModel

model = ChatOpenAI(model="o1-mini")

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "user",
            """
                Generate a slide from provided context and input data and provide a structured output by following all mentioned constraints.

                # Slide Types
                    - **1** contains title, description and a image.
                    - **2** contains title and list of items.
                    - **4** contains title, list of items each having an image.
                    - **5** contains title, description and a graph.
                    - **6** contains title, description and list of items.
                    - **7** contains title and list of items each having an icon.
                    - **8** contains title, description and list of items each having an icon.
                    - **9** contains title, list of items and a graph.
                
                {content_type_notes}

                # Output Schema
                {output_schema}

                # Input Data
                **Prompt**: {prompt}
                **Titles**: {titles}
                **Graphs**: {graphs}
            """,
        )
    ]
)


def run_test():
    content_type_constraints = """
    # Content Type Constraints
    """

    for each in CONTENT_TYPE_MAPPING:
        content_type_constraints += f"""
        **{each.value}**: {CONTENT_TYPE_MAPPING[each].get_notes()}
        """

    graphs = [
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
                    {"name": "Male", "data": [20.9, 31.9]},
                ],
            },
        }
    ]

    chain = prompt_template | model

    response = chain.invoke(
        {
            "prompt": "Generate a presentation using providing titles. Place the graph in second slide. Third and fourth slide should contain icons.",
            "content_type_notes": content_type_constraints,
            "output_schema": SlideModel.model_json_schema(),
            "titles": [
                "Introduction: Flavor Preferences",
                "Chocolate: Gender Insights",
                "Strawberry: Taste Analysis",
                "Vanilla: Flavor Breakdown",
                "Conclusion: Summary of Findings",
            ],
            "graphs": graphs,
        }
    )

    print(response)
