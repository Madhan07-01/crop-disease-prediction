import os
from PIL import Image, ImageDraw, ImageFont

os.environ['MPLCONFIGDIR'] = os.path.join(os.path.dirname(__file__), 'tmp_mpl')

# Ensure output directory
OUT_DIR = os.path.dirname(__file__)

def get_font(size, bold=False):
    # Try common Windows fonts
    font_paths = [
        "C:\\Windows\\Fonts\\arialbd.ttf" if bold else "C:\\Windows\\Fonts\\arial.ttf",
        "C:\\Windows\\Fonts\\segoeuib.ttf" if bold else "C:\\Windows\\Fonts\\segoeui.ttf",
        "C:\\Windows\\Fonts\\calibrib.ttf" if bold else "C:\\Windows\\Fonts\\calibri.ttf"
    ]
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                return ImageFont.truetype(fp, size)
            except Exception:
                pass
    return ImageFont.load_default()

def draw_rounded_rect(draw, coords, radius=8, fill="#ffffff", outline="#2e7d32", width=2):
    x1, y1, x2, y2 = coords
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, fill=fill, outline=outline, width=width)

def draw_arrow(draw, start, end, color="#2e7d32", width=2, arrow_size=8):
    x1, y1 = start
    x2, y2 = end
    draw.line([x1, y1, x2, y2], fill=color, width=width)
    import math
    angle = math.atan2(y2 - y1, x2 - x1)
    x3 = x2 - arrow_size * math.cos(angle - math.pi / 6)
    y3 = y2 - arrow_size * math.sin(angle - math.pi / 6)
    x4 = x2 - arrow_size * math.cos(angle + math.pi / 6)
    y4 = y2 - arrow_size * math.sin(angle + math.pi / 6)
    draw.polygon([(x2, y2), (x3, y3), (x4, y4)], fill=color)

# 1. Figure 3.1: System Architecture
def make_fig_3_1():
    img = Image.new("RGB", (1000, 520), "#F9FBF9")
    draw = ImageDraw.Draw(img)
    f_title = get_font(18, bold=True)
    f_sec = get_font(14, bold=True)
    f_body = get_font(11, bold=False)
    f_badge = get_font(10, bold=True)

    # Title Banner
    draw.rectangle([0, 0, 1000, 48], fill="#1B5E20")
    draw.text((30, 12), "AGRIVISION: DECOUPLED THREE-TIER MICROSERVICE ARCHITECTURE", font=f_title, fill="#FFFFFF")

    # Tier 1: Client Tier
    draw_rounded_rect(draw, (30, 75, 230, 480), fill="#E8F5E9", outline="#2E7D32")
    draw.rectangle([30, 75, 230, 115], fill="#2E7D32")
    draw.text((45, 87), "PRESENTATION TIER", font=f_sec, fill="#FFFFFF")
    draw.text((45, 130), "React 19.2 + Vite 8", font=f_sec, fill="#1B5E20")
    draw.text((45, 160), "• Responsive UI (Tailwind v4)\n• Scanner (Camera / Upload)\n• Dashboard & History Log\n• Operations & Field Triage\n• Weather Risk Monitoring\n• Axios REST Client\n• JWT Token Storage", font=f_body, fill="#1F2937")

    # Arrow Client -> API Gateway
    draw_arrow(draw, (230, 240), (280, 240), color="#1B5E20", width=3)
    draw_arrow(draw, (280, 280), (230, 280), color="#2E7D32", width=2)
    draw.text((236, 218), "HTTP POST", font=f_badge, fill="#1B5E20")
    draw.text((238, 285), "JSON Data", font=f_badge, fill="#2E7D32")

    # Tier 2: API Gateway Tier
    draw_rounded_rect(draw, (280, 75, 520, 480), fill="#E3F2FD", outline="#1565C0")
    draw.rectangle([280, 75, 520, 115], fill="#1565C0")
    draw.text((295, 87), "APPLICATION API GATEWAY", font=f_sec, fill="#FFFFFF")
    draw.text((295, 130), "Node.js 20 + Express 5", font=f_sec, fill="#0D47A1")
    draw.text((295, 160), "• JWT Auth & RBAC Guard\n• Multer Multipart Intake (5MB)\n• AI Service Proxy (Axios / Form)\n• Severity Heuristic Engine\n• Weather Integration (Open-Meteo)\n• Mongoose ODM Pipeline\n• In-Memory Dev Fallback Store\n• Global Error & Logging Trap", font=f_body, fill="#1F2937")

    # Arrow Gateway -> AI Microservice
    draw_arrow(draw, (520, 190), (580, 190), color="#C62828", width=3)
    draw_arrow(draw, (580, 230), (520, 230), color="#D32F2F", width=2)
    draw.text((526, 170), "Image Stream", font=f_badge, fill="#C62828")
    draw.text((528, 235), "Class + Conf", font=f_badge, fill="#D32F2F")

    # Tier 3: AI Inference Microservice
    draw_rounded_rect(draw, (580, 75, 780, 480), fill="#FFEBEE", outline="#C62828")
    draw.rectangle([580, 75, 780, 115], fill="#C62828")
    draw.text((595, 87), "AI INFERENCE ENGINE", font=f_sec, fill="#FFFFFF")
    draw.text((595, 130), "Python 3 + Flask (Port 5000)", font=f_sec, fill="#B71C1C")
    draw.text((595, 160), "• PyTorch Deep CNN (ResNet-50)\n• Custom Linear Classification Head\n• Weights: plant_disease_model.pth\n• 38 Agricultural Disease Classes\n• Val Transforms (224x224 RGB)\n• Softmax Probability Output\n• Non-blocking Worker Execution\n• CUDA / CPU Auto-Detection", font=f_body, fill="#1F2937")

    # Arrow Gateway -> MongoDB
    draw_arrow(draw, (400, 480), (400, 500), color="#1565C0", width=2) # down to bottom
    # Place Database Card on right side
    draw_rounded_rect(draw, (810, 75, 970, 480), fill="#FFF8E1", outline="#F57F17")
    draw.rectangle([810, 75, 970, 115], fill="#F57F17")
    draw.text((820, 87), "DATA PERSISTENCE", font=f_sec, fill="#FFFFFF")
    draw.text((820, 130), "MongoDB 7.0 / Atlas", font=f_sec, fill="#E65100")
    draw.text((820, 160), "• Users Collection\n  (RBAC: Farmer, Officer, Admin)\n• Predictions Collection\n  (Audit logs & field notes)\n• Treatments Collection\n  (Curated remedies)\n• BSON Document Store\n• Indexed by User & Date", font=f_body, fill="#1F2937")

    draw_arrow(draw, (520, 360), (810, 360), color="#F57F17", width=3)
    draw_arrow(draw, (810, 390), (520, 390), color="#F57F17", width=2)
    draw.text((630, 342), "Mongoose Query / Mutation", font=f_badge, fill="#E65100")
    draw.text((650, 395), "BSON Document Payload", font=f_badge, fill="#E65100")

    img.save(os.path.join(OUT_DIR, "fig_3_1_architecture.png"))

# 2. Figure 3.3: Class / Entity Schema Diagram
def make_fig_3_3():
    img = Image.new("RGB", (1000, 460), "#FBFBFB")
    draw = ImageDraw.Draw(img)
    f_title = get_font(16, bold=True)
    f_head = get_font(13, bold=True)
    f_code = get_font(10, bold=False)

    draw.rectangle([0, 0, 1000, 42], fill="#1B5E20")
    draw.text((30, 10), "FIGURE 3.3: AGRIVISION DATA MODELS & ENTITY-RELATIONSHIP SCHEMA", font=f_title, fill="#FFFFFF")

    # User Entity
    draw_rounded_rect(draw, (30, 65, 300, 430), fill="#FFFFFF", outline="#2E7D32")
    draw.rectangle([30, 65, 300, 100], fill="#2E7D32")
    draw.text((105, 73), "User (Model)", font=f_head, fill="#FFFFFF")
    user_txt = (
        "+ _id : ObjectId (PK)\n"
        "+ fullName : String (req)\n"
        "+ email : String (req, unique)\n"
        "+ passwordHash : String (req)\n"
        "+ role : String [farmer | officer | admin]\n"
        "+ createdAt : Date\n"
        "+ updatedAt : Date\n\n"
        "Methods / Associations:\n"
        "• 1-to-Many with Prediction\n"
        "• Bcrypt salted verification\n"
        "• JWT Claims generation"
    )
    draw.text((45, 115), user_txt, font=f_code, fill="#1F2937")

    # Prediction Entity
    draw_rounded_rect(draw, (350, 65, 660, 430), fill="#FFFFFF", outline="#1565C0")
    draw.rectangle([350, 65, 660, 100], fill="#1565C0")
    draw.text((435, 73), "Prediction (Model)", font=f_head, fill="#FFFFFF")
    pred_txt = (
        "+ _id : ObjectId (PK)\n"
        "+ userId : ObjectId (FK -> User)\n"
        "+ imageUrl : String (base64 / path)\n"
        "+ cropName : String [default: Crop Leaf]\n"
        "+ farmLocation : String\n"
        "+ notes : String\n"
        "+ predictedDisease : String (req)\n"
        "+ confidenceScore : Float (req)\n"
        "+ severity : Enum [Low, Med, High, Critical]\n"
        "+ status : Enum [pending_verification,\n"
        "    officer_assigned, under_investigation,\n"
        "    treatment_applied, resolved]\n"
        "+ assignedOfficerId : ObjectId (FK -> User)\n"
        "+ fieldReadings : Embedded Sub-Doc\n"
        "    - soilPh : Float, moisturePercent : Float\n"
        "    - affectedAreaPercent : Float\n"
        "+ scannedAt : Date [default: Date.now]"
    )
    draw.text((365, 110), pred_txt, font=f_code, fill="#1F2937")

    # Treatment Entity
    draw_rounded_rect(draw, (710, 65, 970, 430), fill="#FFFFFF", outline="#E65100")
    draw.rectangle([710, 65, 970, 100], fill="#E65100")
    draw.text((775, 73), "Treatment (Model)", font=f_head, fill="#FFFFFF")
    treat_txt = (
        "+ _id : ObjectId (PK)\n"
        "+ diseaseName : String (unique, index)\n"
        "+ organicTreatment : String (req)\n"
        "+ chemicalTreatment : String (req)\n"
        "+ preventionSteps : Array<String>\n\n"
        "Domain Coverage:\n"
        "• Apple Scab & Black Rot\n"
        "• Tomato Early / Late Blight\n"
        "• Potato Early / Late Blight\n"
        "• Corn Common Rust\n"
        "• Grape Black Rot / Esca\n"
        "• Healthy Canopy Baseline"
    )
    draw.text((725, 115), treat_txt, font=f_code, fill="#1F2937")

    # Connecting lines & cardinality
    draw_arrow(draw, (300, 200), (350, 200), color="#2E7D32", width=2)
    draw.text((310, 180), "1:N", font=get_font(11, bold=True), fill="#2E7D32")

    draw_arrow(draw, (660, 200), (710, 200), color="#E65100", width=2)
    draw.text((670, 180), "N:1", font=get_font(11, bold=True), fill="#E65100")

    img.save(os.path.join(OUT_DIR, "fig_3_3_class_diagram.png"))

# 3. Figure 3.4: Sequence Diagram
def make_fig_3_4():
    img = Image.new("RGB", (1000, 520), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    f_title = get_font(16, bold=True)
    f_head = get_font(12, bold=True)
    f_note = get_font(10, bold=False)

    draw.rectangle([0, 0, 1000, 42], fill="#1B5E20")
    draw.text((30, 10), "FIGURE 3.4: SEQUENCE DIAGRAM OF CROP LEAF INFERENCE & ADVISORY DISPATCH", font=f_title, fill="#FFFFFF")

    actors = [
        ("Farmer / Client", 100, "#2E7D32"),
        ("Express Gateway", 350, "#1565C0"),
        ("Flask AI Service", 600, "#C62828"),
        ("MongoDB Cluster", 850, "#F57F17")
    ]

    for name, x, col in actors:
        draw_rounded_rect(draw, (x - 80, 55, x + 80, 90), radius=5, fill=col, outline=col)
        draw.text((x - 65, 65), name, font=f_head, fill="#FFFFFF")
        draw.line([(x, 90), (x, 490)], fill="#B0BEC5", width=2)

    steps = [
        (100, 350, 120, "1. POST /api/predict (Multipart Form: leaf.jpg, cropName)", "#1565C0", True),
        (350, 350, 150, "authMiddleware verifies JWT & checks file <= 5MB", "#455A64", False),
        (350, 600, 190, "2. POST /predict (Forward image buffer in FormData)", "#C62828", True),
        (600, 600, 230, "Transforms image (224x224), runs ResNet-50 inference", "#C62828", False),
        (600, 350, 270, "3. Return JSON: {prediction: 'Tomato___Early_blight', conf: 0.94}", "#C62828", True),
        (350, 850, 310, "4. findOne({diseaseName}) query for remedies", "#F57F17", True),
        (850, 350, 340, "5. Return treatment document (organic, chemical, prevention)", "#F57F17", True),
        (350, 850, 380, "6. Insert new Prediction log (status: pending_verification)", "#F57F17", True),
        (850, 350, 410, "7. Confirm BSON insertion (reportId: 671a...)", "#F57F17", True),
        (350, 100, 450, "8. HTTP 201 Created: Return full diagnostic & treatment payload", "#2E7D32", True)
    ]

    for x1, x2, y, msg, col, is_arrow in steps:
        if is_arrow:
            draw_arrow(draw, (x1, y), (x2, y), color=col, width=2)
            draw.text((min(x1, x2) + 15, y - 16), msg, font=f_note, fill=col)
        else:
            draw_rounded_rect(draw, (x1 - 100, y - 12, x1 + 100, y + 16), radius=4, fill="#ECEFF1", outline="#90A4AE", width=1)
            draw.text((x1 - 92, y - 6), msg, font=get_font(9), fill="#263238")

    img.save(os.path.join(OUT_DIR, "fig_3_4_sequence.png"))

# 4. Figure 3.5: Level 1 Data Flow Diagram (DFD)
def make_fig_3_5():
    img = Image.new("RGB", (1000, 480), "#FAFAFA")
    draw = ImageDraw.Draw(img)
    f_title = get_font(16, bold=True)
    f_box = get_font(12, bold=True)
    f_txt = get_font(10, bold=False)

    draw.rectangle([0, 0, 1000, 42], fill="#1B5E20")
    draw.text((30, 10), "FIGURE 3.5: LEVEL 1 DATA FLOW DIAGRAM (DFD) - AGRIVISION SYSTEM", font=f_title, fill="#FFFFFF")

    # External Entity: Farmer / Officer
    draw.rectangle([30, 180, 160, 260], fill="#E8F5E9", outline="#2E7D32", width=2)
    draw.text((45, 205), "FARMER /\nAGRI OFFICER", font=f_box, fill="#1B5E20")

    # Process 1.0 Auth
    draw.ellipse([230, 70, 370, 170], fill="#E3F2FD", outline="#1565C0", width=2)
    draw.text((260, 105), "1.0\nUser Auth &\nRBAC Session", font=f_box, fill="#0D47A1")

    # Process 2.0 Ingest & Preprocess
    draw.ellipse([230, 270, 370, 370], fill="#E8F5E9", outline="#2E7D32", width=2)
    draw.text((250, 305), "2.0\nImage Intake &\nValidation", font=f_box, fill="#1B5E20")

    # Process 3.0 Inference
    draw.ellipse([460, 270, 600, 370], fill="#FFEBEE", outline="#C62828", width=2)
    draw.text((485, 305), "3.0\nCNN Disease\nInference", font=f_box, fill="#B71C1C")

    # Process 4.0 Recommendation & Severity
    draw.ellipse([690, 270, 830, 370], fill="#FFF3E0", outline="#E65100", width=2)
    draw.text((705, 305), "4.0\nAdvisory &\nSeverity Engine", font=f_box, fill="#E65100")

    # Process 5.0 Weather & Field Risk
    draw.ellipse([690, 70, 830, 170], fill="#EDE7F6", outline="#512DA8", width=2)
    draw.text((710, 105), "5.0\nWeather &\nPathogen Index", font=f_box, fill="#4A148C")

    # Data Stores
    draw.line([(450, 100), (600, 100)], fill="#37474F", width=2)
    draw.line([(450, 140), (600, 140)], fill="#37474F", width=2)
    draw.text((475, 112), "D1: Users Store", font=f_box, fill="#263238")

    draw.line([(450, 420), (600, 420)], fill="#37474F", width=2)
    draw.line([(450, 460), (600, 460)], fill="#37474F", width=2)
    draw.text((460, 432), "D2: Predictions Log", font=f_box, fill="#263238")

    draw.line([(690, 420), (840, 420)], fill="#37474F", width=2)
    draw.line([(690, 460), (840, 460)], fill="#37474F", width=2)
    draw.text((700, 432), "D3: Treatments Store", font=f_box, fill="#263238")

    # DFD Flows
    draw_arrow(draw, (160, 200), (240, 140), color="#1565C0")
    draw_arrow(draw, (160, 240), (230, 300), color="#2E7D32")
    draw_arrow(draw, (370, 120), (450, 120), color="#1565C0")
    draw_arrow(draw, (370, 320), (460, 320), color="#C62828")
    draw_arrow(draw, (600, 320), (690, 320), color="#E65100")
    draw_arrow(draw, (760, 370), (760, 420), color="#E65100")
    draw_arrow(draw, (760, 420), (760, 370), color="#E65100")
    draw_arrow(draw, (690, 340), (600, 430), color="#2E7D32")

    img.save(os.path.join(OUT_DIR, "fig_3_5_dfd.png"))

# 5. Figure 3.6: Diagnostic & Advisory Workflow Flowchart
def make_fig_3_6():
    img = Image.new("RGB", (1000, 520), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    f_title = get_font(16, bold=True)
    f_box = get_font(11, bold=True)
    f_lbl = get_font(10, bold=False)

    draw.rectangle([0, 0, 1000, 42], fill="#1B5E20")
    draw.text((30, 10), "FIGURE 3.6: DIAGNOSTIC & ADVISORY WORKFLOW (FLOWCHART OF INFERENCE)", font=f_title, fill="#FFFFFF")

    # Flowchart Blocks
    draw_rounded_rect(draw, (50, 100, 200, 160), radius=25, fill="#E8F5E9", outline="#2E7D32")
    draw.text((75, 120), "Start: Farmer Uploads\nLeaf Image / Camera", font=f_box, fill="#1B5E20")

    draw_arrow(draw, (200, 130), (260, 130), color="#2E7D32")

    draw_rounded_rect(draw, (260, 100, 420, 160), fill="#E3F2FD", outline="#1565C0")
    draw.text((275, 120), "Multer File Filter Check:\nJPEG/PNG & <= 5MB", font=f_box, fill="#0D47A1")

    draw_arrow(draw, (420, 130), (480, 130), color="#1565C0")

    # Decision: Valid File?
    draw.polygon([(540, 95), (610, 130), (540, 165), (470, 130)], fill="#FFF9C4", outline="#FBC02D", width=2)
    draw.text((515, 120), "Valid?", font=f_box, fill="#F57F17")

    # No -> Error
    draw_arrow(draw, (540, 165), (540, 220), color="#C62828")
    draw.text((550, 180), "No", font=f_lbl, fill="#C62828")
    draw_rounded_rect(draw, (460, 220, 620, 270), fill="#FFEBEE", outline="#C62828")
    draw.text((480, 235), "Return 400 / 413 Error", font=f_box, fill="#C62828")

    # Yes -> Forward to Flask
    draw_arrow(draw, (610, 130), (680, 130), color="#2E7D32")
    draw.text((630, 110), "Yes", font=f_lbl, fill="#2E7D32")

    draw_rounded_rect(draw, (680, 100, 880, 160), fill="#FFEBEE", outline="#C62828")
    draw.text((700, 115), "Flask /predict:\nResNet-50 PyTorch Forward\nSoftmax Confidence Max", font=f_box, fill="#B71C1C")

    # Next row
    draw_arrow(draw, (780, 160), (780, 320), color="#C62828")
    draw.text((790, 230), "Prediction Array", font=f_lbl, fill="#C62828")

    draw_rounded_rect(draw, (680, 320, 880, 390), fill="#FFF3E0", outline="#E65100")
    draw.text((695, 335), "Severity Heuristics:\nHealthy=Low | Conf>85%=High\nConf>95%=Critical", font=f_box, fill="#E65100")

    draw_arrow(draw, (680, 355), (580, 355), color="#E65100")

    draw_rounded_rect(draw, (380, 320, 580, 390), fill="#EDE7F6", outline="#512DA8")
    draw.text((395, 335), "Fetch Curated Treatment:\nOrganic, Chemical, Prevention\nfrom MongoDB / Fallback", font=f_box, fill="#4A148C")

    draw_arrow(draw, (380, 355), (280, 355), color="#512DA8")

    draw_rounded_rect(draw, (100, 320, 280, 390), fill="#E0F2F1", outline="#00796B")
    draw.text((115, 335), "Save Prediction to DB &\nReturn JSON Report to Client\nStatus: Pending Verification", font=f_box, fill="#004D40")

    draw_rounded_rect(draw, (100, 440, 280, 490), radius=20, fill="#E8F5E9", outline="#2E7D32")
    draw.text((130, 455), "End: Farmer Views Result", font=f_box, fill="#1B5E20")
    draw_arrow(draw, (190, 390), (190, 440), color="#00796B")

    img.save(os.path.join(OUT_DIR, "fig_3_6_flowchart_diagnosis.png"))

# 6. Figure 3.7: Flowchart of Weather Disease Risk Evaluation
def make_fig_3_7():
    img = Image.new("RGB", (1000, 480), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    f_title = get_font(16, bold=True)
    f_box = get_font(11, bold=True)
    f_lbl = get_font(10, bold=False)

    draw.rectangle([0, 0, 1000, 42], fill="#1B5E20")
    draw.text((30, 10), "FIGURE 3.7: FLOWCHART OF WEATHER-DRIVEN DISEASE RISK & SPRAY SUITABILITY", font=f_title, fill="#FFFFFF")

    # Start
    draw_rounded_rect(draw, (50, 80, 220, 140), radius=20, fill="#E8F5E9", outline="#2E7D32")
    draw.text((65, 95), "Query Weather Endpoint:\nDistrict / GPS Coordinates", font=f_box, fill="#1B5E20")

    draw_arrow(draw, (220, 110), (280, 110), color="#2E7D32")

    draw_rounded_rect(draw, (280, 80, 480, 140), fill="#E3F2FD", outline="#1565C0")
    draw.text((295, 95), "Call Open-Meteo REST API:\nTemp, Humidity, Precipitation,\nWeather Code, Wind Speed", font=f_box, fill="#0D47A1")

    draw_arrow(draw, (480, 110), (550, 110), color="#1565C0")

    # Decision: Humidity > 78% & Temp 18-32C?
    draw.polygon([(620, 75), (710, 110), (620, 145), (530, 110)], fill="#FFF9C4", outline="#FBC02D", width=2)
    draw.text((560, 102), "Hum>78% & 18-32°C?", font=get_font(9, bold=True), fill="#F57F17")

    # Yes -> High Risk
    draw_arrow(draw, (710, 110), (790, 110), color="#C62828")
    draw.text((735, 90), "Yes", font=f_lbl, fill="#C62828")
    draw_rounded_rect(draw, (790, 80, 960, 140), fill="#FFEBEE", outline="#C62828")
    draw.text((805, 95), "Risk: HIGH\nFungal Spore Germination\nAlert (Early/Late Blight)", font=f_box, fill="#B71C1C")

    # No -> Second check
    draw_arrow(draw, (620, 145), (620, 210), color="#1565C0")
    draw.text((630, 170), "No", font=f_lbl, fill="#1565C0")

    draw.polygon([(620, 210), (710, 245), (620, 280), (530, 245)], fill="#FFF9C4", outline="#FBC02D", width=2)
    draw.text((560, 237), "Hum>68% or Rain>40%?", font=get_font(9, bold=True), fill="#F57F17")

    # Yes -> Moderate
    draw_arrow(draw, (710, 245), (790, 245), color="#E65100")
    draw.text((735, 225), "Yes", font=f_lbl, fill="#E65100")
    draw_rounded_rect(draw, (790, 215, 960, 275), fill="#FFF3E0", outline="#E65100")
    draw.text((805, 230), "Risk: MODERATE\nElevated Canopy Humidity\nScout Lower Leaves", font=f_box, fill="#E65100")

    # No -> Low Risk
    draw_arrow(draw, (620, 280), (620, 345), color="#2E7D32")
    draw.text((630, 305), "No", font=f_lbl, fill="#2E7D32")
    draw_rounded_rect(draw, (530, 345, 710, 405), fill="#E8F5E9", outline="#2E7D32")
    draw.text((550, 360), "Risk: LOW\nDry Atmospheric Moisture\nStandard Farm Maintenance", font=f_box, fill="#1B5E20")

    # Spray suitability branch
    draw_rounded_rect(draw, (100, 345, 420, 420), fill="#EDE7F6", outline="#512DA8")
    draw.text((115, 360), "Evaluate Spray Suitability:\nClear/Partly Cloudy -> Optimal Spray\nRain/Thunderstorm -> Do Not Spray\nDew/Fog -> Wait for Canopy to Dry", font=f_box, fill="#4A148C")

    draw_arrow(draw, (280, 140), (260, 345), color="#512DA8")

    img.save(os.path.join(OUT_DIR, "fig_3_7_flowchart_weather.png"))

if __name__ == "__main__":
    print("Generating diagrams...")
    make_fig_3_1()
    print("Fig 3.1 OK")
    make_fig_3_3()
    print("Fig 3.3 OK")
    make_fig_3_4()
    print("Fig 3.4 OK")
    make_fig_3_5()
    print("Fig 3.5 OK")
    make_fig_3_6()
    print("Fig 3.6 OK")
    make_fig_3_7()
    print("Fig 3.7 OK")
    print("All diagrams generated successfully!")
