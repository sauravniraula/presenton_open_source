from api.models import LogMetadata
from api.routers.presentation.models import AddChartsRequest
from api.services.instances import supabase_service
from api.services.logging import LoggingService


class AddChartsHandler:

    def __init__(self, data: AddChartsRequest):
        self.data = data
        self.presentation_id = data.presentation_id
        self.charts = data.charts

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        charts_create_dicts = [
            chart.to_create_dict(self.presentation_id) for chart in self.charts
        ]
        charts = await supabase_service.create_graphs(charts_create_dicts)

        logging_service.logger.info(
            logging_service.message(
                [chart.model_dump(mode="json") for chart in charts]
            ),
            extra=log_metadata.model_dump(),
        )

        return charts
