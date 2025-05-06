import asyncio
from typing import List
from langchain_core.documents import Document
from langchain_text_splitters import CharacterTextSplitter
from groq import AsyncGroq

groq_client = AsyncGroq()

text_splitter = CharacterTextSplitter.from_tiktoken_encoder(
    encoding_name="cl100k_base", chunk_size=200000, chunk_overlap=0
)

sysmte_prompt = """Generate a blog-style summary of the provided document in **more than 2000 words**, focusing on **prominently featuring any numerical data and statistics**. Maintain as much information as possible.

### Output Format

- Provide the summary in a **blog format** with an **engaging introduction** and a **clear structure**.
- Ensure the **logical flow** of the document is preserved.
- Emphasize any **numbers, statistics, and data points**.

### Notes

- **Emphasize numerical data and statistics** in the summary.
- **Retain the main ideas and essential details** from the document.
- Use **engaging language** suitable for a blog audience to enhance readability.
- **Show line-breaks** clearly.
- If **slides structure is mentioned** in document, structure the summary in the same way.
"""


async def generate_document_summary(documents: List[Document]):
    coroutines = []
    for document in documents:
        text = document.page_content
        truncated_text = text_splitter.split_text(text)[0]
        coroutine = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": sysmte_prompt,
                },
                {"role": "user", "content": truncated_text},
            ],
            temperature=1,
            max_completion_tokens=8000,
            top_p=1,
            stream=False,
            stop=None,
        )
        coroutines.append(coroutine)

    completions = await asyncio.gather(*coroutines)
    combined = "\n\n".join(
        [completion.choices[0].message.content for completion in completions]
    )
    return combined
