import asyncio
import json
import os
import time
from typing import List, Optional, Tuple
import uuid
from itertools import chain
import redis


from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from langchain_core.vectorstores import InMemoryVectorStore
from openai import OpenAI

from api.models import LogMetadata, SSEResponse

from api.routers.presentation.models import PresentationAndSlides
from api.services.logging import LoggingService
from graph_processor.models import GraphModel
from image_processor.generator import generate_image, get_icon
from ppt_config_generator.generator import generate_ppt_config, get_graphs_and_infographics
from ppt_config_generator.models import (
    PresentationConfigurationModel,
)
from document_processor.embedder import EMBEDDING_MODEL
from ppt_generator.models.slide_model import SlideModel, BaseSlideModel, BasePresentation
from ppt_generator.slide_model_utils import SlideModelUtils
from ppt_generator.slide_generator import generate_slide_from_config
from api.services.instances import s3_service, temp_file_service, supabase_service
from ppt_generator.models.content_type_models import MultipleInfographicModel

from api.routers.presentation.prompts import CREATE_PRESENTATION_PROMPT
from anthropic import AsyncAnthropic
from google import genai
from google.genai import types

r = redis.Redis(
  host=os.getenv('UPSTASH_REDIS_SCHOOL_CHAPTERS_HOST'),
  port=6379,
  password=os.getenv('UPSTASH_REDIS_SCHOOL_CHAPTERS_PASSWORD'),
  ssl=True
)

class PresentationGenerateStreamHandler:

    def __init__(self, user_id: str, session: str):
        self.user_id = user_id
        self.session = session
        self.temp_dir = temp_file_service.create_temp_dir(self.session)
        self.client = OpenAI()
        self.anthropic_client = AsyncAnthropic()
        self.gemini_client = genai.Client()

    def __del__(self):
        temp_file_service.cleanup_temp_dir(self.temp_dir)

    async def get(self, *args, **kwargs):
        self.data = await supabase_service.get_presentation_generate_data(self.session)
        if not self.data:
            print("data not found")
            raise HTTPException(400, "Data not found for provided session")
        
        self.presentation_id = self.data.presentation_id
        self.theme = self.data.theme
        self.images = self.data.images
        self.titles = self.data.titles
        self.watermark = self.data.watermark
        self.sources = self.data.sources

        return StreamingResponse(
            self.get_stream(*args, **kwargs), media_type="text/event-stream"
        )

    async def get_stream(self, logging_service: LoggingService, log_metadata: LogMetadata):
        logging_service.logger.info(
            logging_service.message(self.data.model_dump(mode="json")),
            extra=log_metadata.model_dump(),
        )

        print("started stream")

        if not self.titles:
            raise HTTPException(400, "Titles can not be empty")

        n_slides = len(self.titles)

        print("getting presentation from supabase")

        presentation = await supabase_service.update_presentation(
            {
                "id": self.presentation_id,
                "theme": self.theme,
                "titles": self.titles,
                "n_slides": n_slides,
            }
        )
        print("got presentation from supabase")
        await supabase_service.delete_presentation_slides(self.presentation_id)
        print("deleted slides from supabase")

        yield SSEResponse(
            event="response", data=json.dumps({"status": "Analyzing information 📊"})
        ).to_string()

        coroutines = [
            supabase_service.get_graphs_from_source(source) for source in self.sources
        ]
        graph_collection = await asyncio.gather(*coroutines)
        print("graph_collection", graph_collection)
        graphs = [graph for graph_list in graph_collection for graph in graph_list]

        image_links = (
            await s3_service.get_temporary_bucket_presigned_urls(self.images)
            if self.images
            else []
        )

        presentation_text = ""

        async for chunk, response in self.stream_chunks(
            self.titles, 
            presentation.prompt or "create presentation",
            n_slides, 
            presentation.language, 
            presentation.summary, 
            graphs, 
            presentation.story, 
            presentation.big_idea,
            presentation.chapter_info
        ):
            presentation_text += chunk
            yield response
            await asyncio.sleep(0.01)
        print(presentation_text)
        presentation_json = json.loads(presentation_text)

        image_cloud_paths = []
        icon_cloud_paths = []
        slide_models = []
        for i, content in enumerate(presentation_json["slides"]):
            content["index"] = i
            content["presentation"] = presentation.id
            slide_model = SlideModel(**content)
            slide_content = slide_model.content
            has_images = hasattr(slide_content, "image_prompts")
            has_icons = hasattr(slide_content, "icon_queries")
            
            image_paths = []
            if has_images:
                image_paths = [
                    os.path.join(
                        f"user-{self.user_id}",
                        self.presentation_id,
                        "images",
                        f"{str(uuid.uuid4())}.jpg",
                    )
                    for _ in range(len(slide_content.image_prompts))
                ]

            icon_paths = []
            if has_icons:
                icon_paths = [
                    os.path.join(
                        f"user-{self.user_id}",
                        self.presentation_id,
                        "icons",
                        f"{str(uuid.uuid4())}.png",
                    )
                    for _ in range(len(slide_content.icon_queries))
                ]

            image_cloud_paths.append(image_paths)
            icon_cloud_paths.append(icon_paths)
            
            slide_models.append(slide_model)

        print("image cloud paths", image_cloud_paths)
        print("icon cloud paths", icon_cloud_paths)

        # yield SSEResponse(
        #     event="response", data=json.dumps({"status": "Generating presentation structure 🏗️"})
        # ).to_string()
        # t1 = time.time()
        # presentation_config: PresentationConfigurationModel = await generate_ppt_config(
        #     presentation.prompt,
        #     self.titles,
        #     graphs,
        #     image_links,
        #     presentation.summary,
        #     presentation.language,
        #     presentation.big_idea,
        #     presentation.story,
        #     presentation.interpreted_report_content
        # )
        # print("^"*20)
        # print(presentation_config.model_dump_json())
        # print("^"*20)
        # print(f"Time to generate presentation config: {time.time() - t1}")

        # yield SSEResponse(
        #     event="response", data=json.dumps({"status": "Analyzing charts and infographics 📊"})
        # ).to_string()

        # graphs_and_infographics = await get_graphs_and_infographics(
        #     presentation_config, graphs
        # )

        # yield SSEResponse(
        #     event="response", data=json.dumps({"status": "Crafting optimal content 🎨"})
        # ).to_string()

        # logging_service.logger.info(
        #     logging_service.message(presentation_config.model_dump()),
        #     extra=log_metadata.model_dump(),
        # )

        # vector_store = None
        # if presentation.vector_store:
        #     basename = os.path.basename(presentation.vector_store)
        #     temp_vector_file = temp_file_service.create_temp_file_path(
        #         basename, self.temp_dir
        #     )
        #     await s3_service.download_private_file(
        #         presentation.vector_store, temp_vector_file
        #     )
        #     vector_store = InMemoryVectorStore.load(temp_vector_file, EMBEDDING_MODEL)

        # image_cloud_paths, icon_cloud_paths, slide_models = await self.get_slide_models(
        #     presentation_config, vector_store, presentation.language, graphs_and_infographics
        # )

        # response = PresentationAndSlides(
        #     presentation=presentation, slides=slide_models
        # ).to_response_dict()

        # logging_service.logger.info(
        #     logging_service.message(response), extra=log_metadata.model_dump()
        # )

        # yield SSEResponse(event="response", data=json.dumps(response)).to_string()

        for index, each in enumerate(slide_models):
            images = image_cloud_paths[index]
            icons = icon_cloud_paths[index]
            each.images = images if images else None
            each.icons = icons if icons else None
        yield SSEResponse(event="response", data=json.dumps({"type": "status", "status": "Fetching slide assets"})).to_string()
        async for result in self.fetch_slide_assets(image_cloud_paths, icon_cloud_paths, slide_models):
            yield result

        # Insert slides to supabase
        slide_models = await supabase_service.create_slides(
            [each.to_create_dict() for each in slide_models]
        )
        yield SSEResponse(event="response", data=json.dumps({"type": "status", "status": "Packing slide data"})).to_string()
        # presentation = await supabase_service.update_presentation(
        #     {
        #         "id": self.presentation_id,
        #         "data": json.loads(presentation_config.model_dump_json()),
        #     },
        # )

        response = PresentationAndSlides(
            presentation=presentation, slides=slide_models
        ).to_response_dict()


        # logging_service.logger.info(
        #     logging_service.message(response),
        #     extra=log_metadata.model_dump(),
        # )

        yield SSEResponse(event="response", data=json.dumps({"type": "complete", "presentation": response})).to_string()

        yield SSEResponse(event="response", data=json.dumps({"type": "closing", "content": "First Warning"})).to_string()
        await asyncio.sleep(3)
        yield SSEResponse(event="response", data=json.dumps({"type": "closing", "content": "Final Warning"})).to_string()


    async def stream_chunks(self, titles: List[str], prompt: str, n_slides: int, language: str, summary: str, graphs: dict, story: str, big_idea: str, chapter_info):
        response_format = {
            "type": "json_schema",
            "json_schema": {
                "name": "presentation_schema",
                "schema": BasePresentation.model_json_schema()
            }
        }
        schema = BasePresentation.model_json_schema()

        system_prompt = f"{CREATE_PRESENTATION_PROMPT} -|0|--|0|- Follow this schema while giving out response: {schema}. Make description short and obey the character limits. Output should be in JSON format. Give out only JSON, nothing else."
        system_prompt = system_prompt.replace("-|0|-", "\n")

        graph_texts = []
        if graphs:
            graph_texts = [f"{i+ 1}) -|0|- Name of graph/table: {graph.name} -|0|- Content: {graph.markdown} -|0|- Description: {graph.description}"  for i, graph in enumerate(graphs)]

        user_message = f"Prompt: {prompt}-|0|--|0|- Number of Slides: {n_slides}-|0|--|0|- Presentation Language: {language} -|0|--|0|- Slide Titles: {titles} -|0|--|0|- Reference Document: {summary} -|0|--|0|- Graphs and Data: {'-|0|-'.join(graph_texts)} -|0|--|0|- Story: {story} -|0|--|0|- Big Idea: {big_idea}"
        if chapter_info:
            chapter_content = r.get(chapter_info.id)
            user_message += f"-|0|--|0|- This is academic presentation as per curriculum. Student Grade: {chapter_info.grade} -|0|- Subject Title: {chapter_info.book_title} -|0|- Chapter Title: {chapter_info.chapter_title} -|0|- Chapter Content: {chapter_content}"
        user_message = user_message.replace("-|0|-", "\n")

        print("system_prompt: ", system_prompt)
        print("user_message: ", user_message)
        # with self.client.beta.chat.completions.stream(
        #     model="ft:gpt-4o-2024-08-06:kinu:presenton-dpo:BEYMRIwi",
        #     messages=[
        #         { "role": "system", "content": system_prompt},
        #         { "role": "user", "content": user_message},
        #     ],
        #     response_format=response_format,
        # ) as stream:
        #     for event in stream:
        #         if event.type == "content.delta":
        #             # print(repair_json(event.snapshot))

        #             yield event.delta, SSEResponse(event = "response", data = json.dumps({"type": "chunk", "chunk": event.delta})).to_string()
        print("getting messages from slide ")
        # message_stream = await self.anthropic_client.messages.create(
        #     max_tokens=8192,
        #     temperature=1,
        #     system=system_prompt,
        #     messages=[
        #         {
        #             "role": "user",
        #             "content": user_message,
        #         }
        #     ],
        #     model="claude-3-5-sonnet-20241022",
        #     stream=True
        # )

        # async for event in message_stream:
        #     if event.type == "content_block_delta":
        #         if event.delta.type == "thinking_delta":
        #             print(event.delta.thinking)
        #             continue
        #         if event.delta.type == "signature_delta":
        #             continue
        #         text = event.delta.text.replace("`", "").replace("json", "")
        #         print(text, end="", flush=True)
        #         yield text, SSEResponse(event="response", data=json.dumps({"type": "chunk", "chunk": text})).to_string()

        for chunk in self.gemini_client.models.generate_content_stream(
            model='gemini-2.0-flash',
            contents=user_message,
            config=types.GenerateContentConfig(
                    system_instruction=system_prompt),
            ):
                text = chunk.text.replace("`", "").replace("json", "")
                yield text, SSEResponse(event="response", data=json.dumps({"type": "chunk", "chunk": text})).to_string()



    async def get_slide_models(
        self,
        presentation_config: PresentationConfigurationModel,
        vector_store: Optional[InMemoryVectorStore] = None,
        language: Optional[str] = None,
        infographics_and_graphs: [List[GraphModel | MultipleInfographicModel]] = None
    ) -> Tuple[List[str], List[str], List[SlideModel]]:
        slides_config = presentation_config.slides

        related_documents = []
        if vector_store:
            coroutines = []
            for each_slide_config in slides_config:
                coroutines.append(
                    vector_store.asimilarity_search(each_slide_config.title, 3)
                )
            related_documents = await asyncio.gather(*coroutines)

        coroutines = []

        for index, config in enumerate(slides_config):
            coroutines.append(
                generate_slide_from_config(
                    config,
                    related_documents[index] if vector_store else None,
                    language,
                    infographics_and_graphs[index]
                )
            )

        slides_content = await asyncio.gather(*coroutines)

        # path of images in cloud
        image_cloud_paths = []
        icon_cloud_paths = []

        slide_models: List[SlideModel] = []
        for index, config in enumerate(slides_config):
            slide_content = slides_content[index]

            has_images = hasattr(slide_content, "image_prompts")
            has_icons = hasattr(slide_content, "icon_queries")

            image_paths = []
            if has_images:
                image_paths = [
                    os.path.join(
                        f"user-{self.user_id}",
                        self.presentation_id,
                        "images",
                        f"{str(uuid.uuid4())}.jpg",
                    )
                    for _ in range(len(slide_content.image_prompts))
                ]

            icon_paths = []
            if has_icons:
                icon_paths = [
                    os.path.join(
                        f"user-{self.user_id}",
                        self.presentation_id,
                        "icons",
                        f"{str(uuid.uuid4())}.png",
                    )
                    for _ in range(len(slide_content.icon_queries))
                ]

            image_cloud_paths.append(image_paths)
            icon_cloud_paths.append(icon_paths)

            slide_model = SlideModel(
                id=str(uuid.uuid4()),
                index=index,
                type=config.type,
                content=slides_content[index],
                presentation=self.presentation_id,
            )
            slide_models.append(slide_model)

        return image_cloud_paths, icon_cloud_paths, slide_models

    async def fetch_slide_assets(
        self,
        image_cloud_paths: List[str],
        icon_cloud_paths: List[str],
        slide_models: List[SlideModel],
    ):
        image_prompts = []
        icon_queries = []

        flatten_image_cloud_paths = chain.from_iterable(image_cloud_paths)
        flatten_icon_cloud_paths = chain.from_iterable(icon_cloud_paths)

        for each_slide_model in slide_models:
            slide_model_utils = SlideModelUtils(self.theme, each_slide_model)

            if each_slide_model.images:
                prompts = slide_model_utils.get_image_prompts()
                image_prompts.extend(prompts)

            if each_slide_model.icons:
                icon_queries.extend(slide_model_utils.get_icon_queries())

        coroutines = [generate_image(each, self.temp_dir) for each in image_prompts] + [
            get_icon(each, self.temp_dir) for each in icon_queries
        ]

        # Create a task for status updates
        async def send_status_updates():
            while True:
                yield SSEResponse(event="response", data=json.dumps({"status": "Fetching slide assets..."})).to_string()
                await asyncio.sleep(10)

        status_generator = send_status_updates()
        assets_future = asyncio.gather(*coroutines)
        
        try:
            while not assets_future.done():
                status = await status_generator.__anext__()
                yield status
                await asyncio.sleep(0.1)  # Small sleep to prevent CPU spinning
            
            image_and_icon_paths = await assets_future
            
            # Uploading Images and Icons to Cloud
            await s3_service.upload_public_files(
                [*flatten_image_cloud_paths, *flatten_icon_cloud_paths],
                image_and_icon_paths,
            )
            yield SSEResponse(event="response", data=json.dumps({"status": "Slide assets fetched"})).to_string()
        
        finally:
            if not assets_future.done():
                assets_future.cancel()
