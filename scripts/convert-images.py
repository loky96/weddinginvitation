"""Create WebP renditions without resizing or overwriting the source images. Requires Pillow."""
from pathlib import Path
from PIL import Image, ImageChops, ImageOps

root = Path(__file__).resolve().parent.parent
sources = sorted(
    file
    for folder in (root / "assets", root / "puzzle-images")
    for file in folder.iterdir()
    if file.suffix.lower() in (".png", ".jpg", ".jpeg")
)
before = after = 0
for source in sources:
    target = source.with_suffix(".webp")
    with Image.open(source) as original:
        image = ImageOps.exif_transpose(original)
        transparent = "A" in image.getbands() or "transparency" in image.info
        image = image.convert("RGBA" if transparent else "RGB")
        quality = 94 if source.stem == "scroll-silk" else 90
        image.save(target, "WEBP", quality=quality, method=6, alpha_quality=100, exact=True)
        with Image.open(target) as result:
            assert result.size == image.size, f"Dimensions changed: {source.name}"
            if transparent:
                difference = ImageChops.difference(image.getchannel("A"), result.convert("RGBA").getchannel("A"))
                assert difference.getbbox() is None, f"Transparency changed: {source.name}"
    before += source.stat().st_size
    after += target.stat().st_size
    print(f"{source.relative_to(root)}: {source.stat().st_size // 1024} KB -> {target.stat().st_size // 1024} KB")

print(f"Converted {len(sources)} images; {before / 1_000_000:.1f} MB -> {after / 1_000_000:.1f} MB ({(1 - after / before) * 100:.1f}% smaller).")
