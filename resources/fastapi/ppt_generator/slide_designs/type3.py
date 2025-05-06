import random
from typing import List, Tuple
from ppt_generator.models.content_type_models import Type3Content
from ppt_generator.models.other_models import (
    PresentationTheme,
)
from ppt_generator.models.pptx_models import (
    PptxFillModel,
    PptxParagraphModel,
    PptxPictureBoxModel,
    PptxPictureModel,
    PptxPositionModel,
    PptxSlideModel,
    PptxSpacingModel,
    PptxTextBoxModel,
)
from ppt_generator.slide_designs.base_type_design import BaseTypeDesign


class Type3Design(BaseTypeDesign):

    def __init__(
        self,
        theme: PresentationTheme,
        content: Type3Content,
        pictures: List[PptxPictureModel],
    ):
        self.theme = theme
        self.content = content
        self.pictures = pictures

    @property
    def items_count(self):
        return len(self.content.body)

    @property
    def all_design_types(self):
        return [self.unordered, self.ordered]

    def unordered(self):
        return PptxSlideModel(
            shapes=[
                PptxPictureBoxModel(
                    position=PptxPositionModel(left=800, width=480, height=720),
                    picture=self.pictures[0],
                ),
                PptxTextBoxModel(
                    position=PptxPositionModel.for_textbox(top=50, left=40, width=720),
                    paragraphs=[
                        PptxParagraphModel.for_title(
                            self.theme, text=self.content.title
                        )
                    ],
                ),
                PptxTextBoxModel(
                    margin=PptxSpacingModel.all(20),
                    position=PptxPositionModel.for_textbox(top=170, left=40, width=340),
                    fill=PptxFillModel(color="dddddd"),
                    paragraphs=[
                        PptxParagraphModel.for_heading(
                            self.theme, self.content.body[0].heading
                        ),
                        PptxParagraphModel.for_description(
                            self.theme, self.content.body[0].description
                        ),
                    ],
                ),
                PptxTextBoxModel(
                    margin=PptxSpacingModel.all(20),
                    position=PptxPositionModel.for_textbox(
                        top=170, left=420, width=340
                    ),
                    fill=PptxFillModel(color="dddddd"),
                    paragraphs=[
                        PptxParagraphModel.for_heading(
                            self.theme, self.content.body[1].heading
                        ),
                        PptxParagraphModel.for_description(
                            self.theme, self.content.body[1].description
                        ),
                    ],
                ),
                PptxTextBoxModel(
                    margin=PptxSpacingModel.all(20),
                    position=PptxPositionModel.for_textbox(top=500, left=40, width=720),
                    fill=PptxFillModel(color="dddddd"),
                    paragraphs=[
                        PptxParagraphModel.for_heading(
                            self.theme, self.content.body[2].heading
                        ),
                        PptxParagraphModel.for_description(
                            self.theme, self.content.body[2].description
                        ),
                    ],
                ),
            ]
        )

    def ordered(self):
        return PptxSlideModel(
            shapes=[
                PptxPictureBoxModel(
                    position=PptxPositionModel(width=480, height=720),
                    picture=self.pictures[0],
                ),
                PptxTextBoxModel(
                    position=PptxPositionModel.for_textbox(top=50, left=520, width=720),
                    paragraphs=[
                        PptxParagraphModel.for_title(
                            self.theme, text=self.content.title
                        )
                    ],
                ),
                PptxTextBoxModel.for_list_bullet(self.theme, "1", top=170, left=520),
                PptxTextBoxModel(
                    position=PptxPositionModel.for_textbox(
                        top=160, left=580, width=290
                    ),
                    paragraphs=[
                        PptxParagraphModel.for_heading(
                            self.theme, self.content.body[0].heading
                        ),
                        PptxParagraphModel.for_description(
                            self.theme, self.content.body[0].description
                        ),
                    ],
                ),
                PptxTextBoxModel.for_list_bullet(self.theme, "2", top=170, left=890),
                PptxTextBoxModel(
                    position=PptxPositionModel.for_textbox(
                        top=160, left=950, width=290
                    ),
                    paragraphs=[
                        PptxParagraphModel.for_heading(
                            self.theme, self.content.body[1].heading
                        ),
                        PptxParagraphModel.for_description(
                            self.theme, self.content.body[1].description
                        ),
                    ],
                ),
                PptxTextBoxModel.for_list_bullet(self.theme, "3", top=520, left=520),
                PptxTextBoxModel(
                    position=PptxPositionModel.for_textbox(
                        top=510, left=580, width=600
                    ),
                    paragraphs=[
                        PptxParagraphModel.for_heading(
                            self.theme, self.content.body[2].heading
                        ),
                        PptxParagraphModel.for_description(
                            self.theme, self.content.body[2].description
                        ),
                    ],
                ),
            ]
        )
