from marker.converters.pdf import PdfConverter
from marker.models import create_model_dict
from marker.config.parser import ConfigParser


def run_test():
    config = {
        "output_format": "markdown",
        "save_images": False,
        "enable_ocr": False,
    }
    config_parser = ConfigParser(config)

    converter = PdfConverter(
        config=config_parser.generate_config_dict(),
        artifact_dict=create_model_dict(),
    )

    rendered = converter("/home/viristo/Documents/gpt-4.pdf")
    print(rendered)
