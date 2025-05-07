from typing import List, Optional
import uuid
from fastapi import UploadFile
from api.models import LogMetadata
from api.routers.presentation.models import DocumentsAndImagesPath
from api.services.logging import LoggingService
from api.validators import validate_files
from document_processor.loader import UPLOAD_ACCEPTED_DOCUMENTS
from api.services.instances import temp_file_service
import os

from image_processor.image_from_pptx import get_pdf_from_pptx


class UploadFilesHandler:

    def __init__(
        self,
        documents: Optional[List[UploadFile]],
        images: Optional[List[UploadFile]],
    ):
        self.documents = documents
        self.images = images

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)
        print("Upload Temp Dir: " + self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(
                {
                    "documents": self.documents,
                    "images": self.images,
                }
            ),
            extra=log_metadata.model_dump(),
        )

        validate_files(self.documents, True, True, 50, UPLOAD_ACCEPTED_DOCUMENTS)
        validate_files(
            self.images, True, True, 10, ["image/jpeg", "image/png", "image/webp"]
        )

        self.documents = self.documents or []
        self.images = self.images or []

        # Convert documents to PDF if needed
        converted_documents: List[str] = []
        if self.documents or self.images:
            all_documents = self.documents + self.images
            for doc in all_documents:
                temp_path = temp_file_service.create_temp_file_path(
                    doc.filename, self.temp_dir
                )
                # Save the original file first
                with open(temp_path, "wb") as f:
                    content = await doc.read()
                    f.write(content)

                # Convert based on file extension
                if doc.filename.lower().endswith((".pptx", ".ppt")):
                    pdf_path = get_pdf_from_pptx(temp_path, self.temp_dir)
                    if os.path.exists(pdf_path):
                        converted_documents.append(pdf_path)
                    else:
                        raise Exception(f"Failed to convert {doc.filename} to PDF")
                else:
                    converted_documents.append(temp_path)

        documents_count = len(converted_documents)
        response = DocumentsAndImagesPath(
            documents=converted_documents[:documents_count],
            images=converted_documents[documents_count:],
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response
