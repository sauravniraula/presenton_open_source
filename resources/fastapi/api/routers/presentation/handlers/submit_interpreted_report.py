from api.models import LogMetadata
from api.routers.presentation.models import SubmitInterpretedReportRequest
from api.services.logging import LoggingService
from api.services.instances import supabase_service


class SubmitInterpretedReportHandler:

    def __init__(self, data: SubmitInterpretedReportRequest):
        self.data = data

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        await supabase_service.update_presentation(
            {
                "id": self.data.presentation_id,
                "interpreted_report_content": self.data.report.model_dump(mode="json"),
            }
        )

        return ""
