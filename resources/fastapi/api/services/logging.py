import os
from typing import Any
from watchtower import CloudWatchLogHandler, CloudWatchLogFormatter
from logging import Logger


class LoggingService:

    def __init__(self, stream_name: str):
        self._handler = CloudWatchLogHandler(
            log_group_name=os.getenv("CLOUDWATCH_LOG_GROUP"),
            log_stream_name=stream_name,
        )
        self._handler.formatter = CloudWatchLogFormatter(
            add_log_record_attrs=[
                "levelname",
                "pathname",
                "funcName",
                "presentation",
                "user",
                "title",
                "endpoint",
                "status_code",
                "args",
                "exc_info",
                "stack_info",
            ]
        )
        self._logger = Logger(stream_name)
        self._logger.addHandler(self._handler)

    def __del__(self):
        self._handler.close()

    @property
    def logger(self) -> Logger:
        return self._logger

    def message(self, msg: Any):
        return {"msg": msg}
