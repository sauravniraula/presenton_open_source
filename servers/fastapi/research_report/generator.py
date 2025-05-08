import os
from typing import Optional
from langchain_community.chat_models import ChatPerplexity
from langchain_core.prompts import ChatPromptTemplate


model = ChatPerplexity(model="sonar-pro", temperature=0, api_key=os.getenv("PPLX_API_KEY"))


prompt_template = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            """
            Use provided input prompt to create an elaborate and up-to-date research report in mentioned language.

            # Steps
            1. Analyze the prompt.
            2. Extract topic of the report.
            3. Generate a report.

            # Notes
            - Format of report should be like *Research Report*.
            - Ignore formatting if mentioned in prompt.
            - Report should be data-focused.
            - Include tables if available.
            """,
        ),
        (
            "human",
            """
            - Prompt: {prompt}
            - Language: {language}
            """,
        ),
    ]
)


async def get_report(query: str, language: Optional[str]):
    chain = prompt_template | model
    data =  await chain.ainvoke({"prompt": query, "language": language or "English"})
    return data

