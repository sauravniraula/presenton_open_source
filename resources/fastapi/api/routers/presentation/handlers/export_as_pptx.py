import uuid
from api.models import LogMetadata
from api.routers.presentation.mixins.fetch_presentation_assets import (
    FetchPresentationAssetsMixin,
)
from api.routers.presentation.models import (
    ExportAsRequest,
    PresentationAndPath,
)
from api.services.logging import LoggingService
from api.services.instances import temp_file_service
from api.sql_models import PresentationSqlModel
from ppt_generator.pptx_presentation_creator import PptxPresentationCreator
from api.services.database import sql_session


class ExportAsPptxHandler(FetchPresentationAssetsMixin):

    def __init__(self, data: ExportAsRequest):
        self.data = data

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

        self.presentation_dir = temp_file_service.create_temp_dir(
            self.data.presentation_id
        )

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        await self.fetch_presentation_assets()

        ppt_path = temp_file_service.create_temp_file_path(
            self.presentation_dir, str(uuid.uuid4()).join(".pptx")
        )
        ppt_creator = PptxPresentationCreator(self.data.pptx_model, self.temp_dir)
        ppt_creator.create_ppt()
        ppt_creator.save(ppt_path)

        response = PresentationAndPath(
            presentation_id=self.data.presentation_id, path=ppt_path
        )

        presentation = sql_session.get(PresentationSqlModel, self.data.presentation_id)
        presentation.file = ppt_path
        sql_session.commit()

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
