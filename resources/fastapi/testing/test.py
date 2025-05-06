import requests
import json
from time import time

def test_presentation_generation():
    file_path = "/home/suraj-jha/Downloads/Demographic Data_nine counties_ff5e00cd-eef9-4cbc-9768-da9ed893c8b8.pptx"

    # Upload file first
    upload_url = "http://localhost:8000/ppt/files/upload"

    # The data object is needed because:
    # 1. user_id is required to track who uploaded the file and associate it with their account
    # 2. private flag determines if the file should be accessible only to the user or publicly
    # These are required fields in the API as seen in the context files
 
    files = {
        'documents': ('file.pptx', open(file_path, 'rb'), 'application/pdf')
    }
    
    data = {
        'user_id': "fe201f4f-add4-45bc-a61b-6656028328d5",
        'private': False
    }
    
    upload_response = requests.post(upload_url, files=files, data=data)
    
    if upload_response.status_code != 200:
        raise Exception(f"Upload failed with status {upload_response.status_code}: {upload_response.text}")
        
    upload_result = upload_response.json()
    print("Upload response:", json.dumps(upload_result, indent=2))

    documents = upload_result["documents"]

    print("documents", documents)


    # Decompose the uploaded documents
    decompose_url = "http://localhost:8000/ppt/files/decompose"
    
    decompose_payload = {
        "user_id": "fe201f4f-add4-45bc-a61b-6656028328d5",
        "documents": documents,
        "images": []
    }
    
    decompose_response = requests.post(decompose_url, json=decompose_payload)
    
    if decompose_response.status_code != 200:
        raise Exception(f"Decompose failed with status {decompose_response.status_code}: {decompose_response.text}")
        
    decompose_result = decompose_response.json()
    print("Decompose response:", json.dumps(decompose_result, indent=2))
    print("--------------------------------"*2)

    # text_documents = []
    # for document in documents:
    #     if document.split(".")[-1] == "pdf":
    #         text_documents.append(decompose_result["documents"][document][0])

    # # Extract chart and table links from decompose response
    # chart_links = []
    # table_links = []
    
    # # Get the first (and likely only) document key
    # first_doc = list(decompose_result["charts"].keys())[0]
    # chart_links = decompose_result["charts"][first_doc]
    
    # first_doc = list(decompose_result["tables"].keys())[0]
    # table_links = decompose_result["tables"][first_doc]


    # # Test endpoint URL
    # url = "http://localhost:8000/ppt/create"

    # prompt = """
    #     Trade brief of two countries  
    # """
    
    # # Default test payload
    # payload = {
    #     "user_id": "fe201f4f-add4-45bc-a61b-6656028328d5",
    #     "prompt": prompt,
    #     "language": "",
    #     "documents": text_documents,
    # }

    # print("create presentation payload", payload)

    # try:
    #     # Send POST request
    #     response = requests.post(url, json=payload)
    #     # Print response details
    #     print(f"Status Code: {response.status_code}")
    #     print("Presentation Creation Response:")
    #     print(json.dumps(response.json(), indent=2))
    #     print("--------------------------------"*2)
    #     # Basic assertions
    #     assert response.status_code == 200, f"Expected status code 200, but got {response.status_code}"
        
    #     data =  response.json()
    #     presentation_id = data["id"]

        
    #     # Send request to /ppt/charts/deplot_v2 endpoint
    #     deplot_request = {
    #         "user_id": "e3f75cc8-b03a-452d-ad83-bb4207413436",
    #         "images": [],
    #         "chart_links": chart_links,
    #         "table_links": table_links, 
    #         "research_reports": [],
    #         "presentation_id": presentation_id
    #     }

    #     deplot_response = requests.post(
    #         "http://localhost:8000/ppt/charts/deplot_v2",
    #         json=deplot_request
    #     )

    #     print("\nDeplot Charts Response:")
    #     print(json.dumps(deplot_response.json(), indent=2))
    #     print("--------------------------------"*2)
    #     # Get chart and table links from response
    #     deplot_data = deplot_response.json()
    #     chart_links = [graph["chart_link"] for graph in deplot_data if graph.get("chart_link")]
    #     table_links = [graph["table_link"] for graph in deplot_data if graph.get("table_link")]
        
    #     language = data["language"]
    #     n_slides = data["n_slides"]

    #     response = requests.post("http://localhost:8000/ppt/titles/generate", json={
    #         "user_id": "fe201f4f-add4-45bc-a61b-6656028328d5",
    #         "presentation_id": presentation_id
    #     })

    #     data = response.json()
    #     print(json.dumps(data, indent=2))

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
    #     generate_data = {
    #         "user_id": "fe201f4f-add4-45bc-a61b-6656028328d5",
    #         "presentation_id": presentation_id,
    #         "theme": {
    #             "name": "light",
    #             "colors": {
    #                 "slideBg": "#ffffff", 
    #                 "slideTitle": "#181D27",
    #                 "slideHeading": "#252B37",
    #                 "slideDescription": "#595F6C",
    #                 "slideBox": "#f4f4f4",
    #                 "theme": "light"
    #             }
    #         },
    #         "watermark": False,
    #         "images": [],
    #         "titles": data["titles"]
    #     }

    #     # Send POST request to /ppt/generate/data
    #     response = requests.post(
    #         "http://localhost:8000/ppt/generate/data", 
    #         json=generate_data
    #     )

    #     print("\nGenerate Data Response:")
    #     print(json.dumps(response.json(), indent=2))

    #     data = response.json()

    #     presentation_id = "1aa32345-3b9d-489d-9702-0b76e2d2cad0"
    #     session = "599eab26-da6e-478f-9e9a-d1f28a11d956"


    #     # Get SSE stream from /generate/stream endpoint
    #     stream_url = f"http://localhost:8000/ppt/generate/stream?user_id=fe201f4f-add4-45bc-a61b-6656028328d5&presentation_id={presentation_id}&session={session}"
        
    #     stream_response = requests.get(stream_url, stream=True)
        
    #     # Get first SSE message
    #     for line in stream_response.iter_lines():
    #         if line:
    #             # SSE messages start with "data: "
    #             if line.startswith(b'data: '):
    #                 # Remove "data: " prefix and decode
    #                 data = line[6:].decode('utf-8')
    #                 print("\nFirst SSE message:")
    #                 print(json.dumps(json.loads(data), indent=2))
    #                 break
                    
    #     stream_response.close()
    # except requests.exceptions.RequestException as e:
    #     print(f"Error making request: {e}")
    # except json.JSONDecodeError as e:
    #     print(f"Error decoding response: {e}")

if __name__ == "__main__":
    import time
    t1 = time.time()
    test_presentation_generation()
    print("Time Taken: ", time.time() - t1)



