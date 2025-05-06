import math
import os
from typing import List
import uuid
from PIL import Image, ImageDraw


class ImageProcessor:

    def __init__(self, images: List[str], temp_dir: str):
        self.temp_dir = temp_dir
        self.images = images

        self.joined_images: List[str] = []

    def create_blank_image(self, width, height) -> Image:
        return Image.new("RGB", (width, height), (255, 255, 255))

    def join_images(self, total_width=1024, total_height=1024):
        if not self.images:
            return

        num_output_images = math.ceil(len(self.images) / 4)
        joined_images = []
        for i in range(num_output_images):
            start_idx = i * 4
            end_idx = start_idx + 4
            current_group = self.images[start_idx:end_idx]
            joined_image = self.join_images_in_quadrants(
                current_group, total_width=total_width, total_height=total_height
            )
            joined_images.append(joined_image)

        self.joined_images = joined_images

    def join_images_in_quadrants(
        self, image_paths, total_width=1024, total_height=1024
    ):
        if len(image_paths) > 4:
            raise ValueError("Maximum of 4 image paths can be provided")

        images = []
        for path in image_paths:
            try:
                images.append(Image.open(path))
            except Exception as e:
                print(f"Error opening {path}: {e}")

        while len(images) < 4:
            images.append(self.create_blank_image(total_width // 2, total_height // 2))

        quadrant_width = total_width // 2
        quadrant_height = total_height // 2

        resized_images = []
        for img in images:
            img.thumbnail((quadrant_width, quadrant_height), Image.LANCZOS)

            bg = self.create_blank_image(quadrant_width, quadrant_height)

            paste_x = (quadrant_width - img.width) // 2
            paste_y = (quadrant_height - img.height) // 2
            bg.paste(img, (paste_x, paste_y))

            resized_images.append(bg)

        final_image = self.create_blank_image(total_width, total_height)

        final_image.paste(resized_images[0], (0, 0))
        final_image.paste(resized_images[1], (quadrant_width, 0))
        final_image.paste(resized_images[2], (0, quadrant_height))
        final_image.paste(resized_images[3], (quadrant_width, quadrant_height))

        # Draw the yellow dividing lines
        draw = ImageDraw.Draw(final_image)
        # Vertical line
        draw.line(
            [(quadrant_width - 5, 0), (quadrant_width - 5, total_height)],
            fill="yellow",
            width=10,
        )
        # Horizontal line
        draw.line(
            [(0, quadrant_height - 5), (total_width, quadrant_height - 5)],
            fill="yellow",
            width=10,
        )

        file_path = os.path.join(self.temp_dir, str(uuid.uuid4()) + ".jpg")
        final_image.save(file_path, format="JPEG")
        return file_path
