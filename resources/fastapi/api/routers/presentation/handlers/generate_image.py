import uuid
from api.models import LogMetadata
from api.routers.presentation.models import GenerateImageRequest, PresentationAndUrls
from api.services.logging import LoggingService
from api.services.instances import temp_file_service, s3_service
from image_processor.generator import generate_image


class GenerateImageHandler:

    def __init__(self, data: GenerateImageRequest):
        self.data = data

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)
    
    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        image_path = await generate_image(self.data.prompt, self.temp_dir)
        image_links = await s3_service.get_temporary_files_links([image_path])

        response = PresentationAndUrls(
            presentation_id=self.data.presentation_id, urls=image_links
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
