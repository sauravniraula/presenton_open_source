from typing import List
from pydantic import BaseModel
from openai import OpenAI

import json
import json
from pydantic import BaseModel
from ppt_generator.models.other_models import SlideType


from ppt_generator.models.content_type_models import Type1Content, Type2Content, Type4Content, \
                                                        Type5Content, Type6Content, Type7Content, \
                                                            Type8Content, Type9Content, Type10Content, Type11Content

class BaseSlideModel(BaseModel):
    type: SlideType
    content: (
        Type1Content
        | Type2Content
        | Type4Content
        | Type5Content
        | Type6Content
        | Type7Content
        | Type8Content
        | Type9Content
        | Type10Content
        | Type11Content
    )

class Presentation(BaseModel):
    title: str
    n_slides: int
    titles: list[str]
    slides: list[BaseSlideModel]


client = OpenAI()


system_prompt = """
\n                You're a professional data presenter with years of experience in presenting complex data and its insights in a clear and engaging way. \n\n                You prefer visualizing data using graphs and infographics. And prefer explaining existing information rather than suggesting new ideas.\n\n                Create a presentation using the provided slide titles, images, and additional data, following specified steps and guidelines. \n\n                You have a bias towards creating slides with graphs and infographics.\n\n                Analyze all inputs, including slide titles, graphs, summary, big idea, story and spreadsheet content to construct each slide with appropriate content and format.\n\n                # Slide Types\n                - **1**: contains title, description and image.\n                - **2**: contains title and list of items.\n                - **4**: contains title and list of items with images.\n                - **5**: contains title, description and a graph.\n                - **6**: contains title, description and list of items.\n                - **7**: contains title and list of items with icons.\n                - **8**: contains title, description and list of items with icons.\n                - **9**: contains title, list of items and a graph.\n                - **10**: contains title, list of inforgraphic charts with supporting information.\n                - **11**: contains title, a single inforgraphic chart and description.\n\n                # Steps\n                1. Analyze Prompt, and other provided data.\n                2. Use Slide titles provided in **Titles**.\n                3. Generate Slide Content for each slide. Make sure it has all the context and information required to create this individual slide from.\n                4. Select slide type.\n                5. Select graphs when required from **Graphs**. Don't repeat same graphs in multiple slides unless required by story.\n                6. Select infographics when required from **Infographics**.\n                7. Output should be in json format as per given schema.\n\n                # Notes\n                - Generate output in language mentioned in *Input*.\n                - Distribute contexts mentioned in prompt to slides using **info** field.\n                - User prompt should be respected beyond all rules or constraints.\n                - If **Story** is provided, presentation should follow the story flow.\n                - Infographics and graphs should be prioritized in selection over basic text content. \n                - Select meaningful graphs and infographics_numbers that align with the story/content of the slide.\n                - If infographics is selected for a slide, then slide type should be **10** or **11**.\n                - When you have to express single numbers like percentage or figures, you should use inforgraphics but for a collection of numbers in series you can use charts. \n                - Graphs and infographics selected for a slide should be coherent with the story/content in the slide.\n                - Number of data in a series and categories in graphs should be same. \n                - Freely select type with images and icons.\n                - Introduction and Conclusion should have *Type 1* if graph is not assigned.\n                - Try to select **different types for every slides**.\n                - Don't select Type **3** for any slide.\n                - Do not include same graph twice in presentation without any changes to the other.\n                - Every series in a graph should have data in same unit. Example: all series should be in percentage or all series should be in number of items.\n                - Type **9** and **5** should be only picked if graph is available.\n                - All numbers should be from the give text/graphs. **Do not assume or guess numbers/data.**\n                - For slide content follow these rules:\n                    - Highlighting in markdown format should be used to emphasize numbers and data.\n                    - Specify **don't include text in image** in image prompt.\n                    - Image prompt should cleary define how image should look like.\n                    - Image prompt should not ask to generate **numbers, graphs, dashboard and report**.\n                    - Examples of image prompts: \n                        - a travel agent presenting a detailed itinerary with photos of destinations, showcasing specific experiences, highlighting travel highlights\n                        - a person smiling while traveling, with a beautiful background scenery, such as mountains, beach, or city,  golden hour lighting\n                        - a humanoid robot standing tall, gazing confidently at the horizon, bathed in warm sunlight, the background showing a futuristic cityscape with sleek buildings and flying vehicles\n                    - Descriptions should be clear and to the point.\n                    - Descriptions should not use words like \"This slide\", \"This presentation\".\n                    - If **body** contains items, *choose number of items randomly between mentioned constraints.*\n                    - **Icon queries** must be a generic **single word noun**.\n                    - Provide 3 icon query for each icon where,\n                        - First one should be specific like \"Led bulb\".\n                        - Second one should be more generic that first like \"bulb\".\n                        - Third one should be simplest like \"light\".\n\n                **Go through notes and steps and make sure they are all followed. Rule breaks are strictly not allowed.**\n \n\n Follow this schema while giving out response: {'$defs': {'BarGraphDataModel': {'additionalProperties': True, 'properties': {'categories': {'items': {'type': 'string'}, 'title': 'Categories', 'type': 'array'}, 'series': {'description': 'There should be no more than 3 series', 'items': {'$ref': '#/$defs/BarSeriesModel'}, 'title': 'Series', 'type': 'array'}}, 'required': ['categories', 'series'], 'title': 'BarGraphDataModel', 'type': 'object'}, 'BarSeriesModel': {'additionalProperties': True, 'properties': {'name': {'title': 'Name', 'type': 'string'}, 'data': {'items': {'type': 'number'}, 'title': 'Data', 'type': 'array'}}, 'required': ['name', 'data'], 'title': 'BarSeriesModel', 'type': 'object'}, 'BaseSlideModel': {'properties': {'type': {'$ref': '#/$defs/SlideType'}, 'content': {'anyOf': [{'$ref': '#/$defs/Type1Content'}, {'$ref': '#/$defs/Type2Content'}, {'$ref': '#/$defs/Type4Content'}, {'$ref': '#/$defs/Type5Content'}, {'$ref': '#/$defs/Type6Content'}, {'$ref': '#/$defs/Type7Content'}, {'$ref': '#/$defs/Type8Content'}, {'$ref': '#/$defs/Type9Content'}, {'$ref': '#/$defs/Type10Content'}, {'$ref': '#/$defs/Type11Content'}], 'title': 'Content'}}, 'required': ['type', 'content'], 'title': 'BaseSlideModel', 'type': 'object'}, 'BubbleChartDataModel': {'additionalProperties': True, 'properties': {'series': {'items': {'$ref': '#/$defs/BubbleSeriesModel'}, 'title': 'Series', 'type': 'array'}}, 'required': ['series'], 'title': 'BubbleChartDataModel', 'type': 'object'}, 'BubbleSeriesModel': {'additionalProperties': True, 'properties': {'name': {'title': 'Name', 'type': 'string'}, 'points': {'items': {'$ref': '#/$defs/PointWithRadius'}, 'title': 'Points', 'type': 'array'}}, 'required': ['name', 'points'], 'title': 'BubbleSeriesModel', 'type': 'object'}, 'FractionModel': {'properties': {'number_type': {'const': 'fraction', 'description': 'Type of the number to represent in infographic chart', 'title': 'Number Type', 'type': 'string'}, 'numerator': {'description': 'Numerator of the fraction', 'title': 'Numerator', 'type': 'integer'}, 'denominator': {'description': 'Denominator of the fraction', 'title': 'Denominator', 'type': 'integer'}}, 'required': ['number_type', 'numerator', 'denominator'], 'title': 'FractionModel', 'type': 'object'}, 'GraphModel': {'additionalProperties': True, 'properties': {'id': {'anyOf': [{'type': 'string'}, {'type': 'null'}], 'default': None, 'title': 'Id'}, 'name': {'title': 'Name', 'type': 'string'}, 'type': {'$ref': '#/$defs/GraphTypeEnum'}, 'presentation': {'anyOf': [{'type': 'string'}, {'type': 'null'}], 'default': None, 'title': 'Presentation'}, 'unit': {'anyOf': [{'type': 'string'}, {'type': 'null'}], 'default': 'Unit of the data in the graph. Example: %, kg, million USD, tonnes, etc.', 'title': 'Unit'}, 'data': {'anyOf': [{'$ref': '#/$defs/PieChartDataModel'}, {'$ref': '#/$defs/LineChartDataModel'}, {'$ref': '#/$defs/BubbleChartDataModel'}, {'$ref': '#/$defs/BarGraphDataModel'}, {'$ref': '#/$defs/TableDataModel'}], 'title': 'Data'}}, 'required': ['name', 'type', 'data'], 'title': 'GraphModel', 'type': 'object'}, 'GraphTypeEnum': {'enum': ['pie', 'bar', 'scatter', 'bubble', 'line', 'table'], 'title': 'GraphTypeEnum', 'type': 'string'}, 'HeadingModel': {'properties': {'heading': {'description': 'List item heading to show in slide body', 'maxLength': 35, 'title': 'Heading', 'type': 'string'}, 'description': {'description': 'Description of list item', 'maxLength': 125, 'minLength': 80, 'title': 'Description', 'type': 'string'}}, 'required': ['heading', 'description'], 'title': 'HeadingModel', 'type': 'object'}, 'IconInfographicModel': {'properties': {'chart_type': {'const': 'icon-infographic', 'description': 'Type of the infographic chart', 'title': 'Chart Type', 'type': 'string'}, 'value': {'anyOf': [{'$ref': '#/$defs/FractionModel'}, {'$ref': '#/$defs/PercentageModel'}], 'description': 'Fraction or percentage value to represent in icon infographic', 'title': 'Value'}, 'icon': {'description': 'Icon to show in infographic chart. leave it blank if icon-infographic chart is not selected', 'enum': ['person', 'female_person', 'male_person', 'baby', 'hand', 'tree', 'star', 'corn', 'meal', 'drink_bottle', 'cup', 'droplet', 'house', 'building', 'tent', 'car', 'bicycle', 'clock', 'banknote', 'briefcase', 'truck', 'airplane', 'laptop_computer', 'mobile_phone', 'light_bulb', 'spanner', 'fire', 'mortarboard', 'book', 'syringe', 'first_aid', 'globe'], 'title': 'Icon', 'type': 'string'}}, 'required': ['chart_type', 'value', 'icon'], 'title': 'IconInfographicModel', 'type': 'object'}, 'IconQueryCollectionModel': {'properties': {'queries': {'description': 'Multiple queries to generate simillar icons matching heading and description', 'items': {'type': 'string'}, 'maxItems': 3, 'minItems': 1, 'title': 'Queries', 'type': 'array'}}, 'required': ['queries'], 'title': 'IconQueryCollectionModel', 'type': 'object'}, 'InfographicChartModel': {'properties': {'title': {'description': 'Title of the infographic chart', 'maxLength': 35, 'title': 'Title', 'type': 'string'}, 'chart': {'anyOf': [{'$ref': '#/$defs/ProgressDialModel'}, {'$ref': '#/$defs/RadialProgressModel'}, {'$ref': '#/$defs/ProgressRingModel'}, {'$ref': '#/$defs/IconInfographicModel'}, {'$ref': '#/$defs/ProgressBarModel'}, {'$ref': '#/$defs/TextInfographicModel'}], 'description': 'Infographic chart to show in slide', 'title': 'Chart'}, 'description': {'description': 'Description of the infographic chart', 'title': 'Description', 'type': 'string'}}, 'required': ['title', 'chart', 'description'], 'title': 'InfographicChartModel', 'type': 'object'}, 'LineChartDataModel': {'additionalProperties': True, 'properties': {'categories': {'items': {'type': 'string'}, 'title': 'Categories', 'type': 'array'}, 'series': {'description': 'There should be no more than 3 series', 'items': {'$ref': '#/$defs/LineSeriesModel'}, 'title': 'Series', 'type': 'array'}}, 'required': ['categories', 'series'], 'title': 'LineChartDataModel', 'type': 'object'}, 'LineSeriesModel': {'additionalProperties': True, 'properties': {'name': {'title': 'Name', 'type': 'string'}, 'data': {'items': {'type': 'number'}, 'title': 'Data', 'type': 'array'}}, 'required': ['name', 'data'], 'title': 'LineSeriesModel', 'type': 'object'}, 'NumericalModel': {'properties': {'number_type': {'const': 'numerical', 'description': 'Type of the number to represent in infographic chart', 'title': 'Number Type', 'type': 'string'}, 'numerical': {'description': 'Numerical value to represent in infographic chart', 'title': 'Numerical', 'type': 'number'}, 'suffix': {'description': 'Suffix content to represent the number. Example: x, times, million dollars, etc', 'title': 'Suffix', 'type': 'string'}}, 'required': ['number_type', 'numerical', 'suffix'], 'title': 'NumericalModel', 'type': 'object'}, 'PercentageModel': {'properties': {'number_type': {'const': 'percentage', 'description': 'Type of the number to represent in infographic chart', 'title': 'Number Type', 'type': 'string'}, 'percentage': {'description': 'Percentage to represent in infographic chart', 'title': 'Percentage', 'type': 'number'}}, 'required': ['number_type', 'percentage'], 'title': 'PercentageModel', 'type': 'object'}, 'PieChartDataModel': {'additionalProperties': True, 'properties': {'categories': {'items': {'type': 'string'}, 'title': 'Categories', 'type': 'array'}, 'series': {'description': 'One series model with list of data', 'items': {'$ref': '#/$defs/PieChartSeriesModel'}, 'minItems': 1, 'title': 'Series', 'type': 'array'}}, 'required': ['categories', 'series'], 'title': 'PieChartDataModel', 'type': 'object'}, 'PieChartSeriesModel': {'additionalProperties': True, 'properties': {'data': {'items': {'type': 'number'}, 'title': 'Data', 'type': 'array'}}, 'required': ['data'], 'title': 'PieChartSeriesModel', 'type': 'object'}, 'PointWithRadius': {'additionalProperties': True, 'properties': {'x': {'title': 'X', 'type': 'number'}, 'y': {'title': 'Y', 'type': 'number'}, 'radius': {'anyOf': [{'type': 'number'}, {'type': 'null'}], 'default': None, 'title': 'Radius'}}, 'required': ['x', 'y'], 'title': 'PointWithRadius', 'type': 'object'}, 'ProgressBarModel': {'properties': {'chart_type': {'const': 'progress-bar', 'description': 'Type of the infographic chart', 'title': 'Chart Type', 'type': 'string'}, 'value': {'anyOf': [{'$ref': '#/$defs/FractionModel'}, {'$ref': '#/$defs/PercentageModel'}], 'description': 'Fraction or percentage value to represent in progress bar', 'title': 'Value'}}, 'required': ['chart_type', 'value'], 'title': 'ProgressBarModel', 'type': 'object'}, 'ProgressDialModel': {'properties': {'chart_type': {'const': 'progress-dial', 'description': 'Type of the infographic chart', 'title': 'Chart Type', 'type': 'string'}, 'value': {'anyOf': [{'$ref': '#/$defs/FractionModel'}, {'$ref': '#/$defs/PercentageModel'}], 'description': 'Fraction or percentage value to represent in progress dial', 'title': 'Value'}}, 'required': ['chart_type', 'value'], 'title': 'ProgressDialModel', 'type': 'object'}, 'ProgressRingModel': {'properties': {'chart_type': {'const': 'progress-ring', 'description': 'Type of the infographic chart', 'title': 'Chart Type', 'type': 'string'}, 'value': {'anyOf': [{'$ref': '#/$defs/FractionModel'}, {'$ref': '#/$defs/PercentageModel'}], 'description': 'Fraction or percentage value to represent in progress ring', 'title': 'Value'}}, 'required': ['chart_type', 'value'], 'title': 'ProgressRingModel', 'type': 'object'}, 'RadialProgressModel': {'properties': {'chart_type': {'const': 'radial-progress', 'description': 'Type of the infographic chart', 'title': 'Chart Type', 'type': 'string'}, 'value': {'anyOf': [{'$ref': '#/$defs/FractionModel'}, {'$ref': '#/$defs/PercentageModel'}], 'description': 'Fraction or percentage value to represent in radial progress', 'title': 'Value'}}, 'required': ['chart_type', 'value'], 'title': 'RadialProgressModel', 'type': 'object'}, 'SlideType': {'enum': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 'title': 'SlideType', 'type': 'integer'}, 'TableDataModel': {'additionalProperties': True, 'properties': {'categories': {'items': {'type': 'string'}, 'title': 'Categories', 'type': 'array'}, 'series': {'items': {'$ref': '#/$defs/BarSeriesModel'}, 'title': 'Series', 'type': 'array'}}, 'required': ['categories', 'series'], 'title': 'TableDataModel', 'type': 'object'}, 'TextInfographicModel': {'properties': {'chart_type': {'const': 'text', 'description': 'Type of the infographic chart', 'title': 'Chart Type', 'type': 'string'}, 'value': {'$ref': '#/$defs/NumericalModel', 'description': 'Numerical value to represent in text infographic'}}, 'required': ['chart_type', 'value'], 'title': 'TextInfographicModel', 'type': 'object'}, 'Type10Content': {'properties': {'title': {'description': 'Title of the slide', 'title': 'Title', 'type': 'string'}, 'infographics': {'description': 'List of infographic charts to show in slide', 'items': {'$ref': '#/$defs/InfographicChartModel'}, 'maxItems': 3, 'title': 'Infographics', 'type': 'array'}}, 'required': ['title', 'infographics'], 'title': 'Type10Content', 'type': 'object'}, 'Type11Content': {'properties': {'title': {'description': 'Title of the slide', 'title': 'Title', 'type': 'string'}, 'description': {'description': 'Slide content summary in about 30 words. This will be shown in text box in slide.', 'title': 'Description', 'type': 'string'}, 'infographics': {'description': 'Infographic chart to show in slide', 'items': {'$ref': '#/$defs/InfographicChartModel'}, 'maxItems': 3, 'title': 'Infographics', 'type': 'array'}}, 'required': ['title', 'description', 'infographics'], 'title': 'Type11Content', 'type': 'object'}, 'Type1Content': {'properties': {'title': {'description': 'Title of the slide', 'title': 'Title', 'type': 'string'}, 'body': {'description': 'Slide content summary in about 30 words. This will be shown in text box in slide.', 'maxLength': 230, 'minLength': 150, 'title': 'Body', 'type': 'string'}, 'image_prompts': {'description': 'Prompt used to generate image for this slide. Only one prompt is allowed.', 'items': {'type': 'string'}, 'maxItems': 1, 'minItems': 1, 'title': 'Image Prompts', 'type': 'array'}}, 'required': ['title', 'body', 'image_prompts'], 'title': 'Type1Content', 'type': 'object'}, 'Type2Content': {'properties': {'title': {'description': 'Title of the slide', 'title': 'Title', 'type': 'string'}, 'body': {'default': \"List items to show in slide's body\", 'items': {'$ref': '#/$defs/HeadingModel'}, 'maxItems': 4, 'minItems': 2, 'title': 'Body', 'type': 'array'}}, 'required': ['title'], 'title': 'Type2Content', 'type': 'object'}, 'Type4Content': {'properties': {'title': {'description': 'Title of the slide', 'title': 'Title', 'type': 'string'}, 'body': {'description': \"List items to show in slide's body\", 'items': {'$ref': '#/$defs/HeadingModel'}, 'maxItems': 3, 'minItems': 2, 'title': 'Body', 'type': 'array'}, 'image_prompts': {'description': 'Prompts used to generate image for each item in body', 'items': {'type': 'string'}, 'maxItems': 3, 'minItems': 2, 'title': 'Image Prompts', 'type': 'array'}}, 'required': ['title', 'body', 'image_prompts'], 'title': 'Type4Content', 'type': 'object'}, 'Type5Content': {'properties': {'title': {'description': 'Title of the slide', 'title': 'Title', 'type': 'string'}, 'body': {'description': 'Slide content summary in about 30 words. This will be shown in text box in slide.', 'title': 'Body', 'type': 'string'}, 'graph': {'$ref': '#/$defs/GraphModel', 'description': 'Graph to show in slide'}}, 'required': ['title', 'body', 'graph'], 'title': 'Type5Content', 'type': 'object'}, 'Type6Content': {'properties': {'title': {'description': 'Title of the slide', 'title': 'Title', 'type': 'string'}, 'description': {'description': 'Slide content summary in about 30 words. This will be shown in text box in slide.', 'title': 'Description', 'type': 'string'}, 'body': {'description': \"List items to show in slide's body\", 'items': {'$ref': '#/$defs/HeadingModel'}, 'maxItems': 3, 'minItems': 1, 'title': 'Body', 'type': 'array'}}, 'required': ['title', 'description', 'body'], 'title': 'Type6Content', 'type': 'object'}, 'Type7Content': {'properties': {'title': {'description': 'Title of the slide', 'title': 'Title', 'type': 'string'}, 'body': {'description': \"List items to show in slide's body\", 'items': {'$ref': '#/$defs/HeadingModel'}, 'maxItems': 4, 'minItems': 1, 'title': 'Body', 'type': 'array'}, 'icon_queries': {'description': 'One icon query collection model for every item in body to search icon', 'items': {'$ref': '#/$defs/IconQueryCollectionModel'}, 'maxItems': 4, 'minItems': 1, 'title': 'Icon Queries', 'type': 'array'}}, 'required': ['title', 'body', 'icon_queries'], 'title': 'Type7Content', 'type': 'object'}, 'Type8Content': {'properties': {'title': {'description': 'Title of the slide', 'title': 'Title', 'type': 'string'}, 'description': {'description': 'Slide content summary in about 30 words. This will be shown in text box in slide.', 'title': 'Description', 'type': 'string'}, 'body': {'default': \"List items to show in slide's body\", 'items': {'$ref': '#/$defs/HeadingModel'}, 'maxItems': 3, 'minItems': 1, 'title': 'Body', 'type': 'array'}, 'icon_queries': {'description': 'One icon query collection model for every item in body to search icon', 'items': {'$ref': '#/$defs/IconQueryCollectionModel'}, 'maxItems': 3, 'minItems': 1, 'title': 'Icon Queries', 'type': 'array'}}, 'required': ['title', 'description', 'icon_queries'], 'title': 'Type8Content', 'type': 'object'}, 'Type9Content': {'properties': {'title': {'description': 'Title of the slide', 'title': 'Title', 'type': 'string'}, 'body': {'default': \"List items to show in slide's body\", 'items': {'$ref': '#/$defs/HeadingModel'}, 'maxItems': 3, 'minItems': 1, 'title': 'Body', 'type': 'array'}, 'graph': {'$ref': '#/$defs/GraphModel', 'description': 'Graph to show in slide'}}, 'required': ['title', 'graph'], 'title': 'Type9Content', 'type': 'object'}}, 'properties': {'title': {'title': 'Title', 'type': 'string'}, 'n_slides': {'title': 'N Slides', 'type': 'integer'}, 'titles': {'items': {'type': 'string'}, 'title': 'Titles', 'type': 'array'}, 'slides': {'items': {'$ref': '#/$defs/BaseSlideModel'}, 'title': 'Slides', 'type': 'array'}}, 'required': ['title', 'n_slides', 'titles', 'slides'], 'title': 'Presentation', 'type': 'object'}
"""

user_content = """
Number of Slides: 10

 Presentation Language: English 

 Slide Titles: ['Introduction to Indian Budget', "Theme: 'Sabka Vikas'", 'Agriculture as Growth Engine', 'Aatmanirbharta in Pulses Mission', 'MSMEs: Growth Catalysts', 'Investment and Infrastructure Focus', 'Boosting Export Capabilities', 'Tax and Financial Reforms', 'Social Infrastructure Initiatives', 'Conclusion and Future Outlook'] 

 Reference Document: **The Budget for 2025-2026: Unlocking India's Potential for Enhanced Prosperity and Global Positioning**

Minister of Finance, Nirmala Sitharaman, presented the Budget for 2025-2026 on February 1, 2025, marking a significant milestone in the nation's journey towards Vikshit Bharat. As part of the presentation, the Minister introduced the concept of "four engines" - agriculture, MSMEs, investment, and exports. The proposal unfolds a comprehensive plan that aims to stimulate balanced growth across the regions, empower individuals, elevate household income, and foster private sector investments.

*Specific Highlights:*

*   **Total Expenditure:** Rs. 50.65 lakh crores, a 4.4% rise above the Revised Estimates of 2024-2025, is allocated for various programs under different sectors like Rural Prosperity and Resilience (Rs. 11,000 crores), Agricultural Growth (Rs. 21,400 crores including Rs. 7,000 crores under the Prime Minister Dhan-Dhaanya Krishi Yojana), Skill India Mission (Rs. 7,000 crores), Manufacturing and MSME sectors (Rs. 5,800 crores and Rs. 3,500 crores respectively).
*   **Sector-wise Allocation:**
    *   **Agriculture:**
        *   Rs. 21,400 crores allocated for development of agricultural districts
        *   Establishment of a National Mission for Edible Oilseed to achieve atmanirbhrata in edible oils
        *   Launch of a 6-year "Mission for Aatmanirbharta in Pulses"
    *   **Social Security Schemes:** Allocation of Rs. 8,500 crores for PM-NARENDRA Gaon
    *   **Education**:
        *   Increasing skilling programs in government schools from 28,884 to 50,000
        *   Atal Tinkering Labs: 50,000 such labs will be set up in 2025-2026
    *   **Urban Development**
        *   Launch of Urban Challenge Fund with a corpus of Rs. 1 lakh crores to implement "Cities as Growth Hubs, Creative Redevelopment of Cities" and "Water and Sanitation"
    *   **Healthcare:**
        *   Expansion of medical education: an additional 10,000 seats added next year
        *   Day Care Cancer Centres in all District Hospitals
        *   Enhancing the budget to Rs. 84,200 crores

### **Domestic MROs for Railway Goods**

In an effort to promote development of domestic MROs for railway goods, the July 2024 Budget extended the time limit for export of foreign origin goods that were imported for repairs, from 6 months to one year and further extendable by one year.

## **Maritime Development Fund**

A Maritime Development Fund with a corpus of `25,000 Crore was established. The Fund will have up to 49% contribution by the government, and the balance will be mobilized from ports and private sectors.

### **Maritime**
15% customs duty on fish hydrolysate for manufacture of fish and shrimp feeds; reduction in customs duty to 20% on Frozen Fish Paste (Surimi) for manufacture and export of surimi analogue products.
### **Handicrafts-**
Additional nine items to the list of duty-free inputs.
**Leather-**
20 % Exemption on Wet Blue Leather and customs duty on crust leather from export duty.
Free India saw a huge increase in both the strength of the economy and its people, leading to significantly easier logistics, and so to our trade prospects became high-quality with various other benefits to India.

The Budget also saw 'Exemption of Social Welfare Surcharge on 82 tariff lines that are subject to a cess.'
The Minister spoke about 'Investing in innovation' with a focus on the use of Artificial Intelligence and reducing the digital divide.

### **Impact of Budget on the Economy**

The Budget allocates Rs. 50.65 lakh crores towards various sectors and schemes, with a focus on rural development, agricultural growth, and social welfare.

### **Impact on Agricultural Growth:**

The Budget allocates Rs. 21,400 crores for the development of agricultural districts, launch of a National Mission for Edible Oilseed, and a 6-year "Mission for Aatmanirbharta in Pulses.

### **Impact on Rural India:**

The Budget allocates Rs. 11,000 crores for Rural Prosperity and Resilience, including infrastructure development, vocational training, and entrepreneurship programs for rural youth.

### **Impact on Education:**

The Budget allocates Rs. 5,500 crores for education, including the setting up of 50,000 Atal Tinkering Labs and increasing skilling programs in government schools from 28,884 to 50,000.

### New Tax Rates and Slab Rates Offered

**Income tax slab rates are to be changed.**

The Budget proposes the following tax slab rates:

*   0-4 lakh rupees: No income tax will be payable under the new regime.
*   4-8 lakh rupees: 5% income tax will be payable.
*   8-12 lakh rupees: 10% income tax will be payable.
*   12-16 lakh rupees: 15% income tax will be payable.
*   16-20 lakh rupees: 20% income tax will be payable.
*   20-24 lakh rupees: 25% income tax will be payable.
*   Above 24 lakh rupees: 30% income tax will be payable.

### **Rebate on Income Tax Propose**

It is proposed that resident individuals with total income up to Rs. 12 lakh will not pay any income tax due to a rebate. The rebate will be Rs. 12,000 for individuals with total income up to Rs. 12 lakh.

### **Key Changes in the Budget:**

*   **Customs Duty Changes**
    *   Tariff rate increase on key products including textiles, appliances, electronics.
    *   Levy of Social Welfare Surcharge on certain goods and services.
    *   Rate decrease for specified goods.
*   **Excise Duty Changes**
    *   Levy of cess/tax on specified goods.
*   **Service Tax/IGST Changes**
    *   Levy of additional 0.5% under reverse charge mechanism.
    *   Exemption of goods for specified purposes.
*   **Central Excise Duty Changes**
    *   Levy of additional duty of 7% on certain goods. 

 Graphs and Data: 1) 
 Name of graph/table: Budget 2025-2026 Tax Breakdown 
 Content: | PART – B              |    |  |
|-----------------------|----|--|
| Indirect taxes        | 20 |  |
| Direct Taxes          | 23 |  |
|                       |    |  |
| Annexure to Part-A   | 29 |  |
| Annexure to Part-B   | 31 |  | 
 Description: This table showcases the tax breakdown for the budget of 2025-2026, categorized under Part B. It lists the various taxes, including indirect and direct taxes, along with their respective values. Additional annexures related to the budget sections are also included for further clarification.
2) 
 Name of graph/table: Revised Tax Rate Structure 
 Content: | Income Range             | Tax Rate    |
|--------------------------|-------------|
| 0-4 lakh rupees          | Nil         |
| 4-8 lakh rupees          | 5 per cent  |
| 8-12 lakh rupees         | 10 per cent |
| 12-16 lakh rupees        | 15 per cent |
| 16-20 lakh rupees        | 20 per cent |
| 20-24 lakh rupees        | 25 per cent |
| Above 24 lakh rupees     | 30 per cent | 
 Description: This table outlines the proposed tax rate structure in the new tax regime, detailing the income ranges and associated tax rates. The structure establishes a progressive tax rate, starting from nil for incomes up to 4 lakh rupees, with increasing rates as income rises, culminating in a 30 percent tax rate for incomes above 24 lakh rupees.
3) 
 Name of graph/table: Customs Duty Rates 
 Content: | S. No | Commodity                                                                                                      | Rate of duties | From (per cent) | To (per cent)                        |
|-------|----------------------------------------------------------------------------------------------------------------|----------------|------------------|--------------------------------------|
| I     | Textiles                                                                                                     |                |                  |                                      |
| 1     | Knitted Fabrics covered under tariff items 6004 10 00, 6004 90 00, 6006 22 00, 6006 31 00, 6006 32 00, 6006 33 00, 6006 34 00, 6006 42 00 and 6006 90 00 | 10/20          | 20               | Rs 115 per kg, whichever is higher  |
| II    | Electronics                                                                                                  |                |                  |                                      |
| 1     | Interactive Flat Panel Display classified under tariff item 8528 59 00 (CBU)                                 | 10             | 20               |                                      |

| Type of Import          | Rate of Duties   | From (%) | To (%) |
|------------------------|------------------|----------|--------|
| (i) Above (CBU)       |                  | 25       | 20     |
| (ii) Semi-knocked down (SKD) |                  | 15       | 10     |
| (iii) Completely knocked down (CKD) |                  |          |        | 
 Description: This table outlines the duties applied to various commodities and their classifications, along with specific rates for different types of import scenarios such as CBU, SKD, and CKD. It specifies the duty rates applicable from a future date, providing insight into the evolving landscape of import tariffs as of 02.02.2025.
4) 
 Name of graph/table: Candle Products Table 
 Content: | Index | Product Description                                              | Remark                  |
|-------|----------------------------------------------------------------|------------------------|
| 5     | Candles, tapers and the like covered by                        | (+20 AIDC)            | 
 Description: This table contains a reference to candle products, specifically tapers and other similar items that are categorized for import or sales purposes. The table appears to list specific codes or identifiers related to these products. Understanding this categorization can help in locating or managing the inventory of candle products in a business.
5) 
 Name of graph/table: Flat Rolled Products and Tubes 
 Content: | No. | Description                                                                                       | Value (in %) | Unit |
|-----|---------------------------------------------------------------------------------------------------|---------------|------|
| 11. | OTS/MR type-flat rolled products of thickness less than 0.5 mm                                    | 27.5         | 15   |
| 12. | Other plates, sheets, strips of thickness less than 0.5mm                                        | 27.5         | 15   |
| 13. | Flat-rolled products in coils of thickness greater than or equal to 4.75 mm but not exceeding 10mm| 22.5         | 15   |
| 14. | Flat-rolled products in coils of thickness greater than or equal to 3 mm but less than 4.75 mm  | 22.5         | 15   |
| 15. | Flat-rolled products of stainless steel of width 600mm or more - Other nickel chrome austenitic  | 22.5         | 15   |
| 16. | Flat-rolled products of stainless steel of width 600mm or more - Other sheets and plates         | 22.5         | 15   |
| 17. | Flat-rolled products of other alloy steel grain oriented                                           | 20           | 15   |
| 18. | Other tubes or pipe fittings of stainless steel                                                   |               |      | 
 Description: This table lists various types of flat rolled products and tube fittings along with their corresponding thickness and unit values. It provides insights into the classification and pricing of different forms of steel materials used in manufacturing and construction. The entries cover a range of products such as plates, sheets, strips, and coils with specified thickness limits.
6) 
 Name of graph/table: Motorcycle and Auxiliary Motor Tariff Table 
 Content: | No. | Description                                                                                                                  | Effective Rate        | Tariff Rate          |
|-----|------------------------------------------------------------------------------------------------------------------------------|------------------------|----------------------|
| 32  | Motorcycles (including mopeds) and cycles fitted with an auxiliary motor, with or without side-cars under tariff heading 8711 | 100 (tariff)          | 70 (tariff)          | 
 Description: This table outlines the tariffs applicable to motorcycles, including those with auxiliary motors and sidecars, as specified under tariff heading 8711. It presents the effective rates alongside the respective tariffs for comprehensive understanding. Understanding these rates is essential for determining the costs involved in the import or export of such vehicles.
7) 
 Name of graph/table: Tariff Rate Reduction Table 
 Content: | 25 BCD + 2.5 SWS      | 20 BCD + 7.5 AIDC      |
|-----------------------|------------------------| 
 Description: This table illustrates the decrease in tariff rates with a reduction in the effective rate. It presents two scenarios: one with a base customs duty (BCD) of 25 and an additional service charge (SWS) of 2.5, and another with a base customs duty of 20 and an additional import duty charge (AIDC) of 7.5. The specifics of these scenarios reflect changes that may have implications for pricing and trade agreements.
8) 
 Name of graph/table: Export Duty on Leather 
 Content: | No. | Description                                                   | Rate                     |
|-----|---------------------------------------------------------------|--------------------------|
| 1   | Export duty on Leather [with effect from 2.2.2025]          | 10%                       |
| 2   | Exemption for crew baggage under tariff heading 9803       | Applicable                | 
 Description: This table outlines the export duty applicable on leather, effective from February 2, 2025. It specifies the duty rate along with exemptions for crew baggage under tariff heading 9803. It provides clarity on the financial obligations for exporters and relevant regulations.
9) 
 Name of graph/table: Rebate on Income Tax 
 Content: | Rebate Percentage |
|-------------------|
| 30 per cent       | 
 Description: This table represents a specific financial figure, indicating a rebate percentage that is applicable towards income tax. Understanding tax rebates is essential for individuals looking to optimize their tax returns and manage their finances effectively. This particular entry specifies a 30% rebate, which can significantly impact an individual's tax liability.
10) 
 Name of graph/table: Income Tax Deductions 
 Content: | Section | Description                                                                                              | Amount Limit (per year)                                       | Additional Notes                                    | Thresholds                               |
|---------|----------------------------------------------------------------------------------------------------------|--------------------------------------------------------------|--------------------------------------------------|-----------------------------------------|
| 194K    | Income in respect of units of a mutual fund or specified company or undertaking                          | 5,000/-                                                      |                                                  | 10,000/-                                |
| 194B    | Winnings from lottery, crossword puzzle etc. <br> 194BB - Winnings from horse race                       | Aggregate of amounts exceeding 10,000/- during the financial year |                                                  | 10,000/- in respect of a single transaction |
| 194D    | Insurance commission                                                                                      | 15,000/-                                                      |                                                  | 20,000/-                                |
| 194G    | Income by way of commission, prize etc. on lottery tickets                                              |                                                              | 15,000/-                                         | 20,000/-                                |
| 194H    | Commission or brokerage                                                                                   |                                                              | 15,000/-                                         | 20,000/-                                |
| 194-I   | Rent                                                                                                      |                                                              | 2,40,000/- during the financial year       | 50,000/- per month or part of a month |
| 194J    | Fee for professional or technical services                                                                  |                                                              |                                                  |                                          | 
 Description: This table outlines various income tax deductions related to different types of income as per specified sections of the Income Tax Act. It includes deductions for mutual fund income, lottery winnings, insurance commissions, professional services, and rent. The thresholds for each category are stated, along with the corresponding limits. 

 Story: No Story

"""


response_format = {
    "type": "json_schema",
    "json_schema": {
        "name": "presentation_schema",
        "schema": Presentation.model_json_schema()
    }
}


with client.beta.chat.completions.stream(
    model="ft:gpt-4o-2024-08-06:kinu:presenton:BCB4VOPF",
    messages=[
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": user_content,
        },
    ],
    response_format=response_format,
) as stream:
    for event in stream:
        if event.type == "content.delta":
            print(repair_json(event.snapshot))
        elif event.type == "content.done":
            print("content.done")
        elif event.type == "error":
            print("Error in stream:", event.error)

final_completion = stream.get_final_completion()
print("Final completion:", final_completion)