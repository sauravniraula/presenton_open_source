import time
from typing import List
import uuid
from api.services.s3 import S3Service
from concurrent import futures


storage = S3Service()

# storage.upload_private_file("my_files/a.pptx", "assets/a.pptx")


def upload_file(file_key, file_path):
    print(f"===== uploading file {file_key}  =====")
    storage.upload_temporary_file(file_key, file_path)
    print(f"****** uploaded file {file_key}  *****")
    return file_key


def upload_test():
    start_time = time.time()
    # coroutines = [
    #     upload_file(f"{uuid.uuid4()}.pdf", "assets/the-sun.pdf") for _ in range(10)
    # ]

    executor = futures.ThreadPoolExecutor()

    results = executor.map(
        lambda _: upload_file(f"{uuid.uuid4()}.pdf", "assets/the-sun.pdf"), range(10)
    )

    print(list(results))

    print("====== uploaded all files ====== ")
    print(time.time() - start_time)


def delete_object():
    storage.delete_public_directory("74ed69c9-67cc-46b7-92c6-3ab12db18683")
