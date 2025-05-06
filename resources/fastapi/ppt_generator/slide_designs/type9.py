from typing import Tuple
from graph_processor.models import GraphModel
from ppt_generator.models.content_type_models import Type6Content
from ppt_generator.models.other_models import PresentationTheme
from ppt_generator.models.pptx_models import (
    PptxFontModel,
    PptxGraphBoxModel,
    PptxParagraphModel,
    PptxPictureBoxModel,
    PptxPictureModel,
    PptxPositionModel,
    PptxSlideModel,
    PptxSpacingModel,
    PptxTextBoxModel,
)
from ppt_generator.slide_designs.base_type_design import BaseTypeDesign


class Type9Design(BaseTypeDesign):

    def __init__(
        self, theme: PresentationTheme, content: Type6Content, graph: GraphModel
    ):
        self.theme = theme
        self.content = content
        self.graph = graph

    @property
    def all_design_types(self):
        return [self.default]

    def default(self):
        count = len(self.content.body)

        title_model = PptxTextBoxModel(
            position=PptxPositionModel.for_textbox(left=70, top=80, width=518),
            paragraphs=[
                PptxParagraphModel.for_title(
                    self.theme, self.content.title, size=self.theme.fonts.h3
                ),
            ],
        )

        graph_box_model = PptxGraphBoxModel(
            position=PptxPositionModel(left=70, top=250, width=518, height=470 - 80),
            category_font=PptxFontModel(
                name=self.theme.fonts.description_font,
                size=self.theme.fonts.p3,
                bold=False,
                color=self.theme.colors.paragraph,
            ),
            value_font=PptxFontModel(
                name=self.theme.fonts.description_font,
                size=self.theme.fonts.p3,
                bold=False,
                color=self.theme.colors.paragraph,
            ),
            legend_font=PptxFontModel(
                name=self.theme.fonts.description_font,
                size=self.theme.fonts.p3,
                bold=False,
                color=self.theme.colors.sub_heading,
            ),
            graph=self.graph,
        )

        body_models = []
        left_position = 629
        section_height = round((720 - 80 * 2 - (count - 1) * 40) / count)
        for index in range(count):
            top_position = 80 + index * (40 + section_height)
            position_model = PptxPositionModel(
                top=top_position, left=left_position, width=560, height=section_height
            )

            body_models.extend(
                [
                    PptxPictureBoxModel(
                        position=position_model,
                        picture=PptxPictureModel(
                            is_network=False,
                            path=getattr(self.theme.list_boxes, "type9"),
                        ),
                    ),
                    PptxTextBoxModel(
                        position=PptxPositionModel.for_textbox(
                            left=left_position,
                            top=top_position,
                            width=80,
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
                            left=left_position + 70, top=top_position, width=560 - 70
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

        return PptxSlideModel(shapes=[title_model, graph_box_model, *body_models])
