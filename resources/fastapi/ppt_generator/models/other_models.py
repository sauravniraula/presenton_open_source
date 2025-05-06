from enum import Enum

from ppt_generator.slide_designs.colors import (
    ClassicLightThemeColors,
    Colors,
    DarkThemeColors,
)
from ppt_generator.slide_designs.fonts import ClassicLightFonts, Fonts
from ppt_generator.slide_designs.list_boxes import (
    ClassicLightListBoxes,
    DarkListBoxes,
    ListBoxes,
)
from pydantic import BaseModel

class PresentationTheme(Enum):
    light = "light"
    dark = "dark"
    classic_light = "classic_light"

    @property
    def colors(self):
        match self:
            case self.light:
                return Colors
            case self.dark:
                return DarkThemeColors
            case self.classic_light:
                return ClassicLightThemeColors

    @property
    def fonts(self):
        match self:
            case self.light:
                return Fonts
            case self.dark:
                return Fonts
            case self.classic_light:
                return ClassicLightFonts

    @property
    def list_boxes(self):
        match self:
            case self.light:
                return ListBoxes
            case self.dark:
                return DarkListBoxes
            case self.classic_light:
                return ClassicLightListBoxes


# """
# 1. contains title, description and an image.
# 2. contains title and list of items.
# 3. contains title, list of items and an image.
# 4. contains title and list of items and multiple images.
# 5. contains title, description and a graph.
# 6. contains title, description and list of items.
# 7. contains title, list of items and icons.
# 8. contains title, description, list of items and icons.
# 9. contains title, list of items and a graph.
# """

class SlideType(Enum):

    type1 = 1
    type2 = 2
    type3 = 3
    type4 = 4
    type5 = 5
    type6 = 6
    type7 = 7
    type8 = 8
    type9 = 9
    type10 = 10
    type11 = 11


class SlideTypeModel(BaseModel):
    slide_type: SlideType