import base64
import json
import mimetypes
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_openai import ChatOpenAI

from graph_processor.models import TableMarkdownModel
from ppt_generator.fix_validation_errors import get_validated_response


model = ChatGoogleGenerativeAI(model="gemini-2.0-flash")


def get_prompt_template(image_mimetype: str, image_content: str):
    images_prompt = [
        {
            "type": "image_url",
            "image_url": {"url": f"data:{image_mimetype};base64,{image_content}"},
        }
    ]
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                You are an expert in data analytics.
                Analyze the provided image of graph or table and convert it to markdown table.

                # Steps
                1. Analyze the provided input.
                2. Extract content from image.
                3. Structure the content into tabular form.
                4. Generate a name for the table.
                5. Output the table in **Markdown** format.

                # Notes
                - Ensure the first letter of every text is capitalized.
                - If image is graph, extract every data points.
                - If image is table, extract every rows and columns.
                - Table must be detailed representation of the graph or table.
                - Make sure you output matches the schema.

                **Double-check all the Steps and Notes and ensure they are followed**
                """,
            ),
            (
                "user",
                [
                    {"type": "text", "text": "Input"},
                    *images_prompt,
                ],
            ),
        ]
    )


async def deplot_image_to_table(image_path: str, source: str) -> TableMarkdownModel:
    structured_model = model.with_structured_output(
        TableMarkdownModel.model_json_schema()
    )

    chain = get_prompt_template("image/jpeg", image_path) | structured_model

    response = await get_validated_response(
        chain,
        {},
        TableMarkdownModel,
        2,
    )
    data = response.model_dump()
    data["source"] = source
    return data
