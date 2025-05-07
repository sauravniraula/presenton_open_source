import uuid
from api.models import LogMetadata
from api.routers.presentation.models import (
    PresentationAndUrls,
    SearchIconRequest,
)
from api.services.logging import LoggingService
from image_processor.generator import get_icons


class SearchIconHandler:

    def __init__(self, data: SearchIconRequest):
        self.data = data

        self.session = str(uuid.uuid4())

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        icon_links = await get_icons(
            self.data.query or "", self.data.page, self.data.limit, self.data.category
        )

        response = PresentationAndUrls(
            presentation_id=self.data.presentation_id, urls=icon_links
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
