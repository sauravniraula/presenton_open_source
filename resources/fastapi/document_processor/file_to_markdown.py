import json
import os
import time
from google import genai
from google.genai import types as genaiTypes

from document_processor.models import FileMarkdown


client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

system_instruction = """
    You are an expert in analyzing data.
    Analyze the provided content and provide output in markdown format.

    # Steps
    - Analyze the content.
    - Identify headings, lists, tables, graphs etc.
    - Convert to Markdown Format.
"""


def generate_markdown_from_file(file: str) -> FileMarkdown:
    uploaded_file = client.files.upload(file=file)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        config=genaiTypes.GenerateContentConfig(
            system_instruction=system_instruction,
            max_output_tokens=50_000,
            response_schema=FileMarkdown,
            response_mime_type="application/json",
        ),
        contents=["Input", uploaded_file],
    )

    return FileMarkdown(**json.loads(response.text))
