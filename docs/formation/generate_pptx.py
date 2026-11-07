"""Génère les présentations de formation CARZONE à partir des contenus Markdown.

Entrée  : docs/formation/presentations/*.contenu.md
Images  : docs/formation/captures/**/*.png
Sortie  : docs/formation/presentations/*.pptx

Le script ne modifie pas les contenus. Il produit des fichiers PowerPoint 16:9
avec le logo et la charte CARZONE.
"""

from __future__ import annotations

import re
from pathlib import Path

from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import MSO_ANCHOR, PP_ALIGN
from pptx.oxml.ns import qn
from pptx.util import Inches, Pt
from lxml import etree

ROOT = Path(__file__).resolve().parent
PRESENTATION_DIR = ROOT / "presentations"
CAPTURE_DIR = ROOT / "captures"
LOGO = ROOT.parent.parent / "apps" / "web" / "public" / "brand" / "carzone-logo.png"

CARBON = RGBColor(11, 15, 25)
CARBON_SOFT = RGBColor(22, 28, 39)
RED = RGBColor(225, 29, 72)
RED_DEEP = RGBColor(190, 18, 60)
GOLD = RGBColor(212, 175, 55)
WHITE = RGBColor(255, 255, 255)
MUTED = RGBColor(220, 225, 235)
SLATE = RGBColor(148, 163, 184)
GREEN = RGBColor(74, 222, 128)

FONT = "Aptos"
FONT_TITLE = "Aptos Display"

CAPTURE_RE = re.compile(r"captures/[A-Za-z0-9_./-]+\.png")
SLIDE_RE = re.compile(r"^## Slide (\d+)\s*-\s*(.+)$")


def clean_text(value: str) -> str:
    value = value.replace("**", "").replace("`", "")
    value = value.replace("\u2014", "-")
    return value.strip()


def parse_content(path: Path) -> list[dict]:
    lines = path.read_text(encoding="utf-8").splitlines()
    slides: list[dict] = []
    current: dict | None = None
    skip_capture_note = False
    for raw_line in lines:
        line = raw_line.strip()
        match = SLIDE_RE.match(line)
        if match:
            if current:
                slides.append(current)
            current = {"number": int(match.group(1)), "title": clean_text(match.group(2)), "bullets": [], "captures": []}
            skip_capture_note = False
            continue
        if current is None:
            continue
        captures = CAPTURE_RE.findall(line)
        for capture in captures:
            if capture not in current["captures"]:
                current["captures"].append(capture)
        if skip_capture_note:
            if not line:
                skip_capture_note = False
            continue
        if "captures/" in line or line.startswith("*Capture") or line.startswith("Capture à"):
            skip_capture_note = True
            continue
        if not line or line.startswith("#") or line.startswith("Format cible") or line.startswith("Chaque"):
            continue
        if line.startswith(("- ", "* ")):
            current["bullets"].append(clean_text(line[2:]))
        elif re.match(r"^\d+[.)]\s+", line):
            current["bullets"].append(clean_text(line))
        elif line.startswith("Capture à intégrer") or line.startswith("Capture à"):
            continue
        elif current["bullets"]:
            current["bullets"][-1] = f"{current['bullets'][-1]} {clean_text(line)}"
        else:
            current["bullets"].append(clean_text(line))
    if current:
        slides.append(current)
    return slides


def add_fade_transition(slide):
    """Ajoute une transition douce pour une présentation animée sans surcharge."""
    transition = etree.SubElement(slide.element, qn("p:transition"))
    transition.set("spd", "med")
    etree.SubElement(transition, qn("p:fade"))


def set_background(slide, color: RGBColor) -> None:
    fill = slide.background.fill
    fill.solid()
    fill.fore_color.rgb = color


def add_box(slide, left, top, width, height, color, shape=MSO_SHAPE.RECTANGLE):
    box = slide.shapes.add_shape(shape, Inches(left), Inches(top), Inches(width), Inches(height))
    box.fill.solid()
    box.fill.fore_color.rgb = color
    box.line.fill.background()
    return box


def add_text(slide, text, left, top, width, height, size, color=WHITE, bold=False, align=PP_ALIGN.LEFT, font=FONT):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    frame = box.text_frame
    frame.clear()
    frame.word_wrap = True
    paragraph = frame.paragraphs[0]
    paragraph.text = text
    paragraph.alignment = align
    run = paragraph.runs[0]
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.color.rgb = color
    return box


def add_logo(slide, left=0.55, top=0.35, height=0.75):
    if LOGO.exists():
        slide.shapes.add_picture(str(LOGO), Inches(left), Inches(top), height=Inches(height))


def add_footer(slide, page: int, deck_label: str):
    add_box(slide, 0, 7.28, 13.333, 0.22, CARBON)
    add_text(slide, "CARZONE SARL - Formation", 0.55, 7.31, 8.5, 0.18, 8.5, SLATE)
    add_text(slide, f"{page:02d}", 12.15, 7.28, 0.55, 0.2, 9, GOLD, bold=True, align=PP_ALIGN.RIGHT)


def add_header(slide, title: str, section: str = "FORMATION CARZONE"):
    set_background(slide, CARBON)
    add_box(slide, 0, 0, 13.333, 0.12, RED)
    add_text(slide, section, 0.55, 0.3, 8, 0.25, 9, GOLD, bold=True)
    add_text(slide, title, 0.55, 0.62, 12.2, 0.75, 25, WHITE, bold=True, font=FONT_TITLE)
    add_box(slide, 0.55, 1.35, 1.1, 0.05, RED)


def add_bullets(slide, bullets: list[str], left, top, width, height, font_size=15):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    frame = box.text_frame
    frame.clear()
    frame.word_wrap = True
    frame.vertical_anchor = MSO_ANCHOR.TOP
    usable = [bullet for bullet in bullets if bullet]
    if not usable:
        usable = ["Point à présenter oralement."]
    for index, bullet in enumerate(usable):
        paragraph = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        if re.match(r"^\d+[.)]\s+", bullet):
            paragraph.text = bullet
        else:
            paragraph.text = f"•  {bullet}"
        paragraph.level = 0
        paragraph.space_after = Pt(7)
        paragraph.line_spacing = 1.05
        for run in paragraph.runs:
            run.font.name = FONT
            run.font.size = Pt(font_size)
            run.font.color.rgb = MUTED
            run.font.bold = False
    return box


def add_capture(slide, capture: str, left, top, width, height):
    path = ROOT / capture
    if not path.exists():
        return False
    slide.shapes.add_picture(str(path), Inches(left), Inches(top), width=Inches(width), height=Inches(height))
    return True


def role_sections(path: Path) -> tuple[str, dict[int, list[str]]]:
    title = "Fiche de rôle"
    sections: dict[int, list[str]] = {}
    current = 0
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if line.startswith("# "):
            title = clean_text(line[2:])
            continue
        match = re.match(r"^##\s+(\d+)\.\s+(.+)$", line)
        if match:
            current = int(match.group(1))
            sections[current] = [clean_text(match.group(2))]
            continue
        if current and line:
            if line.startswith("###"):
                continue
            if line.startswith(("- ", "* ")):
                sections[current].append(clean_text(line[2:]))
            elif re.match(r"^\d+[.)]\s+", line):
                sections[current].append(clean_text(line))
            elif line.startswith("*Capture") or "captures/" in line:
                continue
            else:
                sections[current].append(clean_text(line))
    return title, sections


def make_role_slide(prs, title: str, bullets: list[str], image: str | None, page: int, deck_label: str):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, title)
    if image:
        add_capture(slide, image, 6.15, 1.65, 6.55, 4.85)
        add_bullets(slide, bullets, 0.6, 1.7, 5.25, 4.9, 13.5)
        add_text(slide, "Capture d'écran réelle de l'application", 6.15, 6.6, 6.5, 0.25, 8.5, SLATE, align=PP_ALIGN.RIGHT)
    else:
        add_bullets(slide, bullets, 0.6, 1.7, 12.0, 4.9, 15)
    add_footer(slide, page, deck_label)
    add_fade_transition(slide)
    return slide


def create_role_deck(role_path: Path) -> Path:
    title, sections = role_sections(role_path)
    role_slug = role_path.stem
    role_name = title.replace("Fiche de rôle - ", "")
    captures_dir = CAPTURE_DIR / role_slug
    captures = sorted(captures_dir.glob("*.png")) if captures_dir.exists() else []
    capture_paths = [f"captures/{role_slug}/{capture.name}" for capture in captures]
    non_login_captures = [path for path in capture_paths if "connexion" not in path.lower()]
    access_capture = non_login_captures[0] if non_login_captures else (capture_paths[0] if capture_paths else None)
    task_capture = non_login_captures[1] if len(non_login_captures) > 1 else (non_login_captures[-1] if non_login_captures else None)
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    make_cover(prs, role_name, "Parcours de formation dédié - connexion, tâches et exercices")
    objective = [item for item in sections.get(1, [])[1:] if item]
    access = [item for item in sections.get(2, [])[1:] if item]
    limits = [item for item in sections.get(3, [])[1:] if item]
    make_role_slide(prs, "Votre rôle et vos responsabilités", objective[:7], None, 2, role_slug)
    make_role_slide(prs, "Ce que vous pouvez faire", access[:8], access_capture, 3, role_slug)
    make_role_slide(prs, "Les limites de votre accès", limits[:7], None, 4, role_slug)
    make_role_slide(prs, "Vos tâches quotidiennes", sections.get(5, [])[1:9], task_capture, 5, role_slug)
    make_role_slide(prs, "Tâches hebdomadaires et bonnes pratiques", (sections.get(6, [])[1:] + sections.get(7, [])[1:])[:9], None, 6, role_slug)
    make_role_slide(prs, "Exercice pratique et checklist", (sections.get(8, [])[1:] + sections.get(9, [])[1:])[:10], None, 7, role_slug)
    make_role_slide(prs, "Supports associés et contacts", [
        "Module commun : 00-accueil-formation-commune",
        "Complétez votre parcours avec les modules de votre famille de métiers.",
        "Support CARZONE : +229 01 92 61 61 61 / +229 01 63 70 00 00",
        "Email : contact@topcarzone.com / direction@topcarzone.com",
    ], None, 8, role_slug)
    output_dir = PRESENTATION_DIR / "roles"
    output_dir.mkdir(parents=True, exist_ok=True)
    output = output_dir / f"{role_slug}.pptx"
    prs.save(output)
    return output


def make_cover(prs, deck_title: str, subtitle: str):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    set_background(slide, CARBON)
    add_box(slide, 0, 0, 13.333, 0.14, RED)
    add_box(slide, 10.3, 0, 3.0, 7.5, CARBON_SOFT)
    add_box(slide, 10.3, 5.1, 3.0, 0.08, GOLD)
    add_logo(slide, 0.7, 0.55, 0.95)
    add_text(slide, "CARZONE SARL", 1.8, 0.68, 6, 0.3, 15, GOLD, bold=True)
    add_text(slide, "COTONOU - BENIN", 1.8, 0.98, 6, 0.25, 9, SLATE)
    add_text(slide, "FORMATION CARZONE OPS", 0.7, 2.0, 9.1, 0.35, 12, GOLD, bold=True)
    add_text(slide, deck_title, 0.7, 2.45, 9.1, 1.4, 29, WHITE, bold=True, font=FONT_TITLE)
    add_text(slide, subtitle, 0.7, 3.9, 8.9, 0.9, 15, MUTED)
    add_box(slide, 0.7, 4.95, 1.25, 0.06, RED)
    add_text(slide, "Support de formation des équipes", 0.7, 5.18, 8.5, 0.3, 12, GOLD, bold=True)
    add_text(slide, "Version de travail - 2026", 0.7, 6.5, 7, 0.25, 9, SLATE)
    add_text(slide, "DRIVE YOUR DREAM", 10.75, 6.45, 2.2, 0.25, 9, GOLD, bold=True)
    add_fade_transition(slide)
    return slide


def deck_display_title(content_path: Path) -> str:
    first_line = content_path.read_text(encoding="utf-8").splitlines()[0]
    title = re.sub(r"^#\s*Contenu du support\s*-\s*", "", first_line).strip()
    title = re.sub(r"^\d+\.\s*", "", title)
    return title or content_path.stem.replace(".contenu", "")


def deck_subtitle(content_path: Path) -> str:
    slug = content_path.stem.replace(".contenu", "")
    mapping = {
        "00-accueil-formation-commune": "Connexion, navigation, vocabulaire, sécurité et aide",
        "01-direction-gouvernance": "Pilotage, contrôle, indicateurs et décisions",
        "02-commerce-adv-accueil": "Accueil client, prospects, devis et suivi commercial",
        "03-comptabilite": "Facturation, encaissements, dépenses et contrôles",
        "04-stock-showroom-import": "Véhicules, imports, catalogue et disponibilité",
        "05-atelier-stock-garage": "Atelier SAV, ordres de réparation et pièces garage",
        "06-location-vehicules": "Parc locatif, contrats, tarifs et retours",
        "07-rh-administration": "Équipe, rôles, congés et administration",
        "08-bornes-installateurs": "Bornes, demandes d'installation et partenaires",
    }
    return mapping.get(slug, "Procédures, bonnes pratiques et exercices")


def create_deck(content_path: Path) -> Path:
    slides = parse_content(content_path)
    if not slides:
        raise RuntimeError(f"Aucun slide dans {content_path}")
    deck_label = content_path.stem.replace(".contenu", "")
    title = deck_display_title(content_path)
    subtitle = deck_subtitle(content_path)
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    make_cover(prs, title, subtitle)
    for index, slide_data in enumerate(slides[1:], start=2):
        make_content(prs, slide_data, index, deck_label)
    output = PRESENTATION_DIR / f"{deck_label}.pptx"
    prs.save(output)
    return output


def make_content(prs, slide_data: dict, page: int, deck_label: str):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    title = slide_data["title"]
    add_header(slide, title)
    bullets = slide_data["bullets"]
    capture = slide_data["captures"][0] if slide_data["captures"] else None
    has_image = False
    if capture:
        has_image = add_capture(slide, capture, 6.15, 1.65, 6.55, 4.85)
    if has_image:
        add_bullets(slide, bullets, 0.6, 1.7, 5.25, 4.9, 13.5)
        add_text(slide, "Capture d'écran réelle de l'application", 6.15, 6.6, 6.5, 0.25, 8.5, SLATE, align=PP_ALIGN.RIGHT)
    else:
        add_bullets(slide, bullets, 0.6, 1.7, 12.0, 4.9, 16)
    add_footer(slide, page, deck_label)
    add_fade_transition(slide)
    return slide


def make_agenda_slide(prs, slides: list[dict], page: int, deck_label: str):
    slide = prs.slides.add_slide(prs.slide_layouts[6])
    add_header(slide, "Sommaire de la formation")
    entries = [item["title"] for item in slides[1:8]]
    box = slide.shapes.add_textbox(Inches(0.7), Inches(1.85), Inches(11.8), Inches(4.7))
    frame = box.text_frame
    frame.clear()
    frame.word_wrap = True
    for index, entry in enumerate(entries):
        paragraph = frame.paragraphs[0] if index == 0 else frame.add_paragraph()
        paragraph.text = f"{index + 1:02d}.  {entry}"
        paragraph.space_after = Pt(10)
        for run in paragraph.runs:
            run.font.name = FONT
            run.font.size = Pt(15)
            run.font.color.rgb = MUTED
    add_footer(slide, page, deck_label)
    return slide


def main():
    PRESENTATION_DIR.mkdir(parents=True, exist_ok=True)
    content_files = sorted(PRESENTATION_DIR.glob("*.contenu.md"))
    if not content_files:
        raise RuntimeError("Aucun contenu Markdown trouvé")
    for content_path in content_files:
        output = create_deck(content_path)
        print(f"generated {output.name}")
    role_files = sorted((ROOT / "roles").glob("*.md"))
    for role_path in role_files:
        output = create_role_deck(role_path)
        print(f"generated role {output.name}")


if __name__ == "__main__":
    main()
