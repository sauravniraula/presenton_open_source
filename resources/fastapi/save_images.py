import json
import base64

with open("test.json") as f:
    data = json.load(f)

for key in data["images"].keys():
    with open(f"images/{key}.jpeg", "wb") as f:
        f.write(base64.b64decode(data["images"][key]))