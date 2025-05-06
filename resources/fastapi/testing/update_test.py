import requests
import json
import time

# API endpoint
url = "http://localhost:8000/ppt/edit"

# Request data
data = {
    "user_id": "701de4bf-3323-4826-8f27-3a99b40b0f48",
    "presentation_id": "34112a3b-38f9-4fa9-906e-38bb6ce1b703",
    "index": 18,
    "prompt": """remove infographics and add this graph to the presentation: ## Nativity And Ancestry Of Asian Americans

| Ancestry                  | Value  |
| ------------------------- | ------ |
| South Asian (All)         | 370K   |
| Bengali                   | 723    |
| Indian                    | 340K   |
| Pakistani                 | 16.8K  |
| Sri Lankan                | 1.91K  |
| Nepali                    | 7.9K   |
| Bhutanese                 | 71     |
| Bangladeshi               | 2.17K  |
| Southeast Asian (All)     | 534K   |
| Burmese                   | 5.66K  |
| Vietnamese                | 170K   |
| Cambodian                | 10.7K  |
| Hmong                     | 2.27K  |
| Laotian                   | 9.46K  |
| Thai                      | 7.84K  |
| Indonesian                | 4.61K  |
| Filipino                  | 2.57K  |
| Other Southeast Asian     | 321K   |
| East Asian (All)          | 807K   |
| Chinese                   | 608K   |
| Japanese                  | 64K    |
| Korean                    | 77.2K  |
| Taiwanese                 | 50.3K  |
| Hong Konger               | 3.29K  |
| Mongolian                 | 2.27K  |
| Tibetan                   | 2.01K  |
| Okinawan (Includes Ryukyu Islander) | 118    |
| Other Asian American      | 330K   |
"""
}

# Send POST request
try:
    t1 = time.time()
    response = requests.post(url, json=data)
    
    # Check if request was successful
    if response.status_code == 200:
        print("Edit request successful!")
        print("Response:")
        print(json.dumps(response.json(), indent=2))
    else:
        print(f"Error: Status code {response.status_code}")
        print("Response:", response.text)
    print(f"Time taken: {time.time() - t1}")
except requests.exceptions.RequestException as e:
    print(f"Error making request: {e}")