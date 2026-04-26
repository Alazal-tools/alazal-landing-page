"""One-shot image compressor for the Alazal landing page.

Generates WebP copies of every photo PNG / JPG referenced by the site,
prints a savings report, and leaves the originals untouched.

Run from the project root:    python _convert_to_webp.py
"""
import os, sys
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).parent
TARGETS = [
    # (folder, recursive?, quality)
    ("public/teachers",         False, 82),
    ("public/scenes",           True,  78),
    ("public",                  False, 82),  # gray-pattern.png, 1.png, teal-pattern.png
]
EXTS = {".png", ".jpg", ".jpeg"}
SKIP_NAMES = {"alazal-new-logo-w.png"}  # keep original — small + transparency-safe

def humans(n):
    for unit in ("B","KB","MB"):
        if n < 1024:
            return f"{n:6.1f} {unit}"
        n /= 1024
    return f"{n:6.1f} GB"

total_before = 0
total_after  = 0
converted    = 0
skipped      = 0

print("Converting → WebP\n")
for folder, recursive, quality in TARGETS:
    base = ROOT / folder
    if not base.exists():
        continue
    files = base.rglob("*") if recursive else base.glob("*")
    for f in files:
        if not f.is_file():
            continue
        if f.suffix.lower() not in EXTS:
            continue
        if f.name in SKIP_NAMES:
            continue
        out = f.with_suffix(".webp")
        if out.exists() and out.stat().st_mtime >= f.stat().st_mtime:
            skipped += 1
            continue
        try:
            with Image.open(f) as im:
                # Strip EXIF / ICC. Convert palette+alpha PNGs cleanly.
                if im.mode in ("P", "PA"):
                    im = im.convert("RGBA")
                save_kwargs = {"quality": quality, "method": 6}
                if im.mode == "RGBA":
                    save_kwargs["lossless"] = False  # still lossy webp w/ alpha
                im.save(out, "WEBP", **save_kwargs)
        except Exception as e:
            print(f"  ! {f.relative_to(ROOT)}: {e}")
            continue

        before = f.stat().st_size
        after  = out.stat().st_size
        total_before += before
        total_after  += after
        converted    += 1
        rel = f.relative_to(ROOT).as_posix()
        pct = 100 * (1 - after / before) if before else 0
        print(f"  {humans(before)} → {humans(after)}   -{pct:4.0f}%   {rel}")

print(f"\nConverted: {converted}   skipped (already up-to-date): {skipped}")
if total_before:
    print(f"Total before: {humans(total_before)}")
    print(f"Total after:  {humans(total_after)}")
    print(f"Saved:        {humans(total_before - total_after)}  "
          f"({100*(1-total_after/total_before):.0f}%)")
