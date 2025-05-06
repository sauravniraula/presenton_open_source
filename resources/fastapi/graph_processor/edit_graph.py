from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from graph_processor.models import GraphModel
from ppt_generator.fix_validation_errors import get_validated_response


model = ChatOpenAI(model="gpt-4o-mini")


prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            Edit the provided graph as mentioned in the prompt and provide a corrected structured output.

            # Steps
            1. Analyze the provided graph.
            2. Analyze the prompt.
            3. Edit graph if prompt mentions edits for graph.

            # Notes
            - Ensure the first letter of every text field (e.g., graph names, series names) is capitalized.
            - GraphType and Graph Data Type must match (e.g., "LineChartDataModel" if type is "line") .
            - Place graph data inside **Series "data" or "points"** based on the graph type.
            - **Series "data" or "points"** should be numbers.
            - Make sure you output matches the schema.

            **Double-check all the Steps and Notes and ensure they are followed**
            """,
        ),
        (
            "user",
            [
                {
                    "type": "text",
                    "text": """
                    # Input Data
                    - Prompt: {prompt}
                    - Graph: {graph}
                    """,
                },
            ],
        ),
    ]
)


async def get_edited_graph(
    prompt: str,
    graph: GraphModel,
) -> GraphModel:
    structured_model = model.with_structured_output(GraphModel.model_json_schema())

    chain = prompt_template | structured_model

    return await get_validated_response(
        chain,
        {
            "prompt": prompt,
            "graph": graph,
        },
        GraphModel,
        2,
    )
