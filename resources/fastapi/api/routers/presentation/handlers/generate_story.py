import asyncio
from api.models import LogMetadata
from api.routers.presentation.models import GeneratePresentationStoryRequest
from api.services.logging import LoggingService
from api.services.instances import supabase_service
from ppt_config_generator.story_generator import generate_big_idea_and_story


class GeneratePresentationStoryHandler:

    def __init__(self, data: GeneratePresentationStoryRequest):
        self.data = data

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        presentation = await supabase_service.get_presentation(
            self.data.presentation_id
        )
        coroutines = [
            supabase_service.get_graphs_from_source(source) for source in self.data.sources
        ]
        graph_collection = await asyncio.gather(*coroutines)
        graphs = [graph for graph_list in graph_collection for graph in graph_list]

        presentation_story = await generate_big_idea_and_story(
            presentation.prompt,
            presentation.n_slides,
            presentation.language,
            presentation.summary,
            presentation.answers,
            self.data.big_idea,
            self.data.story_type,
            graphs,
            presentation.interpreted_report_content,
        )

        story = "\n\n".join([f"## {each.name}\n{each.content}" for each in presentation_story.story])

        await supabase_service.update_presentation(
            {
                "id": self.data.presentation_id,
                "big_idea": presentation_story.big_idea,
                "story_type": presentation_story.story_type.value,
                "story": story,
            }
        )

        logging_service.logger.info(
            logging_service.message(presentation_story.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        return presentation_story
