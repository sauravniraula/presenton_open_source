import random
from typing import Optional, Tuple
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_AUTO_SHAPE_TYPE

from ppt_generator.models.content_type_models import Type2Content
from ppt_generator.models.other_models import PresentationTheme
from ppt_generator.models.pptx_models import (
    PptxAutoShapeBoxModel,
    PptxConnectorModel,
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
from ppt_generator.slide_designs.colors import Colors


class Type2Design(BaseTypeDesign):

    def __init__(self, theme: PresentationTheme, content: Type2Content):
        self.theme = theme
        self.content = content

    @property
    def items_count(self):
        return len(self.content.body)

    @property
    def all_design_types(self):
        return [self.basic, self.bordered, self.circle_line]

    # def get_design_types_from_count(self, count: int):
    #     if count <= 3:
    #         return self.all_design_types
    #     else:
    #         return [self.bordered, self.circle_line]

    def basic(self):
        # count = min(len(self.content.body), 3)
        count = len(self.content.body)
        section_width = round((1280 - 80 * 2 - (count - 1) * 40) / count)

        return PptxSlideModel(
            shapes=[
                PptxTextBoxModel(
                    position=PptxPositionModel.for_textbox(
                        left=80, top=150, width=1200
                    ),
                    paragraphs=[
                        PptxParagraphModel.for_title(
                            self.theme, self.content.title, True
                        )
                    ],
                ),
                *[
                    PptxTextBoxModel(
                        position=PptxPositionModel.for_textbox(
                            top=300,
                            left=80 + (index * (section_width + 40)),
                            width=section_width,
                        ),
                        paragraphs=[
                            PptxParagraphModel.for_heading(
                                self.theme, self.content.body[index].heading
                            ),
                            PptxParagraphModel.for_description(
                                self.theme, self.content.body[index].description, 20
                            ),
                        ],
                    )
                    for index in range(count)
                ],
            ]
        )

    def bordered(self):
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
        if count <= 3:
            section_width = round((1280 - 106 * 2 - (count - 1) * 40) / count)
            for index in range(count):
                left_position = 106 + (index * (section_width + 40))
                position_model = PptxPositionModel.for_textbox(
                    left=left_position,
                    top=195,
                    width=section_width,
                )
                box_position_model = PptxPositionModel(
                    left=left_position,
                    top=195,
                    width=section_width,
                )
                body_models.extend(
                    [
                        PptxPictureBoxModel(
                            position=box_position_model,
                            picture=PptxPictureModel(
                                is_network=False,
                                path=getattr(self.theme.list_boxes, f"type2_{count}"),
                            ),
                        ),
                        PptxTextBoxModel(
                            margin=PptxSpacingModel(
                                top=32, bottom=32, left=24, right=24
                            ),
                            position=position_model,
                            paragraphs=[
                                PptxParagraphModel.for_bullet(
                                    self.theme, f"0{index+1}"
                                ),
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
        elif count == 4:
            section_width = round((1280 - 106 * 2 - (2 - 1) * 40) / 2)
            for index in range(count):
                repeating_index = index % 2
                left_position = 106 + (repeating_index * (section_width + 40))
                top_position = 195 if index < 2 else 455

                body_models.extend(
                    [
                        PptxPictureBoxModel(
                            position=PptxPositionModel(
                                left=left_position,
                                top=top_position,
                                width=section_width,
                            ),
                            picture=PptxPictureModel(
                                is_network=False,
                                path=getattr(self.theme.list_boxes, f"type2_{count}"),
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
                                PptxParagraphModel.for_bullet(
                                    self.theme, f"0{index+1}"
                                ),
                            ],
                        ),
                        PptxTextBoxModel(
                            margin=PptxSpacingModel(
                                top=32, bottom=32, left=24, right=24
                            ),
                            position=PptxPositionModel.for_textbox(
                                left=left_position + 70,
                                top=top_position,
                                width=section_width - 80,
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

    def circle_line(self):
        count = len(self.content.body)

        title_paragraph_model = PptxParagraphModel.for_title(
            self.theme, self.content.title, True
        )
        title_paragraph_model.alignment = PP_ALIGN.CENTER
        title_model = PptxTextBoxModel(
            position=PptxPositionModel.for_textbox(left=106, top=80, width=1120),
            paragraphs=[title_paragraph_model],
        )

        body_width = 1280 - 122 * 2

        section_width = round((body_width - (count - 1) * 24) / count)

        connector_model = PptxConnectorModel(
            position=PptxPositionModel(
                left=122 + round(section_width / 2),
                top=255 + 32,
                width=body_width - section_width,
                height=0,
            ),
            color=self.theme.colors.connector,
        )

        body_models = []
        for index in range(count):
            left_position = 122 + index * (section_width + 24)
            circle_left_position = left_position + round(section_width / 2) - 32

            circle_box_paragraph = PptxParagraphModel.for_heading(
                self.theme, f"0{index+1}", Colors.white, size=self.theme.fonts.h6
            )

            body_models.extend(
                [
                    PptxAutoShapeBoxModel(
                        type=MSO_AUTO_SHAPE_TYPE.OVAL,
                        position=PptxPositionModel(
                            left=circle_left_position, top=255, height=64, width=64
                        ),
                        fill=PptxFillModel(color=self.theme.colors.primary),
                        paragraphs=[circle_box_paragraph],
                    ),
                    PptxTextBoxModel(
                        position=PptxPositionModel.for_textbox(
                            left=left_position,
                            width=section_width,
                            top=255 + 64,
                        ),
                        margin=PptxSpacingModel(top=32, bottom=32, left=24, right=24),
                        paragraphs=[
                            PptxParagraphModel.for_heading(
                                self.theme,
                                self.content.body[index].heading,
                                alignment=PP_ALIGN.CENTER,
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

        return PptxSlideModel(shapes=[title_model, connector_model, *body_models])
