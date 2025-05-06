import os
from typing import List
import uuid
from PIL import Image
from zipfile import ZipFile
from graph_processor.detector import detect_graphs
from document_processor.loader import DocumentsLoader
from graph_processor.deplot_graphs import deplot_charts
from graph_processor.generator import generate_graph_collection

from api.services.instances import temp_file_service, s3_service

temp_dir = temp_file_service.create_temp_dir("deplot_test")
temp_file_service.delete_dir_files(temp_dir)


async def run_test():
    loader = DocumentsLoader(documents=["/home/viristo/Documents/gpt-4.pdf"])
    loader.load_documents(load_markdown=False, load_images=True, temp_dir=temp_dir)

    images = sorted(loader.images, key=lambda path: os.path.basename(path))

    zip_file_name = f"{str(uuid.uuid4())}.zip"
    zip_file_path = temp_file_service.create_temp_file_path(zip_file_name, temp_dir)
    with ZipFile(zip_file_path, "w") as image_zip:
        for each_image in images:
            image_zip.write(each_image, os.path.basename(each_image))

    zip_file_link = await s3_service.get_temporary_files_links(files=[zip_file_path])[0]

    detected_graphs_collection = await detect_graphs(zip_file_link)

    cropped_chart_temp_paths: List[str] = []
    for index, detected_graphs in enumerate(detected_graphs_collection):
        chart_path = images[index]
        print("Combined Chart Path: ", chart_path)
        print("Detected Graphs: ", detected_graphs)
        chart_image = Image.open(chart_path).convert("RGB")

        for detected_graph in detected_graphs:
            cropped_image = chart_image.crop(detected_graph.bbox)
            file_name = f"cropped-{uuid.uuid4()}.jpg"
            temp_file_path = temp_file_service.create_temp_file_path(
                file_name, temp_dir
            )
            print("Cropped Image Path: ", temp_file_path)
            cropped_image.save(temp_file_path, format="JPEG")
            cropped_chart_temp_paths.append(temp_file_path)

        print("-" * 20)