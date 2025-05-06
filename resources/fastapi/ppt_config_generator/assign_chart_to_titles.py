from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

from graph_processor.models import GraphModel
from ppt_config_generator.models import (
    TitleWithGraphIdCollectionModel,
)
from ppt_generator.fix_validation_errors import get_validated_response


model = ChatOpenAI(model="gpt-4o-mini").with_structured_output(
    TitleWithGraphIdCollectionModel.model_json_schema()
)


prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
                Select the appropriate graph for each provided presentation slide title by following the specified steps and notes.

                # Steps

                1. Analyze the provided presentation slide titles carefully.
                2. Assign each title an appropriate graph based on relevance. 
                3. If a suitable graph is not available or does not match the title requirements, do not provide graph_id.
                4. If graph is selected, do not select same graph for other title.

                # Example Output:

                [
                    {{
                        "title": "title",
                        "graph_id": "graph_id",
                    }}
                ]

                # Notes

                - Do not alter the titles.
                - Ensure that the graph you assign is a suitable match for the title.
                - Usually no graph is attached to first slide.
                - **One graph** can only be **assigned to one title**.
                - Review each title carefully to ensure compliance with the notes provided.
            """,
        ),
        (
            "user",
            [
                {
                    "type": "text",
                    "text": """
                        # Titles
                        {titles}

                        # Graphs
                        {graphs}
                """,
                },
            ],
        ),
    ],
)


async def assign_chart_to_titles(
    titles: List[str], charts: List[GraphModel]
) -> TitleWithGraphIdCollectionModel:

    chain = prompt_template | model

    return await get_validated_response(
        chain,
        {
            "titles": titles,
            "graphs": charts,
        },
        TitleWithGraphIdCollectionModel,
    )
