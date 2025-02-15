#!/usr/bin/env python3
import sys
from pathlib import Path
from PIL import Image


def convert_to_webp(input_path, output_path):
    img = Image.open(input_path)
    img.save(output_path, "WEBP", quality=90)  # Adjust quality if needed
    print(f"Saved {output_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: convert_webp.py <input_path>")
        sys.exit(1)
    input_path = sys.argv[1]
    p = Path(input_path)
    output_path = str(p.with_suffix(".webp"))
    convert_to_webp(input_path, output_path)
