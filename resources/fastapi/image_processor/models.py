from typing import List, Optional
from pydantic import BaseModel
from langchain_core.documents import Document


class ImageMetaDataModel(BaseModel):
    content: Optional[str] = None
    is_graph: bool

    def to_document(self):
        return Document(self.content)


class ImagesMetaDataModel(BaseModel):
    images: List[ImageMetaDataModel]
