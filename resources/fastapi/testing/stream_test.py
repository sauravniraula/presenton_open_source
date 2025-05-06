import time
from langchain_openai import ChatOpenAI

from ppt_config_generator.generator import get_prompt_template
from ppt_config_generator.models import PresentationConfigurationModel


model = ChatOpenAI(model="gpt-4o").with_structured_output(
    PresentationConfigurationModel
)


def run_test():
    start_time = time.time()

    prompt_template = get_prompt_template([])

    chain = prompt_template | model

    response_stream = chain.invoke(
        {
            "titles_with_graphs": [
                {"title": "Introduction: Adversarial Questions", "graph_id": None},
                {"title": "Models: Anthropic-LM, gpt-3.5, gpt-4", "graph_id": None},
                {"title": "Analysis: 0-shot, 5-shot, RLHF", "graph_id": None},
                {"title": "Accuracy: Model Performance", "graph_id": None},
                {"title": "Results: Comparison and Insights", "graph_id": None},
                {"title": "Conclusion: Key Findings", "graph_id": None},
            ],
            "summary": "",
            "graphs": [],
        }
    )

    # for each_chunk in response_stream:
    #     print(each_chunk)

    print(time.time() - start_time)
