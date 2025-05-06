from typing import Optional
from pydantic import BaseModel

from api.routers.presentation.models import PresentationModel


class UserPreferences(BaseModel):
    id: str
    theme: Optional[dict] = None


class LogMetadata(BaseModel):
    user: Optional[str] = None
    presentation: Optional[str] = None
    title: Optional[str] = None
    endpoint: Optional[str] = None
    status_code: Optional[int] = None

    @classmethod
    def from_presentation(
        cls, presentation: PresentationModel, endpoint: Optional[str] = None
    ):
        return cls(
            user=presentation.user_id,
            presentation=presentation.id,
            title=presentation.title,
            endpoint=endpoint,
        )

    @property
    def stream_name(self):
        return f"Endpoint - {self.endpoint}, User - {self.user}, Presentation - {self.presentation}"


class SessionModel(BaseModel):
    session: str


class SSEResponse(BaseModel):
    event: str
    data: str

    def to_string(self):
        return f"event: {self.event}\ndata: {self.data}\n\n"
