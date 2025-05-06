from typing import Optional

from api.models import LogMetadata
from api.services.logging import LoggingService
from api.services.instances import supabase_service


class RequestUtils:
    def __init__(self, endpoint: str):
        self.endpoint = endpoint

    async def initialize_logger(
        self,
        presentation_id: Optional[str] = None,
        user_id: Optional[str] = None,
    ):
        metadata = LogMetadata(
            presentation=presentation_id, user=user_id, endpoint=self.endpoint
        )
        logging_service = LoggingService(metadata.stream_name)

        return logging_service, metadata
