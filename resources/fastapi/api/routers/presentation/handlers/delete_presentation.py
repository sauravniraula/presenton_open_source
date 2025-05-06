from api.models import LogMetadata
from api.services.instances import supabase_service, s3_service
from api.services.logging import LoggingService


class DeletePresentationHandler:

    def __init__(self, id):
        self.id = id

    async def delete(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message({"presentation": self.id}),
            extra=log_metadata.model_dump(),
        )
        await supabase_service.delete_presentation(self.id)

        s3_service.delete_private_directory(self.id)
        s3_service.delete_public_directory(self.id)
