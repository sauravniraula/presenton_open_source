import json
import pickle
from dotenv import load_dotenv

load_dotenv()

import os
from graph_processor.deplot_graphs import deplot_charts
from graph_processor.generator import generate_graph_collection
from api.services.instances import s3_service

cropped_charts_dir = "../assets/graphs/cropped_document_graphs"
deplotted_file = "temp/deplotted_file.pt"


async def run_test():
    cropped_files = os.listdir(cropped_charts_dir)
    cropped_file_paths = [
        os.path.join(cropped_charts_dir, each) for each in cropped_files
    ]

    # deplotted_texts = await deplot_charts(cropped_file_paths)

    deplotted_texts = []
    with open(deplotted_file, "rb") as a_file:
        deplotted_texts = pickle.load(a_file)

    cropped_file_links = await s3_service.get_temporary_files_links(cropped_file_paths)

    graph_collection = await generate_graph_collection(
        deplotted_texts, cropped_file_links
    )

    print(graph_collection.model_dump_json())
