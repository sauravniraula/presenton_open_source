from typing import List, Tuple
from ppt_generator.models.content_type_models import Type8Content
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
from ppt_generator.slide_designs.base_type_design import BaseTypeDesign


class Type8Design(BaseTypeDesign):

    def __init__(
        self,
        theme: PresentationTheme,
        content: Type8Content,
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

        left_position = 556
        section_height = round((720 - 80 * 2 - (count - 1) * 40) / count)

        body_models = []
        if count <= 2:
            for index in range(count):
                top_position = 80 + (index * (section_height + 40))
                body_models.extend(
                    [
                        PptxPictureBoxModel(
                            position=PptxPositionModel(
                                left=left_position,
                                top=top_position,
                                width=584,
                                height=section_height,
                            ),
                            picture=PptxPictureModel(
                                is_network=False,
                                path=getattr(self.theme.list_boxes, "type8"),
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
                                top=16, bottom=32, left=24, right=24
                            ),
                            position=PptxPositionModel.for_textbox(
                                left=left_position,
                                top=top_position + 64 + 32,
                                width=584,
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
        elif count == 3:
            for index in range(count):
                top_position = 80 + (index * (section_height + 40))

                body_models.extend(
                    [
                        PptxPictureBoxModel(
                            position=PptxPositionModel(
                                left=left_position,
                                top=top_position,
                                width=584,
                                height=section_height,
                            ),
                            picture=PptxPictureModel(
                                is_network=False,
                                path=getattr(self.theme.list_boxes, "type8"),
                            ),
                        ),
                        PptxPictureBoxModel(
                            position=PptxPositionModel(
                                left=left_position + 16,
                                top=top_position + 16,
                                width=section_height - 32,
                                height=section_height - 32,
                            ),
                            picture=self.icons[index],
                        ),
                        PptxTextBoxModel(
                            margin=PptxSpacingModel(
                                top=32, bottom=32, left=16, right=24
                            ),
                            position=PptxPositionModel.for_textbox(
                                left=left_position + section_height - 16,
                                top=top_position,
                                width=584 - 100 - 24 - 16,
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
