from api.models import LogMetadata
from api.services.instances import supabase_service
from api.services.logging import LoggingService


class GetPresentationsHandler:

    async def get(self, logging_service: LoggingService, log_metadata: LogMetadata):

        # logging_service.logger.info(
        #     logging_service.message({"user": self.user_id}),
        #     extra=log_metadata.model_dump(),
        # )

        presentations = await supabase_service.get_presentations_from_user_id(
            self.user_id
        )
        for each in presentations:
            each.data = None
            each.summary = None

        logging_service.logger.info(
            logging_service.message(
                [each.model_dump(mode="json") for each in presentations]
            ),
            extra=log_metadata.model_dump(),
        )
        return presentations
