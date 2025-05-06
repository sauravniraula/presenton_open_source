import requests
import json 
stream_url = "https://eyupci2ut4.ap-south-1.awsapprunner.com/ppt/generate/stream?user_id=701de4bf-3323-4826-8f27-3a99b40b0f48&presentation_id=bb795d38-da7a-4fa9-9b23-5daa90ab40e3&session=bab021b7-7935-4eea-9a24-81b7cc3b3673"
stream_response = requests.get(stream_url, stream=True)

# Get first SSE message
for line in stream_response.iter_lines():
    if line:
        # SSE messages start with "data: "
        if line.startswith(b'data: '):
            # Remove "data: " prefix and decode
            data = line[6:].decode('utf-8')
            print("\nFirst SSE message:")
            print(json.dumps(json.loads(data), indent=2))
            break
            
stream_response.close()