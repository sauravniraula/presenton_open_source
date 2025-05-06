from api.models import LogMetadata
from api.services.logging import LoggingService


logging_service = LoggingService(stream_name="test-logs")

logger = logging_service.logger


def run_test():
    log_metadata = LogMetadata()
    logger.info(
        {
            "title": "launch day whoo hoo",
            "is_bool": True,
            "user": "fja01jfaoi",
        },
        extra=log_metadata.model_dump(),
    )
