from google import genai
from google.genai import types
import httpx

client = genai.Client()

with open("/home/suraj-jha/Downloads/1681716079.pdf", "rb") as f:
    doc_data = f.read()

prompt = "Give me content of the chapter 'Current Affairs and Issues'. Give me the content exactly."
response = client.models.generate_content(
  model="gemini-2.5-pro-exp-03-25",
  contents=[
      types.Part.from_bytes(
        data=doc_data,
        mime_type='application/pdf',
      ),
      prompt])
print(response.text)