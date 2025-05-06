
from api.models import LogMetadata, UserPreferences
from api.routers.presentation.models import UpdatePresentationTitlesRequest
from api.services.logging import LoggingService
from api.services.instances import supabase_service



class UpdatePresentationThemeHandler:

    def __init__(self, data: UpdatePresentationTitlesRequest):
        self.data = data
        self.presentation_id = data.presentation_id
        self.titles = data.titles

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        presentation = await supabase_service.get_presentation(self.presentation_id)
        

        return {"message": "Presentation titles updated"}, 200
