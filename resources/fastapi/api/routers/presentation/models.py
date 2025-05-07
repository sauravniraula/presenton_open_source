from datetime import datetime
import json
from typing import List, Optional, Literal
from pydantic import BaseModel

from api.sql_models import PresentationSqlModel, SlideSqlModel
from graph_processor.models import GraphModel
from ppt_config_generator.models import (
    PresentationConfigurationModel,
    TitleWithGraphIdModel,
)
from ppt_generator.models.pptx_models import PptxPresentationModel
from ppt_generator.models.query_and_prompt_models import (
    IconCategoryEnum,
    ImagePromptWithAspectRatio,
)
from ppt_generator.models.slide_model import SlideModel, SlideUpdateModel
from graph_processor.models import TableMarkdownModel


class DocumentHypothesisSupportingData(BaseModel):
    numerical_data: List[dict]
    visualizations: List[dict]


class DocumentHypothesis(BaseModel):
    hypothesis: str
    supporting_data: DocumentHypothesisSupportingData


class DocumentsAndImagesPath(BaseModel):
    documents: Optional[List[str]] = None
    images: Optional[List[str]] = None


class PresentationModel(BaseModel):
    id: str
    user_id: str
    created_at: Optional[datetime] = None
    prompt: Optional[str] = None
    n_slides: int
    theme: Optional[dict] = None
    file: Optional[str] = None
    vector_store: Optional[str] = None
    title: Optional[str] = None
    titles: Optional[List[str]] = None
    language: Optional[str] = None
    summary: Optional[str] = None
    thumbnail: Optional[str] = None
    data: Optional[dict] = None

    def to_create_dict(self):
        temp = self.model_dump(mode="json")
        if not self.created_at:
            del temp["created_at"]
        return temp

    def to_response_dict(self):
        from api.services.instances import s3_service

        temp = self.model_dump(mode="json")
        del temp["data"]
        del temp["summary"]

        if self.file:
            temp["file"] = s3_service.get_public_bucket_public_url(self.file)

        return temp


class PresentationAndUser(BaseModel):
    presentation_id: str
    user_id: str


class GenerateResearchReportRequest(BaseModel):
    language: Optional[str] = None
    query: str


class DecomposeDocumentsRequest(DocumentsAndImagesPath):
    pass


class GeneratePresentationRequirementsRequest(BaseModel):
    prompt: Optional[str] = None
    n_slides: Optional[int] = None
    language: Optional[str] = None
    documents: Optional[List[str]] = None
    research_reports: Optional[List[str]] = None
    images: Optional[List[str]] = None


class GenerateTitleRequest(BaseModel):
    presentation_id: str


class PresentationGenerateRequest(BaseModel):
    presentation_id: str
    theme: Optional[dict] = None
    images: Optional[List[str]] = None
    watermark: bool = True
    titles: List[str]


class GenerateImageRequest(BaseModel):
    presentation_id: str
    prompt: ImagePromptWithAspectRatio


class SearchImageRequest(BaseModel):
    presentation_id: str
    query: Optional[str] = None
    page: int = 1
    limit: int = 10


class SearchIconRequest(BaseModel):
    presentation_id: str
    query: Optional[str] = None
    category: Optional[IconCategoryEnum] = None
    page: int = 1
    limit: int = 10


class SlideEditRequest(BaseModel):
    index: int
    prompt: str


class EditPresentationRequest(BaseModel):
    presentation_id: str
    watermark: bool = True
    changes: List[SlideEditRequest]


class EditPresentationSlideRequest(BaseModel):
    presentation_id: str
    index: int
    prompt: str


class UpdateSlideModelsRequest(BaseModel):
    presentation_id: str
    slides: List[SlideUpdateModel]


class UpdatePresentationThemeRequest(BaseModel):
    presentation_id: str
    theme: Optional[dict] = None


class ExportAsRequest(BaseModel):
    presentation_id: str
    pptx_model: PptxPresentationModel


class DecomposeDocumentsResponse(BaseModel):
    documents: dict


class PresentationAndSlides(BaseModel):
    presentation: PresentationSqlModel
    slides: List[SlideSqlModel]

    def to_response_dict(self):
        presentation = self.presentation.model_dump(mode="json")
        return {
            "presentation": presentation,
            "slides": [each.model_dump(mode="json") for each in self.slides],
        }


class PresentationUpdateRequest(BaseModel):
    presentation_id: str
    slides: List[SlideModel]

    def to_response_dict(self):
        presentation = self.presentation.model_dump(mode="json")
        del presentation["data"]
        del presentation["summary"]
        return {
            "presentation": presentation,
            "slides": [each.model_dump(mode="json") for each in self.slides],
        }


class PresentationWithImage(PresentationModel):
    image: Optional[str] = None


class PresentationAndUrl(BaseModel):
    presentation_id: str
    url: str


class PresentationAndUrls(BaseModel):
    presentation_id: str
    urls: List[str]


class PresentationAndPath(BaseModel):
    presentation_id: str
    path: str


class PresentationAndPaths(BaseModel):
    presentation_id: str
    paths: List[str]


class UpdatePresentationTitlesRequest(BaseModel):
    presentation_id: str
    titles: List[str]
