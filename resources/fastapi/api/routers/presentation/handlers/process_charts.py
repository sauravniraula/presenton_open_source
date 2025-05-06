import asyncio
import os
import time
from typing import List, Optional, Tuple
import uuid
from zipfile import ZipFile
from fastapi import HTTPException

from api.models import LogMetadata
from api.routers.presentation.mixins.process_document import ProcessDocumentMixin
from api.routers.presentation.models import ProcessChartsRequest
from api.services.logging import LoggingService
from api.utils import get_private_file_paths_from_keys
from PIL import Image
from langchain_core.documents import Document

from graph_processor.deplot_graphs import deplot_charts
from graph_processor.detector import detect_graphs, detect_tables
from graph_processor.generator import (
    generate_graph_collection,
    generate_graph_collection_from_tables,
)
from graph_processor.models import GraphModel
from image_processor.metadata_generator import generate_images_metadata
from image_processor.models import ImageMetaDataModel, ImagesMetaDataModel
from image_processor.processor import ImageProcessor
from api.services.instances import s3_service, temp_file_service


class ProcessChartHandler(ProcessDocumentMixin):

    def __init__(self, data: ProcessChartsRequest):
        self.data = data
        self.documents = data.documents
        self.charts = data.charts

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        if not self.documents and not self.charts:
            raise HTTPException(
                status_code=400, detail="No documents or charts provided"
            )

        start_time = time.time()
        documents_loader, pdf_page_image_paths = (
            await self.process_documents(
                load_markdown=False, load_images=True, is_private=True
            )
            if self.documents
            else (None, None)
        )
        print(f"Extract document content: {time.time() - start_time}")

        chart_links, cropped_chart_paths, cropped_table_paths = (
            await self.detect_and_crop_charts_and_tables(pdf_page_image_paths)
        )
        cropped_links = await s3_service.get_temporary_files_links(
            [*cropped_chart_paths, *cropped_table_paths]
        )

        graphs: List[GraphModel] = []
        if chart_links or cropped_links:
            graphs = await self.get_graphs_models(
                chart_links,
                cropped_chart_paths,
                cropped_table_paths,
                cropped_links,
            )

        logging_service.logger.info(
            logging_service.message(
                [graph.model_dump(mode="json") for graph in graphs]
            ),
            extra=log_metadata.model_dump(),
        )

        return graphs

    async def detect_and_crop_charts_and_tables(
        self, image_paths: Optional[List[str]] = None
    ) -> Tuple[List[str], List[str]]:
        image_paths = image_paths or []

        chart_paths = []
        chart_links = []
        if self.charts:
            chart_paths = await get_private_file_paths_from_keys(
                s3_service, temp_file_service, self.charts, self.temp_dir
            )
            chart_links = s3_service.get_private_bucket_presigned_urls(self.charts)

        combined_chart_paths = [*chart_paths, *image_paths]
        # Sorting paths based on filename beacause
        # when zip file is extracted in directory,
        # this is how files would be sorted
        combined_chart_paths = sorted(
            combined_chart_paths, key=lambda path: os.path.basename(path)
        )

        zip_file_name = f"zip-{str(uuid.uuid4())}.zip"
        zip_file_path = temp_file_service.create_temp_file_path(
            zip_file_name, self.temp_dir
        )
        with ZipFile(zip_file_path, "w") as image_zip:
            for each_image in combined_chart_paths:
                image_zip.write(each_image, os.path.basename(each_image))

        zip_file_link = (
            await s3_service.get_temporary_files_links(files=[zip_file_path])
        )[0]

        detected_graphs_collection, detected_tables_collection = await asyncio.gather(
            detect_graphs(zip_file_link), detect_tables(zip_file_link)
        )

        cropped_chart_temp_paths: List[str] = []
        cropped_table_temp_paths: List[str] = []

        graph_counter = 0
        for index, detected_graphs in enumerate(detected_graphs_collection):
            if graph_counter >= 10:
                break

            chart_path = combined_chart_paths[index]
            print("Combined Image Path: ", chart_path)
            print("Detected Graphs: ", detected_graphs)
            chart_image = Image.open(chart_path).convert("RGB")

            for detected_graph in detected_graphs:
                graph_counter += 1

                cropped_image = chart_image.crop(detected_graph.bbox)
                file_name = f"cropped-chart-{uuid.uuid4()}.jpg"
                temp_file_path = temp_file_service.create_temp_file_path(
                    file_name, self.temp_dir
                )
                print("Cropped Graph Image Path: ", temp_file_path)
                cropped_image.save(temp_file_path, format="JPEG")
                cropped_chart_temp_paths.append(temp_file_path)

            print("-" * 20)

        table_counter = 0
        for index, detected_tables in enumerate(detected_tables_collection):
            if table_counter >= 10:
                break

            table_path = combined_chart_paths[index]
            print("Combined Image Path: ", table_path)
            print("Detected Tables: ", detected_tables)
            table_image = Image.open(table_path).convert("RGB")

            for detected_table in detected_tables:
                table_counter += 1

                cropped_image = table_image.crop(detected_table.bbox)
                file_name = f"cropped-table-{uuid.uuid4()}.jpg"
                temp_file_path = temp_file_service.create_temp_file_path(
                    file_name, self.temp_dir
                )
                print("Cropped Table Image Path: ", temp_file_path)
                cropped_image.save(temp_file_path, format="JPEG")
                cropped_table_temp_paths.append(temp_file_path)

            print("-" * 20)

        return chart_links, cropped_chart_temp_paths, cropped_table_temp_paths

    async def extract_images_metadata(
        self, images: List[str]
    ) -> Tuple[List[ImageMetaDataModel], List[Document]]:
        images_processor = ImageProcessor(images, self.temp_dir)
        images_processor.join_images()

        joined_images_links = await s3_service.get_temporary_files_links(
            images_processor.joined_images
        )

        images_metadata_group_coroutine = []
        if joined_images_links:
            for each_image in joined_images_links:
                images_metadata_group_coroutine.append(
                    generate_images_metadata(each_image)
                )
        images_grouped_metadata: List[ImagesMetaDataModel] = await asyncio.gather(
            *images_metadata_group_coroutine
        )
        images_metadata: List[ImageMetaDataModel] = []
        for each in images_grouped_metadata:
            images_metadata.extend(each.images)

        images_metadata = images_metadata[: len(images)]

        images_documents: List[Document] = [
            each.to_document() for each in images_metadata
        ]

        return images_metadata, images_documents

    def get_images_with_charts(
        self, images_metadata: List[ImageMetaDataModel], image_links: List[str]
    ):
        images = []
        for index, each in enumerate(images_metadata):
            if each.is_graph:
                images.append(image_links[index])
        return images

    async def get_graphs_models(
        self,
        chart_links: List[str],
        cropped_chart_paths: List[str],
        cropped_table_paths: List[str],
        cropped_links: List[str],
    ) -> List[GraphModel]:

        cropped_chart_links = cropped_links[: len(cropped_chart_paths)]
        cropped_table_links = cropped_links[len(cropped_chart_paths) :]

        response = await asyncio.gather(
            self.get_graph_models_from_charts(
                chart_links, cropped_chart_paths, cropped_chart_links
            ),
            self.get_graph_models_from_tables(cropped_table_paths, cropped_table_links),
        )
        return [*response[0], *response[1]]

    async def get_graph_models_from_charts(
        self,
        chart_links: List[str],
        cropped_chart_paths: List[str],
        cropped_chart_links: List[str],
    ) -> List[GraphModel]:
        if not (chart_links or cropped_chart_paths):
            return []

        print("Parent Charts: ", chart_links)
        print("Deplotting Charts: ", cropped_chart_paths)
        start_time = time.time()
        deplotted_charts_text = (
            await deplot_charts(cropped_chart_paths) if cropped_chart_paths else []
        )
        print(f"Deplotted All Charts: {time.time() - start_time}")
        graph_model_collection = await generate_graph_collection(
            deplotted_charts_text,
            [*chart_links, *cropped_chart_links],
        )

        return graph_model_collection.graphs

    async def get_graph_models_from_tables(
        self,
        cropped_table_paths: List[str],
        cropped_table_links: List[str],
    ) -> List[GraphModel]:
        if not cropped_table_paths:
            return []

        print("Deplotting Tables: ", cropped_table_paths)
        start_time = time.time()

        # coroutines = []
        # pool_size = 4
        # for index in range(0, len(cropped_table_links), pool_size):
        #     print(f"Processing tables llm batch: {index+1}")
        #     coroutines.append(
        #         generate_graph_collection_from_tables(
        #             cropped_table_links[index : index + pool_size]
        #         )
        #     )
        # response = await asyncio.gather(*coroutines)
        graph_collection = await generate_graph_collection_from_tables(
            cropped_table_links
        )
        print(f"Deplotted All Tables: {time.time() - start_time}")

        return graph_collection.graphs

        # graphs = []
        # for each_collection in response:
        #     graphs.extend(each_collection.graphs)
        # return graphs
