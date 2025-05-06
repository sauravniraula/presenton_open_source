import os
import uuid
from api.models import LogMetadata
from api.routers.presentation.models import (
    DocumentsAndImagesKeys,
    GenerateResearchReportRequest,
    KeyAndUrl,
)
from api.services.logging import LoggingService
from research_report.generator import get_report
from api.services.instances import temp_file_service, s3_service


class GenerateResearchReportHandler:
    def __init__(self, data: GenerateResearchReportRequest, user_id: str):
        self.user_id = user_id
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
        report: str = (await get_report(self.data.query, self.data.language)).content

        file_name = f"{report[:20]}_{str(uuid.uuid4())}.txt"
        file_path = temp_file_service.create_temp_file_path(file_name, self.temp_dir)
        with open(file_path, "w") as text_file:
            text_file.write(report)
        file_key = f"user-{self.user_id}/documents/{file_name}"
        await s3_service.upload_private_file(file_key, file_path)

        file_url = s3_service.get_private_bucket_presigned_url(file_key)

        response = KeyAndUrl(key=file_key, url=file_url)

        logging_service.logger.info(
            response.model_dump(mode="json"), extra=log_metadata.model_dump()
        )

        return response
