import random
import asyncio

from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

from api.routers.presentation.models import DocumentInterpretedReport
from graph_processor.models import GraphModel, TableMarkdownSourceModel
from ppt_config_generator.models import (
    PresentationConfigurationModel,
    TitleWithGraphIdModel,
)


from ppt_generator.fix_validation_errors import get_validated_response
from ppt_generator.models.content_type_models import CONTENT_TYPE_MAPPING
from ppt_generator.models.other_models import SlideType
from graph_processor.models import GraphModel

from ppt_generator.models.content_type_models import MultipleInfographicModel
from langchain_google_genai import ChatGoogleGenerativeAI



model = ChatOpenAI(model="gpt-4o", max_retries = 2).with_structured_output(
    PresentationConfigurationModel.model_json_schema()
)

# model = ChatGroq(temperature=0.6, model_name="deepseek-r1-distill-llama-70b-specdec", max_tokens = 16384).with_structured_output(
#     PresentationConfigurationModel.model_json_schema()
# )

# model = ChatGoogleGenerativeAI(
#     model="gemini-1.5-pro",
#     temperature=0,
#     max_tokens=None,
#     timeout=None,
#     max_retries=2,
#     # other params...
# ).with_structured_output(
#     PresentationConfigurationModel.model_json_schema()
# )



def get_prompt_template(images: List[str]) -> ChatPromptTemplate:
    images_prompt = [
        {
            "type": "image_url",
            "image_url": each,
        }
        for each in images
    ]
    prompt_template = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                You're a professional data presenter with years of experience in presenting complex data and its insights in a clear and engaging way. 

                You prefer visualizing data using graphs and infographics. And prefer explaining existing information rather than suggesting new ideas.

                Create a presentation using the provided slide titles, images, and additional data, following specified steps and guidelines. 

                You have a bias towards creating slides with graphs and infographics.

                Analyze all inputs, including slide titles, graphs, summary, big idea, story and spreadsheet content to construct each slide with appropriate content and format.

                # Slide Types
                - **1**: contains title, description and image.
                - **2**: contains title and list of items.
                - **4**: contains title and list of items with images.
                - **5**: contains title, description and a graph.
                - **6**: contains title, description and list of items.
                - **7**: contains title and list of items with icons.
                - **8**: contains title, description and list of items with icons.
                - **9**: contains title, list of items and a graph.
                - **10**: contains title, list of inforgraphic charts with supporting information.
                - **11**: contains title, a single inforgraphic chart and description.

                # Steps
                1. Analyze Prompt, and other provided data.
                2. Use Slide titles provided in **Titles**.
                3. Generate Slide Content for each slide. Make sure it has all the context and information required to create this individual slide from.
                4. Select slide type.
                5. Select graphs when required from **Graphs**. Don't repeat same graphs in multiple slides unless requires by story.
                6. Select infographics when required from **Infographics**.
                7. Content of info will be used to create slide. Som info for each slide should be more than **200 words**. Give information in this format 1) 70 words about what this slides should signify. 2) another 70 words about the contents on the slide. 3) Another 70 words about elements of the slide. Example:
                    ```
                        This slide highlights the measurable impact of collaboration in teams, showing how it drives productivity and innovation. Studies indicate that companies promoting collaboration are 5 times more likely to be high-performing. It also enhances engagement, with 33% of employees feeling more motivated in a collaborative environment. The goal is to showcase how teamwork leads to better decision-making, faster problem-solving, and increased efficiency, ultimately benefiting both employees and organizations.
                        The slide will present key statistics, such as how 86% of employees and executives cite lack of collaboration as a major cause of workplace failures. It will discuss different collaboration tools like Slack and Trello, which have helped businesses improve productivity by 25%. Additionally, it will include real-world examples of how companies like Google use collaborative strategies to foster innovation, improve workflows, and achieve long-term business success.
                        The slide will feature a pie chart showing the percentage of businesses that report increased efficiency due to collaboration. A bar graph will compare productivity levels of highly collaborative teams versus non-collaborative teams. It will also include an infographic illustrating key collaboration tools and their adoption rates. The background will feature an image of a diverse team working together, reinforcing the theme of unity and shared success.
                    ```

                # Notes
                - Generate output in language mentioned in *Input*.
                - Distribute contexts mentioned in prompt to slides using **info** field.
                - User prompt should be respected beyond all rules or constraints.
                - If **Story** is provided, presentation should follow the story flow.
                - Infographics and graphs should be prioritized in selection over basic text content. 
                - Select meaningful graphs and infographics_numbers that align with the story/content of the slide.
                - *info* should be the elaborate description of what should be persented in the slide. It should be more than 200 words long.
                - If infographics is selected for a slide, then slide type should be **10** or **11**.
                - When you have to express single numbers like percentage or figures, you should use inforgraphics but for a collection of numbers in series you can use charts. 
                - Graphs and infographics selected for a slide should be coherent with the story/content in the slide.
                - Number of data in a series and categories in graphs should be same. 
                - Freely select type with images and icons.
                - Introduction and Conclusion should have *Type 1* if graph is not assigned.
                - Try to select **different types for every slides**.
                - Don't select Type **3** for any slide.
                - *infographics_numbers* can be used to visualize single numbers and metrics in infographic charts.
                - **Do not include *infographics_numbers* with no numbers.**
                - Do not include same graph twice in presentation without any changes to the other.
                - Every series in a graph should have data in same unit. Example: all series should be in percentage or all series should be in number of items.
                - Type **9** and **5** should be only picked if graph is available.
                - All numbers should be from the give text/graphs. **Do not assume or guess numbers/data.**

                **Go through notes and steps and make sure they are all followed. Rule breaks are strictly not allowed.**
                """,
            ),
            (
                "user",
                [
                    {
                        "type": "text",
                        "text": """
                                    *Input:*
                                    - User Prompt: {prompt}
                                    - Big Idea: {big_idea}
                                    - Output Language: {language}
                                    - Titles: {titles}
                                    - Graphs: {graphs}
                                    - Spreadsheet Content: {spreadsheet_content}
                                    - Summary: {summary}
                                    - Story: {story}
                                """,
                    },
                    *images_prompt,
                ],
            ),
        ],
    )
    return prompt_template


async def generate_ppt_config(
    prompt: str,
    titles: List[str],
    graphs: List[TableMarkdownSourceModel],
    images: Optional[List[str]] = None,
    summary: Optional[str] = None,
    language: Optional[str] = None,
    big_idea: Optional[str] = None,
    story: Optional[str] = None,
    interpreted_report: Optional[DocumentInterpretedReport] = None,
) -> PresentationConfigurationModel:

    prompt_template = get_prompt_template(images or [])
    chain = prompt_template | model

    interpreted_content = None
    if interpreted_report:
        interpreted_content = interpreted_report.to_gpt_input()

    formatted_graphs = "\n".join([f"Name: {graph.name}\nData: {graph.markdown}\n\n" for graph in graphs])
    retries = 2
    while retries:
        try:
            presentation_config = await get_validated_response(
                chain,
                {
                    "prompt": prompt,
                    "big_idea": big_idea,
                    "language": language or "English",
                    "titles": titles,
                    "summary": summary,
                    "story": story,
                    "graphs": formatted_graphs,
                    "spreadsheet_content": interpreted_content,
                },
                PresentationConfigurationModel
            )
            return presentation_config
        except Exception as e:
            retries -= 1
            if retries == 0:
                raise e


async def get_graphs_and_infographics(configuration: PresentationConfigurationModel, graphs: List[TableMarkdownSourceModel]):
    coroutines = []
    for slide_index, slide in enumerate(configuration.slides):
        if slide.graph_information and slide.infographics_numbers:
            if slide.type == 5:
                coroutines.append(get_formatted_graph(slide_index, slide.graph_information, graphs))
            elif slide.type == 10 or slide.type == 11:
                coroutines.append(get_formatted_infographics(slide_index, slide.infographics_numbers))
        if slide.graph_information and not slide.infographics_numbers:
            coroutines.append(get_formatted_graph(slide_index, slide.graph_information, graphs))
        if  slide.infographics_numbers and not slide.graph_information: 
            coroutines.append(get_formatted_infographics(slide_index, slide.infographics_numbers))
        
    results = await asyncio.gather(*coroutines)

    graphs_and_infographics = [None for _ in range(len(configuration.slides))]
    for each, slide_index in results:
        graphs_and_infographics[slide_index] = each

    return graphs_and_infographics





def get_graph_formatter_prompt_template() -> ChatPromptTemplate:
    prompt_template = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                 You are a precise data presenter who does not make mistakes with numbers and data. 
                    Notes:
                        - You'll be given a lot of graphs and user prompt. You need to fetch exact graph that user requested in requested format.
                        - Pick most suitable graph type if graph type is not mentioned in prompt.
                        - Numbers is the output graphs should be accurate and exact to the provided graph.
                        - You will not guess but provide exact numbers and information in graph.
                        - **No more than 3 series should be provided for the graph.**
                        - Pick appropriate unit of the data in graph in 'unit' field.
                """,
            ),
            (
                "user",
                [
                    {
                        "type": "text",
                        "text": """
                                    *Input:*
                                    - User Prompt: {prompt}
                                    - Graphs: {graphs}
                                """,
                    }
                ],
            ),
        ],
    )
    return prompt_template


async def get_formatted_graph(
    slide_index: int,
    prompt: str,
    graphs: List[TableMarkdownSourceModel],
) -> GraphModel:
    # model = ChatGroq(temperature=0.6, model_name="deepseek-r1-distill-llama-70b", max_tokens = 16384).with_structured_output(
    #     GraphModel.model_json_schema()
    # )
    model = ChatOpenAI(model="gpt-4o", max_retries = 2).with_structured_output(
        GraphModel.model_json_schema()
    )

    prompt_template = get_graph_formatter_prompt_template()
    chain = prompt_template | model

    formatted_graphs = "\n".join([f"Name: {graph.name}\nData: {graph.markdown}\n\n" for graph in graphs])
    retries = 2
    while retries:
        try:
            graph =  await get_validated_response(
                chain,
                {
                    "prompt": prompt,
                    "graphs": formatted_graphs
                },
                GraphModel
            )
            print(graph.model_dump_json(indent=2))
            return graph, slide_index
        except Exception as e:
            print(f"Error while fetching graph: {e}")
            retries -= 1
            continue
    

def get_infographics_template() -> ChatPromptTemplate:
    prompt_template = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                 You are a precise data presenter who does not make mistakes with numbers and data. 
                 - You'll be given infographics description and user prompt. You need to extract and fill data in right infographic chart as per the description.
                 - You should follow these guidelines while selecting the infographic chart:
                    - Progress Dial (Gauge Chart) – Use when comparing actual performance against a fixed target, such as sales goals or system performance metrics. Best for dashboards and quick-glance overviews.
                    - Radial Progress (Semi-Circle Progress Chart) – Ideal for highlighting a single percentage of completion, like project progress or survey results. Works well when emphasizing key statistics.
                    - Progress Ring (Circular Progress Indicator) – Use when showing cyclic or iterative processes, such as task completion rates or system uptime. Best for side-by-side comparisons of multiple percentages.
                    - Icon Infographics (Any Symbolic Representation) – Use when visually representing proportions, demographics, or categories (e.g., number of satisfied customers using star icons, product distribution using package icons). Enhances engagement by making abstract data more relatable.
                    - Progress Bar (Linear Progress Indicator) – Best for showing sequential progress, such as workflow steps, task completion, or event timelines. Useful for illustrating phased achievements.
                    - Just Text (Numbers in Big Font) – Use when you don't need any infographic chart and just have to show numbers in big form.

                 - You will prioritize for schema fit. If schema is not specified then you will find suitable infographics that matches the description.
                 - Only give numbers and metrics given in *infographics description*, do not assume, makeup or derive numbers and metrics. 
                 - Percentage and resulting charts should be used only when perentage is directly mentioned in *infographics description*.
                 - Fallback to text infographic chart if no suitable schema fits into description.
                 - Try to select same chart type for all infographic charts in the list.
                """,
            ),
            (
                "user",
                [
                    {
                        "type": "text",
                        "text": """
                                    *Input:*
                                    - Infographics Description: {infographics_information}
                                """,
                    }
                ],
            ),
        ],
    )
    return prompt_template


async def get_formatted_infographics(
    slide_index: int,
    infographics_information: str,
) -> MultipleInfographicModel:
    # chat_model = ChatGroq(temperature=0.6, model_name="deepseek-r1-distill-llama-70b", max_tokens = 16384)
    print(infographics_information)
    chat_model = ChatOpenAI(model="o3-mini", max_retries = 2)
    model = chat_model.with_structured_output(MultipleInfographicModel.model_json_schema())
    prompt_template = get_infographics_template()
    chain = prompt_template | model
    retries = 2
    while retries:
        try:
            result =  await get_validated_response(
                chain,
                {
                    "infographics_information": infographics_information,
                },
                MultipleInfographicModel
            )
        except Exception as e:
            print(f"Error while fetching infographic: {e}")
            retries -= 1
            continue
        break
    print(result.model_dump_json(indent=2))
    return result, slide_index
