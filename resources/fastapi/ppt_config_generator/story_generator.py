from typing import List, Optional
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

from api.routers.presentation.models import DocumentInterpretedReport
from graph_processor.models import GraphModel
from ppt_config_generator.models import (
    PresentationIdeaStoryModel,
    QuestionAnswerModel,
    StoryTypeEnum,
)
from ppt_generator.fix_validation_errors import get_validated_response


model = ChatOpenAI(model="gpt-4o").with_structured_output(
    PresentationIdeaStoryModel.model_json_schema()
)

user_prompt_text = {
    "type": "text",
    "text": """
                **Input:**
                - User Prompt: {prompt}
                - Output Language: {language}
                - Number of Slides: {n_slides}
                - Requirements: {question_answers}
                - Graphs: {graphs}
                - Spreadsheet Content: {spreadsheet_content}
                - Big Idea: {big_idea}
                - Story Type: {story_type}
                - Additional Information: {content}
            """,
}


def get_prompt_template():
    return ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """
                You are a data-storytelling expert. Formulate a big idea and a 3-minute story around it using the provided input and provide a structured output.

                # Terms
                - **Big Idea**: This is a single sentence representation of the story. It basically is, “what is found, and what should be done”
                - **3‐minute story**: Three minute story is the entire story that you get at the end. It is concise and to the point.

                # Types of Stories: 
                **heros_journey**: The Hero’s Journey (Data Edition)
                    - Use case: Showing how data led to a transformation
                    - Example: “We started with a messy dataset, unsure of what it meant. Then, a surprising trend emerged, leading to a major breakthrough in our strategy.”
                    - Best for: Data insights that lead to big changes
                    - Story sections: "Beginning", "Challenges", "Resolution"

                **before_after_bridge**: Before-After-Bridge (Data-Driven Change Story)
                    - Use case: Showing how data led to a solution
                    - Example: "We used to rely purely on gut instinct for our marketing decisions. Now our data-driven strategy has boosted conversions by 40%. What changed? We started analyzing real customer behavior data to understand exactly how people interact with our brand."
                    - Best for: Case studies, business transformation stories
                    - Story sections: "Before", "After", "Bridge"

                **pixar_formula**: The Pixar Formula (Storytelling with Trends & Insights)
                    - Use case: Presenting a data trend with a human angle
                    - Example: "Sometime before, businesses thought more ads meant more sales. Every day, they increased ad spend. But one day, data showed that engagement mattered more than spend. Because of that, we shifted our strategy, and our ROI skyrocketed."
                    - Best for: Trends, industry reports, insights presentations
                    - Story sections: "Sometime Before", "Every Day", "But One Day", "Because of That", "Untill Finally"

                **problem_agitate**: Problem-Agitate-Solution (Data-Backed Persuasion)
                    - Use case: Presenting a data-backed problem and solution
                    - Example: "Customer churn is a major issue. 65% of users leave due to poor onboarding. Our AI-powered onboarding tool increased retention by 30%."
                    - Best for: Persuasive presentations, sales decks, pitching data-backed solutions
                    - Story sections: "Problem", "Agitate", "Solution"

                **failure_redemption**: The Failure-Redemption Story (Learning from Data Mistakes)
                    - Use case: Showing how data helped correct a mistake
                    - Example: "We thought engagement was growing, but deeper analysis showed high churn. By analyzing user behavior, we fixed the issue and improved retention by 50%."
                    - Best for: Lessons learned, growth case studies
                    - Story sections: "Failure", "Redemption", "Future Challenges"

                **mystery_reveal**: The Mystery-Reveal Format (Surprising Data Story)
                    - Use case: Starting with a counterintuitive data point to hook the audience
                    - Example: "What if I told you that 90% of people ignore their analytics dashboards? Our research uncovered why—and what to do about it."
                    - Best for: Social media, keynote presentations, thought leadership
                    - Story sections: "Mystery", "Reveal", "Challenges"

                **one_big_idea**: The One Big Idea (Data-Driven Thought Leadership)
                    - Use case: Making a bold statement backed by data
                    - Example: "AI isn’t replacing jobs—it’s creating them. Our research shows that automation led to 20% more high-skill roles."
                    - Best for: TED-style talks, industry whitepapers, executive insights
                    - Story sections: "Introduction", "Deep Dive", "Conclusion"

                # Steps
                - Analyze the provided **Input**
                - Extract the **Big Idea** of the story.
                - Select a new story type if not provided in **Input**.
                - Create a data centric 3-minute story around that **Big Idea** in selected story type.
                - Divide the story into sections.

                # Notes
                - **Big Idea** should be the main focus of the story.
                - If story type is not provided, Select a story type that best fits the **Big Idea**.
                - Use provided **Input** data to formulate the story.
                - Analyze the trends from graphs and understand numerical metrics to include in the story.
                - Make sure the entire story is backed by revelant data and is data centric.
                - Make sure story section **content** matches the section **name**.
                - Use provided or new section names that fits the story type.
                """,
            ),
            (
                "user",
                [user_prompt_text],
            ),
        ],
    )


async def generate_big_idea_and_story(
    prompt: Optional[str],
    n_slides: int,
    language: Optional[str] = None,
    content: Optional[str] = None,
    question_answers: Optional[List[QuestionAnswerModel]] = None,
    big_idea: Optional[str] = None,
    story_type: Optional[StoryTypeEnum] = None,
    graphs: Optional[List[GraphModel]] = None,
    interpreted_report: Optional[DocumentInterpretedReport] = None,
) -> PresentationIdeaStoryModel:

    chain = get_prompt_template() | model

    interpreted_content = None
    if interpreted_report:
        interpreted_content = interpreted_report.to_gpt_input()

    requirements = [each.model_dump(mode="json") for each in (question_answers or [])]

    formatted_graphs = "\n".join([f"Name: {graph.name}\nData: {graph.markdown}\n\n" for graph in graphs])

    return await get_validated_response(
        chain,
        {
            "prompt": prompt,
            "n_slides": n_slides,
            "language": language or "English",
            "question_answers": requirements,
            "content": content,
            "big_idea": big_idea,
            "story_type": story_type.value if story_type else None,
            "graphs": formatted_graphs,
            "spreadsheet_content": interpreted_content,
        },
        PresentationIdeaStoryModel,
    )
