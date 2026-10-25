import os
from PIL import Image, ImageDraw, ImageFont

OUT_DIR = os.path.dirname(__file__)

def get_font(size, bold=False):
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

def draw_browser_frame(draw, width, height, title_text):
    # Window Header
    draw.rectangle([0, 0, width, 32], fill="#E0E0E0")
    # Red, yellow, green window dots
    draw.ellipse([12, 10, 24, 22], fill="#FF5F56")
    draw.ellipse([32, 10, 44, 22], fill="#FFBD2E")
    draw.ellipse([52, 10, 64, 22], fill="#27C93F")
    # URL bar
    draw.rounded_rectangle([100, 6, width - 100, 26], radius=4, fill="#FFFFFF", outline="#BDBDBD")
    draw.text((110, 8), title_text, font=get_font(10), fill="#616161")
    # Body background
    draw.rectangle([0, 32, width, height], fill="#F8FAFC")

# 5.1 Login
def make_fig_5_1():
    W, H = 800, 480
    img = Image.new("RGB", (W, H), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    draw_browser_frame(draw, W, H, "https://agrivision.ai/login")
    
    # Card in center
    cx, cy = W // 2, (H + 32) // 2
    cw, ch = 380, 360
    draw.rounded_rectangle([cx - cw//2, cy - ch//2, cx + cw//2, cy + ch//2], radius=10, fill="#FFFFFF", outline="#E2E8F0", width=2)
    
    # Brand
    draw.text((cx - 70, cy - ch//2 + 25), "AgriVision AI", font=get_font(20, bold=True), fill="#1B5E20")
    draw.text((cx - 110, cy - ch//2 + 55), "Sign in to your farmer / officer portal", font=get_font(11), fill="#64748B")
    
    # Inputs
    draw.text((cx - 150, cy - ch//2 + 95), "Email Address", font=get_font(11, bold=True), fill="#334155")
    draw.rounded_rectangle([cx - 150, cy - ch//2 + 115, cx + 150, cy - ch//2 + 150], radius=6, fill="#F8FAFC", outline="#CBD5E1")
    draw.text((cx - 140, cy - ch//2 + 125), "farmer@agrivision.com", font=get_font(11), fill="#1E293B")
    
    draw.text((cx - 150, cy - ch//2 + 165), "Password", font=get_font(11, bold=True), fill="#334155")
    draw.rounded_rectangle([cx - 150, cy - ch//2 + 185, cx + 150, cy - ch//2 + 220], radius=6, fill="#F8FAFC", outline="#CBD5E1")
    draw.text((cx - 140, cy - ch//2 + 195), "••••••••••••", font=get_font(11), fill="#1E293B")
    
    # Sign In Button
    draw.rounded_rectangle([cx - 150, cy - ch//2 + 245, cx + 150, cy - ch//2 + 285], radius=6, fill="#2E7D32")
    draw.text((cx - 25, cy - ch//2 + 256), "Sign In", font=get_font(13, bold=True), fill="#FFFFFF")
    
    # Demo badges
    draw.text((cx - 145, cy - ch//2 + 305), "Quick Demo: [Farmer] [Extension Officer] [Admin]", font=get_font(9), fill="#166534")
    
    img.save(os.path.join(OUT_DIR, "fig_5_1_login.png"))

# 5.2 Dashboard
def make_fig_5_2():
    W, H = 800, 480
    img = Image.new("RGB", (W, H), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    draw_browser_frame(draw, W, H, "https://agrivision.ai/dashboard")
    
    # Sidebar
    draw.rectangle([0, 32, 160, H], fill="#1B5E20")
    draw.text((20, 50), "AgriVision AI", font=get_font(14, bold=True), fill="#FFFFFF")
    draw.text((20, 85), "• Dashboard\n• Leaf Scanner\n• Weather Advisory\n• Crop History\n• Operations\n• Settings", font=get_font(11), fill="#C8E6C9")
    
    # Top Metrics
    metrics = [
        ("Total Scans", "148", "+12% this week", "#2E7D32"),
        ("Active Alerts", "3 High", "Immediate Spray", "#C62828"),
        ("Weather Risk", "Moderate", "Humidity 68%", "#E65100"),
        ("Officer Status", "Assigned", "Triage in Progress", "#1565C0")
    ]
    for i, (title, val, sub, col) in enumerate(metrics):
        x = 180 + i * 150
        draw.rounded_rectangle([x, 50, x + 140, 130], radius=8, fill="#FFFFFF", outline="#E2E8F0")
        draw.text((x + 12, 60), title, font=get_font(10), fill="#64748B")
        draw.text((x + 12, 78), val, font=get_font(15, bold=True), fill=col)
        draw.text((x + 12, 105), sub, font=get_font(8), fill="#94A3B8")
        
    # Main Content Cards
    draw.rounded_rectangle([180, 150, 480, 460], radius=8, fill="#FFFFFF", outline="#E2E8F0")
    draw.text((195, 165), "Recent Crop Health Diagnostics", font=get_font(12, bold=True), fill="#1E293B")
    records = [
        ("Tomato Leaf - Field 2", "Tomato Early Blight", "94% Conf", "Critical"),
        ("Potato Leaf - North Plot", "Potato Early Blight", "89% Conf", "High"),
        ("Corn Canopy - East", "Corn Common Rust", "92% Conf", "High"),
        ("Apple Foliage - Block 1", "Apple Scab", "96% Conf", "Critical"),
        ("Grape Leaf - South Plot", "Grape Healthy", "99% Conf", "Low")
    ]
    for idx, (cr, dis, cnf, sev) in enumerate(records):
        y = 195 + idx * 50
        draw.text((195, y), cr, font=get_font(10, bold=True), fill="#334155")
        draw.text((195, y + 16), f"{dis} • {cnf}", font=get_font(9), fill="#64748B")
        draw.rounded_rectangle([400, y + 5, 465, y + 25], radius=4, fill="#FEE2E2" if sev in ['Critical', 'High'] else "#DCFCE7")
        draw.text((410, y + 9), sev, font=get_font(8, bold=True), fill="#991B1B" if sev in ['Critical', 'High'] else "#166534")

    # Right Chart / Weather overview
    draw.rounded_rectangle([500, 150, 780, 460], radius=8, fill="#FFFFFF", outline="#E2E8F0")
    draw.text((515, 165), "Field Climate & Spray Advisory", font=get_font(12, bold=True), fill="#1E293B")
    draw.text((515, 195), "District: Chennai, Tamil Nadu (Live GPS)\nTemp: 31°C | Humidity: 65% | Wind: 11 km/h\nStatus: Partly Cloudy\n\nSpray Suitability: OPTIMAL\nDisease Germination Risk: LOW\n\nRecommendation:\nFoliage moisture is moderate. Morning preventive\ncopper spray can proceed safely before rain front.", font=get_font(10), fill="#475569")
    
    img.save(os.path.join(OUT_DIR, "fig_5_2_dashboard.png"))

# 5.3 Scanner
def make_fig_5_3():
    W, H = 800, 480
    img = Image.new("RGB", (W, H), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    draw_browser_frame(draw, W, H, "https://agrivision.ai/scan")
    
    # Sidebar
    draw.rectangle([0, 32, 160, H], fill="#1B5E20")
    draw.text((20, 50), "AgriVision AI", font=get_font(14, bold=True), fill="#FFFFFF")
    draw.text((20, 85), "• Dashboard\n• [Leaf Scanner]\n• Weather Advisory\n• Crop History\n• Operations\n• Settings", font=get_font(11), fill="#C8E6C9")
    
    # Scanner Area
    draw.text((190, 55), "AI Leaf Disease Scanner", font=get_font(16, bold=True), fill="#1E293B")
    draw.text((190, 80), "Upload high-resolution leaf photograph or capture directly via mobile camera", font=get_font(10), fill="#64748B")
    
    # Upload dropzone
    draw.rounded_rectangle([190, 110, 500, 380], radius=8, fill="#F8FAFC", outline="#94A3B8", width=2)
    draw.text((290, 210), "[📷 Drag & Drop Leaf Image]", font=get_font(13, bold=True), fill="#2E7D32")
    draw.text((260, 240), "Supports JPEG & PNG formats (Max 5MB)", font=get_font(10), fill="#64748B")
    draw.rounded_rectangle([290, 275, 400, 305], radius=5, fill="#2E7D32")
    draw.text((310, 283), "Select File", font=get_font(11, bold=True), fill="#FFFFFF")
    
    # Metadata Form on Right
    draw.rounded_rectangle([520, 110, 780, 430], radius=8, fill="#FFFFFF", outline="#E2E8F0")
    draw.text((535, 125), "Field Observation Details", font=get_font(12, bold=True), fill="#1E293B")
    
    draw.text((535, 160), "Crop Variety / Species", font=get_font(10, bold=True), fill="#334155")
    draw.rounded_rectangle([535, 180, 765, 210], radius=5, fill="#F8FAFC", outline="#CBD5E1")
    draw.text((545, 188), "Tomato (Solanum lycopersicum)", font=get_font(10), fill="#1E293B")
    
    draw.text((535, 225), "Field / Plot Location", font=get_font(10, bold=True), fill="#334155")
    draw.rounded_rectangle([535, 245, 765, 275], radius=5, fill="#F8FAFC", outline="#CBD5E1")
    draw.text((545, 253), "Primary North Greenhouse, Block 3", font=get_font(10), fill="#1E293B")
    
    draw.text((535, 290), "Farmer Observations & Symptoms", font=get_font(10, bold=True), fill="#334155")
    draw.rounded_rectangle([535, 310, 765, 360], radius=5, fill="#F8FAFC", outline="#CBD5E1")
    draw.text((545, 318), "Concentric brown rings on lower leaves", font=get_font(9), fill="#64748B")
    
    draw.rounded_rectangle([535, 380, 765, 420], radius=6, fill="#1B5E20")
    draw.text((600, 393), "Analyze Leaf Health", font=get_font(12, bold=True), fill="#FFFFFF")
    
    img.save(os.path.join(OUT_DIR, "fig_5_3_scanner.png"))

# 5.4 Diagnostic Result
def make_fig_5_4():
    W, H = 800, 480
    img = Image.new("RGB", (W, H), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    draw_browser_frame(draw, W, H, "https://agrivision.ai/report/671a5c89")
    
    # Sidebar
    draw.rectangle([0, 32, 160, H], fill="#1B5E20")
    draw.text((20, 50), "AgriVision AI", font=get_font(14, bold=True), fill="#FFFFFF")
    draw.text((20, 85), "• Dashboard\n• Leaf Scanner\n• Weather Advisory\n• [Results]\n• Operations\n• Settings", font=get_font(11), fill="#C8E6C9")
    
    # Top diagnosis badge
    draw.rounded_rectangle([180, 50, 780, 130], radius=8, fill="#FEF2F2", outline="#EF4444", width=2)
    draw.text((200, 62), "DIAGNOSIS: Tomato Early Blight (Alternaria solani)", font=get_font(14, bold=True), fill="#B91C1C")
    draw.text((200, 88), "Inference Confidence: 94.2%  |  Severity: CRITICAL  |  Status: Pending Officer Verification", font=get_font(11), fill="#7F1D1D")
    draw.text((200, 108), "Report ID: 671a5c89...  |  Plot: North Greenhouse Block 3  |  Scanned: Oct 2026", font=get_font(9), fill="#991B1B")
    
    # Treatment Tabs
    tabs = [
        ("🌿 Organic Treatment", 180, 370, "#E8F5E9", "#2E7D32", 
         "• Apply copper-based organic fungicides (Bordeaux mixture).\n• Remove and safely incinerate heavily spotted lower foliage.\n• Spray liquid Bacillus subtilis bio-fungicide every 7 days.\n• Mulch soil base with clean dry straw to stop spore splash."),
        ("🧪 Chemical Intervention", 380, 570, "#E3F2FD", "#1565C0", 
         "• Chlorothalonil 75% WP @ 2g/L water at first lesion sign.\n• Alternate with Azoxystrobin 23% SC to stop resistance.\n• Mancozeb 75% WP as preventive shield on adjacent crops.\n• Observe strict 7-day pre-harvest withholding interval."),
        ("🛡️ Prevention Protocol", 580, 780, "#FFF8E1", "#F57F17", 
         "• Enforce 24-inch inter-plant spacing for canopy airflow.\n• Irrigate strictly at ground root level; do not wet foliage.\n• Implement 3-year crop rotation (avoid Solanaceae crops).\n• Sanitize pruning shears with 70% isopropyl alcohol.")
    ]
    for title, x1, x2, bg, border, content in tabs:
        draw.rounded_rectangle([x1, 145, x2, 450], radius=8, fill=bg, outline=border, width=2)
        draw.rectangle([x1, 145, x2, 180], fill=border)
        draw.text((x1 + 10, 155), title, font=get_font(11, bold=True), fill="#FFFFFF")
        draw.text((x1 + 10, 195), content, font=get_font(9), fill="#1E293B")
        
    img.save(os.path.join(OUT_DIR, "fig_5_4_treatment.png"))

# 5.5 Officer Dashboard
def make_fig_5_5():
    W, H = 800, 480
    img = Image.new("RGB", (W, H), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    draw_browser_frame(draw, W, H, "https://agrivision.ai/operations")
    
    # Sidebar
    draw.rectangle([0, 32, 160, H], fill="#0D47A1")
    draw.text((20, 50), "Officer Portal", font=get_font(14, bold=True), fill="#FFFFFF")
    draw.text((20, 85), "• Field Triage\n• Assigned Cases\n• Soil & Moisture\n• Disease Registry\n• Farmers Log", font=get_font(11), fill="#BBDEFB")
    
    draw.text((180, 50), "District Agricultural Extension & Triage Center", font=get_font(15, bold=True), fill="#1E293B")
    draw.text((180, 75), "Manage pending field diagnoses, assign extension staff, and record soil telemetry", font=get_font(10), fill="#64748B")
    
    # Table of Cases
    draw.rounded_rectangle([180, 105, 780, 450], radius=8, fill="#FFFFFF", outline="#E2E8F0")
    draw.rectangle([180, 105, 780, 135], fill="#F1F5F9")
    draw.text((195, 115), "Farmer / Plot", font=get_font(10, bold=True), fill="#475569")
    draw.text((310, 115), "Diagnosed Disease", font=get_font(10, bold=True), fill="#475569")
    draw.text((460, 115), "Severity", font=get_font(10, bold=True), fill="#475569")
    draw.text((540, 115), "Status", font=get_font(10, bold=True), fill="#475569")
    draw.text((660, 115), "Field Telemetry", font=get_font(10, bold=True), fill="#475569")
    
    cases = [
        ("M. Ramesh (Plot 2)", "Tomato Early Blight", "Critical", "officer_assigned", "pH 6.2 | Moist 72%"),
        ("K. Suresh (North)", "Potato Late Blight", "High", "under_investigation", "pH 6.5 | Moist 80%"),
        ("A. Kumar (East)", "Corn Common Rust", "High", "treatment_applied", "pH 6.8 | Moist 65%"),
        ("P. Lakshmi (South)", "Apple Scab", "Critical", "pending_verification", "Telemetry Pending"),
        ("V. Anand (Plot 5)", "Grape Black Rot", "Medium", "resolved", "pH 7.0 | Moist 58%")
    ]
    for idx, (frm, dis, sev, st, tel) in enumerate(cases):
        y = 150 + idx * 55
        draw.text((195, y), frm, font=get_font(9, bold=True), fill="#1E293B")
        draw.text((310, y), dis, font=get_font(9), fill="#334155")
        draw.text((460, y), sev, font=get_font(9, bold=True), fill="#B91C1C" if sev in ['Critical', 'High'] else "#F57F17")
        draw.rounded_rectangle([535, y - 4, 640, y + 16], radius=4, fill="#E0F2FE")
        draw.text((545, y), st, font=get_font(8, bold=True), fill="#0369A1")
        draw.text((660, y), tel, font=get_font(9), fill="#15803D" if "pH" in tel else "#64748B")
        draw.line([(180, y + 26), (780, y + 26)], fill="#F1F5F9")
        
    img.save(os.path.join(OUT_DIR, "fig_5_5_officer.png"))

# 5.6 Weather
def make_fig_5_6():
    W, H = 800, 480
    img = Image.new("RGB", (W, H), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    draw_browser_frame(draw, W, H, "https://agrivision.ai/weather")
    
    # Sidebar
    draw.rectangle([0, 32, 160, H], fill="#1B5E20")
    draw.text((20, 50), "AgriVision AI", font=get_font(14, bold=True), fill="#FFFFFF")
    draw.text((20, 85), "• Dashboard\n• Leaf Scanner\n• [Weather Advisory]\n• Crop History\n• Operations\n• Settings", font=get_font(11), fill="#C8E6C9")
    
    draw.text((180, 50), "Agricultural Micro-Climate & Spray Suitability Center", font=get_font(15, bold=True), fill="#1E293B")
    draw.text((180, 75), "Live Open-Meteo API synchronization for district & GPS field stations", font=get_font(10), fill="#64748B")
    
    # Main Climate Card
    draw.rounded_rectangle([180, 105, 460, 450], radius=8, fill="#FFFFFF", outline="#E2E8F0")
    draw.text((200, 120), "Current Meteorological Conditions", font=get_font(12, bold=True), fill="#0F172A")
    draw.text((200, 145), "Location: Coimbatore District Station (11.01° N, 76.95° E)", font=get_font(9), fill="#64748B")
    
    params = [
        ("Air Temperature", "28° C", "Feels like 30° C"),
        ("Relative Humidity", "82%", "CRITICAL (>78% triggers fungal alert)"),
        ("Wind Velocity", "9 km/h", "Ideal for low drift application (<15 km/h)"),
        ("Precipitation Chance", "65%", "Rain shower expected in 4 hours"),
        ("Weather Classification", "Partly Cloudy / Humid", "Code 2 - High Spore Index")
    ]
    for idx, (p, v, note) in enumerate(params):
        y = 175 + idx * 50
        draw.text((200, y), p, font=get_font(10, bold=True), fill="#334155")
        draw.text((200, y + 16), v, font=get_font(12, bold=True), fill="#1B5E20" if "82%" not in v else "#B91C1C")
        draw.text((200, y + 32), note, font=get_font(8), fill="#64748B")
        
    # Decision Side
    draw.rounded_rectangle([480, 105, 780, 260], radius=8, fill="#FEF2F2", outline="#EF4444", width=2)
    draw.text((500, 120), "Fungal Disease Warning: HIGH RISK", font=get_font(13, bold=True), fill="#991B1B")
    draw.text((500, 150), "Atmospheric moisture (82%) combined with temperature\nbetween 20°C and 30°C creates optimal micro-climate\nfor Early Blight and Downy Mildew germination.\nScout lower leaves immediately.", font=get_font(10), fill="#7F1D1D")
    
    draw.rounded_rectangle([480, 280, 780, 450], radius=8, fill="#EFF6FF", outline="#3B82F6", width=2)
    draw.text((500, 295), "Chemical Spray Window: HOLD SPRAY", font=get_font(13, bold=True), fill="#1D4ED8")
    draw.text((500, 325), "Spray Suitability: UNSUITABLE\nPrecipitation probability exceeds 60% within 4 hours.\nChemical / bio-fungicide sprays will be washed off\nbefore systemic leaf absorption.\nPostpone spraying until weather clears.", font=get_font(10), fill="#1E40AF")
    
    img.save(os.path.join(OUT_DIR, "fig_5_6_weather.png"))

# 5.7 History Log
def make_fig_5_7():
    W, H = 800, 480
    img = Image.new("RGB", (W, H), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    draw_browser_frame(draw, W, H, "https://agrivision.ai/history")
    
    # Sidebar
    draw.rectangle([0, 32, 160, H], fill="#1B5E20")
    draw.text((20, 50), "AgriVision AI", font=get_font(14, bold=True), fill="#FFFFFF")
    draw.text((20, 85), "• Dashboard\n• Leaf Scanner\n• Weather Advisory\n• [Crop History]\n• Operations\n• Settings", font=get_font(11), fill="#C8E6C9")
    
    draw.text((180, 50), "Farm Health Audit & Historical Scan Records", font=get_font(15, bold=True), fill="#1E293B")
    draw.text((180, 75), "Permanent immutable audit trail of past leaf analyses and treatments applied", font=get_font(10), fill="#64748B")
    
    # Filter Bar
    draw.rounded_rectangle([180, 100, 780, 135], radius=6, fill="#FFFFFF", outline="#CBD5E1")
    draw.text((195, 110), "🔍 Search scans... | Filter: All Crops ▼ | Severity: All ▼ | Export CSV ⬇", font=get_font(10), fill="#475569")
    
    # History Table
    draw.rounded_rectangle([180, 145, 780, 450], radius=8, fill="#FFFFFF", outline="#E2E8F0")
    draw.rectangle([180, 145, 780, 175], fill="#F8FAFC")
    draw.text((195, 155), "Date & Time", font=get_font(9, bold=True), fill="#475569")
    draw.text((290, 155), "Crop & Plot", font=get_font(9, bold=True), fill="#475569")
    draw.text((420, 155), "Detected Pathogen", font=get_font(9, bold=True), fill="#475569")
    draw.text((560, 155), "Confidence", font=get_font(9, bold=True), fill="#475569")
    draw.text((650, 155), "Action Protocol", font=get_font(9, bold=True), fill="#475569")
    
    hist = [
        ("Oct 24, 14:32", "Tomato (North)", "Tomato Early Blight", "94.2%", "Copper Spray Applied"),
        ("Oct 22, 11:15", "Potato (Field 1)", "Potato Early Blight", "88.9%", "Mancozeb 75 WP"),
        ("Oct 19, 09:40", "Corn (East)", "Corn Common Rust", "91.8%", "Foliar Fungicide"),
        ("Oct 15, 16:20", "Apple (Block A)", "Apple Scab", "96.4%", "Pruned & Disinfected"),
        ("Oct 10, 10:05", "Tomato (South)", "Tomato Healthy", "99.1%", "Scouting Routine OK")
    ]
    for idx, (dt, cr, dis, cnf, act) in enumerate(hist):
        y = 190 + idx * 50
        draw.text((195, y), dt, font=get_font(9), fill="#64748B")
        draw.text((290, y), cr, font=get_font(9, bold=True), fill="#1E293B")
        draw.text((420, y), dis, font=get_font(9), fill="#B91C1C" if "Healthy" not in dis else "#15803D")
        draw.text((560, y), cnf, font=get_font(9, bold=True), fill="#0F172A")
        draw.text((650, y), act, font=get_font(9), fill="#475569")
        draw.line([(180, y + 26), (780, y + 26)], fill="#F1F5F9")
        
    img.save(os.path.join(OUT_DIR, "fig_5_7_history.png"))

if __name__ == "__main__":
    print("Generating UI mockups...")
    make_fig_5_1()
    print("5.1 OK")
    make_fig_5_2()
    print("5.2 OK")
    make_fig_5_3()
    print("5.3 OK")
    make_fig_5_4()
    print("5.4 OK")
    make_fig_5_5()
    print("5.5 OK")
    make_fig_5_6()
    print("5.6 OK")
    make_fig_5_7()
    print("5.7 OK")
    print("All UI mockups generated successfully!")
