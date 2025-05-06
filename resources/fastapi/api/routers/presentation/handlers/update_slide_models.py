import os
from typing import List
from urllib.parse import unquote, urlparse
import uuid

from fastapi import HTTPException
from api.models import LogMetadata
from api.routers.presentation.models import (
    UpdateSlideModelsRequest,
    PresentationUpdateRequest,
    PresentationAndSlides,
)
from api.services.instances import supabase_service, temp_file_service, s3_service
from api.services.logging import LoggingService
from api.utils import download_files, replace_file_name


class UpdateSlideModelsHandler:

    def __init__(self, data: PresentationUpdateRequest, user_id: str):
        self.data = data
        self.user_id = user_id
        self.presentation_id = data.presentation_id
        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir()

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):

        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        presentation = await supabase_service.get_presentation(
            self.data.presentation_id
        )

        if presentation.user_id != self.user_id:
            raise HTTPException(
                status_code=403, detail="You are not allowed to edit this presentation"
            )

        old_slides = await supabase_service.get_slides(self.data.presentation_id)
        new_slides = list(map(lambda x: x.get_slide_model(), self.data.slides))

        graphs_dict = []
        for each in new_slides:
            if each.graph:
                graphs_dict.append(
                    each.graph.to_create_dict(
                        presentation=self.data.presentation_id, auto_id=True
                    )
                )
        if graphs_dict:
            graphs = await supabase_service.upsert_graphs(graphs_dict)
            for each in new_slides:
                if each.graph:
                    each.graph_id = graphs.pop(0).id

        graphs = await supabase_service.get_graphs(self.data.presentation_id)

        assets_to_delete = []
        assets_cloud_paths = []
        assets_download_links = []
        for new_slide in new_slides:
            old_images = []
            old_icons = []

            old_slide = next(filter(lambda x: x.id == new_slide.id, old_slides), None)
            if old_slide:
                old_images = old_slide.images or []
                old_icons = old_slide.icons or []

            new_images = new_slide.images or []
            new_icons = new_slide.icons or []

            for old_assets, new_assets, asset_type in [
                (old_images, new_images, "images"),
                (old_icons, new_icons, "icons"),
            ]:
                old_len = len(old_assets)
                new_len = len(new_assets)

                max_count = max(old_len, new_len)

                for i in range(max_count):
                    should_download = False
                    if i >= old_len:
                        if new_assets[i].startswith("http"):
                            should_download = True
                    elif i >= new_len:
                        if old_assets[i]:
                            assets_to_delete.append(old_assets[i])
                    else:
                        if new_assets[i].startswith("http"):
                            if old_assets[i]:
                                assets_to_delete.append(old_assets[i])
                            should_download = True

                    if should_download:
                        parsed_url = unquote(urlparse(new_assets[i]).path)
                        image_name = replace_file_name(
                            os.path.basename(parsed_url), str(uuid.uuid4())
                        )
                        asset_cloud_path = f"user-{self.user_id}/{self.data.presentation_id}/{asset_type}/{image_name}"
                        assets_cloud_paths.append(asset_cloud_path)
                        assets_download_links.append(new_assets[i])
                        getattr(new_slide, asset_type)[i] = asset_cloud_path

        assets_local_paths = [
            os.path.join(self.temp_dir, os.path.basename(each))
            for each in assets_cloud_paths
        ]

        if assets_download_links:
            await download_files(assets_download_links, assets_local_paths)
            await s3_service.upload_public_files(assets_cloud_paths, assets_local_paths)

        updated_slides_dict = [each.to_create_dict(auto_id=True) for each in new_slides]
        new_slides = await supabase_service.upsert_slides(updated_slides_dict)

        for each in new_slides:
            if each.graph_id:
                each.graph = next(filter(lambda x: x.id == each.graph_id, graphs), None)

        if assets_to_delete:
            print(f"Deleting: {assets_to_delete}")
            s3_service.delete_public_files(assets_to_delete)

        logging_service.logger.info(
            logging_service.message(
                [each.model_dump(mode="json") for each in new_slides]
            ),
            extra=log_metadata.model_dump(),
        )
        return new_slides

    async def post_new(
        self, logging_service: LoggingService, log_metadata: LogMetadata
    ):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        presentation_id = self.data.presentation_id
        new_slides = self.data.slides

        presentation = await supabase_service.get_presentation(presentation_id)

        # Handle assets (images and icons)
        assets_to_delete = []
        assets_cloud_paths = []
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
                        asset_cloud_path = f"user-{self.user_id}/{presentation_id}/{asset_type}/{image_name}"
                        assets_cloud_paths.append(asset_cloud_path)
                        assets_download_links.append(asset)
                        getattr(new_slide, asset_type)[i] = asset_cloud_path

        # Download and upload new assets
        assets_local_paths = [
            os.path.join(self.temp_dir, os.path.basename(each))
            for each in assets_cloud_paths
        ]

        if assets_download_links:
            await download_files(assets_download_links, assets_local_paths)
            await s3_service.upload_public_files(assets_cloud_paths, assets_local_paths)

        # Upsert slides
        updated_slides_dict = [each.to_create_dict(auto_id=True) for each in new_slides]
        try:
            new_slides = await supabase_service.upsert_slides(updated_slides_dict)
        except Exception as e:
            print(e)
            return {"error": str(e)}

        response = PresentationAndSlides(presentation=presentation, slides=new_slides)

        # Save presentation
        presentation_dict = response.model_dump(mode="json")

        logging_service.logger.info(
            logging_service.message(
                [each.model_dump(mode="json") for each in new_slides]
            ),
            extra=log_metadata.model_dump(),
        )
        return presentation_dict
