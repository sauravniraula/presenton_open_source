import os
from typing import List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI

from ppt_config_generator.models import PresentationQuestionsAndContentModel
from ppt_config_generator.questions import PRESENTATION_QUESTIONS
from ppt_generator.fix_validation_errors import get_validated_response
from graph_processor.models import TableMarkdownSourceModel

from langchain_community.vectorstores.upstash import UpstashVectorStore
from langchain_openai import OpenAIEmbeddings

embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

vector_store = UpstashVectorStore(
    embedding=embeddings,
    index_url=os.getenv("UPSTASH_VECTOR_REST_URL_LANGUAGE"),
    index_token=os.getenv("UPSTASH_VECTOR_REST_TOKEN_LANGUAGE"),
)


# model = ChatGoogleGenerativeAI(model="gemini-2.0-flash").with_structured_output(
#     PresentationQuestionsAndContentModel.model_json_schema()
# )

model = ChatOpenAI(model="gpt-4.1").with_structured_output(
    PresentationQuestionsAndContentModel.model_json_schema()
)

user_prompt_text = {
    "type": "text",
    "text": """
                **Input:**
                - Prompt: {prompt}
                - Output Language: {language}
                - Number of Slides: {n_slides}
                - Questions: {questions}
                - Additional Information: {context}
                - Graphs: {graphs}
            """,
}


def get_prompt_template(images: List[str]):
    images_prompt = [
        {
            "type": "image_url",
            "image_url": each,
        }
        for each in images
    ]
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                    From provided input generate detailed content, try to answer questions mentioned in input and return structured response.

                    # Steps
                    1. Analyze the prompt and additional information.
                    2. Visualize presentation with **Number of Slides** or if not provided then pick number of slides based on the provided information.
                    3. Use provided input or any information you have on this topic.
                    4. Try to answer the questions provided as **Questions**.
                    5. If language is not provided, then infer language from prompt.
                    6. Add number of slides as in the **Input** or if not provided then infer number of slides from the prompt.

                    # Notes
                    - Consider and analyze all graphs while generating content.
                    - If you want to add context of any graph in the content, reference it in following format [Graph: __name__]. Don't forget to add basic explanation of the graph in content as well.
                    - Generate output (content and questions) in language mentioned in **Input** or inferred language from prompt.
                    - All **number, figures, tables or 'chart contents'** in the prompt should be compulsorily added in the content as it is **without changing anything in exactly same format**.
                    - **Additional Information** serves as supporting information, providing depth and details.
                    - For every question
                        - Analyze the input data.
                        - Provide options to pick from.
                """,
            ),
            (
                "user",
                [user_prompt_text, *images_prompt],
            ),
        ],
    )


async def generate_answers_and_content(
    prompt: Optional[str],
    n_slides: Optional[int],
    summary: str,
    images: List[str],
    language: Optional[str] = None,
    graphs: Optional[List[TableMarkdownSourceModel]] = [],
) -> PresentationQuestionsAndContentModel:
    chain = get_prompt_template(images) | model

    formatted_graphs = "\n".join(
        [f"Name: {graph.name}\nData: {graph.markdown}\n\n" for graph in graphs]
    )
    prompt = prompt

    presentation_content = await get_validated_response(
        chain,
        {
            "context": summary,
            "prompt": prompt,
            "n_slides": n_slides,
            "language": language,
            "questions": PRESENTATION_QUESTIONS,
            "graphs": formatted_graphs,
        },
        PresentationQuestionsAndContentModel,
    )
    language = await vector_store.asimilarity_search(
        query=presentation_content.language, k=1
    )
    if not language:
        presentation_content.language = "English (English)"
    else:
        presentation_content.language = language[0].page_content

    return presentation_content
