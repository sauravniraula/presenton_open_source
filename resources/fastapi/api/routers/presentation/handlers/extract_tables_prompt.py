from uuid import uuid4
from api.routers.presentation.models import PromptTablesExtractionRequest, PromptTablesExtractionResponse
from api.routers.presentation.mixins.process_document import ProcessDocumentMixin
from api.services.logging import LoggingService
from api.models import LogMetadata
from api.services.instances import supabase_service
from graph_processor.extract_tables_from_text import text_to_tables


class PromptTablesExtractionHandler(ProcessDocumentMixin):

    def __init__(self, data: PromptTablesExtractionRequest):
        self.data = data
        self.prompt = data.prompt

        self.source = "prompt-" + str(uuid4())

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata) -> PromptTablesExtractionResponse:
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        extracted_tables = await text_to_tables(self.prompt, self.source)

        if extracted_tables:
            extracted_tables = await supabase_service.create_tables(extracted_tables)
    
        return PromptTablesExtractionResponse(
            tables=extracted_tables, prompt=self.prompt, source=self.source
        )
