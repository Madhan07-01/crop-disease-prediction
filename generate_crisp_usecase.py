"""
generate_crisp_usecase.py
Generates a high-resolution, perfectly-proportioned UML Use Case Diagram for AgriVision.
Dimensions: 2200 x 1000 px (matches slide content area 9.0 in x 4.09 in).
Zero overlaps, professional typography, matching presentation theme.
"""

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, Ellipse
import numpy as np

# 22.0 x 10.0 inches at 100 dpi = 2200 x 1000 px (aspect ratio 2.2 : 1)
FIG_W, FIG_H = 22.0, 10.0
DPI = 150

fig, ax = plt.subplots(figsize=(FIG_W, FIG_H), dpi=DPI)
ax.set_xlim(0, FIG_W)
ax.set_ylim(0, FIG_H)
ax.axis("off")
fig.patch.set_facecolor("#0D1B2A")

# Theme Colors
C_BG        = "#0D1B2A"
C_SYS_BG    = "#102030"
C_SYS_BORD  = "#547808"
C_FARMER    = "#6EA00C"
C_FARMER_BG = "#13281C"
C_AI        = "#F09A18"
C_AI_BG     = "#281F12"
C_ADMIN     = "#B37FEB"
C_ADMIN_BG  = "#261936"
C_CORE      = "#38B6FF"
C_CORE_BG   = "#13253B"
C_WHITE     = "#FFFFFF"
C_OFFWHITE  = "#E2E8F0"
C_MUTED     = "#94A3B8"
C_LINE      = "#64748B"

# Helper drawing functions
def draw_actor(x, y, label, role, color):
    # Head
    head = plt.Circle((x, y + 0.55), 0.22, fc=color, ec=color, zorder=10)
    ax.add_patch(head)
    # Body
    ax.plot([x, x], [y + 0.33, y - 0.15], color=color, lw=2.5, zorder=10)
    # Arms
    ax.plot([x - 0.32, x + 0.32], [y + 0.12, y + 0.12], color=color, lw=2.5, zorder=10)
    # Legs
    ax.plot([x, x - 0.26], [y - 0.15, y - 0.60], color=color, lw=2.5, zorder=10)
    ax.plot([x, x + 0.26], [y - 0.15, y - 0.60], color=color, lw=2.5, zorder=10)
    # Label card
    ax.text(x, y - 0.85, label, fontsize=10.5, color=C_WHITE,
            ha="center", va="top", fontweight="bold", zorder=10)
    ax.text(x, y - 1.12, f"«{role}»", fontsize=8.5, color=color,
            ha="center", va="top", fontstyle="italic", zorder=10)

def draw_usecase(cx, cy, text, border_color, fill_color, rw=1.55, rh=0.38):
    # Oval usecase
    e = Ellipse((cx, cy), 2 * rw, 2 * rh, fc=fill_color, ec=border_color, lw=1.8, zorder=5)
    ax.add_patch(e)
    # Highlight ring
    e2 = Ellipse((cx, cy), 2 * (rw - 0.05), 2 * (rh - 0.04), fc="none", ec=border_color, lw=0.4, alpha=0.5, zorder=5)
    ax.add_patch(e2)
    # Text
    lines = text.split("\n")
    if len(lines) == 1:
        ax.text(cx, cy, lines[0], fontsize=8.5, color=C_WHITE, ha="center", va="center", fontweight="bold", zorder=6)
    else:
        ax.text(cx, cy + 0.10, lines[0], fontsize=8.2, color=C_WHITE, ha="center", va="center", fontweight="bold", zorder=6)
        ax.text(cx, cy - 0.11, lines[1], fontsize=7.8, color=C_OFFWHITE, ha="center", va="center", zorder=6)

def line(x1, y1, x2, y2, color=C_LINE, lw=1.2, zorder=3):
    ax.plot([x1, x2], [y1, y2], color=color, lw=lw, zorder=zorder)

def dashed_arrow(x1, y1, x2, y2, label, color=C_CORE, rad=0.0):
    ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=1.4,
                                linestyle="--",
                                connectionstyle=f"arc3,rad={rad}"),
                zorder=4)
    # midpoint label
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2
    if rad != 0:
        my += rad * 0.5
    ax.text(mx, my + 0.10, label, fontsize=7.2, color=color,
            ha="center", va="bottom", fontweight="bold", fontstyle="italic", zorder=7,
            bbox=dict(boxstyle="round,pad=0.15", fc="#0D1B2A", ec="none", alpha=0.85))

# ── 1. System Boundary ───────────────────────────────────────────────────
SYS_X, SYS_Y = 3.6, 0.4
SYS_W, SYS_H = 14.8, 9.2
sys_box = FancyBboxPatch((SYS_X, SYS_Y), SYS_W, SYS_H,
                         boxstyle="round,pad=0,rounding_size=0.3",
                         fc=C_SYS_BG, ec=C_SYS_BORD, lw=2.2, zorder=1)
ax.add_patch(sys_box)

# Header Tag inside system boundary
hdr_patch = FancyBboxPatch((SYS_X + 0.3, SYS_Y + SYS_H - 0.65), 5.6, 0.48,
                           boxstyle="round,pad=0,rounding_size=0.15",
                           fc="#547808", ec="#547808", zorder=2)
ax.add_patch(hdr_patch)
ax.text(SYS_X + 3.1, SYS_Y + SYS_H - 0.41,
        "System: AgriVision Platform",
        fontsize=10.5, color=C_WHITE, ha="center", va="center", fontweight="bold", zorder=3)

# ── 2. Actors ─────────────────────────────────────────────────────────────
draw_actor(1.8, 7.3, "Farmer", "Primary Actor", C_FARMER)
draw_actor(1.8, 3.1, "Field Officer", "Secondary Actor", C_CORE)
draw_actor(20.2, 7.3, "AI Engine", "CNN Microservice", C_AI)
draw_actor(20.2, 3.1, "Administrator", "System Admin", C_ADMIN)

# ── 3. Usecase Coordinates (3 Columns inside Boundary) ───────────────────
# Column 1 (Left - Farmer & Shared) X = 6.2
# Column 2 (Center - AI & Core Operations) X = 11.0
# Column 3 (Right - Admin & Analytics) X = 15.8

# Col 1: Farmer & Field Operations
uc_reg    = (6.2, 8.5)   # Register & Login
uc_upload = (6.2, 7.2)   # Upload Leaf Image
uc_view   = (6.2, 5.9)   # View Diagnosis & Conf.
uc_treat  = (6.2, 4.6)   # View Treatment Advisory
uc_hist   = (6.2, 3.3)   # Access Scan History
uc_rpt    = (6.2, 2.0)   # Verify Field Report
uc_export = (6.2, 0.9)   # Export Diagnostic PDF

# Col 2: AI & Analytics Processing
uc_pre    = (11.0, 7.8)  # Preprocess Leaf Image
uc_cnn    = (11.0, 6.4)  # ResNet-50 CNN Inference
uc_prob   = (11.0, 5.0)  # Compute Hazard Prob.
uc_dos    = (11.0, 3.6)  # Calculate Dosage & Weather
uc_track  = (11.0, 2.2)  # Track Outbreak Hotspots

# Col 3: Admin & Management
uc_user   = (15.8, 7.8)  # Manage User Accounts
uc_assign = (15.8, 6.4)  # Assign Field Officers
uc_dash   = (15.8, 5.0)  # Monitor System Analytics
uc_audit  = (15.8, 3.6)  # Review Operational Audits
uc_models = (15.8, 2.2)  # Monitor Model Performance

# Draw Col 1 Usecases
draw_usecase(uc_reg[0],    uc_reg[1],    "Register & Authenticate\n(JWT Session)", C_CORE, C_CORE_BG)
draw_usecase(uc_upload[0], uc_upload[1], "Upload Leaf Image\n(Drag & Drop / Camera)", C_FARMER, C_FARMER_BG)
draw_usecase(uc_view[0],   uc_view[1],   "View Diagnosis Result\n(& Confidence Score)", C_FARMER, C_FARMER_BG)
draw_usecase(uc_treat[0],  uc_treat[1],  "View Treatment Advisory\n(Organic / Chemical)", C_FARMER, C_FARMER_BG)
draw_usecase(uc_hist[0],   uc_hist[1],   "Access Scan History\n(& Health Trends)", C_FARMER, C_FARMER_BG)
draw_usecase(uc_rpt[0],    uc_rpt[1],    "Verify Field Incident\n(Officer Inspection)", C_CORE, C_CORE_BG)
draw_usecase(uc_export[0], uc_export[1], "Download Diagnostic PDF\n(Official Advisory)", C_CORE, C_CORE_BG)

# Draw Col 2 Usecases
draw_usecase(uc_pre[0],    uc_pre[1],    "Preprocess Image Array\n(224x224 Normalization)", C_AI, C_AI_BG)
draw_usecase(uc_cnn[0],    uc_cnn[1],    "Execute CNN Inference\n(ResNet-50 PyTorch)", C_AI, C_AI_BG)
draw_usecase(uc_prob[0],   uc_prob[1],   "Compute Hazard Probability\n(Softmax across 38 classes)", C_AI, C_AI_BG)
draw_usecase(uc_dos[0],    uc_dos[1],    "Calculate Dosage & Dilution\n(Live Weather Advisory)", C_CORE, C_CORE_BG)
draw_usecase(uc_track[0],  uc_track[1],  "Track Regional Hotspots\n(Geospatial Outbreaks)", C_ADMIN, C_ADMIN_BG)

# Draw Col 3 Usecases
draw_usecase(uc_user[0],   uc_user[1],   "Manage User Accounts\n(Roles & Permissions)", C_ADMIN, C_ADMIN_BG)
draw_usecase(uc_assign[0], uc_assign[1], "Assign Field Officers\n(Report Work Orders)", C_ADMIN, C_ADMIN_BG)
draw_usecase(uc_dash[0],   uc_dash[1],   "Monitor System Analytics\n(Scans, Errors, Latency)", C_ADMIN, C_ADMIN_BG)
draw_usecase(uc_audit[0],  uc_audit[1],  "Review Operational Logs\n(Audit Trail)", C_ADMIN, C_ADMIN_BG)
draw_usecase(uc_models[0], uc_models[1], "Monitor Model Health\n(Inference Speed < 3s)", C_AI, C_AI_BG)

# ── 4. Actor Associations (Solid Lines) ──────────────────────────────────
# Farmer associations
FARMER_POS = (2.2, 7.3)
line(FARMER_POS[0], FARMER_POS[1], uc_reg[0] - 1.55, uc_reg[1], color=C_FARMER, lw=1.4)
line(FARMER_POS[0], FARMER_POS[1], uc_upload[0] - 1.55, uc_upload[1], color=C_FARMER, lw=1.6)
line(FARMER_POS[0], FARMER_POS[1], uc_view[0] - 1.55, uc_view[1], color=C_FARMER, lw=1.4)
line(FARMER_POS[0], FARMER_POS[1], uc_treat[0] - 1.55, uc_treat[1], color=C_FARMER, lw=1.4)
line(FARMER_POS[0], FARMER_POS[1], uc_hist[0] - 1.55, uc_hist[1], color=C_FARMER, lw=1.4)

# Field Officer associations
OFFICER_POS = (2.2, 3.1)
line(OFFICER_POS[0], OFFICER_POS[1], uc_reg[0] - 1.55, uc_reg[1] - 0.2, color=C_CORE, lw=1.2)
line(OFFICER_POS[0], OFFICER_POS[1], uc_view[0] - 1.55, uc_view[1] - 0.2, color=C_CORE, lw=1.2)
line(OFFICER_POS[0], OFFICER_POS[1], uc_rpt[0] - 1.55, uc_rpt[1], color=C_CORE, lw=1.6)
line(OFFICER_POS[0], OFFICER_POS[1], uc_dos[0] - 1.55, uc_dos[1] - 0.2, color=C_CORE, lw=1.2)

# AI Engine associations
AI_POS = (19.8, 7.3)
line(AI_POS[0], AI_POS[1], uc_pre[0] + 1.55, uc_pre[1], color=C_AI, lw=1.6)
line(AI_POS[0], AI_POS[1], uc_cnn[0] + 1.55, uc_cnn[1], color=C_AI, lw=1.6)
line(AI_POS[0], AI_POS[1], uc_prob[0] + 1.55, uc_prob[1], color=C_AI, lw=1.6)
line(AI_POS[0], AI_POS[1], uc_models[0] + 1.55, uc_models[1], color=C_AI, lw=1.4)

# Admin associations
ADMIN_POS = (19.8, 3.1)
line(ADMIN_POS[0], ADMIN_POS[1], uc_user[0] + 1.55, uc_user[1], color=C_ADMIN, lw=1.5)
line(ADMIN_POS[0], ADMIN_POS[1], uc_assign[0] + 1.55, uc_assign[1], color=C_ADMIN, lw=1.5)
line(ADMIN_POS[0], ADMIN_POS[1], uc_dash[0] + 1.55, uc_dash[1], color=C_ADMIN, lw=1.6)
line(ADMIN_POS[0], ADMIN_POS[1], uc_audit[0] + 1.55, uc_audit[1], color=C_ADMIN, lw=1.4)
line(ADMIN_POS[0], ADMIN_POS[1], uc_track[0] + 1.55, uc_track[1] - 0.2, color=C_ADMIN, lw=1.2)

# ── 5. Standard UML <<include>> & <<extend>> Dependencies ───────────────
# Upload Leaf Image --<<include>>--> Preprocess Image
dashed_arrow(uc_upload[0] + 1.55, uc_upload[1], uc_pre[0] - 1.55, uc_pre[1], "«include»", color=C_AI)

# Preprocess Image --<<include>>--> Execute CNN Inference
dashed_arrow(uc_pre[0], uc_pre[1] - 0.38, uc_cnn[0], uc_cnn[1] + 0.38, "«include»", color=C_AI)

# Execute CNN Inference --<<include>>--> Compute Hazard Probability
dashed_arrow(uc_cnn[0], uc_cnn[1] - 0.38, uc_prob[0], uc_prob[1] + 0.38, "«include»", color=C_AI)

# Compute Hazard Probability --<<include>>--> View Diagnosis Result
dashed_arrow(uc_prob[0] - 1.55, uc_prob[1], uc_view[0] + 1.55, uc_view[1], "«include»", color=C_CORE, rad=-0.15)

# View Diagnosis Result --<<include>>--> View Treatment Advisory
dashed_arrow(uc_view[0], uc_view[1] - 0.38, uc_treat[0], uc_treat[1] + 0.38, "«include»", color=C_FARMER)

# View Treatment Advisory --<<include>>--> Calculate Dosage
dashed_arrow(uc_treat[0] + 1.55, uc_treat[1], uc_dos[0] - 1.55, uc_dos[1], "«include»", color=C_CORE)

# View Treatment Advisory <--<<extend>>-- Download Diagnostic PDF
dashed_arrow(uc_export[0], uc_export[1] + 0.38, uc_treat[0], uc_treat[1] - 0.38, "«extend»", color=C_CORE)

# Monitor Analytics --<<include>>--> Track Regional Hotspots
dashed_arrow(uc_dash[0] - 1.55, uc_dash[1], uc_track[0] + 1.55, uc_track[1], "«include»", color=C_ADMIN)

# ── 6. Bottom Legend ─────────────────────────────────────────────────────
LEG_X, LEG_Y = 11.2, 0.55
leg_box = FancyBboxPatch((LEG_X, LEG_Y), 6.9, 0.42,
                        boxstyle="round,pad=0,rounding_size=0.1",
                        fc="#0A1522", ec="#334155", lw=1.0, zorder=8)
ax.add_patch(leg_box)

ax.text(LEG_X + 0.6, LEG_Y + 0.21, "Legend:", fontsize=7.5, color=C_WHITE, fontweight="bold", ha="center", va="center", zorder=9)

# Dot indicators
items = [
    (C_FARMER, "Farmer UC"),
    (C_CORE, "System / Officer"),
    (C_AI, "AI Microservice"),
    (C_ADMIN, "Administrator"),
]
for idx, (c, lbl) in enumerate(items):
    dot_x = LEG_X + 1.4 + idx * 1.35
    circle = plt.Circle((dot_x, LEG_Y + 0.21), 0.08, fc=c, ec=c, zorder=9)
    ax.add_patch(circle)
    ax.text(dot_x + 0.16, LEG_Y + 0.21, lbl, fontsize=7.2, color=C_OFFWHITE, ha="left", va="center", zorder=9)

OUT = r"D:\project\FSD\crop-disease-prediction\use_case_diagram.png"
plt.tight_layout(pad=0)
fig.savefig(OUT, dpi=DPI, bbox_inches="tight", facecolor=fig.get_facecolor())
plt.close()
print("Saved clean, high-resolution diagram to:", OUT)
