import requests

url = f"http://localhost:8000/ppt/presentation/?presentation_id=19a8fa98-116a-4887-8d79-ac323755cadd&user_id=701de4bf-3323-4826-8f27-3a99b40b0f48"

data = requests.get(url)

print(data.json())
