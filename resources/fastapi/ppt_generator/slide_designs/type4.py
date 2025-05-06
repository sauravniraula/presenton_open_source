from typing import List, Tuple
from ppt_generator.models.pptx_models import (
    PptxParagraphModel,
    PptxPictureBoxModel,
    PptxPictureModel,
    PptxPositionModel,
    PptxSlideModel,
    PptxSpacingModel,
    PptxTextBoxModel,
    PresentationTheme,
)
from ppt_generator.models.content_type_models import Type4Content

from pptx.enum.text import PP_ALIGN

from ppt_generator.slide_designs.base_type_design import BaseTypeDesign


class Type4Design(BaseTypeDesign):

    def __init__(
        self,
        theme: PresentationTheme,
        content: Type4Content,
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
        return [self.default]

    def default(self):
        count = len(self.content.body)

        title_paragraph_model = PptxParagraphModel.for_title(
            self.theme, self.content.title, True
        )
        title_paragraph_model.alignment = PP_ALIGN.CENTER
        title_model = PptxTextBoxModel(
            position=PptxPositionModel.for_textbox(left=106, top=80, width=1120),
            paragraphs=[title_paragraph_model],
        )

        body_models = []
        section_width = round((1280 - 106 * 2 - (count - 1) * 40) / count)
        for index in range(count):
            left_position = 106 + (index * (section_width + 40))

            box_left_position = left_position
            box_section_width = section_width
            if self.theme == PresentationTheme.light:
                if count == 2:
                    box_left_position = left_position + 16
                    box_section_width = section_width - 30

                if count == 3:
                    box_left_position = left_position + 9
                    box_section_width = section_width - 17

            body_models.extend(
                [
                    PptxPictureBoxModel(
                        position=PptxPositionModel(
                            left=left_position,
                            top=195,
                            width=section_width,
                            height=416,
                        ),
                        picture=PptxPictureModel(
                            is_network=False,
                            path=getattr(self.theme.list_boxes, f"type4"),
                        ),
                    ),
                    PptxPictureBoxModel(
                        position=PptxPositionModel(
                            left=box_left_position,
                            top=195,
                            width=box_section_width,
                            height=195,
                        ),
                        border_radius=[32, 32, 0, 0],
                        picture=self.pictures[index],
                    ),
                    PptxTextBoxModel(
                        margin=PptxSpacingModel(top=24, bottom=32, left=24, right=24),
                        position=PptxPositionModel.for_textbox(
                            left=left_position,
                            top=195 + 195,
                            width=section_width,
                        ),
                        paragraphs=[
                            PptxParagraphModel.for_heading(
                                self.theme,
                                self.content.body[index].heading,
                                None,
                                PP_ALIGN.CENTER,
                            ),
                            PptxParagraphModel.for_description(
                                self.theme,
                                self.content.body[index].description,
                                20,
                                PP_ALIGN.CENTER,
                            ),
                        ],
                    ),
                ]
            )

        return PptxSlideModel(shapes=[title_model, *body_models])
