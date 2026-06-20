"""Vygeneruje všechny brandové ikony + og-banner z JEDNOHO zdrojového loga.

Použití:
    python3 scripts/gen_icons.py [cesta_ke_zdroji]

Výchozí zdroj: frontend/public/logo-source.png (sem nahraj svůj přesný originál).
Ideální zdroj: čtvercový PNG s logem (klidně na bílém pozadí – skript bílé
pozadí v rozích automaticky zprůhlední, aby ikony i banner vypadaly čistě).
"""
import sys
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUB = os.path.join(ROOT, "public")
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(PUB, "logo-source.png")

WHITE = (255, 255, 255)
LIGHT = (167, 196, 178)


def load_logo(path):
    """Načte logo, ořízne okraje a near-uniform (bílé) pozadí udělá průhledným."""
    img = Image.open(path).convert("RGBA")
    # sample rohů – pokud jsou stejné a světlé, považuj je za pozadí a zprůhledni
    px = img.load()
    w, h = img.size
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    r0, g0, b0 = corners[0][:3]
    uniform = all(abs(c[0] - r0) < 18 and abs(c[1] - g0) < 18 and abs(c[2] - b0) < 18 for c in corners)
    bright = (r0 + g0 + b0) / 3 > 215
    if uniform and bright:
        datas = img.getdata()
        out = []
        for item in datas:
            if abs(item[0] - r0) < 28 and abs(item[1] - g0) < 28 and abs(item[2] - b0) < 28:
                out.append((item[0], item[1], item[2], 0))
            else:
                out.append(item)
        img.putdata(out)
    # ořízni k neprůhledné oblasti
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    # dorovnej na čtverec s malým okrajem
    s = max(img.size)
    pad = int(s * 0.04)
    canvas = Image.new("RGBA", (s + 2 * pad, s + 2 * pad), (0, 0, 0, 0))
    canvas.alpha_composite(img, ((canvas.size[0] - img.size[0]) // 2, (canvas.size[1] - img.size[1]) // 2))
    return canvas


def export(master, size, path, bg=None):
    out = master.resize((size, size), Image.LANCZOS)
    if bg:
        base = Image.new("RGBA", (size, size), bg)
        base.alpha_composite(out)
        out = base
    out.save(path)


def main():
    if not os.path.exists(SRC):
        print(f"CHYBA: zdroj {SRC} neexistuje. Nahraj logo a spusť znovu.")
        sys.exit(1)
    master = load_logo(SRC)

    export(master, 512, os.path.join(PUB, "logo512.png"))
    export(master, 192, os.path.join(PUB, "logo192.png"))
    export(master, 512, os.path.join(PUB, "logo.png"))
    export(master, 180, os.path.join(PUB, "apple-touch-icon.png"), bg=(255, 255, 255, 255))

    fav = master.resize((64, 64), Image.LANCZOS)
    fav.save(os.path.join(PUB, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

    # OG banner 1200×630 s logem + brandem
    W, H = 1200, 630
    DARK, MID = (27, 67, 50), (45, 106, 79)
    og = Image.new("RGB", (W, H), DARK)
    dd = ImageDraw.Draw(og, "RGBA")
    for y in range(H):
        t = y / H
        dd.line([(0, y), (W, y)], fill=(int(DARK[0] + (MID[0] - DARK[0]) * t),
                                        int(DARK[1] + (MID[1] - DARK[1]) * t),
                                        int(DARK[2] + (MID[2] - DARK[2]) * t)))
    dd.ellipse([880, -160, 1380, 340], fill=(63, 163, 77, 38))
    dd.ellipse([-140, 360, 300, 800], fill=(63, 163, 77, 26))
    logo_og = master.resize((200, 200), Image.LANCZOS)
    og.paste(logo_og, (70, 70), logo_og)
    try:
        FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        FR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
        f_title = ImageFont.truetype(FB, 96)
        f_sub = ImageFont.truetype(FB, 33)
        f_meta = ImageFont.truetype(FR, 31)
        f_badge = ImageFont.truetype(FB, 29)
    except Exception:
        f_title = f_sub = f_meta = f_badge = ImageFont.load_default()
    dd.text((300, 96), "SeknuTo.cz", font=f_title, fill=WHITE)
    dd.text((72, 312), "Sekání trávy · pokládání trávníku · realizace zahrad", font=f_sub, fill=WHITE)
    dd.text((72, 374), "Stříhání keřů a kácení stromů · Dvůr Králové a okolí do 30 km", font=f_meta, fill=LIGHT)
    x = 72
    for p in ["Bezplatná obhlídka", "Cena předem", "730 588 372"]:
        tw = dd.textlength(p, font=f_badge)
        dd.rounded_rectangle([x, 470, x + tw + 48, 530], radius=30, fill=(63, 163, 77))
        dd.text((x + 24, 484), p, font=f_badge, fill=WHITE)
        x += tw + 48 + 20
    og.save(os.path.join(PUB, "og-image.jpg"), quality=90)

    print("Hotovo: favicon.ico, logo.png, logo192/512.png, apple-touch-icon.png, og-image.jpg")


if __name__ == "__main__":
    main()
