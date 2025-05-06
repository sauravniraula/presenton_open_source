from api.models import LogMetadata, UserPreferences
from api.routers.presentation.models import UpdatePresentationThemeRequest
from api.services.logging import LoggingService
from api.services.instances import supabase_service


class UpdatePresentationThemeHandler:

    def __init__(self, data: UpdatePresentationThemeRequest, user_id: str):
        self.user_id = user_id
        self.data = data

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        if self.data.theme:
            theme_name = self.data.theme.get("name", None)
            if theme_name and theme_name.lower() == "custom":
                user_preferences = UserPreferences(
                    id=self.user_id, theme=self.data.theme
                )
                await supabase_service.upsert_user_preferences(
                    user_preferences.model_dump(mode="json")
                )

        await supabase_service.update_presentation(
            {"id": self.data.presentation_id, "theme": self.data.theme}
        )

        return ""
