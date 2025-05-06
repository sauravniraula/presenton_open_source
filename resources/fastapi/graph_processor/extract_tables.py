import re
import json

from typing import List
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from graph_processor.models import TableMarkdownModel
from ppt_generator.fix_validation_errors import get_validated_response


model = ChatOpenAI(model="gpt-4o-mini").with_structured_output(
    TableMarkdownModel.model_json_schema()
)

# model = ChatGroq(temperature=0.6, model_name="llama-3.1-8b-instant").with_structured_output(
#     TableMarkdownModels.model_json_schema()
# )



prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
                Given *Input Text* is a table in markdown format. You need to extract and format markdown properly in standard way. And give the text in following format.
            """,
        ),
        (
            "user",
            """
               Input Text: {input_text}
            """
        )
    ]
)


def extract_raw_tables(text):
    # Pattern to match: up to 50 chars before, one or more pipe-separated terms, \n, and up to 50 chars after
    pattern = r'.{0,80}((\|[\s\w\-()\d.,><\\u:\/]+)+\n)(?=.*\d).{0,80}'

    # Find all matches in the text
    matches = re.finditer(pattern, text)

    return [match.group(0) for match in matches]

async def raw_text_to_table(text, source):
    chain = prompt_template | model
    table =  await get_validated_response(chain, {"input_text": text}, TableMarkdownModel)
    table =  table.model_dump()
    table["source"] = source
    return table
