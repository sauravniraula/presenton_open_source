from dotenv import load_dotenv
from pdf2image import convert_from_path
from pptx import Presentation
from pptx.util import Pt
from pptx.enum.text import PP_ALIGN
from pptx.shapes.autoshape import Shape

from ppt_generator.models.content_type_models import (
    HeadingModel,
    Type2Content,
)
from ppt_generator.models.other_models import PresentationTheme, SlideType
from ppt_generator.models.pptx_models import PptxPictureModel, PptxPresentationModel
from ppt_generator.pptx_presentation_creator import PptxPresentationCreator
from ppt_generator.slide_designs.content_to_design import ContentToDesign
from ppt_generator.slide_designs.type2 import Type2Design

load_dotenv()


def run_test():
    theme = PresentationTheme.light

    content = Type2Content(
        title="How to colonize sun?",
        body=[
            HeadingModel(
                heading="How to colonize sun?",
                description="Colonizing the Sun is not feasible due to the extreme conditions present there. The Sun's surface (photosphere) has temperatures of about 5,500°C (9,932°F).",
            ),
            HeadingModel(
                heading="How to colonize sun?",
                description="Colonizing the Sun is not feasible due to the extreme conditions present there. The Sun's surface (photosphere) has temperatures of about 5,500°C (9,932°F).",
            ),
            HeadingModel(
                heading="How to colonize sun?",
                description="Colonizing the Sun is not feasible due to the extreme conditions present there. The Sun's surface (photosphere) has temperatures of about 5,500°C (9,932°F).",
            ),
        ],
        # image_prompts=["lakdjf", "ajldkf"],
    )

    content_desigin = Type2Design(
        theme,
        content,
    )

    ppt_creator = PptxPresentationCreator(
        PptxPresentationModel(slides=[content_desigin.basic()], theme=theme),
        temp_dir="temp",
    )
    ppt_creator.create_ppt()
    ppt_creator.save("temp/output.pptx")
