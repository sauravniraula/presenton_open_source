import os
from typing import List
from urllib.parse import unquote, urlparse
import uuid

from sqlmodel import select
from api.models import LogMetadata
from api.routers.presentation.models import (
    PresentationUpdateRequest,
    PresentationAndSlides,
)
from api.services.logging import LoggingService
from api.sql_models import PresentationSqlModel, SlideSqlModel
from api.utils import download_files, replace_file_name
from api.services.database import sql_session
from api.services.instances import temp_file_service


class UpdateSlideModelsHandler:

    def __init__(self, data: PresentationUpdateRequest):
        self.data = data
        self.presentation_id = data.presentation_id
        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir()

        self.presentation_dir = temp_file_service.create_temp_dir(self.presentation_id)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        presentation_id = self.data.presentation_id
        new_slides = self.data.slides

        presentation = sql_session.get(PresentationSqlModel, presentation_id)

        # Handle assets (images and icons)
        assets_local_paths = []
        assets_download_links = []
        for new_slide in new_slides:
            new_images = new_slide.images or []
            new_icons = new_slide.icons or []

            for new_assets, asset_type in [
                (new_images, "images"),
                (new_icons, "icons"),
            ]:
                for i, asset in enumerate(new_assets):
                    if asset.startswith("http"):
                        parsed_url = unquote(urlparse(asset).path)
                        image_name = replace_file_name(
                            os.path.basename(parsed_url), str(uuid.uuid4())
                        )
                        asset_cloud_path = (
                            f"{self.presentation_dir}/{asset_type}/{image_name}"
                        )
                        assets_local_paths.append(asset_cloud_path)
                        assets_download_links.append(asset)
                        getattr(new_slide, asset_type)[i] = asset_cloud_path

        if assets_download_links:
            await download_files(assets_download_links, assets_local_paths)

        try:
            for each in new_slides:
                sql_session.add(SlideSqlModel(**each.model_dump(mode="json")))
        except Exception as e:
            print(e)
            return {"error": str(e)}

        sql_session.commit()
        new_slides = sql_session.exec(
            select(SlideSqlModel).where(SlideSqlModel.presentation == presentation_id)
        ).all()

        response = PresentationAndSlides(presentation=presentation, slides=new_slides)
        response = response.to_response_dict()

        logging_service.logger.info(
            logging_service.message(response),
            extra=log_metadata.model_dump(),
        )
        return response
