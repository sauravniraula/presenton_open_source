from api.models import LogMetadata
from api.services.logging import LoggingService
from api.services.instances import supabase_service, s3_service


class DeleteSlideHandler:

    def __init__(self, id):
        self.id = id

    async def delete(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message({"slide": self.id}),
            extra=log_metadata.model_dump(),
        )
        await supabase_service.delete_slide(self.id)

        s3_service.delete_private_directory(self.id)
        s3_service.delete_public_directory(self.id)
