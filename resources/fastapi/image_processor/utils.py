import asyncio
import uuid
from pdf2image import convert_from_path
import pymupdf
from api.services.instances import temp_file_service


def get_page_images_from_pdf(document_path: str, temp_dir: str):
    images_temp_dir = temp_file_service.create_dir_in_dir(temp_dir)

    image_paths = []

    pdf_loader = pymupdf.open(document_path)
    page_count = pdf_loader.page_count

    batch_size = 10
    for index in range(1, page_count + 1, batch_size):
        images = convert_from_path(
            document_path, first_page=index, last_page=index + batch_size - 1
        )
        for each_image in images:
            temp_image_path = temp_file_service.create_temp_file_path(
                f"{uuid.uuid4()}.jpg", images_temp_dir
            )
            each_image.save(temp_image_path, "JPEG")
            image_paths.append(temp_image_path)

    return image_paths


async def get_page_images_from_pdf_async(document_path: str, temp_dir: str):
    return await asyncio.to_thread(get_page_images_from_pdf, document_path, temp_dir)
