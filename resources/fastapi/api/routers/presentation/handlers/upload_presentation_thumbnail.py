import uuid
from fastapi import UploadFile

from api.models import LogMetadata
from api.routers.presentation.models import PresentationAndUrl
from api.services.logging import LoggingService
from api.services.instances import temp_file_service, supabase_service, s3_service
from api.utils import get_file_keys, save_uploaded_files


class UploadPresentationThumbnailHandler:

    def __init__(self, user_id: str, presentation_id: str, thumbnail: UploadFile):
        self.user_id = user_id
        self.presentation_id = presentation_id
        self.thumbnail = thumbnail

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(
                {
                    "presentation_id": self.presentation_id,
                    "thumbnail": self.thumbnail,
                }
            ),
            extra=log_metadata.model_dump(),
        )

        presentation = await supabase_service.get_presentation(self.presentation_id)

        if presentation.thumbnail:
            s3_service.delete_public_files([presentation.thumbnail])

        _, file_keys = get_file_keys(
            [self.thumbnail.filename],
            f"user-{self.user_id}/{self.presentation_id}",
        )
        file_paths = save_uploaded_files(
            temp_file_service, [self.thumbnail], file_keys, self.temp_dir
        )
        await s3_service.upload_public_file(file_keys[0], file_paths[0])

        presentation.thumbnail = file_keys[0]
        await supabase_service.upsert_presentation(presentation.to_create_dict())

        response = PresentationAndUrl(
            presentation_id=self.presentation_id, url=file_keys[0]
        )
        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
