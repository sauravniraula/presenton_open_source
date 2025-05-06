# from sseclient import SSEClient
import requests

url = "http://localhost:8000/ppt/generate"

data = {
    "presentation_id": "3c902a51-abab-41f0-8339-8fbda0a83b00",
    "theme": "dark",
    "title_with_charts": [
        {"title": "Introduction: Adversarial QA", "graph_id": None},
        {"title": "Models: Anthropic-LM, gpt-3.5, gpt-4", "graph_id": None},
        {"title": "Accuracy: 0-shot performance", "graph_id": None},
        {"title": "Accuracy: 5-shot performance", "graph_id": None},
        {"title": "Accuracy: RLHF performance", "graph_id": None},
        {"title": "Conclusion: Model Comparison", "graph_id": None},
    ],
}


def run_test():
    # messages = SSEClient(url)
    # for index, each in enumerate(messages):
    #     print(f"Response number - {index + 1}")
    #     print(each)
    #     print("-" * 20)
    pass
