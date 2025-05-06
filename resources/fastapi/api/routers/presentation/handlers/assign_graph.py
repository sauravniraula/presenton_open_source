from typing import List

from fastapi import HTTPException
from api.models import LogMetadata
from api.routers.presentation.models import AssignChartsRequest, AssignChartsResponse
from api.services.instances import supabase_service
from api.services.logging import LoggingService
from ppt_config_generator.assign_chart_to_titles import assign_chart_to_titles


class AssignChartsHandler:

    def __init__(self, data: AssignChartsRequest):
        self.data = data
        self.presentation_id = data.presentation_id

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump()),
            extra=log_metadata.model_dump(),
        )

        presentation = await supabase_service.get_presentation(self.presentation_id)
        charts = await supabase_service.get_graphs(self.presentation_id)

        # charts_create_dicts = [
        #     chart.to_create_dict(self.presentation_id) for chart in self.charts
        # ]
        # self.charts = await supabase_service.create_graphs(charts_create_dicts)

        title_with_graph_id_collection = await assign_chart_to_titles(
            [title for title in presentation.titles], charts
        )

        response = AssignChartsResponse(
            title_with_charts=title_with_graph_id_collection.items,
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump()),
            extra=log_metadata.model_dump(),
        )

        return response
