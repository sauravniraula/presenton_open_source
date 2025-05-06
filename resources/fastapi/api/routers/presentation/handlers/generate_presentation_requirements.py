import asyncio
from typing import List, Tuple
import uuid
from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from api.models import LogMetadata
from api.routers.presentation.mixins.process_document import ProcessDocumentMixin
from api.routers.presentation.models import (
    GeneratePresentationRequirementsRequest,
    PresentationModel,
)
from api.services.logging import LoggingService
from api.services.instances import temp_file_service, s3_service, supabase_service
from document_processor.embedder import EMBEDDING_MODEL
from ppt_config_generator.document_summary_generator import generate_document_summary
from ppt_config_generator.ppt_answers_and_content_generator import (
    generate_answers_and_content,
)


class GeneratePresentationRequirementsHandler(ProcessDocumentMixin):
    def __init__(
        self,
        presentation_id: str,
        data: GeneratePresentationRequirementsRequest,
        user_id: str,
    ):
        self.data = data
        self.presentation_id = presentation_id
        self.user_id = user_id
        self.prompt = data.prompt
        self.n_slides = data.n_slides
        self.documents = data.documents
        self.language = data.language
        self.research_reports = data.research_reports
        self.images = data.images
        self.sources = data.sources

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)
        self.chapter_info = data.chapter_info

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        documents_loader, _ = (
            await self.process_documents(self.documents, split_documents=False)
            if self.documents
            else (None, None)
        )

        research_report_loader, _ = (
            await self.process_documents(
                self.research_reports, split_documents=False, is_private=True
            )
            if self.research_reports
            else (None, None)
        )

        documents = []
        splitted_documents = []
        if documents_loader:
            documents.extend(documents_loader.documents)
            splitted_documents.extend(documents_loader.splitted_documents)

        if research_report_loader:
            documents.extend(research_report_loader.documents)
            splitted_documents.extend(research_report_loader.splitted_documents)

        image_links = (
            s3_service.get_private_bucket_presigned_urls(self.images)
            if self.images
            else []
        )

        coroutines = [
            supabase_service.get_graphs_from_source(source) for source in self.sources
        ]
        graph_collection = await asyncio.gather(*coroutines)
        graphs = [graph for graph_list in graph_collection for graph in graph_list]

        summary = await generate_document_summary(documents)
        print("-" * 40)
        print(summary)
        print("-" * 40)

        presentation_questions_content = await generate_answers_and_content(
            self.prompt, self.n_slides, summary, image_links, self.language, graphs
        )

        print("presentation_questions_content", presentation_questions_content)

        ppt_data = PresentationModel(
            id=self.presentation_id,
            user_id=self.user_id,
            prompt=self.prompt,
            n_slides=presentation_questions_content.n_slides,
            language=presentation_questions_content.language,
            vector_store=None,
            summary=summary,
            questions=presentation_questions_content.question_options,
            chapter_info=self.chapter_info.model_dump(mode="json") if self.chapter_info else None,
        )
        
        ppt_data = await supabase_service.create_presentation(ppt_data.to_create_dict())

        logging_service.logger.info(
            logging_service.message(ppt_data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )
        ppt_data.summary = None
        ppt_data.interpreted_report_content = None

        return ppt_data

    async def create_vectorstore(
        self, documents: List[Document]
    ) -> Tuple[InMemoryVectorStore, str]:
        file_key = f"user-{self.user_id}/{self.presentation_id}/vector_store.json"
        file_path = temp_file_service.create_temp_file_path(file_key, self.temp_dir)
        vector_store = InMemoryVectorStore(embedding=EMBEDDING_MODEL)
        vector_store.add_documents(documents)
        vector_store.dump(file_path)
        await s3_service.upload_private_file(file_key, file_path)
        return vector_store, file_key
