from typing import List, Optional
import uuid
from fastapi import UploadFile, HTTPException
from tempfile import SpooledTemporaryFile
from api.models import LogMetadata
from api.routers.presentation.models import DocumentsAndImagesKeys
from api.services.logging import LoggingService
from api.utils import get_file_keys, save_uploaded_files
from api.validators import validate_files
from document_processor.loader import UPLOAD_ACCEPTED_DOCUMENTS
from api.services.instances import s3_service, temp_file_service
import os
import subprocess


class UploadFilesHandler:

    def __init__(
        self,
        user_id: str,
        documents: Optional[List[UploadFile]],
        images: Optional[List[UploadFile]],
    ):
        self.user_id = user_id
        self.documents = documents
        self.images = images

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)


    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

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

        # Convert documents to PDF if needed
        converted_documents = []
        if self.documents:
            for doc in self.documents:
                temp_path = os.path.join(self.temp_dir, doc.filename)
                # Save the original file first
                with open(temp_path, "wb") as f:
                    content = await doc.read()
                    f.write(content)
                    await doc.seek(0)  # Reset file pointer for later use
                
                # Convert based on file extension
                if doc.filename.lower().endswith(('.pptx', '.ppt')):
                    # try:
                    pdf_path = self.convert_pptx_to_pdf(temp_path, self.temp_dir)
                    if os.path.exists(pdf_path):
                        # Create a SpooledTemporaryFile for the PDF content
                        temp_file = SpooledTemporaryFile()
                        with open(pdf_path, 'rb') as pdf_file:
                            temp_file.write(pdf_file.read())
                        temp_file.seek(0)  # Reset to beginning
                        
                        # Create new UploadFile for the converted PDF
                        pdf_filename = os.path.splitext(doc.filename)[0] + '.pdf'
                        converted_doc = UploadFile(
                            file=temp_file,
                            filename=pdf_filename
                        )
                        converted_documents.append(converted_doc)
                    else:
                        raise Exception(f"Failed to convert {doc.filename} to PDF")
                else:
                    converted_documents.append(doc)
            
            # Replace original documents with converted ones
            self.documents = converted_documents

        file_paths = []
        all_file_keys = []
        documents_count = 0
        if self.documents:
            documents_count = len(self.documents)
            _, file_keys = get_file_keys(
                [each.filename for each in self.documents],
                f"user-{self.user_id}/documents",
                append_uuid_to_name=True,
            )
            all_file_keys.extend(file_keys)
            file_paths.extend(
                save_uploaded_files(
                    temp_file_service, self.documents, file_keys, self.temp_dir
                )
            )
        if self.images:
            _, file_keys = get_file_keys(
                [each.filename for each in self.images],
                f"user-{self.user_id}/images",
                append_uuid_to_name=True,
            )
            all_file_keys.extend(file_keys)
            file_paths.extend(
                save_uploaded_files(
                    temp_file_service, self.images, file_keys, self.temp_dir
                )
            )

        await s3_service.upload_private_files(all_file_keys, file_paths)
        response = DocumentsAndImagesKeys(
            documents=all_file_keys[:documents_count],
            images=all_file_keys[documents_count:],
        )

        logging_service.logger.info(
            logging_service.message(response.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return response

    def convert_pptx_to_pdf(self, pptx_path: str, temp_dir: str) -> str:
        base_name = os.path.splitext(os.path.basename(pptx_path))[0]

        # TODO: Change libreoffice name accordingly
        process = subprocess.run(
            f"soffice --headless --invisible --convert-to pdf {pptx_path} --outdir {temp_dir}",
            shell=True,
            capture_output=True,
            text=True
        )

        print(process.stdout)

        pdf_filename = f"{base_name}.pdf"
        pdf_path = os.path.join(temp_dir, pdf_filename)

        return pdf_path

    def convert_docx_to_pdf(self, docx_path: str, temp_dir: str) -> str:
        base_name = os.path.splitext(os.path.basename(docx_path))[0]

        # Convert DOCX to PDF using LibreOffice
        subprocess.run(
            f"soffice --headless --invisible --convert-to pdf {docx_path} --outdir {temp_dir}",
            shell=True,
            capture_output=True,
            text=True
        )

        pdf_filename = f"{base_name}.pdf"
        pdf_path = os.path.join(temp_dir, pdf_filename)

        return pdf_path
