import random
from typing import List, Optional, Tuple
from ppt_generator.models.pptx_models import (
    PptxPictureBoxModel,
    PptxPictureModel,
    PptxPositionModel,
    PptxSlideModel,
)


class BaseTypeDesign:

    @property
    def items_count(self):
        return 0

    @property
    def all_design_types(self) -> List:
        raise NotImplementedError(f"{self}.all_design_types not implemented")

    def get_design_types_from_count(self, _: int) -> List:
        return self.all_design_types

    def get_slide_design(
        self, design_index: Optional[int] = None
    ) -> Tuple[int, PptxSlideModel]:
        count = self.items_count

        if design_index:
            selected_design = self.all_design_types[design_index]
        else:
            available_designs = self.get_design_types_from_count(count)
            selected_design = random.choice(available_designs)

        return self.all_design_types.index(selected_design), selected_design()
