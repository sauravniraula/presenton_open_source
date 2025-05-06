from typing import List, Dict, Any
import json
import uuid
import boto3
import tempfile
from openai import OpenAI
import asyncio
from io import BytesIO
from pydub import AudioSegment
import os
from concurrent.futures import ThreadPoolExecutor
from langsmith import wrappers
import io

# Initialize clients
openai = wrappers.wrap_openai(OpenAI(api_key=os.getenv("OPENAI_API_KEY")))

# Fix S3 client initialization
endpoint = os.getenv("R2_ENDPOINT_URL")
bucket = os.getenv("R2_BUCKET_NAME")

if not endpoint or not bucket:
    raise ValueError("R2_ENDPOINT_URL and R2_BUCKET_NAME must be set in environment variables")

s3_client = boto3.client(
    's3',
    region_name="auto",
    aws_access_key_id=os.getenv("R2_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("R2_SECRET_ACCESS_KEY"),
    endpoint_url=endpoint
)

def convert_to_character_timings(text: str, word_timings: List[Dict[str, Any]], delay_time: float) -> Dict:
    characters = list(text)
    start_times = [0] * len(characters)
    end_times = [0] * len(characters)
    
    current_index = 0
    last_timing = 0
    
    for timing in word_timings:
        timing = timing.__dict__
        word = timing["word"]
        # Skip empty words
        if not word or len(word) == 0:
            continue
            
        word_start = timing["start"] + delay_time
        word_duration = timing["end"] - timing["start"]
        char_duration = word_duration / len(word)  # Now we know len(word) is not 0

        for i in range(len(word)):
            if current_index + i < len(characters):
                start_times[current_index + i] = word_start + (i * char_duration)
                end_times[current_index + i] = word_start + ((i + 1) * char_duration)
                last_timing = end_times[current_index + i]
        
        current_index += len(word)
        
        if current_index < len(characters) and characters[current_index] == ' ':
            start_times[current_index] = word_start + word_duration
            end_times[current_index] = word_start + word_duration + 0.05
            last_timing = end_times[current_index]
            current_index += 1

    last_non_zero_index = len(start_times) - 1
    while last_non_zero_index >= 0 and start_times[last_non_zero_index] == 0:
        last_non_zero_index -= 1

    if last_non_zero_index >= 0:
        last_value = end_times[last_non_zero_index]
        for i in range(last_non_zero_index + 1, len(characters)):
            start_times[i] = last_value
            end_times[i] = last_value

    return {
        "characters": characters,
        "character_start_times_seconds": [round(t, 3) for t in start_times],
        "character_end_times_seconds": [round(t, 3) for t in end_times]
    }

def add_silence_to_audio(audio_segment: AudioSegment, silence_duration: float) -> AudioSegment:
    silence = AudioSegment.silent(duration=int(silence_duration * 1000))
    return silence + audio_segment

def process_slide_sync(slide: Dict[str, Any], voice: str, delay_time: float) -> Dict[str, Any]:    
    # Generate speech using OpenAI TTS
    mp3_response = openai.audio.speech.create(
        model="tts-1",
        voice=voice,
        input=slide["script"]
    )
    
    audio_buffer = mp3_response.content
    audio_segment = AudioSegment.from_mp3(BytesIO(audio_buffer))
    
    # Add silence before the audio
    audio_segment = add_silence_to_audio(audio_segment, delay_time)
    
    # Create temporary file for transcription
    with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
        temp_file.write(audio_buffer)
        temp_path = temp_file.name

    try:
        # Get transcription with word timings
        with open(temp_path, 'rb') as audio_file:
            transcription_response = openai.audio.transcriptions.create(
                file=audio_file,
                model="whisper-1",
                response_format="verbose_json",
                timestamp_granularities=["word"]
            )
    finally:
        os.unlink(temp_path)  # Clean up temporary file

    if not transcription_response or not transcription_response.words:
        raise Exception('Failed to get transcription')

    words = [word.__dict__ for word in transcription_response.words]

    # Convert word timings to character timings
    letter_timing = convert_to_character_timings(
        transcription_response.text,
        transcription_response.words,
        delay_time
    )

    # Upload to S3
    output_buffer = io.BytesIO()
    audio_segment.export(output_buffer, format='mp3')
    output_buffer.seek(0)
    
    file_id = str(uuid.uuid4())
    key = f"presentations/audio/slides/{file_id}.mp3"
    
    s3_client.put_object(
        Bucket=bucket,
        Key=key,
        Body=output_buffer.getvalue(),
        ContentType='audio/mpeg'
    )

    return {
        "index": slide["index"],
        "script": transcription_response.text,
        "audio_url": f"{os.getenv('R2_PUBLIC_URL')}{key}",
        "letter_timing": letter_timing,
        "words": words,
        "audio_segment": audio_segment
    }

async def process_slide(slide: Dict[str, Any], voice: str, delay_time: float) -> Dict[str, Any]:
    # Run the synchronous processing in a thread pool
    loop = asyncio.get_event_loop()
    with ThreadPoolExecutor() as pool:
        return await loop.run_in_executor(pool, process_slide_sync, slide, voice, delay_time)

def merge_audio_files(audio_results: List[Dict[str, Any]], delay_time: float) -> bytes:
    # Sort results by index
    sorted_results = sorted(audio_results, key=lambda x: x["index"])
    
    # Initialize merged audio
    merged = AudioSegment.empty()
    
    # Create silence segment for delay
    silence = AudioSegment.silent(duration=int(delay_time * 1000))  # Convert seconds to milliseconds
    
    # Process and merge audio files
    for result in sorted_results:
        if "audio_segment" in result:
            merged += silence
            merged += result["audio_segment"]
    
    # Export to bytes
    output_buffer = io.BytesIO()
    merged.export(output_buffer, format='mp3')
    return output_buffer.getvalue()

def format_time(seconds: float) -> str:
    """Convert seconds to SRT time format (HH:MM:SS,mmm)"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millisecs = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{millisecs:03d}"

async def generate_audio(
    slides: List[Dict[str, Any]],
    voice: str = "alloy",
    delay_time: float = 0
) -> Dict[str, Any]:
    try:
        # Convert slides to list of dictionaries
        slides_data = [{"index": slide.index, "script": slide.script} for slide in slides]
        
        print(f"Processing {len(slides_data)} slides in parallel")
        
        # Process all slides in parallel
        audio_results = await asyncio.gather(*[
            process_slide(slide, voice, delay_time) for slide in slides_data
        ])
        
        # Merge audio files with delay
        merged_audio = merge_audio_files(audio_results, delay_time)
        
        # Upload merged audio to S3
        merged_file_id = str(uuid.uuid4())
        merged_key = f"presentations/audio/merged/{merged_file_id}.mp3"
        
        s3_client.put_object(
            Bucket=bucket,
            Key=merged_key,
            Body=merged_audio,
            ContentType='audio/mpeg'
        )
        
        merged_audio_url = f"{os.getenv('R2_PUBLIC_URL')}{merged_key}"
        
        # Create temporary file for merged audio transcription
        with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
            temp_file.write(merged_audio)
            temp_path = temp_file.name

        try:
            # Get transcription with word timings for the complete merged audio
            with open(temp_path, 'rb') as audio_file:
                transcription_response = openai.audio.transcriptions.create(
                    file=audio_file,
                    model="whisper-1",
                    response_format="verbose_json",
                    timestamp_granularities=["word"]
                )
        finally:
            os.unlink(temp_path)  # Clean up temporary file

        if not transcription_response or not transcription_response.words:
            raise Exception('Failed to get transcription for merged audio')

        # Generate SRT from merged audio transcription
        srt_content = generate_srt_from_merged([word.__dict__ for word in transcription_response.words])
        
        # Correct the subtitles using OpenAI
        corrected_srt = await correct_subtitles(srt_content, audio_results)
        
        # Upload corrected SRT file
        srt_file_id = str(uuid.uuid4())
        srt_key = f"presentations/audio/subtitles/{srt_file_id}.srt"
        
        s3_client.put_object(
            Bucket=bucket,
            Key=srt_key,
            Body=corrected_srt.encode('utf-8'),
            ContentType='text/plain'
        )
        
        srt_url = f"{os.getenv('R2_PUBLIC_URL')}{srt_key}"
        
        # Remove audio segments from response
        for result in audio_results:
            if "audio_segment" in result:
                del result["audio_segment"]
        
        return {
            "slides": audio_results,
            "merged_audio_url": merged_audio_url,
            "subtitles_url": srt_url
        }
        
    except Exception as e:
        print(f"Error in generate_audio: {e}")
        raise e



async def correct_subtitles(srt_content: str, slides: List[Dict[str, Any]]) -> str:
    """Correct subtitles using OpenAI GPT-4"""
    try:
        # Combine all scripts into one
        full_script = "\n".join(slide["script"] for slide in slides if slide.get("script"))
        
        messages = [
            {
                "role": "system",
                "content": "You will be given the content of an SRT subtitle file and a script from which the subtitle file has been created. Your task is to correct the text of the subtitle file by referencing the script, focusing on spelling, capitalization and punctuation errors. Ensure that you do not alter any timing sequences in any way; only make textual corrections within the existing sequences. Don't add anything except the srt file content."
            },
            {
                "role": "user",
                "content": f"Script: {full_script}\nSRT Subtitle Content:\n{srt_content}"
            }
        ]

        completion = openai.chat.completions.create(
            model="gpt-4o-mini",   
            messages=messages,
            temperature=1,
            max_tokens=2048,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )

        corrected_srt = completion.choices[0].message.content.replace('`', '')
        
        if not corrected_srt:
            raise Exception('No correction received from OpenAI')
            
        return corrected_srt
    
    except Exception as e:
        print(f"Error correcting subtitles: {e}")
        return srt_content  # Return original content if correction fails


def generate_srt_from_merged(words: List[Dict[str, Any]]) -> str:
    """Generate SRT subtitles from merged audio word timings"""
    srt = ""
    cue_index = 1
    current_cue = []
    MAX_WORDS_PER_CUE = 10
    PUNCTUATION_MARKS = ".!?,:;"

    for i, timing in enumerate(words):
        if not timing["word"]:
            timing["word"] = " "
        current_cue.append(timing["word"])
        
        # Create new cue when we hit word limit, punctuation, or end of words
        should_break = (
            len(current_cue) >= MAX_WORDS_PER_CUE or
            timing["word"][-1] in ".!?" or
            i == len(words) - 1
        )

        if should_break and current_cue:
            start_index = i - len(current_cue) + 1
            cue_start_time = words[start_index]["start"]
            cue_end_time = timing["end"]

            # Ensure minimum duration
            if cue_end_time == cue_start_time:
                cue_end_time = cue_start_time + 0.5

            # Only create cue if timing is valid
            if cue_end_time > cue_start_time:
                srt += f"{cue_index}\n"
                srt += f"{format_time(cue_start_time)} --> {format_time(cue_end_time)}\n"
                
                # Join words without spaces before punctuation
                cue_text = ""
                for j, word in enumerate(current_cue):
                    if len(word) > 0 and j > 0 and not word[0] in PUNCTUATION_MARKS:
                        cue_text += " "
                    cue_text += word
                
                srt += f"{cue_text}\n\n"
                cue_index += 1

            current_cue = []

    return srt

if __name__ == "__main__":
    test_data = {
        "body": json.dumps({
            "slides": [
                {
                    "index": 0,
                    "script": "This is a test script for slide one."
                },
                {
                    "index": 1,
                    "script": "This is a test script for slide two."
                }
            ],
            "voice": "nova",
            "delay_time": 5  # 2 seconds delay
        })
    }
    response = generate_audio(test_data, None)
    print("Test response:", response)
