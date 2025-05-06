from api.models import LogMetadata
from api.routers.presentation.models import SubmitQuestionAnswersRequest
from api.services.logging import LoggingService
from api.services.instances import supabase_service


class SubmitAnswersHandler:

    def __init__(self, data: SubmitQuestionAnswersRequest):
        self.data = data

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        await supabase_service.update_presentation(
            {
                "id": self.data.presentation_id,
                "answers": [each.model_dump(mode="json") for each in self.data.answers],
            }
        )

        return ""
