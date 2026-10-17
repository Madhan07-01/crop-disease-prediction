"""
generate_usecase.py
Renders a professional UML Use Case Diagram for AgriVision using matplotlib.
Output: use_case_diagram.png  (2400×1600 px, 200 dpi)
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import Ellipse, FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import numpy as np

# ── Canvas ─────────────────────────────────────────────────────────────────
FIG_W, FIG_H = 18, 12          # inches
DPI = 150
fig, ax = plt.subplots(figsize=(FIG_W, FIG_H), dpi=DPI)
ax.set_xlim(0, FIG_W)
ax.set_ylim(0, FIG_H)
ax.axis("off")
fig.patch.set_facecolor("#0D1B2A")   # dark navy

# ── Palette ────────────────────────────────────────────────────────────────
C_BG       = "#0D1B2A"
C_CARD     = "#13273A"
C_GREEN    = "#547808"
C_GREEN_LT = "#6A9A0F"
C_BLUE     = "#228BE6"
C_ORANGE   = "#F09A18"
C_PURPLE   = "#8F3BC8"
C_WHITE    = "#FFFFFF"
C_OFFWHITE = "#E8F0E9"
C_MUTED    = "#A0B8A8"
C_BORDER   = "#2A4A3A"

# ── Helpers ────────────────────────────────────────────────────────────────

def txt(x, y, s, fs=9, color=C_WHITE, bold=False, italic=False,
        ha="center", va="center", zorder=5):
    weight = "bold" if bold else "normal"
    style  = "italic" if italic else "normal"
    ax.text(x, y, s, fontsize=fs, color=color, ha=ha, va=va,
            fontweight=weight, fontstyle=style, zorder=zorder,
            fontfamily="monospace" if not bold else "sans-serif")

def rect(x, y, w, h, fc=C_CARD, ec=C_BORDER, lw=1.2, radius=0.25, zorder=2, alpha=1.0):
    box = FancyBboxPatch((x, y), w, h,
                         boxstyle=f"round,pad=0,rounding_size={radius}",
                         fc=fc, ec=ec, lw=lw, zorder=zorder, alpha=alpha)
    ax.add_patch(box)
    return box

def oval(cx, cy, rx, ry, fc=C_CARD, ec=C_BLUE, lw=1.5, zorder=3):
    e = Ellipse((cx, cy), 2*rx, 2*ry, fc=fc, ec=ec, lw=lw, zorder=zorder)
    ax.add_patch(e)
    return e

def use_case(cx, cy, label, color=C_BLUE, sub=None):
    """Draw a UML use-case oval with label."""
    rx, ry = 2.10, 0.44
    oval(cx, cy, rx, ry, fc=C_CARD, ec=color, lw=2.0)
    # Inner highlight
    oval(cx, cy, rx - 0.08, ry - 0.06, fc=C_CARD, ec=color, lw=0.4, zorder=4)
    lines = label.split("\n")
    offset = 0.10 * (len(lines) - 1)
    for i, line in enumerate(lines):
        ax.text(cx, cy + offset - i * 0.22, line,
                fontsize=8.5, color=C_WHITE, ha="center", va="center",
                fontweight="bold", zorder=5)
    if sub:
        ax.text(cx, cy - ry - 0.16, sub,
                fontsize=7, color=C_MUTED, ha="center", va="top",
                fontstyle="italic", zorder=5)

def actor(cx, cy, label, color=C_WHITE):
    """Draw a UML stick-figure actor."""
    # Head
    head = plt.Circle((cx, cy + 0.60), 0.22, fc=color, ec=color, zorder=6)
    ax.add_patch(head)
    # Body
    ax.plot([cx, cx],       [cy + 0.38, cy - 0.08], color=color, lw=2.2, zorder=6)
    # Arms
    ax.plot([cx - 0.36, cx + 0.36], [cy + 0.15, cy + 0.15], color=color, lw=2.2, zorder=6)
    # Legs
    ax.plot([cx, cx - 0.30], [cy - 0.08, cy - 0.52], color=color, lw=2.2, zorder=6)
    ax.plot([cx, cx + 0.30], [cy - 0.08, cy - 0.52], color=color, lw=2.2, zorder=6)
    # Label
    ax.text(cx, cy - 0.75, label, fontsize=9, color=color,
            ha="center", va="top", fontweight="bold", zorder=6)

def arrow(x1, y1, x2, y2, color=C_MUTED, lw=1.2, style="->", label=None, label_color=C_MUTED):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle=style, color=color,
                                lw=lw, connectionstyle="arc3,rad=0.0"),
                zorder=4)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx, my + 0.12, label, fontsize=7, color=label_color,
                ha="center", va="bottom", fontstyle="italic", zorder=6)

def dashed_arrow(x1, y1, x2, y2, color=C_MUTED, label=None):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="->", color=color, lw=1.1,
                                linestyle="dashed",
                                connectionstyle="arc3,rad=0.0"),
                zorder=4)
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2
        ax.text(mx, my + 0.14, label, fontsize=7, color=color,
                ha="center", va="bottom", fontstyle="italic", zorder=6)

# ══════════════════════════════════════════════════════════════════════════
# BACKGROUND TITLE BLOCK
# ══════════════════════════════════════════════════════════════════════════
rect(0.15, 10.90, FIG_W - 0.30, 0.90, fc=C_GREEN, ec=C_GREEN, radius=0.20, zorder=1)
txt(FIG_W / 2, 11.36, "AgriVision  —  UML Use Case Diagram",
    fs=17, color=C_WHITE, bold=True)
txt(FIG_W / 2, 11.05, "AI-Driven Crop Disease Prediction Platform  |  MERN Stack + CNN Microservice",
    fs=9.5, color=C_OFFWHITE)

# ══════════════════════════════════════════════════════════════════════════
# SYSTEM BOUNDARY BOX
# ══════════════════════════════════════════════════════════════════════════
SYS_X, SYS_Y = 3.50, 0.50
SYS_W, SYS_H = 11.00, 10.10
rect(SYS_X, SYS_Y, SYS_W, SYS_H, fc="#0F2236", ec=C_GREEN_LT, lw=2.0, radius=0.40, zorder=1)
txt(SYS_X + SYS_W / 2, SYS_Y + SYS_H - 0.30,
    "«System»  AgriVision Platform",
    fs=10, color=C_GREEN_LT, bold=True)

# ══════════════════════════════════════════════════════════════════════════
# ── SECTION LABELS inside boundary ────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════
def section_label(x, y, w, label, color):
    rect(x, y, w, 0.35, fc=color + "33", ec=color, lw=1.0, radius=0.12, zorder=2)
    txt(x + w / 2, y + 0.175, label, fs=8, color=color, bold=True)

section_label(3.70, 8.90, 3.60, "[ Farmer Use Cases ]",    C_GREEN_LT)
section_label(7.60, 8.90, 3.20, "[ Admin Use Cases ]",     C_PURPLE)
section_label(11.10, 8.90, 3.20, "[ AI System Cases ]",    C_ORANGE)

# ══════════════════════════════════════════════════════════════════════════
# ── USE CASES ─────────────────────────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════

# --- FARMER use cases (left cluster, green) --------------------------------
UC_FA = [
    (5.52, 8.30, "Login / Register",           C_GREEN_LT),
    (5.52, 7.34, "Upload Leaf Image",           C_GREEN_LT),
    (5.52, 6.38, "View Prediction Result",      C_GREEN_LT),
    (5.52, 5.42, "Access History Dashboard",    C_GREEN_LT),
    (5.52, 4.46, "Receive Treatment Advisory",  C_GREEN_LT),
    (5.52, 3.50, "Download Scan Report",        C_GREEN_LT),
]
for cx, cy, label, color in UC_FA:
    use_case(cx, cy, label, color)

# --- ADMIN use cases (centre-right cluster, purple) -----------------------
UC_AD = [
    (9.20, 8.30, "Manage User Accounts",        C_PURPLE),
    (9.20, 7.34, "Monitor Platform Analytics",  C_PURPLE),
    (9.20, 6.38, "Assign Field Officers",       C_PURPLE),
    (9.20, 5.42, "Review Outbreak Reports",     C_PURPLE),
    (9.20, 4.46, "Generate Summary Report",     C_PURPLE),
]
for cx, cy, label, color in UC_AD:
    use_case(cx, cy, label, color)

# --- AI SYSTEM use cases (right cluster, orange) --------------------------
UC_AI = [
    (12.80, 8.30, "Receive Image Payload",      C_ORANGE),
    (12.80, 7.34, "Pre-process Image Array",    C_ORANGE),
    (12.80, 6.38, "Run CNN Inference\n(ResNet-50)", C_ORANGE),
    (12.80, 5.42, "Compute Disease\nProbability",   C_ORANGE),
    (12.80, 4.46, "Return Confidence\nJSON",        C_ORANGE),
]
for cx, cy, label, color in UC_AI:
    use_case(cx, cy, label, color)

# ══════════════════════════════════════════════════════════════════════════
# ── ACTORS ────────────────────────────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════
actor(1.80, 6.60, "Farmer\n(Primary Actor)", color=C_GREEN_LT)
actor(1.80, 3.40, "Field Officer\n(Secondary Actor)", color=C_BLUE)
actor(16.00, 6.60, "AI System\n(Automated)", color=C_ORANGE)
actor(16.00, 3.40, "Admin\n(System Actor)", color=C_PURPLE)

# ══════════════════════════════════════════════════════════════════════════
# ── ASSOCIATION ARROWS  (Actor → Use Case) ─────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════

# Farmer → his use cases
farmer_x, farmer_y = 1.80, 6.60
for cx, cy, _, _ in UC_FA:
    arrow(farmer_x + 0.22, farmer_y, cx - 2.10, cy, color=C_GREEN + "AA", lw=1.0)

# Field Officer → Review Outbreak + View History
officer_x, officer_y = 1.80, 3.40
arrow(officer_x + 0.22, officer_y, 9.20 - 2.10, 5.42, color=C_BLUE + "AA", lw=1.0,
      label="«extend»")
arrow(officer_x + 0.22, officer_y, 5.52 - 2.10, 4.46, color=C_BLUE + "AA", lw=1.0)

# Admin → his use cases
admin_x, admin_y = 16.00, 3.40
for cx, cy, _, _ in UC_AD:
    arrow(admin_x - 0.22, admin_y, cx + 2.10, cy, color=C_PURPLE + "AA", lw=1.0)

# AI System → its use cases
ai_x, ai_y = 16.00, 6.60
for cx, cy, _, _ in UC_AI:
    arrow(ai_x - 0.22, ai_y, cx + 2.10, cy, color=C_ORANGE + "AA", lw=1.0)

# ══════════════════════════════════════════════════════════════════════════
# ── INCLUDE / EXTEND RELATIONSHIPS ─────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════

# Upload Leaf Image  «include»→  Receive Image Payload
dashed_arrow(5.52 + 2.10, 7.34, 12.80 - 2.10, 8.30,
             color=C_ORANGE, label="«include»")

# Receive Image Payload «include»→ Pre-process
dashed_arrow(12.80 + 0.05, 8.30 - 0.44, 12.80 + 0.05, 7.34 + 0.44,
             color=C_ORANGE, label="«include»")

# Pre-process «include»→ Run CNN
dashed_arrow(12.80 + 0.05, 7.34 - 0.44, 12.80 + 0.05, 6.38 + 0.44,
             color=C_ORANGE, label="«include»")

# Run CNN «include»→ Compute Probability
dashed_arrow(12.80 + 0.05, 6.38 - 0.44, 12.80 + 0.05, 5.42 + 0.44,
             color=C_ORANGE, label="«include»")

# Compute Probability «include»→ Return JSON
dashed_arrow(12.80 + 0.05, 5.42 - 0.44, 12.80 + 0.05, 4.46 + 0.44,
             color=C_ORANGE, label="«include»")

# Return JSON «include»→ View Prediction Result
dashed_arrow(12.80 - 2.10, 4.46, 5.52 + 2.10, 6.38,
             color=C_BLUE, label="«include»")

# View Prediction «include»→ Receive Treatment
dashed_arrow(5.52 + 0.05, 6.38 - 0.44, 5.52 + 0.05, 5.42 + 0.44,
             color=C_GREEN_LT, label="«include»")

# Receive Treatment «extend»→ Download Report
dashed_arrow(5.52 + 0.05, 4.46 - 0.44, 5.52 + 0.05, 3.50 + 0.44,
             color=C_GREEN_LT, label="«extend»")

# Review Outbreak «include»→ Access History
dashed_arrow(9.20 - 2.10, 5.42, 5.52 + 2.10, 5.42,
             color=C_PURPLE, label="«include»")

# Assign Field Officers «extend»→ Generate Summary
dashed_arrow(9.20 + 0.05, 6.38 - 0.44, 9.20 + 0.05, 5.42 + 0.44,
             color=C_PURPLE, label="«extend»")

# Monitor Analytics «include»→ Review Outbreak Reports
dashed_arrow(9.20 + 0.05, 7.34 - 0.44, 9.20 + 0.05, 6.38 + 0.44,
             color=C_PURPLE, label="«include»")

# ══════════════════════════════════════════════════════════════════════════
# ── LEGEND ────────────────────────────────────────────────────────────────
# ══════════════════════════════════════════════════════════════════════════
LX, LY = 0.20, 0.40
rect(LX, LY, 3.10, 2.60, fc="#0A1520", ec=C_BORDER, lw=1.2, radius=0.20, zorder=5)
txt(LX + 1.55, LY + 2.38, "Legend", fs=9.5, color=C_WHITE, bold=True)

legend_items = [
    (C_GREEN_LT, "Farmer Use Case"),
    (C_PURPLE,   "Admin Use Case"),
    (C_ORANGE,   "AI System Case"),
    (C_BLUE,     "System Interaction"),
    (C_MUTED,    "Association"),
]
for i, (color, label) in enumerate(legend_items):
    y_pos = LY + 1.98 - i * 0.40
    oval(LX + 0.55, y_pos, 0.38, 0.14, fc="#0A1520", ec=color, lw=1.5, zorder=6)
    txt(LX + 1.10, y_pos, label, fs=7.8, color=C_OFFWHITE, ha="left", va="center")

# ── Relationship legend ──────────────────────────────────────────────────
RX, RY = 0.20, 0.40 + 2.70
rect(RX, RY, 3.10, 1.30, fc="#0A1520", ec=C_BORDER, lw=1.2, radius=0.20, zorder=5)
txt(RX + 1.55, RY + 1.10, "Relationships", fs=9, color=C_WHITE, bold=True)

ax.annotate("", xy=(RX + 1.60, RY + 0.78), xytext=(RX + 0.30, RY + 0.78),
            arrowprops=dict(arrowstyle="->", color=C_MUTED, lw=1.2), zorder=6)
txt(RX + 2.05, RY + 0.78, "Association", fs=7.5, color=C_OFFWHITE, ha="left")

ax.annotate("", xy=(RX + 1.60, RY + 0.46), xytext=(RX + 0.30, RY + 0.46),
            arrowprops=dict(arrowstyle="->", color=C_BLUE, lw=1.2,
                            linestyle="dashed"), zorder=6)
txt(RX + 2.05, RY + 0.46, "«include»", fs=7.5, color=C_BLUE, ha="left", italic=True)

ax.annotate("", xy=(RX + 1.60, RY + 0.16), xytext=(RX + 0.30, RY + 0.16),
            arrowprops=dict(arrowstyle="->", color=C_ORANGE, lw=1.2,
                            linestyle="dotted"), zorder=6)
txt(RX + 2.05, RY + 0.16, "«extend»", fs=7.5, color=C_ORANGE, ha="left", italic=True)

# ── Footer ────────────────────────────────────────────────────────────────
txt(FIG_W / 2, 0.18,
    "AgriVision  |  AI-Driven Crop Disease Prediction  |  UML 2.5 Use Case Diagram",
    fs=7.5, color=C_MUTED, italic=True)

# ══════════════════════════════════════════════════════════════════════════
# SAVE
# ══════════════════════════════════════════════════════════════════════════
OUT = r"D:\project\FSD\crop-disease-prediction\use_case_diagram.png"
plt.tight_layout(pad=0)
fig.savefig(OUT, dpi=DPI, bbox_inches="tight",
            facecolor=fig.get_facecolor())
plt.close()
print(f"Saved: {OUT}")
