import os
import jwt
import json
import requests
import datetime

from api.routers.presentation.models import PresentationAndSlides

with open("data-update.json", "r") as f:
    data = json.load(f)

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

file_path = "/home/suraj-jha/Downloads/Social_Media_and_Mental_Health_web_version_August2021.pdf"

# Upload file first
upload_url = "http://localhost:8000/ppt/files/upload"

# Add JWT token to headers
headers = {
    'Authorization': f'Bearer {encoded_jwt}'  # Replace with actual JWT token
}


def test_slides_data():
    url = "https://presentation-generator-fragrant-mountain-1643.fly.dev/ppt/slides/update"
    obj = PresentationAndSlides(**data)
    slides = data["slides"]
    slides.pop(-1)
    response = requests.post(url, json={"user_id": "xxx", "presentation_id": data["presentation"]["id"], "slides": slides}, headers = headers)
    assert response.status_code == 200
    response_data = response.json()
    print(json.dumps(response_data, indent = 2))


if __name__ == "__main__":
    test_slides_data()