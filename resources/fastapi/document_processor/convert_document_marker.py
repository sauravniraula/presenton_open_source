import os
import aiohttp
import asyncio
import pymupdf4llm


# async def pdf_to_markdown(document_path):
#     headers = {"X-Api-Key": os.getenv("DATALAB_API_KEY")}
#     url = "https://www.datalab.to/api/v1/marker"

#     async with aiohttp.ClientSession() as session:
#         form_data = aiohttp.FormData()
#         with open(document_path, 'rb') as f:
#             form_data.add_field('file', f, filename='test.pdf', content_type='application/pdf')
#             form_data.add_field('langs', "English")
#             form_data.add_field('force_ocr', "false")
#             form_data.add_field('paginate', "false")
#             form_data.add_field('output_format', "markdown")
#             form_data.add_field('use_llm', "false")
#             form_data.add_field('strip_existing_ocr', "false")
#             form_data.add_field('disable_image_extraction', "false")

#             try:
#                 async with session.post(url, data=form_data, headers=headers) as response:
#                     print(response.status)
#                     data = await response.json()
#             except Exception as e:
#                 print(response.text)
#                 raise e

#             max_polls = 300
#             check_url = data["request_check_url"]

#             for i in range(max_polls):
#                 await asyncio.sleep(2)
#                 async with session.get(check_url, headers=headers) as response:
#                     data = await response.json()
                    
#                     if data["status"] == "complete":
#                         break

#             return data["markdown"], data["images"].values(), document_path

async def pdf_to_markdown(document_path):
    md_text = pymupdf4llm.to_markdown(document_path)
    return md_text, [], document_path

if __name__ == """__main__""":
    asyncio.run(pdf_to_markdown("/home/suraj-jha/Downloads/data-presentations/2/data-doc-2.pdf"))

