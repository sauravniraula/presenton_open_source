from langchain_core.tools import tool
from ai.models import AnimationGroups, SegmentedScript, AnimationGroup, EvaluationResult, \
    ShapeStructure, ParagraphStructure
from ai.utils import add_evaluator_comment, get_evaluator_comments
from typing import List, Union

from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_core.prompts import ChatPromptTemplate
import json
import random

@tool
def get_animation_groups_format() -> str:
    """Get the format of animation groups"""
    return AnimationGroups.model_json_schema()

@tool
def get_animation_type() -> List[str]:
    """Get animation types for the shapes"""
    return ['slideIn', 'fadeIn']

@tool
def segment_script(script: str, comments: List[str] = []) -> List[str]:
    """
    This tool is used to segment the script into multiple segments.
    """
    model = ChatOpenAI(model="gpt-4o")
    structured_client = model.with_structured_output(SegmentedScript)
    input = f"""
            This is the script for a presentation:
            [{script}]

            These are the comments from evaluator:
            [{comments}]
    """
    response = structured_client.invoke(input)
    return response.segments

@tool
def select_elements(script: str, script_segments: List[str],
                    structures: List[Union[ShapeStructure, ParagraphStructure]],\
                    comments: List[str] = []) -> List[AnimationGroup]:
    """ 
    This tool is used to select the relevant shapes/paragraphs for a given script segment with animations.
    Arguments:
    - script: The complete script for the presentation.
    - script_segment: The script segment for which the shapes/paragraphs need to be selected.
    - structures: The list of shapes/paragraphs for the slide. \
        This should be supplied exactly as it is in the input.
    - animation: The animation type to be selected for the shapes/paragraphs. \
         This is returned by get_single_animation_type tool.
    """
    model = ChatOpenAI(model="gpt-4o")
    structures = [structure.json() for structure in structures]
    structured_client = model.with_structured_output(AnimationGroups)
    system_message = """
        You are an expert AI agent with amazing attention to detail and specialized in grouping shapes/paragraphs for a given script segment.
        You need to choose shapes/paragraphs that are relevant to the script segment and are spatially closer and \
            necessary to understand the script segment.
        You need to also add animations to the shapes/paragraphs.
        You need strictly to abide by the comment from evaluator. Comments have previous examples and mistakes made is previous examples. It is above all rules.
        Paragraphs that are in same shape and have is_bullet as True are considered as associated bullet points.
        
        You need to follow these rules:
            1) If a paragraph which is a bullet point is added to a group,\
                 then all other associated bullet points should be added to some group. No bullet point should be missed.
            2) Never miss any bullet point.
            3) A bullet point should not be added to more than one group.
            4) In case of two bullet points A and B where B is listed after A in input, \
                B can be in the same group as A or some other group, but not before A's group as per script segment.
        
    """
    input = f"Here is the complete script: [{script}]. \
            Here are the the script segments: [{script_segments}]. \
            Here is the list of shapes/paragraphs: [{structures}]. \
            Here are comments in [example-comment] format from evaluator. You have to cartefully analyze the comments and not do the same mistake as per comments prescription: [{comments}]."
    
    response = structured_client.invoke(input)
    animation = get_single_animation_type()
    for animation_group in response.animation_groups:
        for element in animation_group.elements:
            element.animation_type = animation
    return response.animation_groups

def get_single_animation_type() -> str:
    """Get single animation type for the shapes"""
    animations = {
        "invisible_till_start": ['fadeIn', 'slideInLeft', 'slideInRight'],
        "always_visible": ['emphasis', 'zoomIn']
    }
    animation = random.choice(animations[random.choice(list(animations.keys()))])
    return animation

@tool
def correct_script_segment(script: str, script_segments: List[str],
                            animation_groups: List[AnimationGroup], comments: List[str] = []) -> str:
    """
    This tool is used to correct the script segment. It is used to correct the script segment \
        if the script segment is not in the correct order as per the script. It will strictly follow the comments.
    """
    model = ChatOpenAI(model="gpt-4o")
    structured_client = model.with_structured_output(AnimationGroups)
    system_message = """
        You are an expert AI agent specialized in correcting the script segment.
        You will need to follow the comments and correct the script in the animation groups.
        You need to reference original script and script segments to correct the script segment.
    """
    input = f"Here is the complete script: [{script}]. \
            Here are the the script segments: [{script_segments}]. \
            Here are the animation groups: [{animation_groups}]. \
            Here are the comments: [{comments}]."   
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("user", "{input}")
    ])
    client = prompt | structured_client
    response = client.invoke({"input": input})
    return response.animation_groups
    

@tool
def evaluate_final_result(script: str, script_segments: List[str], \
                        structures: List[Union[ShapeStructure, ParagraphStructure]],
                        result: str, count: int) -> EvaluationResult:
    """
    This will evaluate is the final result is correct or not.
    """
    model = ChatOpenAI(model="gpt-4o")
    structured_client = model.with_structured_output(EvaluationResult)
    example_json = { "animation_groups": [ { "elements": [ { "text": "current market analysis", "containing_shape_name": "Shape_10", "animation_type": "emphasis" }, { "text": "We have identified important key trends that demand our attention.", "containing_shape_name": "Shape_11", "animation_type": "fadeIn" }, { "text": "Data reveals a steady increase in consumer demand for sustainable products, presenting an opportunity for our eco-friendly offerings.", "containing_shape_name": "Shape_11", "animation_type": "fadeIn" } ], "script_segment": "Our current market analysis has identified key trends." }, { "elements": [ { "text": "Data reveals a steady increase in consumer demand for sustainable products, presenting an opportunity for our eco-friendly offerings.", "containing_shape_name": "Shape_11", "animation_type": "fadeIn" }, { "shape_name": "Shape_12", "reason_for_selection": "The decorative element at the bottom provides visual interest and complements the topic of eco-friendliness with its plant-like structure.", "animation_type": "fadeIn" } ], "script_segment": "There's a growing consumer demand for sustainable products, providing us with opportunities for eco-friendly offerings." } ] }
    system_message = """
        Paragraphs that are in same shape and have is_bullet as True are considered as associated bullet points.
        
        This will evaluate if the final result is correct or not based on following rules:
            1) If a paragraph which is a bullet point is added to a group,\
                 then all other associated bullet points should be added to some group. No bullet point should be missed.
            2) Never miss any bullet point.
            4) In case of two bullet points A and B where B is listed after A in input, \
                B can be in the same group as A or some other group, but not before A's group as per script segment.
        
        Don't go beyond these rules. And don't infer anything beyond these clear rules.
        
        Comment should be as an example of what not to do. \
        You will give the sample of response given and point at the rule that the sample violated\
            and the place where it is violated.
    You will output comment in following format containing both the json output and correction comment:
           [ {{
                'animation_groups': [ 
                    {{ 'elements': [ 
                        {{ 'text': 'current market analysis', 'containing_shape_name': 'Shape_10', 'animation_type': 'emphasis' }}, 
                        {{ 'text': 'We have identified important key trends that demand our attention.', 'containing_shape_name': 'Shape_11', 'animation_type': 'fadeIn' }}, 
                        {{ 'text': 'Data reveals a steady increase in consumer demand for sustainable products, presenting an opportunity for our eco-friendly offerings.', 'containing_shape_name': 'Shape_11', 'animation_type': 'fadeIn' }} 
                        ], 'script_segment': 'Our current market analysis has identified key trends.' 
                    }}, 
                    {{ 'elements': [ 
                        {{ 'text': 'Data reveals a steady increase in consumer demand for sustainable products, presenting an opportunity for our eco-friendly offerings.', 'containing_shape_name': 'Shape_11', 'animation_type': 'fadeIn' }}, 
                        {{ 'shape_name': 'Shape_12', 'reason_for_selection': 'The decorative element at the bottom provides visual interest and complements the topic of eco-friendliness with its plant-like structure.', 'animation_type': 'fadeIn' }} 
                    ], 'script_segment': 'There\'s a growing consumer demand for sustainable products, providing us with opportunities for eco-friendly offerings.' }} 
                ]
            }}
            
            In above example:
                - The animation fadeIn was selected for the first element but slideInLeft was selected for the second element. \
                    Both should be either Invisible-Till-Start animation or Always-Visible animation.]
    
    """
    if count >= 4:
        return EvaluationResult(is_correct=True, error_type='none', comment='')
    input = f"Here the complete script: [{script}]. \
            Here are the script segments after segmentation: [{script_segments}]. \
            Here are the shapes/paragraphs (structures): [{structures}]. \
            Here is the final result: [{result}]. \
            Here is the count of calls made to evaluate the result: [{count}]."
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_message),
        ("user", "{input}")
    ])
    client = prompt | structured_client
    response = client.invoke({"input": input })
    if response.error_type != 'none' and not response.is_correct and count <= 2:
        print("*" * 10)
        print(response.comment)
        print("*" * 10)
        add_evaluator_comment(response.comment)
    return response
