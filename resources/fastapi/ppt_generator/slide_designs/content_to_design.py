from typing import List, Optional, Tuple
from graph_processor.models import GraphModel
from ppt_generator.models.content_type_models import SlideContentModel
from ppt_generator.models.other_models import PresentationTheme, SlideType
from ppt_generator.models.pptx_models import PptxPictureModel, PptxSlideModel
from ppt_generator.slide_designs.type1 import Type1Design
from ppt_generator.slide_designs.type2 import Type2Design
from ppt_generator.slide_designs.type3 import Type3Design
from ppt_generator.slide_designs.type4 import Type4Design
from ppt_generator.slide_designs.type5 import Type5Design
from ppt_generator.slide_designs.type6 import Type6Design
from ppt_generator.slide_designs.type7 import Type7Design
from ppt_generator.slide_designs.type8 import Type8Design
from ppt_generator.slide_designs.type9 import Type9Design


class ContentToDesign:

    def __init__(
        self,
        content_type: SlideType,
        content: SlideContentModel,
        theme: PresentationTheme,
        pictures: Optional[List[PptxPictureModel]] = None,
        icons: Optional[List[PptxPictureModel]] = None,
        graph: Optional[GraphModel] = None,
    ):
        self.content_type = content_type
        self.content = content
        self.theme = theme
        self.pictures = pictures
        self.icons = icons
        self.graph = graph

    def get_slide_design(
        self, design_index: Optional[int] = None
    ) -> Tuple[int, PptxSlideModel]:
        match self.content_type:
            case SlideType.type1:
                return Type1Design(
                    self.theme, self.content, self.pictures
                ).get_slide_design(design_index)
            case SlideType.type2:
                return Type2Design(self.theme, self.content).get_slide_design(
                    design_index
                )
            case SlideType.type3:
                return Type3Design(
                    self.theme, self.content, self.pictures
                ).get_slide_design(design_index)
            case SlideType.type4:
                return Type4Design(
                    self.theme, self.content, self.pictures
                ).get_slide_design(design_index)
            case SlideType.type5:
                return Type5Design(
                    self.theme, self.content, self.graph
                ).get_slide_design(design_index)
            case SlideType.type6:
                return Type6Design(self.theme, self.content).get_slide_design(
                    design_index
                )
            case SlideType.type7:
                return Type7Design(
                    self.theme, self.content, self.icons
                ).get_slide_design(design_index)
            case SlideType.type8:
                return Type8Design(
                    self.theme, self.content, self.icons
                ).get_slide_design(design_index)
            case SlideType.type9:
                return Type9Design(
                    self.theme, self.content, self.graph
                ).get_slide_design(design_index)
