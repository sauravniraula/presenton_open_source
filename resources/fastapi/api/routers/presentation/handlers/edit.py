import asyncio
import os
from typing import List, Tuple
import uuid

from fastapi import HTTPException
from api.models import LogMetadata
from api.routers.presentation.models import (
    EditPresentationSlideRequest,
)
from api.services.instances import supabase_service, temp_file_service, s3_service
from api.services.logging import LoggingService
from image_processor.generator import generate_image, get_icon
from ppt_generator.models.slide_model import SlideModel
from ppt_generator.slide_generator import (
    get_edited_slide_content_model,
    get_slide_type_from_prompt,
)
from ppt_generator.slide_model_utils import SlideModelUtils


class PresentationEditHandler:
    def __init__(self, data: EditPresentationSlideRequest, user_id: str):
        self.data = data
        self.user_id = user_id
        self.presentation_id = data.presentation_id

        self.slide_index = data.index
        self.prompt = data.prompt

        self.session = str(uuid.uuid4())
        self.temp_dir = temp_file_service.create_temp_dir(self.session)

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def post(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        presentation = await supabase_service.get_presentation(self.presentation_id)

        if presentation.user_id != self.user_id:
            raise HTTPException(
                status_code=403, detail="You are not allowed to edit this presentation"
            )

        slide_to_edit = await supabase_service.get_slide_at_index(
            self.presentation_id, self.slide_index
        )

        new_slide_type = await get_slide_type_from_prompt(self.prompt, slide_to_edit)

        edited_content = await get_edited_slide_content_model(
            self.prompt,
            new_slide_type.slide_type,
            slide_to_edit,
            presentation.theme,
            presentation.language,
        )

        new_slide_model = SlideModel(
            id=slide_to_edit.id,
            index=slide_to_edit.index,
            type=new_slide_type.slide_type,
            design_index=slide_to_edit.design_index,
            images=None,
            icons=None,
            presentation=slide_to_edit.presentation,
            content=edited_content,
        )

        # Images to delete - is list of cloud paths
        # Images to generate - is list of index of images to generate
        images_to_delete, images_to_generate, icons_to_delete, icons_to_generate = (
            self.get_all_assets_to_generate_and_delete(
                slide_to_edit,
                new_slide_model,
            )
        )
        print(images_to_generate)
        print(edited_content)
        new_image_paths = slide_to_edit.images or []
        new_icon_paths = slide_to_edit.icons or []
        images_count = len(new_image_paths)
        icons_count = len(new_icon_paths)
        for index in images_to_generate:
            file_key = f"user-{self.user_id}/{self.presentation_id}/images/{str(uuid.uuid4())}.jpg"
            if index < images_count:
                new_image_paths.pop(index)
                new_image_paths.insert(index, file_key)
            else:
                new_image_paths.append(file_key)
        for index in icons_to_generate:
            file_key = f"user-{self.user_id}/{self.presentation_id}/icons/{str(uuid.uuid4())}.png"
            if index < icons_count:
                new_icon_paths.pop(index)
                new_icon_paths.insert(index, file_key)
            else:
                new_icon_paths.append(file_key)

        if new_image_paths:
            new_slide_model.images = new_image_paths
        if new_icon_paths:
            new_slide_model.icons = new_icon_paths

        # Generate and Delete Images and Icons
        objects_to_delete = [*images_to_delete, *icons_to_delete]
        if objects_to_delete:
            s3_service.delete_public_files(objects_to_delete)

        new_image_prompts = {}
        new_icon_queries = {}
        if images_to_generate:
            slide_model_utils = SlideModelUtils(presentation.theme, new_slide_model)
            image_prompts = slide_model_utils.get_image_prompts()
            for image_index in images_to_generate:
                new_image_prompts[new_slide_model.images[image_index]] = image_prompts[
                    image_index
                ]

        if icons_to_generate:
            slide_model_utils = SlideModelUtils(presentation.theme, new_slide_model)
            icon_queries = slide_model_utils.get_icon_queries()
            for icon_index in icons_to_generate:
                new_icon_queries[new_slide_model.icons[icon_index]] = icon_queries[
                    icon_index
                ]

        coroutines = [
            generate_image(each, self.temp_dir) for each in new_image_prompts.values()
        ] + [get_icon(each, self.temp_dir) for each in new_icon_queries.values()]

        image_and_icon_paths = await asyncio.gather(*coroutines)
        combined_cloud_paths = [*new_image_prompts.keys(), *new_icon_queries.keys()]

        await s3_service.upload_public_files(combined_cloud_paths, image_and_icon_paths)
        await supabase_service.upsert_slide(new_slide_model.to_create_dict())

        logging_service.logger.info(
            logging_service.message(new_slide_model.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )
        return new_slide_model

    def get_all_assets_to_generate_and_delete(
        self,
        old_slide_model: SlideModel,
        new_slide_model: SlideModel,
    ) -> Tuple[List[str], List[str], List[str], List[str]]:

        images_to_delete, images_to_generate = self.get_assets_to_generate_and_delete(
            old_slide_model,
            new_slide_model,
            "image_prompts",
            "images",
        )

        icons_to_delete, icons_to_generate = self.get_assets_to_generate_and_delete(
            old_slide_model,
            new_slide_model,
            "icon_queries",
            "icons",
        )

        return images_to_delete, images_to_generate, icons_to_delete, icons_to_generate

    def get_assets_to_generate_and_delete(
        self,
        old_slide_model: SlideModel,
        new_slide_model: SlideModel,
        content_attr: str,
        slide_model_attr: str,
    ) -> Tuple[List[str], List[str]]:

        items_to_delete = []
        items_to_generate = []

        existing_paths = getattr(old_slide_model, slide_model_attr, [])
        new_content_items = getattr(new_slide_model.content, content_attr, [])
        old_content_items = getattr(old_slide_model.content, content_attr, [])

        # Case 1: No new items but slide has existing items - delete all
        if not new_content_items and existing_paths:
            items_to_delete.extend(existing_paths)
            return items_to_delete, items_to_generate

        # Case 2: New items but slide has no existing items - generate all
        if new_content_items and not existing_paths:
            items_to_generate = [idx for idx in range(len(new_content_items))]
            return items_to_delete, items_to_generate

        # Case 3: Both new and existing items - compare and update
        if new_content_items and existing_paths:
            new_count = len(new_content_items)
            old_count = len(existing_paths)

            generate_idx = []
            for idx in range(max(new_count, old_count)):
                # Generate additional new items
                if idx >= old_count:
                    generate_idx.append(idx)
                # Delete excess old items
                elif idx >= new_count:
                    items_to_delete.append(existing_paths[idx])
                # Compare and update changed items
                else:
                    old_value = old_content_items[idx]
                    new_value = new_content_items[idx]
                    if old_value != new_value:
                        items_to_delete.append(existing_paths[idx])
                        generate_idx.append(idx)

            if generate_idx:
                items_to_generate = generate_idx

        filtered_items_to_delete = []
        for each in items_to_delete:
            if not each:
                continue
            filtered_items_to_delete.append(each)

        return filtered_items_to_delete, items_to_generate
