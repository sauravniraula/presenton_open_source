import requests
id = "dba2e2d2-e46f-4f86-842c-9b9b7a3513cc"

def get_presentation_from_id(presentation_id):
     presentation = requests.get(f"https://presentation-generator-autumn-butterfly-8856.fly.dev/ppt/presentation?presentation_id={presentation_id}&user_id=701de4bf-3323-4826-8f27-3a99b40b0f48")
     print(presentation.status_code)
     print(presentation.json())
         
if __name__ == "__main__":
    id = "dba2e2d2-e46f-4f86-842c-9b9b7a3513cc"
    get_presentation_from_id(id)