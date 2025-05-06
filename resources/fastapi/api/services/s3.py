import asyncio
import os
from typing import BinaryIO, List, Optional
import uuid
import boto3
from concurrent import futures

import boto3

from api.utils import replace_file_name

PRIVATE_BUCKET = "pptgen-private-v2"
PUBLIC_BUCKET = "pptgen-public-v2"
TEMPORARY_BUCKET = "pptgen-temporary-v2"

DEFAULT_REGION = "ap-south-1"


class S3Service:

    def __init__(self, region: Optional[str] = None):
        self.region = region or DEFAULT_REGION
        self.endpoint = f"https://s3.{self.region}.amazonaws.com"

        self.executor = futures.ThreadPoolExecutor()

    @property
    def client(self):
        return boto3.client("s3", region_name=self.region, endpoint_url=self.endpoint)

    async def upload_file(self, bucket: str, file_key: str, file: str | BinaryIO):
        print(f"Uploading File: {file_key} ")
        if isinstance(file, str):
            await asyncio.get_event_loop().run_in_executor(
                self.executor, self.client.upload_file, file, bucket, file_key
            )
        else:
            await asyncio.get_event_loop().run_in_executor(
                self.executor, self.client.upload_fileobj, file, bucket, file_key
            )
        print(f"Uploaded File: {file_key} ")

    async def upload_multiple_files(
        self, bucket: str, file_keys: List[str], files: List[str | BinaryIO]
    ):
        coroutines = []
        for index, each_key in enumerate(file_keys):
            coroutines.append(self.upload_file(bucket, each_key, files[index]))
        await asyncio.gather(*coroutines)

    async def upload_private_file(self, file_key: str, file: str | BinaryIO):
        await self.upload_file(PRIVATE_BUCKET, file_key, file)

    async def upload_public_file(self, file_key: str, file: str | BinaryIO):
        await self.upload_file(PUBLIC_BUCKET, file_key, file)

    async def upload_temporary_file(self, file_key: str, file: str | BinaryIO):
        await self.upload_file(TEMPORARY_BUCKET, file_key, file)

    async def upload_private_files(
        self, file_keys: List[str], files: List[str | BinaryIO]
    ):
        await self.upload_multiple_files(PRIVATE_BUCKET, file_keys, files)

    async def upload_public_files(
        self, file_keys: List[str], files: List[str | BinaryIO]
    ):
        await self.upload_multiple_files(PUBLIC_BUCKET, file_keys, files)

    async def upload_temporary_files(
        self, file_keys: List[str], files: List[str | BinaryIO]
    ):
        await self.upload_multiple_files(TEMPORARY_BUCKET, file_keys, files)

    async def download_file(self, bucket: str, file_key: str, file_path: str):
        await asyncio.get_event_loop().run_in_executor(
            self.executor, self.client.download_file, bucket, file_key, file_path
        )

    async def download_multiple_files(
        self, bucket: str, file_keys: List[str], file_paths: List[str]
    ):
        coroutines = []
        for index, each_key in enumerate(file_keys):
            file_path = file_paths[index]
            coroutines.append(self.download_file(bucket, each_key, file_path))
        await asyncio.gather(*coroutines)

    async def download_public_file(self, file_key: str, file_path: str):
        await self.download_file(PUBLIC_BUCKET, file_key, file_path)

    async def download_private_file(self, file_key: str, file_path: str):
        await self.download_file(PRIVATE_BUCKET, file_key, file_path)

    async def download_private_files(self, file_keys: List[str], file_paths: List[str]):
        await self.download_multiple_files(PRIVATE_BUCKET, file_keys, file_paths)

    async def download_temporary_file(self, file_key: str, file_path: str):
        await self.download_file(TEMPORARY_BUCKET, file_key, file_path)

    async def download_temporary_files(
        self, file_keys: List[str], file_paths: List[str]
    ):
        await self.download_multiple_files(TEMPORARY_BUCKET, file_keys, file_paths)

    def delete_files(self, bucket: str, file_keys: List[str]):
        self.client.delete_objects(
            Bucket=bucket,
            Delete={"Objects": [{"Key": each} for each in file_keys]},
        )

    def delete_directory(self, bucket: str, dir_key: str):
        if not dir_key.endswith("/"):
            dir_key += "/"

        paginator = self.client.get_paginator("list_objects_v2")
        pages = paginator.paginate(Bucket=bucket, Prefix=dir_key)

        for page in pages:
            if "Contents" not in page:
                continue
            file_keys = [obj["Key"] for obj in page["Contents"]]
            if file_keys:
                self.delete_files(bucket, file_keys)

    def delete_public_files(self, file_keys: List[str]):
        self.delete_files(PUBLIC_BUCKET, file_keys)

    def delete_public_directory(self, dir_key: str):
        self.delete_directory(PUBLIC_BUCKET, dir_key)

    def delete_private_files(self, file_keys: List[str]):
        self.delete_files(PRIVATE_BUCKET, file_keys)

    def delete_private_directory(self, dir_key: str):
        self.delete_directory(PRIVATE_BUCKET, dir_key)

    def get_presigned_url(self, bucket: str, file_key: str, valid: int = 43200) -> str:
        return self.client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": bucket,
                "Key": file_key,
            },
            ExpiresIn=valid,
        )

    def get_presigned_urls(
        self, bucket: str, file_keys: List[str], valid: int = 43200
    ) -> List[str]:
        executor = futures.ThreadPoolExecutor()
        results = executor.map(
            lambda file_key: self.get_presigned_url(bucket, file_key, valid), file_keys
        )
        return list(results)

    def get_public_url(self, bucket: str, file_key) -> str:
        return f"{self.endpoint}/{bucket}/{file_key}"

    def get_public_urls(self, bucket: str, file_keys: List[str]) -> List[str]:
        return [self.get_public_url(bucket, each) for each in file_keys]

    def get_temporary_bucket_presigned_url(
        self, file_key: str, valid: int = 43200
    ) -> str:
        return self.get_presigned_url(TEMPORARY_BUCKET, file_key, valid)

    def get_temporary_bucket_presigned_urls(
        self, file_keys: List[str], valid: int = 43200
    ) -> List[str]:
        return self.get_presigned_urls(TEMPORARY_BUCKET, file_keys, valid)

    def get_private_bucket_presigned_url(
        self, file_key: str, valid: int = 43200
    ) -> str:
        return self.get_presigned_url(PRIVATE_BUCKET, file_key, valid)

    def get_private_bucket_presigned_urls(
        self, file_keys: List[str], valid: int = 43200
    ) -> List[str]:
        return self.get_presigned_urls(PRIVATE_BUCKET, file_keys, valid)

    def get_public_bucket_public_url(self, file_key: str):
        return self.get_public_url(PUBLIC_BUCKET, file_key)

    def get_public_bucket_public_urls(self, file_keys: List[str]):
        return self.get_public_urls(PUBLIC_BUCKET, file_keys)

    async def get_temporary_files_keys(self, files: List[str]) -> List[str]:
        file_keys = [
            replace_file_name(os.path.basename(each), str(uuid.uuid4()))
            for each in files
        ]
        await self.upload_temporary_files(file_keys, files)
        return file_keys

    async def get_temporary_files_links(self, files: List[str], valid: int = 43200) -> List[str]:
        file_keys = await self.get_temporary_files_keys(files)
        return self.get_temporary_bucket_presigned_urls(file_keys, valid)
