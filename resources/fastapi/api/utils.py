import asyncio
import os
import traceback
from typing import Coroutine, List, Optional, Tuple
import uuid

import aiohttp
from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from api.models import LogMetadata
from api.services.logging import LoggingService


def replace_file_name(old_name: str, new_name: str) -> str:
    splitted = old_name.split(".")
    if len(splitted) < 1:
        return new_name
    else:
        return ".".join([new_name, splitted[-1]])


def get_file_keys(
    file_paths: List[str],
    basepath: Optional[str] = None,
    prefix: Optional[str] = None,
    append_uuid_to_name: bool = False,
):
    file_keys = []
    file_names = []
    for each_file in file_paths:
        file_name = f"{prefix}-" if prefix else ""
        if append_uuid_to_name:
            actual_name = os.path.basename(each_file)
            file_name += f"{actual_name.split('.')[0]}_"
        file_name += replace_file_name(os.path.basename(each_file), str(uuid.uuid4()))
        file_names.append(file_name)
        file_keys.append(os.path.join(basepath, file_name) if basepath else file_name)

    return file_names, file_keys


def save_uploaded_files(
    temp_file_service, files: List[UploadFile], file_paths: List[str], temp_dir: str
) -> List:
    full_file_paths = []
    for index, each_file in enumerate(files):
        temp_file_path = temp_file_service.create_temp_file(
            file_paths[index], each_file.file.read(), dir_path=temp_dir
        )
        full_file_paths.append(temp_file_path)
    return full_file_paths


async def get_temporary_file_paths_from_keys(
    s3_service, temp_file_service, file_keys: List[str], temp_dir: str
) -> List[str]:
    file_paths = [
        temp_file_service.create_temp_file_path(each_key, temp_dir)
        for each_key in file_keys
    ]
    await s3_service.download_temporary_files(file_keys, file_paths)
    return file_paths


async def get_private_file_paths_from_keys(
    s3_service, temp_file_service, file_keys: List[str], temp_dir: str
) -> List[str]:
    file_paths = [
        temp_file_service.create_temp_file_path(each_key, temp_dir)
        for each_key in file_keys
    ]
    await s3_service.download_private_files(file_keys, file_paths)
    return file_paths


async def download_file(url: str, save_path: str, headers: Optional[dict] = None):
    async with aiohttp.ClientSession() as session:
        async with session.get(url, headers=headers) as response:
            if response.status == 200:
                with open(save_path, "wb") as file:
                    while True:
                        chunk = await response.content.read(1024)
                        if not chunk:
                            break
                        file.write(chunk)
                print(f"File downloaded successfully to {save_path}")
                return True
            else:
                print(f"Failed to download file. HTTP status: {response.status}")
                return False


async def download_files(urls: List[str], save_paths: List[str]):
    for url, save_path in zip(urls, save_paths):
        print(url)
        print(save_path)
        print("-" * 10)
    coroutines = [
        download_file(url, save_paths[index]) for index, url in enumerate(urls)
    ]
    await asyncio.gather(*coroutines)


async def handle_errors(
    func, logging_service: LoggingService, log_metadata: LogMetadata
):
    try:
        logging_service.logger.info(f"START", extra=log_metadata.model_dump())
        response = await func(
            logging_service=logging_service, log_metadata=log_metadata
        )
        is_stream = isinstance(response, StreamingResponse)
        logging_service.logger.info(
            "STREAMING" if is_stream else "END", extra=log_metadata.model_dump()
        )
        return response

    except HTTPException as e:
        log_metadata.status_code = e.status_code
        logging_service.logger.error(
            f"Raised HTTPException - {e.detail}", extra=log_metadata.model_dump()
        )
        raise e
    except Exception as e:
        print(traceback.print_stack())
        print(traceback.print_exc())

        log_metadata.status_code = 400
        logging_service.logger.critical(
            "Unhandled Exception",
            exc_info=True,
            stack_info=True,
            extra=log_metadata.model_dump(),
        )
        raise HTTPException(400, "Something went wrong while processing your request.")
