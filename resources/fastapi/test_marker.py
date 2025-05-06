import os
import time
import requests

def pdf_to_markdown(document_path):
    headers = {"X-Api-Key": os.getenv("DATALAB_API_KEY")}
    url = "https://www.datalab.to/api/v1/marker"

    files = {
        'file': ('test.pdf', open(document_path, 'rb'), 'application/pdf')
    }
    data = {
        'langs': "English",
        'force_ocr': "false",
        'paginate': "false",
        'output_format': "markdown",
        'use_llm': "false",
        'strip_existing_ocr': "false",
        'disable_image_extraction': "false"
    }

    try:
        response = requests.post(url, files=files, data=data, headers=headers)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        print(response.text)
        raise e

    max_polls = 300
    check_url = data["request_check_url"]

    for _ in range(max_polls):
        time.sleep(2)
        check_response = requests.get(check_url, headers=headers)
        check_response.raise_for_status()
        data = check_response.json()

        if data["status"] == "complete":
            break

    return data["markdown"], data["images"].values(), document_path


if __name__ == "__main__":
    document_path = "/home/suraj-jha/Downloads/1726652577.pdf"
    markdown, images, _ = pdf_to_markdown(document_path)
    with open("output.md", "w") as f:
        f.write(markdown)
    print(images)