import os
from math import e
import requests
import json
from time import time
import datetime
import jwt

def test_presentation_generation():
    payload = {
        "iss": "https://myafywavanntmzevipvx.supabase.co/auth/v1",
        "sub": "e3f75cc8-b03a-452d-ad83-bb4207413436",
        "aud": "authenticated",
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1),
        "iat": datetime.datetime.utcnow(),
        "email": "maesterofcitadel@gmail.com",
        "phone": "",
        "app_metadata": {
            "provider": "email",
            "providers": [
                "email",  
                "google"
            ]
        },
        "user_metadata": {
            "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLoPTFf9Uvg2bZYqmLzprNCjN0X5hRgRrA1FzrEBni6JhV7bQ=s96-c",
            "email": "maesterofcitadel@gmail.com",
            "email_verified": True,
            "full_name": "Woodland Whisper",
            "iss": "https://accounts.google.com",
            "name": "Woodland Whisper", 
            "phone_verified": False,
            "picture": "https://lh3.googleusercontent.com/a/ACg8ocLoPTFf9Uvg2bZYqmLzprNCjN0X5hRgRrA1FzrEBni6JhV7bQ=s96-c",
            "provider_id": "101114364158288489443",
            "sub": "101114364158288489443"
        },
        "role": "authenticated",
        "aal": "aal1",
        "amr": [
            {
                "method": "password",
                "timestamp": 1742642276
            }
        ],
        "session_id": "5c6cda51-4c32-4b98-ad46-f44d2f01aca6",
        "is_anonymous": False
    }

    # Encode the JWT using the payload and secret key
    encoded_jwt = jwt.encode(payload, os.getenv("SUPABASE_JWT_KEY"), algorithm="HS256")

    # Output the JWT token
    print(f"Encoded JWT: {encoded_jwt}")

    file_path = "/home/suraj-jha/Downloads/data-presentations/2/data-doc-2.pdf"
    # image_path = "/home/suraj-jha/Pictures/Screenshots/suraj.png"

    # # Upload file first
    upload_url = "http://localhost:8000/ppt/files/upload"

    # Add JWT token to headers
    headers = {
        'Authorization': f'Bearer {encoded_jwt}'  # Replace with actual JWT token
    }
    
    # files = {
    #     'documents': ('file.pdf', open(file_path, 'rb'), 'application/pdf'),
    #     # 'images': ('suraj.png', open(image_path, 'rb'), 'image/png')
    # }
    
    # data = {
    #     'user_id': "fe201f4f-add4-45bc-a61b-6656028328d5",
    #     'private': False
    # }
    
    # upload_response = requests.post(upload_url, files=files, data=data, headers=headers)
    
    # if upload_response.status_code != 200:
    #     raise Exception(f"Upload failed with status {upload_response.status_code}: {upload_response.text}")
        
    # upload_result = upload_response.json()
    # print("Upload response:", json.dumps(upload_result, indent=2))

    # documents = upload_result["documents"]

    # # Decompose the uploaded documents
    # decompose_url = "http://localhost:8000/ppt/files/decompose"
    
    # decompose_payload = {
    #     "user_id": "fe201f4f-add4-45bc-a61b-6656028328d5",
    #     "documents": documents,
    #     "images": upload_result["images"]
    # }

    # print(decompose_payload)

    t1 = time()
    
    # decompose_response = requests.post(decompose_url, json=decompose_payload, headers = headers)
    # print("Time Taken for Decompose: ", time() - t1)
    
    # if decompose_response.status_code != 200:
    #     raise Exception(f"Decompose failed with status {decompose_response.status_code}: {decompose_response.text}")

    # decompose_result = decompose_response.json()
    # print("Decompose response:", json.dumps(decompose_result, indent=2))
    # print("--------------------------------"*2)
    sources = []
    # sources = list(decompose_result["documents"].keys())

    print("Sources: ", sources)

    prompt = """
        
    """

    extraction_data = {
        "user_id": "fe201f4f-add4-45bc-a61b-6656028328d5",
        "prompt": prompt
    }

    # results = requests.post("http://localhost:8000/ppt/prompt-tables-extraction", json=extraction_data, headers = headers)
    # results = results.json()
    # print("Extracted Tables from prompt: ", results)

    # if results["tables"]:
    #     sources.append(results["source"])

    text_documents = []
    # for document in documents:
    #     if document.split(".")[-1] == "pdf":
    #         text_documents.append(decompose_result["documents"][document][0])

    # Extract chart and table links from decompose response
    chart_links = []
    table_links = []
    
    # Get the first (and likely only) document key
    # first_doc = list(decompose_result["charts"].keys())[0]
    # chart_links = decompose_result["charts"][first_doc]
    
    # first_doc = list(decompose_result["tables"].keys())[0]
    # table_links = decompose_result["tables"][first_doc]

    # # Test endpoint URL
    url = "http://localhost:8000/ppt/create"
    
    # Default test payload
    payload = {
        "user_id": "fe201f4f-add4-45bc-a61b-6656028328d5",
        "prompt": prompt,
        "language": "English (English)",
        "documents": text_documents,
        "sources": sources,
        "chapter_info":{
            "grade": "8",
            "book_title": "Social Studies and Human Value Education Grade-8 (Nepali Edition)",
            "course": "Social Studies and Human Value Education Grade-8 (Nepali Edition)",
            "id": "a48f7820-a4a0-4a66-967e-2ebe4c29c7b5",
            "chapter_title": "Infrastructure of Development"
        }
    }

    print("create presentation payload", payload)

    # try:
    # Send POST request
    response = requests.post(url, json=payload, headers = headers)
    # Print response details
    print(f"Status Code: {response.status_code}")
    print("Presentation Creation Response:")
    print(json.dumps(response.json(), indent=2))
    print("--------------------------------"*2)
    # Basic assertions
    assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"
    try:
        data =  response.json()
        presentation_id = data["id"]
        print("presentation data", data)    

        response = requests.post("http://localhost:8000/ppt/titles/generate", json={
            "user_id": "fe201f4f-add4-45bc-a61b-6656028328d5",
            "presentation_id": presentation_id
        }, headers = headers)

        data = response.json()
        print(json.dumps(data, indent=2))

    #     #     # Assign charts to slides
    #     # assign_charts_response = requests.post(
    #     #     "http://localhost:8000/ppt/charts/assign",
    #     #     json={
    #     #         "presentation_id": presentation_id,
    #     #         "user_id": "e3f75cc8-b03a-452d-ad83-bb4207413436"
    #     #     }
    #     # )
        
    #     # print("\nAssign Charts Response:")
    #     # print(json.dumps(assign_charts_response.json(), indent=2))
    #     # print("--------------------------------"*2)

    #     # Prepare data for /ppt/generate/data endpoint
        generate_data = {
            "user_id": "fe201f4f-add4-45bc-a61b-6656028328d5",
            "presentation_id": presentation_id,
            "theme": {
                "name": "cream",
                "colors": {
                    "slideBg": "#ffffff",
                    "slideTitle": "#181D27",
                    "slideHeading": "#252B37",
                    "slideDescription": "#595F6C",
                    "slideBox": "#f4f4f4",
                    "theme": "cream"
                }
            },
            "watermark": False,
            "images": [],
            "titles": data["titles"],
            "sources": sources
        }

        # Send POST request to /ppt/generate/data
        response = requests.post(
            "http://localhost:8000/ppt/generate/data", 
            json=generate_data,
            headers = headers
        )

        print("\nGenerate Data Response:")
        print(json.dumps(response.json(), indent=2))

        data = response.json()
        # presentation_id = "1aa32345-3b9d-489d-9702-0b76e2d2cad0"
        session = data["session"]
    # try:
        stream_url = f"http://localhost:8000/ppt/generate/stream?user_id=fe201f4f-add4-45bc-a61b-6656028328d5&presentation_id={presentation_id}&session={session}"
        # stream_url = "http://localhost:8000/ppt/generate/stream?user_id=701de4bf-3323-4826-8f27-3a99b40b0f48&presentation_id=4ca9d8d5-92fc-4182-8494-2eb2a42962b8&session=041e1808-4322-499a-b8a2-99bb3962738e"
        t1 = time()
        ttft = None
        stream_response = requests.get(stream_url, stream=True)
        presentation = ""
        stream_time = {}
        for line in stream_response.iter_lines():
            if line:
                if line.startswith(b'data: '):
                    data = line[6:].decode('utf-8')
                    data = json.loads(data)
                    if "type" in data:
                        if data["type"] == "chunk":
                            if not ttft:
                                ttft = time() - t1
                            presentation += data["chunk"]
                            stream_time[time() - t1] = len(presentation)
                            print(stream_time)

                        if data["type"] == "complete":
                            print("completed")
                            print(json.dumps(data["presentation"]))
        print("\nStream closed by server.")
        stream_response.close()
        print(presentation)
        t2 = time()
        print("Total Time Taken: ", t2 - t1)
        print("Time to first Byte: ", ttft)
        import matplotlib.pyplot as plt

        # Convert dictionary items to lists for plotting
        times = list(stream_time.keys())
        lengths = list(stream_time.values())

        # Create the plot
        plt.figure(figsize=(10, 6))
        plt.plot(times, lengths, '-b')
        plt.xlabel('Time (seconds)')
        plt.ylabel('Stream Length')
        plt.title('Stream Progress Over Time')
        plt.grid(True)
        plt.savefig('stream_progress-2.png')
        plt.close()
    except requests.exceptions.RequestException as e:
        print(f"Error making request: {e}")
    except json.JSONDecodeError as e:
        print(f"Error decoding response: {e}")
    

if __name__ == "__main__":
    test_presentation_generation()



