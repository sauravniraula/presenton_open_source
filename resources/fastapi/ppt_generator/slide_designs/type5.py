from typing import Tuple
from graph_processor.models import GraphModel
from ppt_generator.models.content_type_models import Type5Content
from ppt_generator.models.other_models import PresentationTheme
from ppt_generator.models.pptx_models import (
    PptxFontModel,
    PptxGraphBoxModel,
    PptxParagraphModel,
    PptxPositionModel,
    PptxSlideModel,
    PptxSpacingModel,
    PptxTextBoxModel,
)
from ppt_generator.slide_designs.base_type_design import BaseTypeDesign


class Type5Design(BaseTypeDesign):

    def __init__(
        self, theme: PresentationTheme, content: Type5Content, graph: GraphModel
    ):
        self.theme = theme
        self.content = content
        self.graph = graph

    @property
    def all_design_types(self):
        return [self.default]

    def default(self):
        title_paragraph: PptxParagraphModel = PptxParagraphModel.for_title(
            self.theme, self.content.title
        )
        title_paragraph.spacing = PptxSpacingModel(bottom=30)

        return PptxSlideModel(
            shapes=[
                PptxTextBoxModel(
                    position=PptxPositionModel.for_textbox(top=200, left=40, width=590),
                    paragraphs=[
                        title_paragraph,
                        PptxParagraphModel.for_description(
                            self.theme, self.content.body
                        ),
                    ],
                ),
                PptxGraphBoxModel(
                    position=PptxPositionModel(
                        top=100, left=650, width=590, height=520
                    ),
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
                ),
            ]
        )
