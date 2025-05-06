import uuid

from api.models import LogMetadata
from api.routers.presentation.models import GenerateTitleRequest
from api.services.instances import s3_service, temp_file_service, supabase_service
from api.services.logging import LoggingService
from ppt_config_generator.ppt_title_summary_generator import generate_ppt_titles


class PresentationTitleSummaryGenerateHandler:
    def __init__(self, data: GenerateTitleRequest):
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

        presentation = await supabase_service.get_presentation(
            self.data.presentation_id
        )

        presentation_titles = await generate_ppt_titles(
            presentation.big_idea or presentation.prompt,
            presentation.n_slides,
            presentation.story or presentation.summary,
            presentation.language,
            presentation.interpreted_report_content,
            presentation.chapter_info.model_dump(mode="json") if presentation.chapter_info else None,
        )

        presentation = await supabase_service.update_presentation(
            {
                "id": self.data.presentation_id,
                "title": presentation_titles.presentation_title,
                "titles": presentation_titles.titles,
            }
        )

        logging_service.logger.info(
            logging_service.message(presentation.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )
        presentation.summary = None
        presentation.interpreted_report_content = None

        return presentation
