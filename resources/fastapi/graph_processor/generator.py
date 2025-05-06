from typing import List
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from graph_processor.models import GraphCollectionModel, GraphModel
from ppt_generator.fix_validation_errors import get_validated_response


model = ChatOpenAI(model="gpt-4o")


def get_prompt_template(charts: List[str]) -> ChatPromptTemplate:
    images_prompt = [
        {
            "type": "image_url",
            "image_url": each,
        }
        for each in charts
    ]

    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                Process the images to GraphModel and correct series values using deplotted text, providing a corrected structured output.

                # Steps
                
                1. Detect all unique and readable graphs from the provided images.
                2. For each detected graph, identify the graph type.
                3. Create a GraphModel based on the identified graph type.
                4. Check for postfixes (e.g., `%` for percentages).
                5. Give each graph a name.


                # Notes
                - Ensure the name is properly capitalized, e.g., "Mobile Users in 2024."
                - Ensure the first letter of every text field (e.g., graph names, series names) is capitalized.
                - GraphType and Graph Data Type must match (e.g., "LineChartDataModel" if type is "line") .
                - Only use **deplotted text** after **deciding on category and series names**
                - Each **category** can have at most **2 words**.
                - **Series names** can have at most **2 words**.
                - Place graph data inside **Series "data" or "points"** based on the graph type.
                - **Series "data" or "points"** should be numbers.
                - After fetching **categories and series from provided image**,
                    - Find deplotted graph by matching graph titles or values.
                    - Observe deplotted graph and extract data.
                    - Remove repeating numbers from data.
                    - Correct incorrect series data using extracted data.


                # Output Considerations

                - Make sure you output matches the schema.
                - Do not include **GraphModel** if data is not accurate.

                **Double-check all the Steps and Notes and ensure they are followed**
                """,
            ),
            (
                "user",
                [
                    {
                        "type": "text",
                        "text": """
                        # Deplotted Text
                        {deplotted_graphs}
                        """,
                    },
                    *images_prompt,
                ],
            ),
        ]
    )


def get_prompt_template_for_table(tables: List[str]) -> ChatPromptTemplate:
    images_prompt = [
        {
            "type": "image_url",
            "image_url": each,
        }
        for each in tables
    ]

    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                Convert table images to graphs and provide a structured output.

                # Steps
                
                1. Detect all tables from provided images.
                2. For each table, check if graph can be created from it.
                3. Choose a matching graph **type**.
                4. Check for postfixes (e.g., `%` for percentages).
                5. Give each graph a name.


                # Notes
                - Ensure the name is properly capitalized, e.g., "Mobile Users in 2024."
                - Ensure the first letter of every text field (e.g., graph names, series names) is capitalized.
                - GraphType and Graph Data Type must match (e.g., "LineChartDataModel" if type is "line") .
                - Each **category** can have at most **2 words**.
                - **Series names** can have at most **2 words**.
                - Place graph data inside **Series "data" or "points"** based on the graph type.
                - **Series "data" or "points"** should be numbers.
                - Create graph only from table with **numbers**.

                # Output Considerations

                - Make sure you output matches the schema.
                - Do not include **GraphModel** if data is not accurate.

                **Double-check all the Steps and Notes and ensure they are followed**
                """,
            ),
            (
                "user",
                [
                    *images_prompt,
                ],
            ),
        ]
    )


def get_prompt_template_for_markdown() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                Analyze the provided markdown and extract graphs and provide a structured output.

                # Steps
                
                1. Detect tables and data from markdown.
                2. From tables and data, check if graph can be created.
                3. Choose a matching graph **type**.
                4. Check for postfixes (e.g., `%` for percentages).
                5. Give each graph a name.


                # Notes
                - Ensure the name is properly capitalized, e.g., "Mobile Users in 2024."
                - Ensure the first letter of every text field (e.g., graph names, series names) is capitalized.
                - GraphType and Graph Data Type must match (e.g., "LineChartDataModel" if type is "line") .
                - Each **category** can have at most **2 words**.
                - **Series names** can have at most **2 words**.
                - Place graph data inside **Series "data" or "points"** based on the graph type.
                - **Series "data" or "points"** should be numbers.
                - Create graph only from table with **numbers**.

                # Output Considerations

                - Make sure you output matches the schema.

                **Double-check all the Steps and Notes and ensure they are followed**
                """,
            ),
            (
                "user",
                """
                # Input Markdown:
                {markdown}
                """,
            ),
        ]
    )


def get_prompt_template_for_interpreted_reports() -> ChatPromptTemplate:
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                Analyze the provided raw graph data and provide a structured output.

                # Steps
                
                1. Analyze provided graph data.
                2. Create a structured graph from each raw graph data.
                3. Choose a matching graph **type**.
                4. Check for postfixes (e.g., `%` for percentages).
                5. Give each graph a name.


                # Notes
                - Ensure the name is properly capitalized, e.g., "Mobile Users in 2024."
                - Ensure the first letter of every text field (e.g., graph names, series names) is capitalized.
                - GraphType and Graph Data Type must match (e.g., "LineChartDataModel" if type is "line") .
                - Each **category** can have at most **2 words**.
                - **Series names** can have at most **2 words**.
                - Place graph data inside **Series "data" or "points"** based on the graph type.
                - **Series "data" or "points"** should be numbers.
                - Create graph only from table with **numbers**.

                # Output Considerations
                - Make sure you output matches the schema.

                **Double-check all the Steps and Notes and ensure they are followed**
                """,
            ),
            (
                "user",
                """
                # Raw Graphs:
                {raw_graphs}
                """,
            ),
        ]
    )


async def generate_graph_collection(
    deplotted_graphs_text: List[str],
    graphs_images: List[str],
) -> GraphCollectionModel:
    structured_model = model.with_structured_output(
        GraphCollectionModel.model_json_schema()
    )

    chain = get_prompt_template(graphs_images) | structured_model

    return await get_validated_response(
        chain, {"deplotted_graphs": deplotted_graphs_text}, GraphCollectionModel, 2
    )


async def generate_graph_collection_from_tables(
    table_images: List[str],
) -> GraphCollectionModel:
    structured_model = model.with_structured_output(
        GraphCollectionModel.model_json_schema()
    )

    chain = get_prompt_template_for_table(table_images) | structured_model

    return await get_validated_response(chain, {}, GraphCollectionModel, 2)


async def generate_graph_collection_from_markdowns(
    markdowns: List[str],
) -> GraphCollectionModel:
    markdown = ""
    for each in markdowns:
        markdown += each
        markdown += "\n\n"

    structured_model = model.with_structured_output(
        GraphCollectionModel.model_json_schema()
    )

    chain = get_prompt_template_for_markdown() | structured_model

    return await get_validated_response(
        chain, {"markdown": markdown}, GraphCollectionModel, 2
    )


async def generate_graph_collection_from_interpreted_reports(
    raw_graphs: List[dict],
) -> GraphCollectionModel:
    structured_model = model.with_structured_output(
        GraphCollectionModel.model_json_schema()
    )

    chain = get_prompt_template_for_interpreted_reports() | structured_model

    return await get_validated_response(
        chain, {"raw_graphs": raw_graphs}, GraphCollectionModel, 2
    )
