import requests 
import json

import time

with open('data.json', 'r') as file:
    json_data = json.load(file)
t1 = time.time()
response = requests.post('http://localhost:8000/ppt/presentation/export_as_pdf', json=json_data)
print("Time taken: ", time.time() - t1)
print(response.status_code)

print(response.json())
