#!/usr/bin/env python3
"""Build the bitmap Helvetica web fonts used by 1994.html.

The first browser, WorldWideWeb on NeXT (1991), drew pages with Helvetica bitmap
screen fonts: 12pt body text on 14px lines, 14pt bold <h2> and 18pt bold <h1>
(its default.style). This script downloads the hand-drawn Adobe Helvetica bitmaps
that shipped with the X Window System at those sizes (permissively licensed; see
fonts/x11-sans/LICENSE.txt), turns every pixel into a square in a new font so one
font pixel is one CSS pixel, and writes fonts/x11-sans/x11-sans.css to apply each
font at its native size and line height.

Requires: python3 -m pip install fonttools skia-pathops brotli
Run from anywhere: python3 scripts/build_pixel_fonts.py
"""

import io
import tarfile
import urllib.request
from pathlib import Path

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib.removeOverlaps import removeOverlaps

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "fonts" / "x11-sans"
PACKAGE_URL = "https://www.x.org/releases/individual/font/font-adobe-{dpi}-1.0.4.tar.xz"

# Font units per bitmap pixel.
UNITS_PER_PIXEL = 64

# (family, style, CSS selector to apply it to, line height in px, X.Org package, BDF file).
# Sizes and line heights follow WorldWideWeb's Normal, Heading2 and Heading1 styles.
VARIANTS = [
    ("X11 Sans Body", "Regular", "body", 14, "75dpi", "helvR12.bdf"),
    ("X11 Sans Body", "Bold", None, None, "75dpi", "helvB12.bdf"),
    ("X11 Sans Body", "Italic", None, None, "75dpi", "helvO12.bdf"),
    ("X11 Sans Heading", "Bold", "h2", 14, "75dpi", "helvB14.bdf"),
    ("X11 Sans Title", "Bold", "h1", 18, "75dpi", "helvB18.bdf"),
]


def download_packages() -> dict:
    """Return {dpi: {member name: bytes}} for the BDF files and license we need."""
    wanted = {dpi: {bdf for *_, d, bdf in VARIANTS if d == dpi} | {"COPYING"} for *_, dpi, _ in VARIANTS}
    files = {}
    for dpi, names in wanted.items():
        data = urllib.request.urlopen(PACKAGE_URL.format(dpi=dpi)).read()
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:xz") as archive:
            files[dpi] = {
                Path(member.name).name: archive.extractfile(member).read()
                for member in archive.getmembers()
                if Path(member.name).name in names
            }
    return files


def parse_bdf(text: str) -> dict:
    """Parse a BDF bitmap font into its properties and {codepoint: glyph} map."""
    font = {"glyphs": {}}
    lines = iter(text.splitlines())
    for line in lines:
        key, _, value = line.partition(" ")
        if key in ("PIXEL_SIZE", "FONT_ASCENT", "FONT_DESCENT"):
            font[key] = int(value)
        elif key == "STARTCHAR":
            glyph = {}
            for line in lines:
                key, _, value = line.partition(" ")
                if key == "ENCODING":
                    glyph["codepoint"] = int(value.split()[0])
                elif key == "DWIDTH":
                    glyph["advance"] = int(value.split()[0])
                elif key == "BBX":
                    glyph["width"], glyph["height"], glyph["x"], glyph["y"] = map(int, value.split())
                elif key == "BITMAP":
                    glyph["rows"] = [int(next(lines), 16) for _ in range(glyph["height"])]
                elif key == "ENDCHAR":
                    break
            if glyph.get("codepoint", -1) >= 0x20:
                font["glyphs"][glyph["codepoint"]] = glyph
    return font


def draw_glyph(glyph) -> object:
    pen = TTGlyphPen(None)
    row_bits = (glyph["width"] + 7) // 8 * 8
    for row_index, bits in enumerate(glyph["rows"]):
        bottom = (glyph["y"] + glyph["height"] - 1 - row_index) * UNITS_PER_PIXEL
        top = bottom + UNITS_PER_PIXEL
        start = None
        for col in range(glyph["width"] + 1):
            lit = col < glyph["width"] and bits & (1 << (row_bits - 1 - col))
            if lit and start is None:
                start = col
            elif not lit and start is not None:
                left = (glyph["x"] + start) * UNITS_PER_PIXEL
                right = (glyph["x"] + col) * UNITS_PER_PIXEL
                pen.moveTo((left, bottom))
                pen.lineTo((left, top))
                pen.lineTo((right, top))
                pen.lineTo((right, bottom))
                pen.closePath()
                start = None
    return pen.glyph()


def build_variant(bdf_text: str, family: str, style: str) -> tuple:
    bdf = parse_bdf(bdf_text)
    size = bdf["PIXEL_SIZE"]
    upm = size * UNITS_PER_PIXEL

    glyph_order = [".notdef"]
    cmap, glyphs, advances = {}, {".notdef": TTGlyphPen(None).glyph()}, {".notdef": upm // 2}
    for codepoint, glyph in sorted(bdf["glyphs"].items()):
        name = f"uni{codepoint:04X}"
        glyph_order.append(name)
        cmap[codepoint] = name
        glyphs[name] = draw_glyph(glyph)
        advances[name] = glyph["advance"] * UNITS_PER_PIXEL

    ascent = bdf["FONT_ASCENT"] * UNITS_PER_PIXEL
    descent = -bdf["FONT_DESCENT"] * UNITS_PER_PIXEL
    bold = style == "Bold"
    italic = style == "Italic"

    builder = FontBuilder(upm, isTTF=True)
    builder.setupGlyphOrder(glyph_order)
    builder.setupCharacterMap(cmap)
    builder.setupGlyf(glyphs)
    builder.setupHorizontalMetrics({name: (advances[name], 0) for name in glyph_order})
    builder.setupHorizontalHeader(ascent=ascent, descent=descent)
    builder.setupNameTable(
        {
            "copyright": "Copyright 1984-1989, 1994 Adobe Systems Incorporated. "
            "Copyright 1988, 1994 Digital Equipment Corporation.",
            "familyName": family,
            "styleName": style,
            "psName": f"{family.replace(' ', '')}-{style}",
        }
    )
    builder.setupOS2(
        version=4,
        usWeightClass=700 if bold else 400,
        fsSelection=(0x20 if bold else 0) | (0x01 if italic else 0) | (0x40 if style == "Regular" else 0) | 0x80,
        sTypoAscender=ascent,
        sTypoDescender=descent,
        sTypoLineGap=0,
        usWinAscent=ascent,
        usWinDescent=-descent,
    )
    builder.setupPost()

    font = builder.font
    font["head"].macStyle = (0x01 if bold else 0) | (0x02 if italic else 0)
    removeOverlaps(font)
    glyf, hmtx = font["glyf"], font["hmtx"]
    for name in glyph_order:
        glyph = glyf[name]
        glyph.recalcBounds(glyf)
        hmtx[name] = (hmtx[name][0], glyph.xMin if glyph.numberOfContours else 0)

    out = OUT_DIR / f"{family.replace(' ', '')}-{style}.woff2"
    font.flavor = "woff2"
    font.save(out)
    return out, size


def write_stylesheet(sizes: dict):
    lines = ["/* Generated by scripts/build_pixel_fonts.py; edit VARIANTS there instead. */", ""]
    for family, style, *_ in VARIANTS:
        descriptors = f'font-family: "{family}"; src: url("{family.replace(" ", "")}-{style}.woff2") format("woff2");'
        if style == "Bold":
            descriptors += " font-weight: 700;"
        if style == "Italic":
            descriptors += " font-style: italic;"
        lines.append(f"@font-face {{ {descriptors} }}")
    lines.append("")
    for family, _, selector, line_height, _, _ in VARIANTS:
        if selector:
            lines.append(
                f'{selector} {{ font-family: "{family}", Helvetica, Arial, sans-serif; '
                f"font-size: {sizes[family]}px; line-height: {line_height}px; }}"
            )
    (OUT_DIR / "x11-sans.css").write_text("\n".join(lines) + "\n")


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    files = download_packages()
    sizes = {}
    for family, style, _, _, dpi, bdf_name in VARIANTS:
        out, size = build_variant(files[dpi][bdf_name].decode("latin-1"), family, style)
        sizes[family] = size
        print(f"{out.relative_to(ROOT)}  ({size}px, from {dpi}/{bdf_name})")
    (OUT_DIR / "LICENSE.txt").write_bytes(files["75dpi"]["COPYING"])
    write_stylesheet(sizes)


if __name__ == "__main__":
    main()
