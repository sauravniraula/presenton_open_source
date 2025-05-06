import json
import os
import redis
from typing import List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI

from api.routers.presentation.models import DocumentInterpretedReport
from ppt_config_generator.models import PresentationTitlesModel
from ppt_generator.fix_validation_errors import get_validated_response


# model = ChatGoogleGenerativeAI(model="gemini-2.5-flash-preview-04-17").with_structured_output(
#     PresentationTitlesModel.model_json_schema()
# )

r = redis.Redis(
  host=os.getenv('UPSTASH_REDIS_SCHOOL_CHAPTERS_HOST'),
  port=6379,
  password=os.getenv('UPSTASH_REDIS_SCHOOL_CHAPTERS_PASSWORD'),
  ssl=True
)

model = ChatOpenAI(model="gpt-4.1-mini").with_structured_output(
    PresentationTitlesModel.model_json_schema()
)

user_prompt_text = {
    "type": "text",
    "text": """
                **Input:**
                - Prompt: {prompt}
                - Output Language: {language}
                - Number of Slides: {n_slides}
                - SpreadSheet Content: {spreadsheet_content}
                - Content: {content}
                - Additional Information: {content}
            """,
}


def get_prompt_template():
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                    Generate titles for the presentation based on the prompt and additional information.

                    # Steps
                    1. Analyze the prompt and additional information.
                    2. Visualize presentation with **Number of Slides**.
                    3. Use provided input or any information you have on this topic.
                    4. Check if slide titles are provided in **Input**.
                    5. Generate title for each slide if not provided in **Input**.
                    6. If slide titles are provided in **Input** then use them as it is.
                    7. In case if slides for chapter is provided then analyze all chapter content and then structurally generate titles considering all slide content. \
                        Keep the flow as per given chapter content. Ensure that titles are generated to cover all the content in the chapter.

                    # Notes
                    - Generate output in language mentioned in **Input**.
                    - Ensure the prompt and additional information remains the main focus of the presentation.
                    - **Additional Information** serves as supporting information, providing depth and details.
                    - Slide titles should maintain a logical and coherent flow throughout the presentation.
                    - Slide **Title** should not contain slide number like (Slide 1, Slide 2, etc)
                    - Slide **Title** can have 3 to 8 words.
                    - Slide **Title** must not use any other special characters except ":".
                    - Presentation **Title** should be around 3 to 8 words.
                    - Extract titles from the **Additional Information** or **Prompt** if provided.
                    - If presentation flow is mentioned in **Additional Information** then use it to generate titles.
                    - If Chapter Content is provided than strictly adhere to it and then generate titles in the same content flow as chapter content.
                """,
            ),
            (
                "user",
                [user_prompt_text],
            ),
        ],
    )


async def generate_ppt_titles(
    prompt: Optional[str],
    n_slides: int,
    content: Optional[str],
    language: Optional[str] = None,
    interpreted_report: Optional[DocumentInterpretedReport] = None,
    chapter_info: Optional[dict] = None,
) -> PresentationTitlesModel:

    chain = get_prompt_template() | model


    content = ""
    if chapter_info:
        n_slides = 0
        chapter_content = r.get(chapter_info["id"])
        content = f"Chapter Title: {chapter_info['chapter_title']}, Chapter Content: {chapter_content}, Course: {chapter_info['course']}, Book Title: {chapter_info['book_title']}, Grade: {chapter_info['grade']}"

    return await get_validated_response(
        chain,
        {
            "prompt": prompt,
            "n_slides": n_slides,
            "language": language or "English",
            "content": content,
            "spreadsheet_content": interpreted_report,
            "content": content,
        },
        PresentationTitlesModel,
    )
