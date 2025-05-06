from typing import List, Tuple
from pptx.enum.text import PP_ALIGN

from ppt_generator.models.content_type_models import Type7Content
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


class Type7Design(BaseTypeDesign):

    def __init__(
        self,
        theme: PresentationTheme,
        content: Type7Content,
        icons: List[PptxPictureModel],
    ):
        self.theme = theme
        self.content = content
        self.icons = icons

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
        if count <= 3:
            section_width = round((1280 - 106 * 2 - (count - 1) * 40) / count)
            for index in range(count):
                left_position = 106 + (index * (section_width + 40))
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
                                path=getattr(self.theme.list_boxes, f"type7_{count}"),
                            ),
                        ),
                        PptxPictureBoxModel(
                            position=PptxPositionModel(
                                left=round(left_position + section_width / 2 - 64 / 2),
                                top=195 + 32,
                                width=64,
                                height=64,
                            ),
                            picture=self.icons[index],
                        ),
                        PptxTextBoxModel(
                            margin=PptxSpacingModel(
                                top=32, bottom=32, left=24, right=24
                            ),
                            position=PptxPositionModel.for_textbox(
                                left=left_position,
                                top=195 + 64 + 24,
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
                                path=getattr(self.theme.list_boxes, f"type7_{count}"),
                            ),
                        ),
                        PptxPictureBoxModel(
                            position=PptxPositionModel(
                                left=left_position + 24,
                                top=top_position + 32,
                                width=64,
                                height=64,
                            ),
                            picture=self.icons[index],
                        ),
                        PptxTextBoxModel(
                            margin=PptxSpacingModel(
                                top=32, bottom=32, left=24, right=24
                            ),
                            position=PptxPositionModel.for_textbox(
                                left=left_position + 84,
                                top=top_position,
                                width=section_width - 84,
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
