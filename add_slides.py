"""
add_slides.py
Appends 7 new technical slides to FSD PROJECT PPT FINAL (1).pptx
and saves as FSD PROJECT PPT FINAL_Updated.pptx
Theme: Syne (headers), Geist (body), #547808 green accent, dark bg (#1A1A2E / #16213E)
"""

from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.util import Inches, Pt
from pptx.oxml.ns import qn
from lxml import etree
import copy, sys

SRC_PATH = r"D:\project\FSD\crop-disease-prediction\FSD PROJECT PPT FINAL (1).pptx"
DST_PATH = r"D:\project\FSD\crop-disease-prediction\FSD PROJECT PPT FINAL_Updated.pptx"

prs = Presentation(SRC_PATH)

# ── Slide dimensions (widescreen 13.33 x 7.5 in) ──────────────────────────
W = prs.slide_width   # 9144000 EMU
H = prs.slide_height  # 5143500 EMU

# ── Theme colours (extracted from existing slides) ─────────────────────────
C_BG_DARK   = RGBColor(0x0D, 0x1B, 0x2A)   # deep navy (matches slide bg)
C_BG_CARD   = RGBColor(0x13, 0x27, 0x3A)   # card surface
C_GREEN     = RGBColor(0x54, 0x78, 0x08)   # #547808 – exact accent green
C_GREEN_LT  = RGBColor(0x6A, 0x9A, 0x0F)   # lighter green for bullets
C_BLUE      = RGBColor(0x22, 0x8B, 0xE6)   # digital blue accent
C_WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
C_OFFWHITE  = RGBColor(0xE8, 0xF0, 0xE9)
C_MUTED     = RGBColor(0xA0, 0xB8, 0xA8)

# ── Fonts ──────────────────────────────────────────────────────────────────
F_HEADING = "Syne"
F_BODY    = "Geist"

# ── Layouts ───────────────────────────────────────────────────────────────
# Only 2 layouts available: index 0 = 'Slide master 1', index 1 = 'DEFAULT'
LAYOUT_BLANK  = prs.slide_layouts[0]
LAYOUT_DEFAULT = prs.slide_layouts[1]

# ── Helper functions ───────────────────────────────────────────────────────

def new_slide():
    """Add a blank slide using the master layout and return it."""
    slide = prs.slides.add_slide(LAYOUT_BLANK)
    # Remove any placeholder shapes inherited from the layout
    sp_list = slide.shapes._spTree
    for sp in list(sp_list):
        if sp.tag.endswith('}sp'):
            ph = sp.find('.//' + qn('p:ph'))
            if ph is not None:
                sp_list.remove(sp)
    return slide


def fill_solid(shape, rgb: RGBColor):
    fill = shape.fill
    fill.solid()
    fill.fore_color.rgb = rgb


def add_rect(slide, left, top, width, height, rgb: RGBColor):
    shape = slide.shapes.add_shape(1, left, top, width, height)
    fill_solid(shape, rgb)
    shape.line.fill.background()
    return shape


def add_textbox(slide, left, top, width, height,
                text, font_name=F_BODY, font_size=12,
                color=C_WHITE, bold=False, italic=False,
                align=PP_ALIGN.LEFT, wrap=True):
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = wrap
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.color.rgb = color
    run.font.bold = bold
    run.font.italic = italic
    return txBox


def add_paragraph(tf, text, font_name=F_BODY, font_size=11,
                  color=C_OFFWHITE, bold=False, bullet=False, indent=0):
    """Append a paragraph to an existing text frame."""
    from pptx.oxml import parse_xml
    p = tf.add_paragraph()
    p.alignment = PP_ALIGN.LEFT
    if bullet:
        pPr = p._pPr if p._pPr is not None else p._p.get_or_add_pPr()
        pPr.set('indent', str(Pt(-14)))
        pPr.set('marL', str(Pt(14 + indent * 14)))
    run = p.add_run()
    run.text = text
    run.font.name = font_name
    run.font.size = Pt(font_size)
    run.font.color.rgb = color
    run.font.bold = bold
    return p


def slide_bg(slide):
    """Apply dark navy background rectangle covering entire slide."""
    add_rect(slide, 0, 0, W, H, C_BG_DARK)


def title_bar(slide, title_text, subtitle=None):
    """Draw the green top-bar header matching existing slide style."""
    BAR_H = Inches(0.72)
    bar = add_rect(slide, Inches(0.54), Inches(0.54), Inches(9.22), BAR_H, C_GREEN)

    # Title text
    add_textbox(slide,
                Inches(0.65), Inches(0.58),
                Inches(8.8), BAR_H - Inches(0.05),
                title_text,
                font_name=F_HEADING, font_size=20,
                color=C_WHITE, bold=True)

    if subtitle:
        add_textbox(slide,
                    Inches(0.65), Inches(1.30),
                    Inches(9.0), Inches(0.32),
                    subtitle,
                    font_name=F_BODY, font_size=10,
                    color=C_MUTED, bold=False)


def card_box(slide, left, top, width, height, header=None, header_color=None):
    """Draw a dark card box with optional coloured header strip."""
    card = add_rect(slide, left, top, width, height, C_BG_CARD)
    card.line.color.rgb = C_GREEN
    card.line.width = Pt(1)
    if header:
        hh = Inches(0.38)
        hdr = add_rect(slide, left, top, width, hh, header_color or C_GREEN)
        add_textbox(slide, left + Inches(0.1), top + Inches(0.04),
                    width - Inches(0.2), hh,
                    header, font_name=F_HEADING, font_size=12,
                    color=C_WHITE, bold=True)
        return card, top + hh
    return card, top


# ═══════════════════════════════════════════════════════════════════════════
# ── FIND insertion index (before last slide = slide 10) ───────────────────
# ═══════════════════════════════════════════════════════════════════════════

# We'll build 7 slides, then reorder so they appear before the last slide.
# python-pptx doesn't support true slide insertion, so we:
# 1) add all 7 slides at the end
# 2) then move the original last slide to the very end

def move_slide(prs, old_index, new_index):
    """Move slide at old_index to new_index (0-based)."""
    xml_slides = prs.slides._sldIdLst
    slides = list(xml_slides)
    item = slides[old_index]
    xml_slides.remove(item)
    xml_slides.insert(new_index, item)


# Remember original last slide index before we add new ones
original_last_idx = len(prs.slides) - 1  # 9 (0-based)

# ═══════════════════════════════════════════════════════════════════════════
# SLIDE A: Functional & Non-Functional Requirements
# ═══════════════════════════════════════════════════════════════════════════
def build_slide_requirements():
    slide = new_slide()
    slide_bg(slide)
    title_bar(slide, "Functional & Non-Functional Requirements")

    CONTENT_TOP = Inches(1.52)
    CONTENT_H   = Inches(5.45)
    COL_W       = Inches(4.40)
    GAP         = Inches(0.18)
    LEFT1       = Inches(0.54)
    LEFT2       = LEFT1 + COL_W + GAP

    # Left card – Functional
    _, body_top_l = card_box(slide, LEFT1, CONTENT_TOP, COL_W, CONTENT_H,
                              header="⚙  Functional Requirements", header_color=C_GREEN)
    txb = slide.shapes.add_textbox(LEFT1 + Inches(0.14), body_top_l + Inches(0.12),
                                   COL_W - Inches(0.28), CONTENT_H - Inches(0.55))
    tf = txb.text_frame
    tf.word_wrap = True

    func_items = [
        ("Secure User Registration", "JWT-based session management with role-based access control for Farmer, Officer, and Admin personas."),
        ("Interactive Image Upload", "Drag-and-drop UI supporting high-resolution leaf image uploads with live preview."),
        ("Automated CNN Inference", "ResNet-50 model returns predicted disease label and confidence score in < 3 s."),
        ("Historical Dashboard", "Farmers can browse, filter, and export their full prediction history and health trends."),
    ]
    first = True
    for title, detail in func_items:
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = PP_ALIGN.LEFT
        run = p.add_run()
        run.text = f"▸  {title}"
        run.font.name = F_HEADING
        run.font.size = Pt(11.5)
        run.font.color.rgb = C_GREEN_LT
        run.font.bold = True

        p2 = tf.add_paragraph()
        run2 = p2.add_run()
        run2.text = f"   {detail}"
        run2.font.name = F_BODY
        run2.font.size = Pt(9.5)
        run2.font.color.rgb = C_OFFWHITE

        tf.add_paragraph()  # spacer

    # Right card – Non-Functional
    _, body_top_r = card_box(slide, LEFT2, CONTENT_TOP, COL_W, CONTENT_H,
                              header="🔒  Non-Functional Requirements", header_color=C_BLUE)
    txb2 = slide.shapes.add_textbox(LEFT2 + Inches(0.14), body_top_r + Inches(0.12),
                                    COL_W - Inches(0.28), CONTENT_H - Inches(0.55))
    tf2 = txb2.text_frame
    tf2.word_wrap = True

    nf_items = [
        ("Performance", "AI inference response < 3 seconds; API endpoints respond < 500 ms under normal load."),
        ("Scalability", "Microservice design — Node.js and Flask scale independently via container orchestration."),
        ("Security", "Bcrypt password hashing, JWT expiry, HTTPS-only cookies, and input sanitisation."),
        ("Usability", "Fully responsive mobile-first React frontend; WCAG 2.1 AA colour contrast compliance."),
    ]
    first2 = True
    for title, detail in nf_items:
        p = tf2.paragraphs[0] if first2 else tf2.add_paragraph()
        first2 = False
        p.alignment = PP_ALIGN.LEFT
        run = p.add_run()
        run.text = f"▸  {title}"
        run.font.name = F_HEADING
        run.font.size = Pt(11.5)
        run.font.color.rgb = RGBColor(0x5B, 0xC0, 0xF5)
        run.font.bold = True

        p2 = tf2.add_paragraph()
        run2 = p2.add_run()
        run2.text = f"   {detail}"
        run2.font.name = F_BODY
        run2.font.size = Pt(9.5)
        run2.font.color.rgb = C_OFFWHITE

        tf2.add_paragraph()

    return slide

build_slide_requirements()
print("✓ Slide 1: Requirements")


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE B: Detailed System Architecture
# ═══════════════════════════════════════════════════════════════════════════
def build_slide_architecture():
    slide = new_slide()
    slide_bg(slide)
    title_bar(slide, "Detailed System Architecture",
              subtitle="Decoupled microservices: Node.js handles UI and DB logic, proxying image payloads to the isolated Flask AI service to prevent event-loop blocking.")

    TIERS = [
        ("CLIENT TIER",   "React.js (Frontend UI)",
         "Vite build toolchain · Axios HTTP client · React Context auth state · Role-based routing",
         RGBColor(0x22, 0x8B, 0xE6)),
        ("API GATEWAY",   "Node.js & Express.js (REST Routing & Auth)",
         "JWT middleware · Multer file handling · Mongoose ODM · Proxy to Flask /predict endpoint",
         C_GREEN),
        ("AI ENGINE",     "Python & Flask (ResNet-50 CNN Inference)",
         "PyTorch model loading · Image pre-processing (224×224 normalise) · JSON confidence response",
         RGBColor(0xF0, 0x9A, 0x18)),
        ("DATA TIER",     "MongoDB (NoSQL Document Store)",
         "Users · Predictions (1-to-many) · Treatments · In-memory fallback for dev environments",
         RGBColor(0x8F, 0x3B, 0xC8)),
    ]

    TIER_W  = Inches(8.40)
    TIER_H  = Inches(0.96)
    TIER_X  = Inches(0.85)
    TOP_START = Inches(1.68)
    GAP     = Inches(0.16)

    ARROW_X = TIER_X + TIER_W / 2 - Inches(0.12)

    for i, (layer, title, detail, color) in enumerate(TIERS):
        top = TOP_START + i * (TIER_H + GAP)

        # Tier badge
        badge = add_rect(slide, TIER_X, top, Inches(1.55), TIER_H, color)

        add_textbox(slide, TIER_X + Inches(0.08), top + Inches(0.28),
                    Inches(1.40), Inches(0.42),
                    layer, font_name=F_HEADING, font_size=9,
                    color=C_WHITE, bold=True, align=PP_ALIGN.CENTER)

        # Content area
        content_left = TIER_X + Inches(1.60)
        content_w    = TIER_W - Inches(1.60)
        content_box  = add_rect(slide, content_left, top, content_w, TIER_H, C_BG_CARD)
        content_box.line.color.rgb = color
        content_box.line.width = Pt(1.2)

        add_textbox(slide, content_left + Inches(0.14), top + Inches(0.08),
                    content_w - Inches(0.28), Inches(0.38),
                    title, font_name=F_HEADING, font_size=13,
                    color=color, bold=True)

        add_textbox(slide, content_left + Inches(0.14), top + Inches(0.50),
                    content_w - Inches(0.28), Inches(0.40),
                    detail, font_name=F_BODY, font_size=9,
                    color=C_OFFWHITE)

        # Arrow connector (except after last)
        if i < len(TIERS) - 1:
            arrow_top = top + TIER_H + Inches(0.02)
            add_textbox(slide, ARROW_X, arrow_top, Inches(0.24), GAP - Inches(0.02),
                        "↓", font_name=F_HEADING, font_size=14,
                        color=C_MUTED, align=PP_ALIGN.CENTER)

    return slide

build_slide_architecture()
print("✓ Slide 2: Architecture")


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE C: Use Case Diagram
# ═══════════════════════════════════════════════════════════════════════════
def build_slide_usecase():
    slide = new_slide()
    slide_bg(slide)
    title_bar(slide, "Use Case Diagram")

    ACTORS = [
        {
            "label": "🌾  Farmer",
            "subtitle": "Primary Actor",
            "color": C_GREEN,
            "actions": [
                "Upload Leaf Image via scanner or gallery",
                "View AI Prediction Result & confidence score",
                "Access Historical Dashboard & scan logs",
                "Receive personalised treatment advisories",
            ],
            "left": Inches(0.42),
        },
        {
            "label": "🛡️  Administrator",
            "subtitle": "System Actor",
            "color": RGBColor(0x8F, 0x3B, 0xC8),
            "actions": [
                "Manage & moderate platform user accounts",
                "Monitor real-time analytics & scan volumes",
                "Assign field officers to outbreak reports",
                "View platform health and API metrics",
            ],
            "left": Inches(4.86),
        },
        {
            "label": "🤖  AI System",
            "subtitle": "Automated Actor",
            "color": RGBColor(0xF0, 0x9A, 0x18),
            "actions": [
                "Pre-process image array (resize, normalise)",
                "Run ResNet-50 forward pass inference",
                "Compute hazard probability across 38 classes",
                "Return disease label + confidence JSON",
            ],
            "left": Inches(9.30),
        },
    ]

    BOX_W = Inches(4.14)
    BOX_H = Inches(5.38)
    BOX_TOP = Inches(1.52)

    # System boundary ellipse label
    add_textbox(slide, Inches(4.60), Inches(1.52), Inches(3.8), Inches(0.36),
                "«AgriVision Platform Boundary»",
                font_name=F_BODY, font_size=9, color=C_MUTED,
                italic=True, align=PP_ALIGN.CENTER)

    # Vertical center divider
    div = add_rect(slide, Inches(4.64), Inches(1.90), Inches(0.02), Inches(4.90),
                   RGBColor(0x35, 0x4A, 0x3A))

    for actor in ACTORS:
        _, body_top = card_box(slide, actor["left"], BOX_TOP, BOX_W, BOX_H,
                                header=actor["label"], header_color=actor["color"])

        add_textbox(slide, actor["left"] + Inches(0.12), body_top + Inches(0.04),
                    BOX_W - Inches(0.24), Inches(0.28),
                    actor["subtitle"],
                    font_name=F_BODY, font_size=9,
                    color=C_MUTED, italic=True)

        # Divider line inside card
        sub_div = add_rect(slide, actor["left"] + Inches(0.2),
                           body_top + Inches(0.36), BOX_W - Inches(0.4), Pt(1),
                           actor["color"])

        txb = slide.shapes.add_textbox(
            actor["left"] + Inches(0.14), body_top + Inches(0.46),
            BOX_W - Inches(0.28), BOX_H - Inches(1.0))
        tf = txb.text_frame
        tf.word_wrap = True

        for idx, action in enumerate(actor["actions"]):
            p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
            run = p.add_run()
            run.text = f"○  {action}"
            run.font.name = F_BODY
            run.font.size = Pt(10.5)
            run.font.color.rgb = C_OFFWHITE

            tf.add_paragraph()  # spacer

    return slide

build_slide_usecase()
print("✓ Slide 3: Use Case")


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE D: ER Schema
# ═══════════════════════════════════════════════════════════════════════════
def build_slide_er():
    slide = new_slide()
    slide_bg(slide)
    title_bar(slide, "Entity-Relationship (ER) Schema",
              subtitle="MongoDB NoSQL document collections — relationships modelled via embedded documents and userId references.")

    COLLECTIONS = [
        {
            "name": "Users",
            "icon": "👤",
            "color": C_GREEN,
            "relation": "1",
            "fields": [
                ("_id",           "ObjectId",  "Primary Key"),
                ("fullName",      "String",    "User display name"),
                ("email",         "String",    "Unique login identifier"),
                ("passwordHash",  "String",    "Bcrypt hash — never stored plain"),
                ("role",          "Enum",      "'farmer' | 'officer' | 'admin'"),
                ("createdAt",     "Date",      "ISO 8601 timestamp"),
            ],
        },
        {
            "name": "Predictions",
            "icon": "🔬",
            "color": C_BLUE,
            "relation": "∞",
            "fields": [
                ("_id",              "ObjectId",  "Primary Key"),
                ("userId",           "ObjectId",  "Foreign Key → Users._id"),
                ("imageUrl",         "String",    "Stored image path / CDN URL"),
                ("predictedDisease", "String",    "CNN output label (38 classes)"),
                ("confidenceScore",  "Float",     "0.00 – 1.00 probability"),
                ("cropSpecies",      "String",    "User-entered crop name"),
                ("scannedAt",        "Date",      "Timestamp of scan"),
            ],
        },
        {
            "name": "Treatments",
            "icon": "💊",
            "color": RGBColor(0xF0, 0x9A, 0x18),
            "relation": "",
            "fields": [
                ("diseaseName",      "String",    "Primary Key — matches CNN label"),
                ("organicTreatment", "String",    "Neem oil, copper sulphate, etc."),
                ("chemicalTreatment","String",    "Fungicide / bactericide protocol"),
                ("preventionSteps",  "Array",     "Ordered list of prevention tips"),
                ("severity",         "Enum",      "'low' | 'medium' | 'high'"),
            ],
        },
    ]

    CARD_W  = Inches(4.08)
    CARD_H  = Inches(5.30)
    CARD_TOP = Inches(1.58)
    GAP     = Inches(0.20)

    # Relationship line between collections 1 and 2
    rel_x = Inches(0.42) + CARD_W + GAP / 2
    add_textbox(slide, rel_x - Inches(0.12), Inches(3.80), Inches(0.36), Inches(0.36),
                "→", font_name=F_HEADING, font_size=22,
                color=C_MUTED, align=PP_ALIGN.CENTER)

    for i, col in enumerate(COLLECTIONS):
        left = Inches(0.42) + i * (CARD_W + GAP)

        # Card background
        _, body_top = card_box(slide, left, CARD_TOP, CARD_W, CARD_H,
                                header=f"{col['icon']}  {col['name']} Collection",
                                header_color=col["color"])

        txb = slide.shapes.add_textbox(
            left + Inches(0.12), body_top + Inches(0.10),
            CARD_W - Inches(0.24), CARD_H - Inches(0.60))
        tf = txb.text_frame
        tf.word_wrap = True

        for j, (field, dtype, desc) in enumerate(col["fields"]):
            p = tf.paragraphs[0] if j == 0 else tf.add_paragraph()
            run = p.add_run()
            run.text = field
            run.font.name = F_HEADING
            run.font.size = Pt(10.5)
            run.font.color.rgb = col["color"]
            run.font.bold = True

            run2 = p.add_run()
            run2.text = f"  : {dtype}"
            run2.font.name = F_BODY
            run2.font.size = Pt(9.5)
            run2.font.color.rgb = RGBColor(0xF0, 0x9A, 0x18)

            p2 = tf.add_paragraph()
            run3 = p2.add_run()
            run3.text = f"   {desc}"
            run3.font.name = F_BODY
            run3.font.size = Pt(8.5)
            run3.font.color.rgb = C_MUTED

            tf.add_paragraph()  # spacer

    return slide

build_slide_er()
print("✓ Slide 4: ER Schema")


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE E: Detailed Module Description
# ═══════════════════════════════════════════════════════════════════════════
def build_slide_modules():
    slide = new_slide()
    slide_bg(slide)
    title_bar(slide, "Detailed Module Description")

    MODULES = [
        {
            "num": "01",
            "title": "User Auth Module",
            "icon": "🔐",
            "color": C_GREEN,
            "stack": "Node.js · Express · JWT · Bcrypt",
            "desc": (
                "Handles end-to-end identity: registration form validation, "
                "Bcrypt hashing before MongoDB write, JWT issuance on login, "
                "role middleware protecting /farmer, /officer, /admin routes, "
                "and automatic token refresh on every API request."
            ),
        },
        {
            "num": "02",
            "title": "AI Diagnostic Module",
            "icon": "🤖",
            "color": C_BLUE,
            "stack": "Python · Flask · PyTorch · ResNet-50",
            "desc": (
                "Isolated microservice on port 5000. Loads pre-trained "
                "plant_disease_model.pth at startup. Accepts multipart image POST, "
                "resizes to 224×224, normalises with ImageNet mean/std, "
                "runs forward pass, and returns top-1 disease label + confidence."
            ),
        },
        {
            "num": "03",
            "title": "Treatment Mapping Module",
            "icon": "💊",
            "color": RGBColor(0xF0, 0x9A, 0x18),
            "stack": "Node.js · MongoDB · Mongoose",
            "desc": (
                "Business logic layer correlating CNN output disease string with "
                "the Treatments collection. Returns structured organic remedy, "
                "chemical protocol, and ordered prevention steps. Falls back to "
                "in-memory store during development when MongoDB is unavailable."
            ),
        },
        {
            "num": "04",
            "title": "History Dashboard Module",
            "icon": "📊",
            "color": RGBColor(0x8F, 0x3B, 0xC8),
            "stack": "React.js · Axios · Chart.js",
            "desc": (
                "React component aggregating all historical scans for the "
                "authenticated farmer. Renders a timeline chart of disease "
                "frequency, sortable/filterable prediction table, and export "
                "to CSV. Real-time update via polling /api/history every 30 s."
            ),
        },
    ]

    CARD_W = Inches(4.36)
    CARD_H = Inches(2.55)
    GAP_X  = Inches(0.22)
    GAP_Y  = Inches(0.18)
    LEFT1  = Inches(0.54)
    LEFT2  = LEFT1 + CARD_W + GAP_X
    TOP1   = Inches(1.52)
    TOP2   = TOP1 + CARD_H + GAP_Y

    positions = [(LEFT1, TOP1), (LEFT2, TOP1), (LEFT1, TOP2), (LEFT2, TOP2)]

    for mod, (lx, ty) in zip(MODULES, positions):
        _, body_top = card_box(slide, lx, ty, CARD_W, CARD_H,
                                header=f"{mod['icon']}  {mod['num']}. {mod['title']}",
                                header_color=mod["color"])

        # Stack pill
        add_textbox(slide, lx + Inches(0.12), body_top + Inches(0.08),
                    CARD_W - Inches(0.24), Inches(0.28),
                    mod["stack"],
                    font_name=F_BODY, font_size=8.5,
                    color=mod["color"], italic=True)

        # Description
        add_textbox(slide, lx + Inches(0.12), body_top + Inches(0.40),
                    CARD_W - Inches(0.24), CARD_H - Inches(1.00),
                    mod["desc"],
                    font_name=F_BODY, font_size=9.5,
                    color=C_OFFWHITE, wrap=True)

    return slide

build_slide_modules()
print("✓ Slide 5: Modules")


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE F: Technology Stack Breakdown
# ═══════════════════════════════════════════════════════════════════════════
def build_slide_tech():
    slide = new_slide()
    slide_bg(slide)
    title_bar(slide, "Technology Stack Breakdown")

    LANES = [
        {
            "layer": "Frontend UI",
            "techs": ["React.js 18", "Vite 5", "Tailwind CSS 3", "Axios", "React Router v6"],
            "color": C_BLUE,
            "icon": "🖥️",
            "note": "SPA with role-based routing, responsive layouts, drag-and-drop scanner, WebRTC camera.",
        },
        {
            "layer": "Backend API",
            "techs": ["Node.js 20", "Express.js 4", "JWT (jsonwebtoken)", "Multer", "Bcrypt.js"],
            "color": C_GREEN,
            "icon": "⚙️",
            "note": "RESTful API gateway: auth, predict-proxy, history, operations, weather, recommendation routes.",
        },
        {
            "layer": "AI Microservice",
            "techs": ["Python 3.10", "Flask 3", "PyTorch 2", "ResNet-50", "Pillow / OpenCV"],
            "color": RGBColor(0xF0, 0x9A, 0x18),
            "icon": "🤖",
            "note": "Isolated on port 5000; loads plant_disease_model.pth; returns JSON disease + confidence.",
        },
        {
            "layer": "Database & Storage",
            "techs": ["MongoDB Atlas / Local", "Mongoose ODM 8", "In-Memory Dev Store", "GridFS (images)"],
            "color": RGBColor(0x8F, 0x3B, 0xC8),
            "icon": "🗄️",
            "note": "Document store with Users, Predictions (1-many), Treatments collections.",
        },
    ]

    LANE_H  = Inches(1.12)
    LANE_W  = Inches(12.25)   # limited by slide width; clip to W
    LANE_W  = W - Inches(1.08)
    LANE_X  = Inches(0.54)
    TOP_S   = Inches(1.52)
    GAP     = Inches(0.12)

    BADGE_W = Inches(1.70)

    for i, lane in enumerate(LANES):
        top = TOP_S + i * (LANE_H + GAP)

        # Layer badge
        badge = add_rect(slide, LANE_X, top, BADGE_W, LANE_H, lane["color"])
        add_textbox(slide, LANE_X + Inches(0.06), top + Inches(0.12),
                    BADGE_W - Inches(0.12), Inches(0.34),
                    lane["icon"] + "  " + lane["layer"],
                    font_name=F_HEADING, font_size=10.5,
                    color=C_WHITE, bold=True, align=PP_ALIGN.CENTER)

        # Tech pills area
        pills_left = LANE_X + BADGE_W + Inches(0.10)
        pills_w    = LANE_W - BADGE_W - Inches(0.10)
        content_box = add_rect(slide, pills_left, top, pills_w, LANE_H, C_BG_CARD)
        content_box.line.color.rgb = lane["color"]
        content_box.line.width = Pt(1)

        # Tech names in one line
        tech_str = "  ·  ".join(lane["techs"])
        add_textbox(slide, pills_left + Inches(0.14), top + Inches(0.10),
                    pills_w - Inches(0.28), Inches(0.38),
                    tech_str,
                    font_name=F_HEADING, font_size=11,
                    color=lane["color"], bold=True)

        # Note
        add_textbox(slide, pills_left + Inches(0.14), top + Inches(0.52),
                    pills_w - Inches(0.28), Inches(0.50),
                    lane["note"],
                    font_name=F_BODY, font_size=9,
                    color=C_OFFWHITE)

    return slide

build_slide_tech()
print("✓ Slide 6: Tech Stack")


# ═══════════════════════════════════════════════════════════════════════════
# SLIDE G: UI Design & Wireframes
# ═══════════════════════════════════════════════════════════════════════════
def build_slide_ui():
    slide = new_slide()
    slide_bg(slide)
    title_bar(slide, "UI Design & Wireframes")

    VIEWS = [
        {
            "label": "View 1 — Farmer Dashboard",
            "icon": "📊",
            "color": C_GREEN,
            "desc": "Clean, modern interface displaying quick statistics (total scans, disease alerts, recent activity) and a sortable/filterable table of past prediction history.",
            "features": [
                "KPI stat cards: scans, diseases, resolved",
                "Prediction history table with search & sort",
                "Disease frequency trend line chart",
                "Quick-scan action button (top right)",
            ],
            "mockup": [
                ("┌─────────────────────────────┐",  C_GREEN),
                ("│  🌾 Farmer Dashboard         │",  C_WHITE),
                ("│  [Scans: 24] [Alerts: 3]    │",  C_OFFWHITE),
                ("│  ─────────────────────────  │",  C_MUTED),
                ("│  Date   Crop    Disease  Conf│",  C_OFFWHITE),
                ("│  13 Oct Tomato  Late Blt 91% │",  C_GREEN_LT),
                ("│  11 Oct Maize   Grey Leaf 78%│",  C_OFFWHITE),
                ("└─────────────────────────────┘",  C_GREEN),
            ],
        },
        {
            "label": "View 2 — Upload Interface",
            "icon": "📷",
            "color": C_BLUE,
            "desc": "Drag-and-drop leaf upload zone with live image preview, crop species selector, farm plot notes field, and prominent 'Predict Disease' action button.",
            "features": [
                "Drag-and-drop + click-to-browse upload zone",
                "Mobile rear camera capture (capture=environment)",
                "WebRTC live webcam viewfinder toggle",
                "Crop species dropdown + plot notes input",
            ],
            "mockup": [
                ("┌─────────────────────────────┐",  C_BLUE),
                ("│  📷 Scan Leaf Image          │",  C_WHITE),
                ("│  ┌───────────────────────┐  │",  C_MUTED),
                ("│  │   Drop image here     │  │",  C_OFFWHITE),
                ("│  │   or tap to capture   │  │",  C_MUTED),
                ("│  └───────────────────────┘  │",  C_MUTED),
                ("│  [Crop ▾]  [Notes...]       │",  C_OFFWHITE),
                ("│  [  🔍 Predict Disease  ]   │",  C_BLUE),
                ("└─────────────────────────────┘",  C_BLUE),
            ],
        },
        {
            "label": "View 3 — Results Modal",
            "icon": "🔬",
            "color": RGBColor(0xF0, 0x9A, 0x18),
            "desc": "Dynamic results panel showing identified condition, AI confidence score with visual gauge, severity badge, and recommended organic & chemical treatment protocols.",
            "features": [
                "Disease name with severity badge (Low/Med/High)",
                "Animated confidence percentage gauge",
                "Organic & chemical treatment protocol cards",
                "Download PDF report + share button",
            ],
            "mockup": [
                ("┌─────────────────────────────┐",  RGBColor(0xF0, 0x9A, 0x18)),
                ("│  🔬 Prediction Result        │",  C_WHITE),
                ("│  Late Blight  [HIGH ⚠️]      │",  RGBColor(0xF0, 0x9A, 0x18)),
                ("│  Confidence: ████████░ 91%   │",  C_OFFWHITE),
                ("│  ─────────────────────────  │",  C_MUTED),
                ("│  Organic: Copper Sulphate   │",  C_GREEN_LT),
                ("│  Chemical: Mancozeb 2g/L    │",  C_BLUE),
                ("│  [📄 Export]  [✓ Confirm]   │",  C_OFFWHITE),
                ("└─────────────────────────────┘",  RGBColor(0xF0, 0x9A, 0x18)),
            ],
        },
    ]

    COL_W   = Inches(4.08)
    GAP     = Inches(0.20)
    COL_TOP = Inches(1.52)
    COL_H   = Inches(5.38)

    for i, view in enumerate(VIEWS):
        lx = Inches(0.42) + i * (COL_W + GAP)

        _, body_top = card_box(slide, lx, COL_TOP, COL_W, COL_H,
                                header=f"{view['icon']}  {view['label']}",
                                header_color=view["color"])

        # Description
        add_textbox(slide, lx + Inches(0.12), body_top + Inches(0.08),
                    COL_W - Inches(0.24), Inches(0.82),
                    view["desc"],
                    font_name=F_BODY, font_size=8.8,
                    color=C_OFFWHITE, wrap=True)

        # ASCII mockup box
        mock_top = body_top + Inches(1.00)
        mock_box = add_rect(slide, lx + Inches(0.12), mock_top,
                            COL_W - Inches(0.24), Inches(1.90),
                            RGBColor(0x0A, 0x12, 0x1E))
        mock_box.line.color.rgb = view["color"]
        mock_box.line.width = Pt(1)

        mock_txb = slide.shapes.add_textbox(
            lx + Inches(0.16), mock_top + Inches(0.06),
            COL_W - Inches(0.32), Inches(1.78))
        mock_tf = mock_txb.text_frame
        mock_tf.word_wrap = False

        for j, (line, col) in enumerate(view["mockup"]):
            p = mock_tf.paragraphs[0] if j == 0 else mock_tf.add_paragraph()
            run = p.add_run()
            run.text = line
            run.font.name = "Courier New"
            run.font.size = Pt(6.8)
            run.font.color.rgb = col

        # Feature bullets
        feat_top = mock_top + Inches(2.00)
        feat_txb = slide.shapes.add_textbox(
            lx + Inches(0.12), feat_top,
            COL_W - Inches(0.24), COL_H - feat_top + COL_TOP)
        feat_tf = feat_txb.text_frame
        feat_tf.word_wrap = True

        for k, feat in enumerate(view["features"]):
            p = feat_tf.paragraphs[0] if k == 0 else feat_tf.add_paragraph()
            run = p.add_run()
            run.text = f"✓  {feat}"
            run.font.name = F_BODY
            run.font.size = Pt(8.8)
            run.font.color.rgb = C_OFFWHITE

    return slide

build_slide_ui()
print("✓ Slide 7: UI Wireframes")


# ═══════════════════════════════════════════════════════════════════════════
# REORDER: Move original last slide (was index 9) back to the very end
# New indices after adding 7 slides: original_last is now at index 9,
# new slides are at 10..16. We want order: 0..8, 10..16, 9
# ═══════════════════════════════════════════════════════════════════════════
total_slides = len(prs.slides)  # should be 17
print(f"\nTotal slides before reorder: {total_slides}")

# The original last slide is still at index original_last_idx (9) because
# new slides were appended after it. Let's verify:
xml_ids = list(prs.slides._sldIdLst)
print(f"Slide order (0-based indices, {len(xml_ids)} total)")

# Move the original last slide (index 9) to be the very last slide (index 16)
move_slide(prs, original_last_idx, total_slides - 1)
print(f"✓ Conclusion slide moved to position {total_slides} (last)")

# ═══════════════════════════════════════════════════════════════════════════
# SAVE
# ═══════════════════════════════════════════════════════════════════════════
prs.save(DST_PATH)
print(f"\n✅  Saved: {DST_PATH}")
print(f"   Total slides in updated file: {len(prs.slides)}")
