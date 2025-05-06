from typing import List, Tuple
from api.utils import (
    get_private_file_paths_from_keys,
    get_temporary_file_paths_from_keys,
)

from document_processor.loader import DocumentsLoader
from api.services.instances import s3_service, temp_file_service


class ProcessDocumentMixin:

    async def process_documents(
        self,
        documents: List[str],
        split_documents: bool = False,
        load_markdown: bool = True,
        load_images: bool = False,
        is_private: bool = False,
        temp_dir: str = None,
    ) -> Tuple[DocumentsLoader, List[List[str]]]:
        fetch_file_func = (
            get_private_file_paths_from_keys
            if is_private
            else get_temporary_file_paths_from_keys
        )

        presigned_urls_func = (
            s3_service.get_private_bucket_presigned_urls
            if is_private
            else s3_service.get_temporary_bucket_presigned_urls
        )

        document_paths = await fetch_file_func(
            s3_service, temp_file_service, documents, temp_dir or self.temp_dir
        )

        presigned_file_urls = presigned_urls_func(documents)

        documents_loader = DocumentsLoader(document_paths)

        await documents_loader.load_documents(
            temp_dir or self.temp_dir,
            split_documents,
            load_markdown,
            load_images,
            presigned_file_urls,
        )

        images = documents_loader.images

        return documents_loader, images
