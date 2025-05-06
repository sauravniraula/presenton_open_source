import random
from typing import List, Optional, Tuple
from ppt_generator.models.content_type_models import Type1Content
from ppt_generator.models.other_models import (
    PresentationTheme,
)
from ppt_generator.models.pptx_models import (
    PptxParagraphModel,
    PptxPictureBoxModel,
    PptxPictureModel,
    PptxPositionModel,
    PptxSlideModel,
    PptxSpacingModel,
    PptxTextBoxModel,
)
from ppt_generator.slide_designs.base_type_design import BaseTypeDesign


class Type1Design(BaseTypeDesign):

    def __init__(
        self,
        theme: PresentationTheme,
        content: Type1Content,
        pictures: List[PptxPictureModel],
    ):
        self.theme = theme
        self.content = content
        self.pictures = pictures

    @property
    def all_design_types(self):
        return [self.centered_image_right]

    def full_image_left(self):
        title_paragraph: PptxParagraphModel = PptxParagraphModel.for_title(
            self.theme, self.content.title
        )
        title_paragraph.spacing = PptxSpacingModel(bottom=30)

        return PptxSlideModel(
            shapes=[
                PptxPictureBoxModel(
                    position=PptxPositionModel(width=480, height=720),
                    picture=self.pictures[0],
                ),
                PptxTextBoxModel(
                    position=PptxPositionModel.for_textbox(
                        top=200, left=520, width=720
                    ),
                    paragraphs=[
                        title_paragraph,
                        PptxParagraphModel.for_description(
                            self.theme, self.content.body
                        ),
                    ],
                ),
            ]
        )

    def centered_image_right(self):
        title_paragraph: PptxParagraphModel = PptxParagraphModel.for_title(
            self.theme, self.content.title
        )
        title_paragraph.spacing = PptxSpacingModel(bottom=30)

        return PptxSlideModel(
            shapes=[
                PptxTextBoxModel(
                    position=PptxPositionModel.for_textbox(top=200, left=80, width=528),
                    paragraphs=[
                        title_paragraph,
                        PptxParagraphModel.for_description(
                            self.theme, self.content.body
                        ),
                    ],
                ),
                PptxPictureBoxModel(
                    position=PptxPositionModel(top=80, left=672, width=528, height=574),
                    border_radius=[20] * 4,
                    picture=self.pictures[0],
                ),
            ]
        )
