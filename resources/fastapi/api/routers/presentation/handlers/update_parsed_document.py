import uuid
from fastapi import UploadFile

from api.models import LogMetadata
from api.services.logging import LoggingService
from api.services.s3 import PRIVATE_BUCKET, TEMPORARY_BUCKET
from api.utils import save_uploaded_files
from api.services.instances import temp_file_service, s3_service


class UpdateParsedDocumentHandler:

    def __init__(self, file_key: str, private: bool, file: UploadFile):
        self.file_key = file_key
        self.private = private
        self.file = file

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(
                {"path": self.file_key, "private": self.private, "file": self.file}
            ),
            extra=log_metadata.model_dump(),
        )

        temp_path = temp_file_service.create_temp_file_path(
            self.file_key, dir_path=self.temp_dir
        )
        save_uploaded_files(temp_file_service, [self.file], [temp_path], self.temp_dir)
        upload_bucket = PRIVATE_BUCKET if self.private else TEMPORARY_BUCKET
        await s3_service.upload_file(upload_bucket, self.file_key, temp_path)
