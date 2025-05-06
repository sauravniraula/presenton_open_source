from image_processor.utils import create_circle_image, create_rounded_rectangle_image


def run_test():
    icon_path = "assets/icons/placeholder.png"
    output_path = "assets/icons/output_placeholder.png"

    create_circle_image(icon_path, output_path, "9999f3", 0)
