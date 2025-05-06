from typing import Tuple
from pptx.enum.text import PP_ALIGN

from ppt_generator.models.content_type_models import Type6Content
from ppt_generator.models.other_models import PresentationTheme
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


class Type6Design(BaseTypeDesign):

    def __init__(self, theme: PresentationTheme, content: Type6Content):
        self.theme = theme
        self.content = content

    @property
    def items_count(self):
        return len(self.content.body)

    @property
    def all_design_types(self):
        return [self.default]

    def default(self):
        count = len(self.content.body)

        description_model = PptxParagraphModel.for_description(
            self.theme, self.content.description
        )
        description_model.spacing = PptxSpacingModel(top=20)
        title_model = PptxTextBoxModel(
            position=PptxPositionModel.for_textbox(left=80, top=200, width=404),
            paragraphs=[
                PptxParagraphModel.for_title(self.theme, self.content.title),
                description_model,
            ],
        )

        body_models = []
        left_position = 556
        section_height = round((720 - 80 * 2 - (count - 1) * 40) / count)
        for index in range(count):
            top_position = 80 + index * (40 + section_height)
            position_model = PptxPositionModel(
                top=top_position, left=left_position, width=584, height=section_height
            )

            body_models.extend(
                [
                    PptxPictureBoxModel(
                        position=position_model,
                        picture=PptxPictureModel(
                            is_network=False,
                            path=getattr(self.theme.list_boxes, f"type6"),
                        ),
                    ),
                    PptxTextBoxModel(
                        position=PptxPositionModel.for_textbox(
                            left=left_position,
                            top=top_position,
                            width=90,
                        ),
                        margin=PptxSpacingModel(top=32, bottom=24, left=16),
                        text_wrap=False,
                        paragraphs=[
                            PptxParagraphModel.for_bullet(self.theme, f"0{index+1}"),
                        ],
                    ),
                    PptxTextBoxModel(
                        margin=PptxSpacingModel(top=32, bottom=32, left=24, right=24),
                        position=PptxPositionModel.for_textbox(
                            left=left_position + 70, top=top_position, width=584 - 70
                        ),
                        paragraphs=[
                            PptxParagraphModel.for_heading(
                                self.theme, self.content.body[index].heading
                            ),
                            PptxParagraphModel.for_description(
                                self.theme, self.content.body[index].description, 20
                            ),
                        ],
                    ),
                ]
            )

        return PptxSlideModel(shapes=[title_model, *body_models])
