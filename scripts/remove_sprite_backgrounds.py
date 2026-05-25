#!/usr/bin/env python3
"""Remove edge-connected paper backgrounds from RGBA sprite strips.

The generated character sheets in public/assets/sprites were exported as fully
opaque PNGs with light gray/white card backgrounds. Phaser can already render
transparent PNGs correctly, so this utility rewrites those background pixels to
alpha 0 while preserving the real artwork and frame dimensions.
"""

from __future__ import annotations

import argparse
import struct
import zlib
from collections import deque
from pathlib import Path

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
RGBA_CHANNELS = 4


class PngError(RuntimeError):
    pass


def read_rgba_png(path: Path) -> tuple[int, int, bytearray]:
    data = path.read_bytes()
    if not data.startswith(PNG_SIGNATURE):
        raise PngError(f"{path} is not a PNG")

    pos = len(PNG_SIGNATURE)
    width = height = None
    bit_depth = color_type = interlace = None
    idat_chunks: list[bytes] = []

    while pos < len(data):
        if pos + 8 > len(data):
            raise PngError(f"{path} has a truncated chunk header")

        chunk_length = struct.unpack(">I", data[pos : pos + 4])[0]
        chunk_type = data[pos + 4 : pos + 8]
        chunk_data = data[pos + 8 : pos + 8 + chunk_length]
        pos += 12 + chunk_length

        if chunk_type == b"IHDR":
            width, height, bit_depth, color_type, _compression, _filter, interlace = struct.unpack(
                ">IIBBBBB", chunk_data
            )
        elif chunk_type == b"IDAT":
            idat_chunks.append(chunk_data)
        elif chunk_type == b"IEND":
            break

    if width is None or height is None:
        raise PngError(f"{path} is missing IHDR")
    if bit_depth != 8 or color_type != 6 or interlace != 0:
        raise PngError(
            f"{path} must be non-interlaced 8-bit RGBA; got bit_depth={bit_depth}, "
            f"color_type={color_type}, interlace={interlace}"
        )

    raw = zlib.decompress(b"".join(idat_chunks))
    stride = width * RGBA_CHANNELS
    expected = height * (stride + 1)
    if len(raw) != expected:
        raise PngError(f"{path} decoded to {len(raw)} bytes, expected {expected}")

    pixels = bytearray(width * height * RGBA_CHANNELS)
    previous = bytearray(stride)
    source_index = 0

    for y in range(height):
        filter_type = raw[source_index]
        source_index += 1
        scanline = raw[source_index : source_index + stride]
        source_index += stride
        recon = bytearray(stride)

        for x in range(stride):
            left = recon[x - RGBA_CHANNELS] if x >= RGBA_CHANNELS else 0
            up = previous[x]
            upper_left = previous[x - RGBA_CHANNELS] if x >= RGBA_CHANNELS else 0
            value = scanline[x]

            if filter_type == 0:
                pass
            elif filter_type == 1:
                value = (value + left) & 0xFF
            elif filter_type == 2:
                value = (value + up) & 0xFF
            elif filter_type == 3:
                value = (value + ((left + up) // 2)) & 0xFF
            elif filter_type == 4:
                predictor = paeth_predictor(left, up, upper_left)
                value = (value + predictor) & 0xFF
            else:
                raise PngError(f"{path} uses unsupported PNG filter {filter_type}")

            recon[x] = value

        start = y * stride
        pixels[start : start + stride] = recon
        previous = recon

    return width, height, pixels


def paeth_predictor(left: int, up: int, upper_left: int) -> int:
    p = left + up - upper_left
    pa = abs(p - left)
    pb = abs(p - up)
    pc = abs(p - upper_left)

    if pa <= pb and pa <= pc:
        return left
    if pb <= pc:
        return up
    return upper_left


def chunk(kind: bytes, payload: bytes) -> bytes:
    return (
        struct.pack(">I", len(payload))
        + kind
        + payload
        + struct.pack(">I", zlib.crc32(kind + payload) & 0xFFFFFFFF)
    )


def write_rgba_png(path: Path, width: int, height: int, pixels: bytearray) -> None:
    stride = width * RGBA_CHANNELS
    raw_rows = bytearray()
    for y in range(height):
        raw_rows.append(0)  # filter type 0 keeps the writer simple and deterministic.
        start = y * stride
        raw_rows.extend(pixels[start : start + stride])

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    path.write_bytes(
        PNG_SIGNATURE
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", zlib.compress(bytes(raw_rows), level=9))
        + chunk(b"IEND", b"")
    )


def is_background_pixel(r: int, g: int, b: int, a: int) -> bool:
    if a <= 8:
        return True

    luma = 0.2126 * r + 0.7152 * g + 0.0722 * b
    chroma = max(r, g, b) - min(r, g, b)

    # The exported backgrounds are neutral paper tones with slight JPEG-like
    # color drift. Keep this conservative and only remove pixels connected to
    # the sheet edge so bright in-sprite highlights survive.
    return (
        (luma >= 248 and chroma <= 36)
        or (luma >= 235 and chroma <= 48)
        or (luma >= 210 and chroma <= 24)
        or (r >= 228 and g >= 224 and b >= 208 and chroma <= 58)
    )


def transparent_background_mask(width: int, height: int, pixels: bytearray) -> bytearray:
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def enqueue_if_background(x: int, y: int) -> None:
        pixel_index = y * width + x
        if visited[pixel_index]:
            return

        offset = pixel_index * RGBA_CHANNELS
        if is_background_pixel(
            pixels[offset],
            pixels[offset + 1],
            pixels[offset + 2],
            pixels[offset + 3],
        ):
            visited[pixel_index] = 1
            queue.append((x, y))

    for x in range(width):
        enqueue_if_background(x, 0)
        enqueue_if_background(x, height - 1)
    for y in range(height):
        enqueue_if_background(0, y)
        enqueue_if_background(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            enqueue_if_background(x - 1, y)
        if x + 1 < width:
            enqueue_if_background(x + 1, y)
        if y > 0:
            enqueue_if_background(x, y - 1)
        if y + 1 < height:
            enqueue_if_background(x, y + 1)

    return visited


def remove_background(path: Path, dry_run: bool) -> tuple[int, int]:
    width, height, pixels = read_rgba_png(path)
    background_mask = transparent_background_mask(width, height, pixels)
    changed = 0

    for pixel_index, is_background in enumerate(background_mask):
        if not is_background:
            continue

        alpha_offset = pixel_index * RGBA_CHANNELS + 3
        if pixels[alpha_offset] != 0:
            pixels[alpha_offset] = 0
            changed += 1

    if changed and not dry_run:
        write_rgba_png(path, width, height, pixels)

    return changed, width * height


def iter_sprite_pngs(root: Path) -> list[Path]:
    return sorted(
        path
        for path in root.rglob("*.png")
        if path.is_file() and "source" not in path.parts
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "root",
        nargs="?",
        default="public/assets/sprites",
        type=Path,
        help="Directory containing game-ready sprite PNGs",
    )
    parser.add_argument("--dry-run", action="store_true", help="Print changes without writing files")
    args = parser.parse_args()

    root = args.root
    total_changed = 0
    total_pixels = 0

    for path in iter_sprite_pngs(root):
        changed, pixels = remove_background(path, args.dry_run)
        total_changed += changed
        total_pixels += pixels
        if changed:
            pct = changed / pixels * 100
            print(f"{path}: transparent {changed}/{pixels} pixels ({pct:.1f}%)")

    print(f"Done. Transparent pixels written: {total_changed}/{total_pixels}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
