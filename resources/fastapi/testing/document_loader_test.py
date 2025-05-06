import asyncio
import time
import pymupdf4llm
import uuid

from pdf2image import convert_from_path
from document_processor.loader import DocumentsLoader

from api.services.instances import temp_file_service

# document_path = "/home/viristo/Documents/rajeev-bro.pdf"
# document_path = "/home/viristo/Documents/gpt-4.pdf"
# document_path = "/home/viristo/Documents/ppt.pptx"
document_path = "/home/viristo/Downloads/test.docx"


async def other_async_func():
    attempt = 0
    while True:
        attempt += 1
        print("Executing loop")
        await asyncio.sleep(1)

        if attempt > 10:
            break


async def run_test_async():
    start_time = time.time()
    loader = DocumentsLoader([document_path])
    temp_dir = temp_file_service.create_temp_dir("document_test")
    await loader.load_documents(temp_dir)
    with open("temp/output.txt", "w") as text_file:
        text_file.write(loader.documents[0].page_content)

    print(time.time() - start_time)
