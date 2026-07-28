#!/usr/bin/env python3
"""
SVG → PNG high-resolution converter.

Usage:
    # 单文件转换（默认 4x 缩放，约 384 DPI）
    python svg2png.py input.svg -o output.png

    # 指定缩放倍数
    python svg2png.py input.svg -o output.png --scale 8

    # 指定 DPI
    python svg2png.py input.svg -o output.png --dpi 600

    # 指定输出宽度（高度等比缩放）
    python svg2png.py input.svg -o output.png --width 1024

    # 批量转换整个目录
    python svg2png.py icons/ -o png_output/ --scale 4

Dependencies:
    pip install cairosvg
"""

import argparse
import sys
from pathlib import Path

import cairosvg


def svg_to_png(
    svg_path: Path,
    output_path: Path,
    *,
    scale: float | None = None,
    dpi: float | None = None,
    output_width: int | None = None,
    output_height: int | None = None,
) -> None:
    """
    Convert a single SVG file to a high-resolution PNG.

    Resolution priority:
    1. output_width / output_height — exact pixel dimensions
    2. dpi — dots per inch (default SVG DPI is 96)
    3. scale — multiplier over the SVG's intrinsic size (default: 4)
    """
    svg_bytes = svg_path.read_bytes()

    kwargs: dict = {}
    if output_width:
        kwargs["output_width"] = output_width
    if output_height:
        kwargs["output_height"] = output_height
    if dpi:
        kwargs["dpi"] = dpi
    if scale:
        kwargs["scale"] = scale

    # Fallback: high-resolution by default
    if not any([output_width, output_height, dpi, scale]):
        kwargs["scale"] = 4.0

    cairosvg.svg2png(bytestring=svg_bytes, write_to=str(output_path), **kwargs)

    # Report result
    from PIL import Image as PILImage

    img = PILImage.open(output_path)
    file_size = output_path.stat().st_size
    print(f"  ✓ {svg_path.name} → {output_path.name}  "
          f"({img.width}×{img.height}, {file_size / 1024:.1f} KB)")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Convert SVG to high-resolution PNG",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s logo.svg -o logo.png                     # 4x scale (default high-res)
  %(prog)s logo.svg -o logo.png --scale 8           # 8x scale
  %(prog)s logo.svg -o logo.png --dpi 300           # 300 DPI
  %(prog)s logo.svg -o logo.png --width 2048        # fixed width
  %(prog)s icons/ -o png_output/ --scale 4          # batch convert
        """,
    )
    parser.add_argument("input", type=str, help="SVG file or directory containing SVGs")
    parser.add_argument("-o", "--output", type=str, required=True,
                        help="Output path (PNG file or directory)")
    parser.add_argument("--scale", type=float, default=None,
                        help="Scale factor (e.g. 4 = 4x native size). Default: 4")
    parser.add_argument("--dpi", type=float, default=None,
                        help="DPI for output (optional)")
    parser.add_argument("--width", type=int, default=None,
                        help="Output pixel width (height auto-scaled)")
    parser.add_argument("--height", type=int, default=None,
                        help="Output pixel height (width auto-scaled)")

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"Error: input path '{input_path}' does not exist", file=sys.stderr)
        sys.exit(1)

    # Determine mode: single file or batch
    if input_path.is_dir():
        svg_files = sorted(input_path.glob("*.svg"))
        if not svg_files:
            print(f"Error: no SVG files found in '{input_path}'", file=sys.stderr)
            sys.exit(1)

        output_path.mkdir(parents=True, exist_ok=True)

        print(f"Converting {len(svg_files)} SVG{'s' if len(svg_files) > 1 else ''} "
              f"from '{input_path}' → '{output_path}/'\n")
        for svg_file in svg_files:
            out_file = output_path / f"{svg_file.stem}.png"
            svg_to_png(svg_file, out_file,
                       scale=args.scale, dpi=args.dpi,
                       output_width=args.width, output_height=args.height)
        print(f"\nDone — {len(svg_files)} files converted.")
    else:
        if output_path.suffix.lower() != ".png":
            output_path = output_path.with_suffix(".png")

        output_path.parent.mkdir(parents=True, exist_ok=True)

        svg_to_png(input_path, output_path,
                   scale=args.scale, dpi=args.dpi,
                   output_width=args.width, output_height=args.height)
        print("Done.")


if __name__ == "__main__":
    main()
