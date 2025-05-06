import json
from typing import List, Optional, Literal
from pydantic import BaseModel

from graph_processor.models import GraphModel
from ppt_config_generator.models import (
    PresentationConfigurationModel,
    QuestionAnswerModel,
    QuestionOptionsModel,
    StoryTypeEnum,
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


class DocumentInterpretedReport(BaseModel):
    complete_report: str
    hypotheses: List[DocumentHypothesis]

    def to_gpt_input(self):
        return {
            "Spreadsheet report": self.complete_report,
            "Findings": [
                {
                    "Finding": each.hypothesis,
                    "Supporting data": each.supporting_data.numerical_data,
                }
                for each in self.hypotheses
            ],
        }


class DocumentsAndImagesKeys(BaseModel):
    documents: Optional[List[str]] = None
    images: Optional[List[str]] = None


class KeyAndUrl(BaseModel):
    key: str
    url: str

class ChapterInfo(BaseModel):
    id: str
    chapter_title: str
    course: str
    book_title:  str
    grade: str



class PresentationModel(BaseModel):
    id: str
    user_id: str
    created_at: Optional[str] = None
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
    questions: Optional[List[QuestionOptionsModel]] = None
    answers: Optional[List[QuestionAnswerModel]] = None
    big_idea: Optional[str] = None
    story_type: Optional[StoryTypeEnum] = None
    story: Optional[str] = None
    interpreted_report_content: Optional[DocumentInterpretedReport] = None
    data: Optional[dict] = None
    chapter_info: Optional[ChapterInfo] = None 

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
        del temp["interpreted_report_content"]

        if self.file:
            temp["file"] = s3_service.get_public_bucket_public_url(self.file)

        return temp


class PresentationAndUser(BaseModel):
    presentation_id: str
    user_id: str


class GenerateResearchReportRequest(BaseModel):
    language: Optional[str] = None
    query: str


class DecomposeDocumentsRequest(DocumentsAndImagesKeys):
    # user_id: str
    # presentation_id: str
    pass

class PromptTablesExtractionRequest(BaseModel):
    prompt: str

class GeneratePresentationRequirementsRequest(BaseModel):
    prompt: Optional[str] = None
    n_slides: Optional[int] = None
    language: Optional[str] = None
    documents: Optional[List[str]] = None
    research_reports: Optional[List[str]] = None
    images: Optional[List[str]] = None
    sources: Optional[List[str]] = []
    chapter_info: Optional[ChapterInfo] = None


class SubmitInterpretedReportRequest(BaseModel):
    presentation_id: str
    report: DocumentInterpretedReport


class SubmitQuestionAnswersRequest(BaseModel):
    presentation_id: str
    answers: List[QuestionAnswerModel]


class GeneratePresentationStoryRequest(BaseModel):
    presentation_id: str
    big_idea: Optional[str] = None
    story_type: Optional[StoryTypeEnum] = None
    sources: Optional[List[str]] = []


class GenerateTitleRequest(BaseModel):
    presentation_id: str


class ProcessChartsRequest(BaseModel):
    documents: Optional[List[str]] = None
    charts: Optional[List[str]] = None


class DeplotChartsRequest(BaseModel):
    presentation_id: str
    research_reports: Optional[List[str]] = None
    images: Optional[List[str]] = None
    chart_links: Optional[List[str]] = None
    table_links: Optional[List[str]] = None


class AssignChartsRequest(BaseModel):
    presentation_id: str
    # charts: List[GraphModel]


class AssignChartsResponse(BaseModel):
    title_with_charts: List[TitleWithGraphIdModel]


class AddChartsRequest(BaseModel):
    presentation_id: str
    charts: List[GraphModel]


class UpdateChartsRequest(BaseModel):
    presentation_id: str
    charts: List[GraphModel]


class PresentationGenerateRequest(BaseModel):
    presentation_id: str
    theme: Optional[dict] = None
    images: Optional[List[str]] = None
    watermark: bool = True
    titles: List[str]
    sources: List[str]


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
    images: dict
    charts: dict
    tables: dict


class PromptTablesExtractionResponse(BaseModel):
    tables: List[TableMarkdownModel]
    prompt: str
    source: str

class PresentationAndSlides(BaseModel):
    presentation: PresentationModel
    slides: List[SlideModel]

    def to_response_dict(self):
        presentation = self.presentation.model_dump(mode="json")
        del presentation["data"]
        del presentation["summary"]
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


class UpdatePresentationTitlesRequest(BaseModel):
    presentation_id: str
    titles: List[str]
