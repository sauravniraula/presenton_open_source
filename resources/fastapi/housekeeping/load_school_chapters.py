import json
import redis
import os
from tqdm import tqdm  # Import tqdm

# Load the JSON file
with open("/home/suraj-jha/Downloads/chapter_id_content_map (5).json", "r") as f:
    data = json.load(f)

# Connect to Redis
r = redis.Redis(
    host=os.getenv('UPSTASH_REDIS_SCHOOL_CHAPTERS_HOST'),
    port=6379,
    password=os.getenv('UPSTASH_REDIS_SCHOOL_CHAPTERS_PASSWORD'),
    ssl=True
)

# Use tqdm for the progress bar
for chapter_id, content in tqdm(data.items(), desc="Uploading chapters to Redis"):
    r.set(chapter_id, content)
