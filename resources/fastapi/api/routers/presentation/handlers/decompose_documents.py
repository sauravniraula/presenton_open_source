import asyncio
import json
import os
import base64
import io
from typing import List, Tuple
import uuid
from zipfile import ZipFile
from PIL import Image
from api.models import LogMetadata
from api.routers.presentation.mixins.process_document import ProcessDocumentMixin
from api.routers.presentation.models import (
    DecomposeDocumentsRequest,
    DecomposeDocumentsResponse,
)
from api.services.instances import temp_file_service, s3_service, supabase_service
from api.services.logging import LoggingService
from api.utils import get_private_file_paths_from_keys
from graph_processor.deplot_charts_and_tables import deplot_image_to_table
from graph_processor.detector import detect_tables
from api.services.instances import s3_service, temp_file_service
from api.utils import get_private_file_paths_from_keys
from document_processor.convert_document_marker import pdf_to_markdown
from document_processor.detect_graphs import detect_graphs
from graph_processor.extract_tables import extract_raw_tables, raw_text_to_table

class DecomposeDocumentsHandler(ProcessDocumentMixin):

    def __init__(self, data: DecomposeDocumentsRequest):
        self.data = data
        self.images = data.images or []

        self.documents = list(
            filter(lambda doc: not doc.endswith(".csv"), self.data.documents or [])
        )

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        document_paths = await get_private_file_paths_from_keys(
            s3_service, temp_file_service, self.documents, self.temp_dir
        )

        coroutines = [pdf_to_markdown(each) for each in document_paths]

        parsed_documents = await asyncio.gather(*coroutines)

        document_paths = []
        for parsed_doc, _ ,_ in parsed_documents:
            file_path = temp_file_service.create_temp_file_path(
                f"{str(uuid.uuid4())}.txt", self.temp_dir
            )
            parsed_doc = parsed_doc.replace("<br>", "\n")
            with open(file_path, "w") as text_file:
                text_file.write(parsed_doc)
            document_paths.append(file_path)

        document_temporary_keys = await s3_service.get_temporary_files_keys(
            document_paths
        )
        document_temporary_links = s3_service.get_temporary_bucket_presigned_urls(
            document_temporary_keys
        )

        graph_to_tables_coroutines = []
        
        for index, (document, detected_images, document_path) in enumerate(parsed_documents):
            raw_tables = extract_raw_tables(document)
            for raw_table in raw_tables:
                graph_to_tables_coroutines.append(raw_text_to_table(raw_table, self.documents[index]))
            if detected_images:
                images = []
                for image_path in detected_images:
                    image_bytes = base64.b64decode(image_path)
                    image = Image.open(io.BytesIO(image_bytes))
                    images.append(image)
                # detected_graphs = detect_graphs(images)
                # graph_to_tables_coroutines.extend(
                #     [deplot_image_to_table(detected_graph, self.documents[index]) for detected_graph in detected_graphs]
                # )

        # if self.images:
        #     for image in self.images:
        #         image_paths = await get_private_file_paths_from_keys(
        #             s3_service, temp_file_service, [image], self.temp_dir
        #         )
        #         loaded_image = Image.open(image_paths[0])
        #         detected_graphs = detect_graphs([loaded_image])
        #         graph_to_tables_coroutines.extend(
        #             [deplot_image_to_table(detected_graph, image) for detected_graph in detected_graphs]
        #         )
        #         # Convert loaded_image to base64 string for each detected graph
        #         with io.BytesIO() as buffer:
        #             loaded_image.save(buffer, format='PNG')
        #             image_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
        #         graph_to_tables_coroutines.append(deplot_image_to_table(image_str, image))


        extracted_tables = await asyncio.gather(*graph_to_tables_coroutines)
        
        if extracted_tables:
            for i, table in enumerate(extracted_tables):
                if isinstance(table, list):
                    extracted_tables.pop(i)
                    extracted_tables.extend(table)
            extracted_tables = await supabase_service.create_tables(extracted_tables)

        documents = {}
        for index, each in enumerate(self.documents):
            documents[each] = [
                document_temporary_keys[index],
                document_temporary_links[index],
            ]

        images = {}
        if self.images:
            image_links = s3_service.get_private_bucket_presigned_urls(self.images)
            for index, each in enumerate(self.images):
                images[each] = image_links[index]
        
        tables = {}
        for table in extracted_tables:
            table = table.model_dump()
            if table["source"] in tables:
                tables[table["source"]].append(table)
            else:
                tables[table["source"]] = [table]
        
        charts = {}
        for document in self.documents:
            charts[document] = []

        response = DecomposeDocumentsResponse(
            documents=documents,
            images=images,
            charts=charts,
            tables=tables,
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response

    async def detect_and_crop_charts_and_tables(
        self, document_image_paths: List[List[str]] = []
    ) -> Tuple[dict, dict]:
        # image_paths = []
        # if self.images:
        #     image_paths = await get_private_file_paths_from_keys(
        #         s3_service, temp_file_service, self.images, self.temp_dir
        #     )

        # combined_image_sources = [*self.images, *self.documents]
        # combined_images_collection = [
        #     *[[each] for each in image_paths],
        #     *document_image_paths,
        # ]

        # combined_image_paths = []
        # image_path_to_source_index = {}
        # for index, image_collection in enumerate(combined_images_collection):
        #     for each in image_collection:
        #         combined_image_paths.append(each)
        #         image_path_to_source_index[each] = index

        # # Sorting paths based on filename beacause
        # # when zip file is extracted in directory,
        # # this is how files would be sorted
        # combined_image_paths = sorted(
        #     combined_image_paths, key=lambda path: os.path.basename(path)
        # )

        # zip_file_name = f"zip-{str(uuid.uuid4())}.zip"
        # zip_file_path = temp_file_service.create_temp_file_path(
        #     zip_file_name, self.temp_dir
        # )
        # with ZipFile(zip_file_path, "w") as image_zip:
        #     for each_image in combined_image_paths:
        #         image_zip.write(each_image, os.path.basename(each_image))

        # zip_file_link = (
        #     await s3_service.get_temporary_files_links(files=[zip_file_path])
        # )[0]

        # detected_graphs_collection, detected_tables_collection = await asyncio.gather(
        #     detect_graphs(zip_file_link), detect_tables(zip_file_link)
        # )

        # cropped_charts = {}
        # cropped_tables = {}

        # for each in combined_image_sources:
        #     cropped_charts[each] = []
        #     cropped_tables[each] = []

        # for index, detected_graphs in enumerate(detected_graphs_collection):
        #     if not detected_graphs:
        #         continue

        #     image_path = combined_image_paths[index]
        #     image_source_index = image_path_to_source_index[image_path]
        #     image_source = combined_image_sources[image_source_index]
        #     chart_image = Image.open(image_path).convert("RGB")
        #     for detected_graph in detected_graphs:

        #         cropped_image = chart_image.crop(detected_graph.bbox)
        #         file_name = f"cropped-chart-{uuid.uuid4()}.jpg"
        #         temp_file_path = temp_file_service.create_temp_file_path(
        #             file_name, self.temp_dir
        #         )
        #         cropped_image.save(temp_file_path, format="JPEG")
        #         cropped_charts[image_source].append(temp_file_path)


        # for index, detected_tables in enumerate(detected_tables_collection):

        #     image_path = combined_image_paths[index]
        #     image_source_index = image_path_to_source_index[image_path]
        #     image_source = combined_image_sources[image_source_index]

        #     table_image = Image.open(image_path).convert("RGB")

        #     for detected_table in detected_tables:

        #         cropped_image = table_image.crop(detected_table.bbox)
        #         file_name = f"cropped-table-{uuid.uuid4()}.jpg"
        #         temp_file_path = temp_file_service.create_temp_file_path(
        #             file_name, self.temp_dir
        #         )
        #         cropped_image.save(temp_file_path, format="JPEG")
        #         cropped_tables[image_source].append(temp_file_path)


        return [], []
