import asyncio
from api.models import LogMetadata
from api.routers.presentation.models import PresentationAndSlides
from api.services.instances import supabase_service, s3_service
from api.services.logging import LoggingService


class GetPresentationHandler:

    def __init__(self, id: str):
        self.id = id

    async def get(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message({"presentation": self.id}),
            extra=log_metadata.model_dump(),
        )

        coroutines = [
            supabase_service.get_presentation(self.id),
            supabase_service.get_slides(self.id),
            supabase_service.get_graphs(self.id),
        ]

        presentation, slide_models, graphs = await asyncio.gather(*coroutines)

        # for each in slide_models:
        #     if each.graph_id:
        #         each.graph = next(filter(lambda x: x.id == each.graph_id, graphs), None)

        response = PresentationAndSlides(
            presentation=presentation, slides=slide_models
        ).to_response_dict()

        logging_service.logger.info(
            logging_service.message(response),
            extra=log_metadata.model_dump(),
        )
        return response
