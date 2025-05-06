import uuid

from fastapi import HTTPException
from api.models import LogMetadata, SessionModel
from api.routers.presentation.models import PresentationGenerateRequest
from api.services.logging import LoggingService
from api.services.instances import supabase_service


class PresentationGenerateDataHandler:

    def __init__(self, data: PresentationGenerateRequest):
        self.data = data
        self.session = str(uuid.uuid4())

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump()),
            extra=log_metadata.model_dump(),
        )

        if not self.data.titles:
            raise HTTPException(400, "Titles can not be empty")

        await supabase_service.save_generate_presentation_data(self.session, self.data)

        

        response = SessionModel(session=self.session)
        logging_service.logger.info(
            logging_service.message(response),
            extra=log_metadata.model_dump(),
        )

        return response
