import os
import traceback
import uuid

from fastapi import HTTPException
from api.models import LogMetadata
from api.routers.presentation.mixins.fetch_presentation_assets import (
    FetchPresentationAssetsMixin,
)
from api.routers.presentation.models import ExportAsRequest, PresentationAndUrl
from api.services.instances import supabase_service, temp_file_service, s3_service
from api.services.logging import LoggingService
from image_processor.image_from_pptx import get_pdf_from_pptx
from ppt_generator.pptx_presentation_creator import PptxPresentationCreator
from api.services.email import send_document_download_email

class ExportAsPDFHandler(FetchPresentationAssetsMixin):

    def __init__(self, data: ExportAsRequest, user_id: str):
        self.data = data
        self.user_id = user_id

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        await self.fetch_presentation_assets()

        temp_ppt_file_path = temp_file_service.create_temp_file_path(
            "presentation.pptx", self.temp_dir
        )
        ppt_creator = PptxPresentationCreator(self.data.pptx_model, self.temp_dir)
        ppt_creator.create_ppt()
        ppt_creator.save(temp_ppt_file_path)

        ppt_file_key = (
            f"user-{self.user_id}/{self.data.presentation_id}/presentation.pptx"
        )
        await s3_service.upload_public_file(ppt_file_key, temp_ppt_file_path)
        await supabase_service.update_presentation(
            {"id": self.data.presentation_id, "file": ppt_file_key}
        )

        pdf_path = get_pdf_from_pptx(temp_ppt_file_path, self.temp_dir)
        temporary_urls = await s3_service.get_temporary_files_links([pdf_path], 604700)

        response = PresentationAndUrl(
            presentation_id=self.data.presentation_id,
            url=temporary_urls[0],
        )

        user = await supabase_service.get_user(self.user_id)
        presentation = await supabase_service.get_presentation(self.data.presentation_id)

        send_document_download_email("PDF", presentation.title, temporary_urls[0], user.email)

        logging_service.logger.info(
            logging_service.message(response.model_dump()),
            extra=log_metadata.model_dump(),
        )

        return response
