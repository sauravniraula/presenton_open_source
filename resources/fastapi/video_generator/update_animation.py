import json
import time
import random
import base64
import requests
from io import BytesIO
from PIL import Image
from openai import OpenAI
from .models import UpdateScriptSegments
from .schema import ANIMATED_SCHEMA
from typing import Dict, Any, List
from langsmith import wrappers


client = wrappers.wrap_openai(OpenAI())


system_prompt = """
Incorporate corrections based on the user's feedback, making adjustments to animation suggestions strictly as implied by the user feedback while preserving previous grouping and animations except where explicitly modified by feedback.

Absolutely do not change anything in the previous animation unless explicitly stated in user feedback. This includes script_segment, text_id, text, animation.

The task requires identifying suitable animation candidates from a slide by segmenting the given script and selecting appropriate texts from the slide for animation. The input includes a list of `text_frame` objects, where each `text_frame` has two attributes: `texts` (list of text objects) and `is_bullet` (a boolean indicating if it contains bullet points). Ensure the final output follows the specific rules for animation selection and ordering whenever possible. Prioritize user feedback and modify rule adherence only if necessary to meet user requirements. Existing animations should not be altered except where user feedback specifies.

Use the script, visual elements, positioning, size, listed rules, and user-provided feedback to determine which segments of the text require highlighting or emphasis through animation.

# Rules for Selection

- If any text in a bullet `text_frame` is selected for animation, then all texts within that `text_frame` should be part of any segment. No text in this condition should be excluded from being part of any segment. It is not necessary that it is a part of the same segment.
- The order of animation segments should respect the ordering on the slide—text that follows a bullet point cannot precede it in an animation sequence.
- The `script_segment` included in the output must be precisely a part of the original script. It should match exactly, without assuming or modifying anything.
- Only change animation type if specified by user in feedback. Do not change otherwise.
- Only use the following animation types:
  - `slideInLeft`
  - `slideInRight`
  - `fadeIn`
- If a user suggests an animation that is not in the above list, choose the nearest animation type in behavior from the given list.
- Do not change any previously included animations unless explicitly stated in user feedback.

# User Feedback Integration Rule

- Give priority to the user's comments when making adjustments. Follow the user-provided instructions as best as possible, even if it means overriding or breaking the defined animation rules. Do not, however, choose animation types that are not allowed. If the user's suggested animation type is not present in the given list, pick the closest available option.
- Only when implementing feedback forces breaking a non-animation-specific rule should those rules be modified.
- Avoid changing existing animations entirely unless directed by specific user feedback.
- Because animation occurs during the respective script segment is spoken, when user suggests to bring or animate certain text together or differently, take it in reference to script segment.

# Steps

1. **Analyze Slide and Shape Information:**
   - Extract all textual information from the slide and any external shapes (provided in JSON format), ensuring the collection of text is accurate.
   - Assess each text element, considering its position and size relative to other elements. This includes determining which texts are visually grouped or logically situated near each other.

2. **Script Segmentation:**
   - Split the provided script into logical segments. A segment is defined as a coherent statement representing an idea or topic.

3. **Mapping and Selection:**
   - For each script segment, map it to the appropriate text elements on the slide.
   - Pay specific attention to the rules regarding bullet texts (`text_frame` objects where `is_bullet` is True).
   - Analyze the positional hierarchy and size to determine the significance of each text element before selecting and grouping for animation.
   - If one of the texts in a bullet `text_frame` is included in animation, ensure all texts are animated at some point.
   - No text can be represented in earlier segments than the text it follows within a `text_frame`.
  
4. **Integrate User Feedback:**
   - Review any comments provided by the user on the previous output.
   - Make necessary adjustments to improve text selection, grouping, and animations based on user feedback.
   - Follow the user's directives first while adhering to allowed animation types.
   - If following user comments requires breaking the rules (other than the allowed animation types), then proceed by breaking these rules, ensuring maximum alignment with user instructions.
   - Avoid altering existing animations unless explicitly addressed by user feedback.

5. **Prioritize Clarity and Emphasis:**
   - Select text elements that provide the best visualization of the key information in each script segment.
   - The chosen text must match exactly with the source—do not modify or paraphrase.

# Output Format

- **JSON object** representing segments with the associated animated text.
  - Each segment entry must contain:
    - `script_segment` (string): The specific script portion. This must be taken exactly from the provided script without modifications.
    - `texts` (array): An array of objects, each representing the animated text.
      - `text_id` (string): Identifier for the text from the slide.
      - `text` (string): The actual text to be animated (must match input exactly).
      - `animation` (string): The type of animation applied. It must be one of the allowed animation types (`slideInLeft`, `slideInRight`, `fadeIn`).
    - `user_feedback` (optional string): If applicable, additional comments or adjustments representing previously incorporated user feedback.

```json
{
  "segments": [
    {
      "script_segment": "Introduction to the new project.",
      "texts": [
        {
          "text_id": "xxxxxx",
          "text": "New Project Overview",
          "animation": "fadeIn"
        }
      ]
    },
    {
      "script_segment": "Key Team Members",
      "texts": [
        {
          "text_id": "yyyyyy",
          "text": "Team Lead: John Doe",
          "animation": "fadeIn"
        }
      ]
    }
  ]
}
```

# Notes

- Ensure coherent and logical segmentation so that each part of the script aligns properly with corresponding visuals.
- When mapping text, ensure the rules regarding bullets, ordering, position, and size are strictly maintained unless overridden by user feedback.
- Ensure bullet groupings are handled correctly if selected for animation—all items within a bullet `text_frame` should be included.
- Maintain the sequence integrity; text that follows should always come later in segments, unless dictated otherwise by user preferences.
- The `script_segment` must be an exact segment from the script; it should not be changed, assumed, or paraphrased.
- Continuously refine outputs based on user feedback. Ensure any changes preserve sequence, coherence, and adherence to rules unless explicitly overridden by user instructions.
- Existing grouping and animations should remain unchanged unless the user feedback suggests otherwise.
- Only provide animations from the set of allowed types (`slideInLeft`, `slideInRight`, `fadeIn`). If a user suggests otherwise, choose the closest available type from the allowed list.

"""

def update_animation(slide: List[Dict[str, Any]], script: str, thumbnail: str, animation: List[Dict[str, Any]], user_feedback: str):
    print(f"Updating animation : {animation}")
    print(f"User feedback: {user_feedback}")
    try:
        response = requests.get(thumbnail)
        img = Image.open(BytesIO(response.content))
        img_base64 = base64.b64encode(response.content).decode('utf-8')
        slide_image_url = f"data:image/jpeg;base64,{img_base64}"

        response = client.chat.completions.create(
            model="o1-preview",
            messages=[
                # {
                # "role": "system",
                # "content": [
                #         {
                #             "type": "text",
                #             "text": system_prompt 
                #         }
                #     ]
                # },
                {
                "role": "user",
                "content": [
                        # {
                        # "type": "image_url",
                        # "image_url": {
                        #         "url": slide_image_url                    
                        #     }
                        # },
                        {
                        "type": "text",
                        "text": f"System Message: {system_prompt}. Input: This is the list of text frames: {slide}, this is the script: {script}, \
                             this is previous animation result: {animation} and this is the user feedback for the animation: {user_feedback}"
                        }
                    ]
                },
            ],
            temperature=1,
            # max_tokens=2048,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0,
            # response_format={
            #     "type": "json_object"
            # }

        )
        unvalidated_data = json.loads(response.choices[0].message.content[7:-3])
        validated_data = UpdateScriptSegments(**unvalidated_data)

        response = json.loads(validated_data.model_dump_json())
        # animation = random.choice(["fadeIn", "slideInLeft", "slideInRight"])
        # for script_segment in response["segments"]:
        #     for text in script_segment["texts"]:
        #         text["animation"] = animation
        
        return response
    except Exception as e:
        print(e)
        raise e

if __name__ == "__main__":
    script = """
        Effective delivery techniques are the sprinkles on your speech sundae. Voice modulation and body language are your secret ingredients. Use them wisely, like a magician with a deck of cards. Keep your audience guessing, and they'll be hanging on your every word. Let's make your delivery as memorable as your favorite song.
    """
    thumbnail = "https://pub-7c765f3726084c52bcd5d180d51f1255.r2.dev/thumbnail.png"
    text_frames =  [ { "texts": [ { "id": "bf5afedd9d4f566b5b81df5e8823e751", "text": "Effective delivery techniques", "shape_name": "Shape_24" } ], "is_bullet": False }, { "texts": [ { "id": "08ab14a8b5b33a0f6e958743f444f762", "text": "Voice modulation", "shape_name": "Shape_25" }, { "id": "16cb070daa280c66a0b8ddad6f07a378", "text": "This is a powerful tool in public speaking. It involves varying pitch, tone, and volume to convey emotion, emphasize points, and maintain interest.", "shape_name": "Shape_25" }, { "id": "0d2376482d84f37ee3a9750750dc3f19", "text": "Pitch variation", "shape_name": "Shape_25" }, { "id": "6e73d1691199569937fd58aed3522082", "text": "Tone inflection", "shape_name": "Shape_25" }, { "id": "ef557513df892b1b6a6fad5550fbd0f6", "text": "Volume control", "shape_name": "Shape_25" } ], "is_bullet": True }, { "texts": [ { "id": "86cfcf42d92e34f785833787f05c579a", "text": "Body language", "shape_name": "Shape_26" }, { "id": "16b028be7b26fb331afd6fdb00378464", "text": "Effective body language enhances your message, making it more impactful and memorable.", "shape_name": "Shape_26" }, { "id": "e0fbf79c6807fc050c2a8bd21d5e7bf0", "text": "Meaningful eye contact", "shape_name": "Shape_26" }, { "id": "a76c0e1fd717c8ca6505157d7d3463c7", "text": "Purposeful gestures", "shape_name": "Shape_26" }, { "id": "721bde85de4cd3081b7a7bbc3c56ac84", "text": "Maintain good posture", "shape_name": "Shape_26" }, { "id": "1b4b4d0eed3babed44be00a79a460e69", "text": "Control your expressions", "shape_name": "Shape_26" } ], "is_bullet": True } ]
    previous_animation = {"segments": [{"script_segment": "Effective delivery techniques are the sprinkles on your speech sundae.", "texts": [{"text_id": "bf5afedd9d4f566b5b81df5e8823e751", "text": "Effective delivery techniques", "animation": "slideInLeft"}]}, {"script_segment": "Voice modulation and body language are your secret ingredients.", "texts": [{"text_id": "08ab14a8b5b33a0f6e958743f444f762", "text": "Voice modulation", "animation": "slideInLeft"}, {"text_id": "86cfcf42d92e34f785833787f05c579a", "text": "Body language", "animation": "slideInLeft"}]}, {"script_segment": "Use them wisely, like a magician with a deck of cards.", "texts": [{"text_id": "16cb070daa280c66a0b8ddad6f07a378", "text": "This is a powerful tool in public speaking. It involves varying pitch, tone, and volume to convey emotion, emphasize points, and maintain interest.", "animation": "slideInLeft"}, {"text_id": "16b028be7b26fb331afd6fdb00378464", "text": "Effective body language enhances your message, making it more impactful and memorable.", "animation": "slideInLeft"}]}, {"script_segment": "Keep your audience guessing, and they'll be hanging on your every word.", "texts": [{"text_id": "0d2376482d84f37ee3a9750750dc3f19", "text": "Pitch variation", "animation": "slideInLeft"}, {"text_id": "6e73d1691199569937fd58aed3522082", "text": "Tone inflection", "animation": "slideInLeft"}, {"text_id": "ef557513df892b1b6a6fad5550fbd0f6", "text": "Volume control", "animation": "slideInLeft"}, {"text_id": "e0fbf79c6807fc050c2a8bd21d5e7bf0", "text": "Meaningful eye contact", "animation": "slideInLeft"}, {"text_id": "a76c0e1fd717c8ca6505157d7d3463c7", "text": "Purposeful gestures", "animation": "slideInLeft"}, {"text_id": "721bde85de4cd3081b7a7bbc3c56ac84", "text": "Maintain good posture", "animation": "slideInLeft"}, {"text_id": "1b4b4d0eed3babed44be00a79a460e69", "text": "Control your expressions", "animation": "slideInLeft"}]}, {"script_segment": "Let's make your delivery as memorable as your favorite song.", "texts": []}]}
    start_time = time.time()
    print(json.dumps({"slide": text_frames, "script": script, "thumbnail": thumbnail, "animation": previous_animation, "user_feedback": "title, voice modulation and body language should be animated together"}))
    animation = update_animation(text_frames, script, thumbnail, previous_animation,\
         "title, voice modulation and body language should be animated together")
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")
    from pprint import pprint
    print(json.dumps(animation))
    # data = json.loads(data)
    # slide = data["slide"]
    # script = data["script"]
    # slide_image_url = slide["thumbnail"]
    # structures = get_slide_structures(slide["structure"], \
    #                                     slide["shapes"], \
    #                                         slide_image_url)
    # response = select_elements(script, script.split(".")[0], structures)
    # print(response)


# Test evaluate_final_result
# if __name__ == "__main__":
#     with open("../input.json", "r") as f:
#         data = f.read()
#     data = json.loads(data)
#     script = data["script"]
#     script_segments = script.split(".")
#     structures = get_slide_structures(data["slide"]["structure"], \
#                                     data["slide"]["shapes"], \
#                                         data["slide"]["thumbnail"])
#     response = evaluate_final_result(script, script_segments, structures, "", 0)
#     with open("../wrong_example.json", "r") as f:
#         wrong_example = f.read()
#     wrong_example = json.loads(wrong_example)
#     response = evaluate_final_result(script, script_segments, structures, wrong_example, 0)
#     print(response)