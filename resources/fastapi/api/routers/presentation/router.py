from typing import Annotated, List, Optional
import uuid
from fastapi import APIRouter, Body, File, UploadFile, Depends

from api.models import SessionModel
from api.request_utils import RequestUtils
from api.routers.presentation.handlers.add_charts import AddChartsHandler
from api.routers.presentation.handlers.assign_graph import AssignChartsHandler
from api.routers.presentation.handlers.decompose_documents import (
    DecomposeDocumentsHandler,
)
from api.routers.presentation.handlers.delete_presentation import (
    DeletePresentationHandler,
)
from api.routers.presentation.handlers.delete_slide import DeleteSlideHandler
from api.routers.presentation.handlers.deplot_charts import DeplotChartsHandler
from api.routers.presentation.handlers.edit import PresentationEditHandler
from api.routers.presentation.handlers.export_as_pdf import ExportAsPDFHandler
from api.routers.presentation.handlers.export_as_pptx import ExportAsPptxHandler
from api.routers.presentation.handlers.generate_data import (
    PresentationGenerateDataHandler,
)
from api.routers.presentation.handlers.generate_image import GenerateImageHandler
from api.routers.presentation.handlers.generate_presentation_requirements import (
    GeneratePresentationRequirementsHandler,
)
from api.routers.presentation.handlers.generate_research_report import (
    GenerateResearchReportHandler,
)
from api.routers.presentation.handlers.generate_story import (
    GeneratePresentationStoryHandler,
)
from api.routers.presentation.handlers.extract_tables_prompt import (
    PromptTablesExtractionHandler,
)
from api.routers.presentation.handlers.generate_stream import (
    PresentationGenerateStreamHandler,
)
from api.routers.presentation.handlers.generate_title_summary import (
    PresentationTitleSummaryGenerateHandler,
)
from api.routers.presentation.handlers.get_presentation import GetPresentationHandler
from api.routers.presentation.handlers.get_presentations import GetPresentationsHandler
from api.routers.presentation.handlers.process_charts import ProcessChartHandler
from api.routers.presentation.handlers.search_icon import SearchIconHandler
from api.routers.presentation.handlers.search_image import SearchImageHandler
from api.routers.presentation.handlers.submit_answers import SubmitAnswersHandler
from api.routers.presentation.handlers.submit_interpreted_report import SubmitInterpretedReportHandler
from api.routers.presentation.handlers.update_charts import UpdateChartsHandler
from api.routers.presentation.handlers.update_parsed_document import (
    UpdateParsedDocumentHandler,
)
from api.routers.presentation.handlers.update_presentation_theme import (
    UpdatePresentationThemeHandler,
)
from api.routers.presentation.handlers.update_slide_models import (
    UpdateSlideModelsHandler,
)
from api.routers.presentation.handlers.upload_files import UploadFilesHandler
from api.routers.presentation.handlers.upload_presentation_thumbnail import (
    UploadPresentationThumbnailHandler,
)
from api.routers.presentation.handlers.get_chapters import GetChaptersHandler
from api.routers.presentation.models import (
    AddChartsRequest,
    AssignChartsRequest,
    AssignChartsResponse,
    DecomposeDocumentsRequest,
    DecomposeDocumentsResponse,
    DeplotChartsRequest,
    EditPresentationSlideRequest,
    ExportAsRequest,
    GenerateImageRequest,
    GeneratePresentationRequirementsRequest,
    GeneratePresentationStoryRequest,
    GenerateResearchReportRequest,
    KeyAndUrl,
    PresentationAndSlides,
    PresentationAndUrl,
    GenerateTitleRequest,
    PresentationAndUrls,
    PresentationGenerateRequest,
    PresentationModel,
    ProcessChartsRequest,
    SearchIconRequest,
    SearchImageRequest,
    SubmitInterpretedReportRequest,
    SubmitQuestionAnswersRequest,
    UpdateChartsRequest,
    UpdatePresentationThemeRequest,
    UpdateSlideModelsRequest,
    PresentationUpdateRequest,
    DocumentsAndImagesKeys,
    PromptTablesExtractionRequest,
    PromptTablesExtractionResponse
)
from api.utils import handle_errors
from graph_processor.models import GraphModel
from ppt_config_generator.models import PresentationIdeaStoryModel
from ppt_generator.models.slide_model import SlideModel
from api.services.auth import get_current_user

presentation_router = APIRouter(prefix="/ppt")




@presentation_router.get("/user_presentations", response_model=List[PresentationModel])
async def get_user_presentations(user_id: str):
    request_utils = RequestUtils("/ppt/user_presentations")
    logging_service, log_metadata = await request_utils.initialize_logger(
        user_id=user_id
    )
    return await handle_errors(
        GetPresentationsHandler(user_id).get, logging_service, log_metadata
    )


@presentation_router.get("/presentation", response_model=PresentationAndSlides)
async def get_presentation_from_id(presentation_id: str, user_id: str):
    request_utils = RequestUtils("/ppt/presentation")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        GetPresentationHandler(presentation_id).get, logging_service, log_metadata
    )


@presentation_router.post("/files/upload", response_model=DocumentsAndImagesKeys)
async def upload_files(
    user_id: Annotated[str, Depends(get_current_user)],
    documents: Annotated[Optional[List[UploadFile]], File()] = None,
    images: Annotated[Optional[List[UploadFile]], File()] = None,
):
    print(user_id)
    request_utils = RequestUtils("/ppt/files/upload")
    logging_service, log_metadata = await request_utils.initialize_logger(
        user_id=user_id,
    )
    return await handle_errors(
        UploadFilesHandler(user_id, documents, images).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/report/generate", response_model=KeyAndUrl)
async def generate_research_report(data: GenerateResearchReportRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/report/generate")
    logging_service, log_metadata = await request_utils.initialize_logger(
        user_id=user_id,
    )
    return await handle_errors(
        GenerateResearchReportHandler(data, user_id).post, logging_service, log_metadata
    )


@presentation_router.post("/files/decompose", response_model=DecomposeDocumentsResponse)
async def generate_research_report(data: DecomposeDocumentsRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/files/decompose")
    logging_service, log_metadata = await request_utils.initialize_logger(
        user_id=user_id,
    )
    return await handle_errors(
        DecomposeDocumentsHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/prompt-tables-extraction", response_model=PromptTablesExtractionResponse)
async def prompt_tables_extraction(data: PromptTablesExtractionRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/prompt-tables-extraction")
    logging_service, log_metadata = await request_utils.initialize_logger(
        user_id=user_id,
    )
    return await handle_errors(
        PromptTablesExtractionHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/document/update")
async def generate_research_report(
    user_id: Annotated[str, Depends(get_current_user)],
    path: Annotated[str, Body()],
    private: Annotated[bool, Body()],
    file: Annotated[UploadFile, File()],
):
    request_utils = RequestUtils("/ppt/document/update")
    logging_service, log_metadata = await request_utils.initialize_logger(
        user_id=user_id,
    )
    return await handle_errors(
        UpdateParsedDocumentHandler(path, private, file).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/interpreted_report/submit")
async def submit_interpreted_report(data: SubmitInterpretedReportRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/interpreted_report/submit")
    logging_service, log_metadata = await request_utils.initialize_logger(
        user_id=user_id,
        presentation_id=data.presentation_id,
    )
    return await handle_errors(
        SubmitInterpretedReportHandler(data).post,
        logging_service,
        log_metadata,
    )

@presentation_router.post("/create", response_model=PresentationModel)
async def create_presentation(data: GeneratePresentationRequirementsRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/create")
    
    presentation_id = str(uuid.uuid4())
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        GeneratePresentationRequirementsHandler(presentation_id, data, user_id).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/answers/submit")
async def submit_question_answers(data: SubmitQuestionAnswersRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/answers/submit")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        SubmitAnswersHandler(data).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/story", response_model=PresentationIdeaStoryModel)
async def generate_story(data: GeneratePresentationStoryRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/story")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        GeneratePresentationStoryHandler(data).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/titles/generate", response_model=PresentationModel)
async def generate_titles(data: GenerateTitleRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/titles/generate")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        PresentationTitleSummaryGenerateHandler(data).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/charts/deplot", response_model=List[GraphModel])
async def process_charts(data: ProcessChartsRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/charts/deplot")
    logging_service, log_metadata = await request_utils.initialize_logger(
        user_id=user_id,
    )
    return await handle_errors(
        ProcessChartHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/charts/deplot_v2", response_model=List[GraphModel])
async def deplot_charts_tables(data: DeplotChartsRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/charts/deplot_v2")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        DeplotChartsHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/charts/assign", response_model=AssignChartsResponse)
async def assign_charts(data: AssignChartsRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/charts/assign")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        AssignChartsHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/charts/add", response_model=List[GraphModel])
async def add_charts(data: AddChartsRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/charts/add")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        AddChartsHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/charts/update", response_model=List[GraphModel])
async def upload_graphs_data(data: UpdateChartsRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/charts/update")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        UpdateChartsHandler(data).post, logging_service, log_metadata
    )

@presentation_router.post("/generate/data", response_model=SessionModel)
async def submit_presentation_generation_data(
    data: PresentationGenerateRequest,
    user_id: Annotated[str, Depends(get_current_user)]
):
    request_utils = RequestUtils("/ppt/generate/data")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        PresentationGenerateDataHandler(data).post, logging_service, log_metadata
    )


@presentation_router.get("/generate/stream")
async def presentation_generation_stream(
    user_id: str, presentation_id: str, session: str
):
    request_utils = RequestUtils("/ppt/generate/stream")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
        user_id=user_id,
    )
    print("user_id", user_id)
    print("session", session)
    print("presentation_id", presentation_id)
    return await handle_errors(
        PresentationGenerateStreamHandler(user_id, session).get,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/presentation/thumbnail", response_model=PresentationAndUrl)
async def update_presentation(
    user_id: Annotated[str, Depends(get_current_user)],
    presentation_id: Annotated[str, Body()],
    thumbnail: Annotated[UploadFile, File()],
):
    request_utils = RequestUtils("/ppt/presentation/thumbnail")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        UploadPresentationThumbnailHandler(user_id, presentation_id, thumbnail).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/presentation/theme")
async def update_presentation(data: UpdatePresentationThemeRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/presentation/theme")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        UpdatePresentationThemeHandler(data, user_id).post,
        logging_service,
        log_metadata,
    )


@presentation_router.post("/edit", response_model=SlideModel)
async def update_presentation(data: EditPresentationSlideRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/edit")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id
    )
    return await handle_errors(
        PresentationEditHandler(data, user_id).post, logging_service, log_metadata
    )


@presentation_router.post("/slides/update", response_model=PresentationAndSlides)
async def update_slide_models(data: PresentationUpdateRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/slides/update")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        UpdateSlideModelsHandler(data, user_id).post_new, logging_service, log_metadata
    )


@presentation_router.post("/image/generate", response_model=PresentationAndUrls)
async def generate_image(data: GenerateImageRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/image/generate")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        GenerateImageHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/image/search", response_model=PresentationAndUrls)
async def search_image(data: SearchImageRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/image/search")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        SearchImageHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post("/icon/search", response_model=PresentationAndUrls)
async def search_image(data: SearchIconRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/icon/search")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        SearchIconHandler(data).post, logging_service, log_metadata
    )


@presentation_router.post(
    "/presentation/export_as_pptx", response_model=PresentationAndUrl
)
async def export_as_pptx(data: ExportAsRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/presentation/export_as_pptx")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        ExportAsPptxHandler(data, user_id).post, logging_service, log_metadata
    )

@presentation_router.post(
    "/presentation/export_as_pdf", response_model=PresentationAndUrl
)
async def export_as_pdf(data: ExportAsRequest, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/presentation/export_as_pdf")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=data.presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        ExportAsPDFHandler(data, user_id).post, logging_service, log_metadata
    )


@presentation_router.delete("/delete", status_code=204)
async def delete_presentation(presentation_id: str, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/delete")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        DeletePresentationHandler(presentation_id).delete, logging_service, log_metadata
    )


@presentation_router.delete("/slide/delete", status_code=204)
async def delete_slide(slide_id: str, presentation_id: str, user_id: Annotated[str, Depends(get_current_user)]):
    request_utils = RequestUtils("/ppt/slide/delete")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id=presentation_id,
        user_id=user_id,
    )
    return await handle_errors(
        DeleteSlideHandler(slide_id).delete, logging_service, log_metadata
    )


@presentation_router.get("/chapter-details", status_code=200)
async def get_chapters():
    request_utils = RequestUtils("/ppt/chapter-details")
    logging_service, log_metadata = await request_utils.initialize_logger(
        presentation_id="",
        user_id="",
    )
    return await handle_errors(
        GetChaptersHandler().get, logging_service, log_metadata
    )

