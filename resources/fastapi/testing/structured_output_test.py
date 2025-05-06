from langchain_openai import ChatOpenAI
from pydantic import BaseModel, Field


class QuestionAnswer(BaseModel):
    question: str = Field(description="Question part of question-answer style joke")
    answer: str = Field(description="Answer part of question-answer style joke")


model = ChatOpenAI(model="gpt-4o-mini")
structured_model = model.with_structured_output(QuestionAnswer.model_json_schema())


def run_test():
    response = structured_model.invoke("Give me a joke")
    print(type(response))
    print(response)

    response = QuestionAnswer(**response)

    print(type(response))
    print(response)
