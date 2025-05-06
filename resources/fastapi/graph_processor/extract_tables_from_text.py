from typing import List
from pydantic import BaseModel
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from graph_processor.models import TableMarkdownModel
from ppt_generator.fix_validation_errors import get_validated_response

class TableMarkdownModels(BaseModel):
    tables: List[TableMarkdownModel]

model = ChatOpenAI(model="gpt-4o", max_completion_tokens=10000).with_structured_output(
    TableMarkdownModels.model_json_schema()
)

prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
                Generate a markdown table from provided context and input data and provide a structured output by following all mentioned constraints.

                Extract tables described within a given prompt into markdown format. Each table should include both a name and a body that are also in markdown format.
                
                - **Check Direct Extraction**: Determine if the table can be directly extracted from the text.
                - **Derive Tables**: If not directly extractable, create tables based on numerical data present within the text. Only consider numerical data for this step, ignoring non-numerical information.
                - **Meaningful Tables**: Ensure each table is meaningful. Do not give empty tables or tables with perturbed data.
                - **Empty Tables**: Do not give out empty tables.
                - **Handle Absence of Tables**: **If no tables can be directly extracted and no numerical data is available to form tables, do not give out tables.**
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

async def text_to_tables(text, source):
    chain = prompt_template | model
    tables =  await get_validated_response(chain, {"input_text": text}, TableMarkdownModels)
    dict_tables = []
    for table in tables.tables:
        dict_table = table.model_dump()
        dict_table["source"] = source
        dict_tables.append(dict_table)
    return dict_tables

