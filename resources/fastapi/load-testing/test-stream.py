from locust import HttpUser, task, between
from time import time
import json

class StreamUser(HttpUser):
    host = "http://localhost:8000"  # Add this line to specify the host
    wait_time = between(1, 3)  # Wait 1-3 seconds between tasks
    
    @task
    def test_stream(self):
        # Test parameters
        user_id = "701de4bf-3323-4826-8f27-3a99b40b0f48"
        presentation_id = "df2ffe83-7b30-4175-a282-296ff15cdcc1"
        session = "d274b916-033f-45ab-b2e5-403fddbcdec7"
        
        # Stream endpoint
        stream_url = f"/ppt/generate/stream?user_id={user_id}&presentation_id={presentation_id}&session={session}"
        
        start_time = time()
        ttft = None  # Time to first token
        presentation = ""
        stream_time = {}
        
        with self.client.get(stream_url, stream=True, catch_response=True) as response:
            try:
                for line in response.iter_lines():
                    if line:
                        if line.startswith(b'data: '):
                            data = json.loads(line[6:].decode('utf-8'))
                            
                            if "type" in data:
                                if data["type"] == "chunk":
                                    if not ttft:
                                        ttft = time() - start_time
                                    presentation += data["chunk"]
                                    stream_time[time() - start_time] = len(presentation)
                                
                                elif data["type"] == "complete":
                                    # Mark the request as successful
                                    response.success()
                                    break
                
                # Log custom metrics
                if ttft:
                    self.environment.events.request.fire(
                        request_type="TIME_TO_FIRST_TOKEN",
                        name="Stream TTFT",
                        response_time=ttft * 1000,  # Convert to milliseconds
                        response_length=0,
                        exception=None,
                    )
                
            except Exception as e:
                response.failure(f"Streaming failed: {str(e)}")