import asyncio
import json
from typing import List
from api.models import LogMetadata
from api.routers.presentation.models import UpdateChartsRequest
from api.services.instances import s3_service, temp_file_service, supabase_service
from api.services.logging import LoggingService


class UpdateChartsHandler:

    def __init__(self, data: UpdateChartsRequest):
        self.data = data
        self.graphs = data.charts

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        edit_dicts = []
        for each in self.graphs:
            edit_dicts.append(json.loads(each.model_dump_json()))

        graphs = await supabase_service.upsert_graphs(edit_dicts)

        logging_service.logger.info(
            logging_service.message([graph.model_dump(mode='json') for graph in graphs]),
            extra=log_metadata.model_dump(),
        )

        return graphs
