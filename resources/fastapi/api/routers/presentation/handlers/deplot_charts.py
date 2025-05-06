import asyncio
import os
import time
from typing import List, Optional
from urllib.parse import unquote, urlparse
import uuid
from api.models import LogMetadata
from api.routers.presentation.models import (
    DeplotChartsRequest,
    DocumentInterpretedReport,
    PresentationModel,
)
from api.services.logging import LoggingService
from api.utils import download_files, get_private_file_paths_from_keys
from graph_processor.deplot_graphs import deplot_charts
from graph_processor.generator import (
    generate_graph_collection,
    generate_graph_collection_from_interpreted_reports,
    generate_graph_collection_from_markdowns,
    generate_graph_collection_from_tables,
)
from graph_processor.models import GraphModel
from api.services.instances import s3_service, temp_file_service, supabase_service


class DeplotChartsHandler:
    def __init__(self, data: DeplotChartsRequest):
        self.data = data
        self.presentation_id = data.presentation_id
        self.images = data.images
        self.research_reports = data.research_reports or []
        self.chart_links = data.chart_links or []
        self.table_links = data.table_links or []

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        presentation = await supabase_service.get_presentation(self.presentation_id)

        image_links = (
            s3_service.get_private_bucket_presigned_urls(self.images)
            if self.images
            else []
        )

        report_contents: List[str] = []
        if self.research_reports:
            report_paths = await get_private_file_paths_from_keys(
                s3_service, temp_file_service, self.research_reports, self.temp_dir
            )
            for each in report_paths:
                with open(each) as text_file:
                    report_contents.append(text_file.read())

        graphs: List[GraphModel] = []
        if image_links or self.chart_links or self.table_links or report_contents:
            graphs = await self.get_graphs_models(
                presentation, image_links, report_contents
            )

        if graphs:
            graphs = await supabase_service.create_graphs(
                [each.to_create_dict(self.data.presentation_id) for each in graphs]
            )

        logging_service.logger.info(
            logging_service.message(
                [graph.model_dump(mode="json") for graph in graphs]
            ),
            extra=log_metadata.model_dump(),
        )

        return graphs

    async def get_graphs_models(
        self,
        presentation: PresentationModel,
        image_links: List[str],
        report_contents: List[str],
    ) -> List[GraphModel]:

        response = await asyncio.gather(
            self.get_graph_models_from_interpreted_reports(
                presentation.interpreted_report_content
            ),
            self.get_graph_models_from_charts(image_links),
            self.get_graph_models_from_tables(image_links),
            self.get_graph_models_from_markdowns(report_contents),
        )
        return [*response[0], *response[1], *response[2], *response[3]]

    async def get_graph_models_from_interpreted_reports(
        self, interpreted_report: Optional[DocumentInterpretedReport]
    ) -> List[GraphModel]:
        if not interpreted_report:
            return []

        visualizations = []
        for each in interpreted_report.hypotheses:
            visualizations.extend(each.supporting_data.visualizations)

        if not visualizations:
            return []

        generate_graph_collection = (
            await generate_graph_collection_from_interpreted_reports(visualizations)
        )
        return generate_graph_collection.graphs

    async def get_graph_models_from_charts(
        self, image_links: List[str]
    ) -> List[GraphModel]:
        if not (image_links or self.chart_links):
            return []

        chart_paths = []
        for each in self.chart_links:
            file_name = os.path.basename(unquote(urlparse(each).path))
            chart_paths.append(
                temp_file_service.create_temp_file_path(file_name, self.temp_dir)
            )
        await download_files(self.chart_links, chart_paths)

        print("Parent Charts: ", image_links)
        print("Deplotting Charts: ", self.chart_links)
        start_time = time.time()
        deplotted_charts_text = await deplot_charts(chart_paths) if chart_paths else []
        print(f"Deplotted All Charts: {time.time() - start_time}")
        graph_model_collection = await generate_graph_collection(
            deplotted_charts_text,
            [*image_links, *self.chart_links],
        )

        return graph_model_collection.graphs

    async def get_graph_models_from_tables(
        self, image_links: List[str]
    ) -> List[GraphModel]:
        if not (image_links or self.table_links):
            return []

        print("Parent Tables: ", image_links)
        print("Deplotting Tables: ", self.table_links)
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
            [*image_links, *self.table_links]
        )
        print(f"Deplotted All Tables: {time.time() - start_time}")

        return graph_collection.graphs

        # graphs = []
        # for each_collection in response:
        #     graphs.extend(each_collection.graphs)
        # return graphs

    async def get_graph_models_from_markdowns(
        self, report_contents: List[str]
    ) -> List[GraphModel]:
        if not report_contents:
            return []

        start_time = time.time()
        graph_collection = await generate_graph_collection_from_markdowns(
            report_contents
        )
        print(f"Deplotted All Markdowns: {time.time() - start_time}")
        return graph_collection.graphs
