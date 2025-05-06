import json
from api.models import LogMetadata
from api.routers.presentation.models import AddChartsRequest
from api.services.instances import supabase_service
from api.services.logging import LoggingService


with open("books_chapers_overview.json", "r") as f:
    cdc_chapters = json.load(f)

class GetChaptersHandler:

    def __init__(self):
        pass

    async def get(self, logging_service: LoggingService, log_metadata: LogMetadata):
        return {"courses": {"cdc": {"grades": cdc_chapters}}}