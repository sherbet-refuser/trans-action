#!/usr/bin/env python3

import argparse
from PIL import Image


def resize_and_pad(input_path, output_path):
    """Resizes and pads an image to exactly 1200x630 while keeping it centered."""
    target_size = (1200, 630)

    # Open the image
    img = Image.open(input_path)
    img = img.convert("RGB")
    bg_color = img.getpixel((0, 0))

    # Resize while keeping aspect ratio
    img.thumbnail((1200, 630), Image.LANCZOS)

    # Create a blank canvas
    new_img = Image.new("RGB", target_size, bg_color)

    # Calculate positioning to center the image
    x_offset = (target_size[0] - img.size[0]) // 2
    y_offset = (target_size[1] - img.size[1]) // 2

    # Paste resized image onto the canvas
    new_img.paste(img, (x_offset, y_offset))

    # Save result
    new_img.save(output_path)
    print(f"Saved preview image to {output_path}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Resize and pad an image to 1200x630 for social media previews."
    )
    parser.add_argument("input_path", help="Path to the input image file")
    parser.add_argument("output_path", help="Path to save the preview image")

    args = parser.parse_args()
    resize_and_pad(args.input_path, args.output_path)
