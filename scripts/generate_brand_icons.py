"""
Utility script to regenerate AthletIQs brand icons.

Creates a circular shield with the IQ monogram and exports all favicon
and app icon sizes used by the project.
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw


BASE_SIZE = 2048


def _draw_background(draw: ImageDraw.ImageDraw, size: int) -> None:
    outer_color = (14, 24, 60, 255)
    mid_color = (28, 56, 155, 255)
    inner_color = (37, 99, 235, 255)

    outer_margin = int(size * 0.06)
    mid_margin = int(size * 0.1)
    inner_margin = int(size * 0.16)

    draw.ellipse(
        (outer_margin, outer_margin, size - outer_margin, size - outer_margin),
        fill=outer_color,
    )
    draw.ellipse(
        (mid_margin, mid_margin, size - mid_margin, size - mid_margin),
        fill=mid_color,
    )
    draw.ellipse(
        (inner_margin, inner_margin, size - inner_margin, size - inner_margin),
        fill=inner_color,
    )


def _draw_letters(img: Image.Image, draw: ImageDraw.ImageDraw, size: int) -> None:
    letter_color = (250, 252, 255, 255)
    inner_color = (37, 99, 235, 255)

    # Stylised "I"
    i_width = size * 0.11
    i_top = size * 0.3
    i_bottom = size * 0.7
    i_center = size * 0.36
    i_radius = i_width * 0.45

    draw.rounded_rectangle(
        (i_center - i_width / 2, i_top, i_center + i_width / 2, i_bottom),
        radius=i_radius,
        fill=letter_color,
    )

    # Stylised "Q"
    q_cx = size * 0.66
    q_cy = size * 0.49
    q_radius = size * 0.19
    inner_radius = q_radius * 0.58

    draw.ellipse(
        (q_cx - q_radius, q_cy - q_radius, q_cx + q_radius, q_cy + q_radius),
        fill=letter_color,
    )
    draw.ellipse(
        (
            q_cx - inner_radius,
            q_cy - inner_radius,
            q_cx + inner_radius,
            q_cy + inner_radius,
        ),
        fill=inner_color,
    )

    # Q tail with single underline gesture (thin start, thicker mid, tapered end)
    tail = [
        (q_cx - q_radius * 0.18, q_cy + q_radius * 0.55),
        (q_cx + q_radius * 0.05, q_cy + q_radius * 0.4),
        (q_cx + q_radius * 0.55, q_cy + q_radius * 0.52),
        (q_cx + q_radius * 0.66, q_cy + q_radius * 0.66),
        (q_cx + q_radius * 0.32, q_cy + q_radius * 0.8),
        (q_cx - q_radius * 0.05, q_cy + q_radius * 0.72),
    ]
    draw.polygon(tail, fill=letter_color)

    # Clip the leading edge to keep it nimble
    clip = [
        (q_cx - q_radius * 0.2, q_cy + q_radius * 0.62),
        (q_cx - q_radius * 0.05, q_cy + q_radius * 0.62),
        (q_cx + q_radius * 0.3, q_cy + q_radius * 0.74),
        (q_cx + q_radius * 0.15, q_cy + q_radius * 0.82),
        (q_cx - q_radius * 0.12, q_cy + q_radius * 0.72),
    ]

    draw.polygon(clip, fill=inner_color)

    # Small notch on the tail for recognisable detail
    notch_radius_x = q_radius * 0.14
    notch_radius_y = q_radius * 0.09
    notch_cx = q_cx + q_radius * 0.2
    notch_cy = q_cy + q_radius * 0.63
    draw.ellipse(
        (
            notch_cx - notch_radius_x,
            notch_cy - notch_radius_y,
            notch_cx + notch_radius_x,
            notch_cy + notch_radius_y,
        ),
        fill=inner_color,
    )

    # Add a soft highlight across the top of the monogram
    highlight = Image.new("RGBA", img.size, (0, 0, 0, 0))
    highlight_draw = ImageDraw.Draw(highlight)
    highlight_color = (255, 255, 255, int(0.14 * 255))
    highlight_draw.ellipse(
        (
            size * 0.18,
            size * 0.14,
            size * 0.82,
            size * 0.58,
        ),
        fill=highlight_color,
    )
    img.alpha_composite(highlight)


def build_base_icon(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    _draw_background(draw, size)
    _draw_letters(image, draw, size)
    return image


def export_png(image: Image.Image, size: int, paths: Iterable[Path]) -> None:
    if size != image.width:
        resized = image.resize((size, size), Image.LANCZOS)
    else:
        resized = image.copy()

    for path in paths:
        path.parent.mkdir(parents=True, exist_ok=True)
        resized.save(path, format="PNG")


def export_favicon(image: Image.Image, public_dir: Path) -> None:
    sizes = [16, 32, 48]
    variants = []
    for size in sizes:
        if size == image.width:
            variants.append(image.copy())
        else:
            variants.append(image.resize((size, size), Image.LANCZOS))
    favicon_path = public_dir / "favicon.ico"
    variants[0].save(
        favicon_path,
        format="ICO",
        sizes=[img.size for img in variants],
    )


def main() -> None:
    project_root = Path(__file__).resolve().parents[1]
    public_dir = project_root / "public"

    base_image = build_base_icon(BASE_SIZE)

    targets: dict[int, list[str]] = {
        2048: ["logo-master-2048.png"],
        1024: ["logo-1024.png"],
        512: ["logo-512.png", "android-chrome-512.png"],
        256: ["logo-256.png"],
        192: ["android-chrome-192.png"],
        180: ["apple-touch-icon-180.png"],
        128: ["logo-128.png"],
        96: ["favicon-96.png"],
        64: ["favicon-64.png"],
        48: ["favicon-48.png"],
        32: ["favicon-32.png"],
        16: ["favicon-16.png"],
    }

    for size, names in targets.items():
        export_png(base_image, size, [public_dir / name for name in names])

    export_favicon(base_image, public_dir)


if __name__ == "__main__":
    main()
