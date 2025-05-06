from pydantic import BaseModel, Field


class FileMarkdown(BaseModel):
    markdown: str = Field(description="Markdown extracted from file")
