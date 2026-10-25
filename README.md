# 🌿 AgriVision: AI-Driven Crop Disease Prediction & Farm Advisory Platform

AgriVision is an enterprise-grade full-stack precision agriculture platform built with the **MERN Stack (MongoDB, Express.js, React 18, Node.js)** and an isolated **PyTorch ResNet-50 Deep Learning AI microservice** running on Python/Flask.

The system empowers farmers to scan, diagnose, and treat crop foliar diseases in real-time, backed by microclimate weather forecasts, chemical dilution calculators, and specialized workspaces for Agricultural Extension Officers and System Administrators.

---

## 🏗️ Architecture Overview

```
                      +-----------------------------------+
                      |      React 18 SPA (Vite UI)       |
                      |  • Mobile Camera & WebRTC Scan    |
                      |  • Live Open-Meteo Weather Widget |
                      |  • Role-Based Workspaces          |
                      +-----------------+-----------------+
                                        | (REST / JWT)
                                        v
                      +-----------------------------------+
                      |    Node.js + Express API Gateway  |
                      |  • Port 4000                      |
                      |  • Role Middleware (RBAC)         |
                      |  • Image Proxy & Risk Indexing    |
                      +--------+-----------------+--------+
                               |                 |
       (Mongoose Document ODM) |                 | (Multipart Proxy)
                               v                 v
                 +-------------+----+     +------+--------------------+
                 |  MongoDB Database |     |  Flask AI Microservice    |
                 |  • crop_disease_db|     |  • Port 5000              |
                 |  • Users / Scans  |     |  • PyTorch ResNet-50      |
                 |  • Clinical Rx    |     |  • 38 Pathogen Classes    |
                 +-------------------+     +---------------------------+
```

---

## ✨ Key Features

1. **AI Folio Diagnosis Engine (ResNet-50):**
   - Classifies 38 distinct crop disease conditions across major agricultural crops (Tomato, Potato, Apple, Maize, Grape, etc.).
   - Provides confidence scores, pathogen taxonomy, and severity level assessments.

2. **Multi-Input Crop Scanner:**
   - Native device camera capture (`capture="environment"` for mobile field usage).
   - In-app WebRTC live camera viewfinder for tablets and laptops.
   - Drag-and-drop file uploader with instant client-side preview.

3. **Three Role-Based Workspaces:**
   - **Farmer Dashboard:** Quick diagnostic scan, historical scan log, treatment schedules, and localized farm alerts.
   - **Agricultural Field Officer Dashboard:** Incident inspection queue, verification tools, farmer plot assignments, and field readings.
   - **Administrator Operations:** System-wide scan metrics, user management, disease outbreak geographical tracking.

4. **Real-Time Microclimate & Spray Windows:**
   - Open-Meteo API integration with automated GPS geo-location & district presets (Chennai, Coimbatore, Madurai, Bengaluru, Delhi, etc.).
   - Disease Risk Index calculation based on ambient humidity, temperature, and precipitation probability.
   - Optimal pesticide/fungicide spray window recommendations.

5. **Agronomic Treatment & Dilution Engine:**
   - Dual-protocol treatment options: Organic/biological remedies vs. chemical fungicides.
   - Interactive tank mix dilution & dosage calculator based on field acreage and sprayer volume.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6 |
| **Backend API** | Node.js, Express.js, JSON Web Tokens (JWT), Multer, Mongoose, Bcrypt |
| **AI Microservice** | Python 3.10+, PyTorch, Torchvision, Flask, Pillow, Flask-CORS |
| **Database** | MongoDB (Local or MongoDB Atlas Cloud) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js:** v18+ (v20+ recommended)
- **Python:** 3.9+ with pip and virtual environment support
- **MongoDB:** Local MongoDB community service or MongoDB Atlas cluster connection string

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/Madhan07-01/crop-disease-prediction.git
cd crop-disease-prediction
```

---

### Step 2: Configure Environment Variables
Copy the sample environment file in `server/`:
```bash
cp server/.env.example server/.env
```
Edit `server/.env` if using a remote MongoDB Atlas cluster:
```env
MONGO_URI=mongodb://adminUser:Admin%40123@localhost:27017/crop_disease_db?authSource=admin
JWT_SECRET=super_secret_jwt_key_change_in_production
PORT=4000
FLASK_AI_URL=http://localhost:5000/predict
```

---

### Step 3: Start AI Microservice (Port 5000)
```bash
cd ai_service
# Activate virtual environment if configured:
# .venv\Scripts\activate  (Windows)
# source .venv/bin/activate  (Linux/macOS)
pip install -r requirements.txt
python app.py
```

---

### Step 4: Start Express Backend (Port 4000)
```bash
cd server
npm install
node server.js
```
*(On first boot, the server automatically seeds initial demo accounts and clinical treatment guidelines into MongoDB).*

---

### Step 5: Start React Frontend (Port 5173)
```bash
cd client
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 👥 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Farmer** | `farmer@agrivision.com` | `Farmer@123` |
| **Field Officer** | `officer@agrivision.com` | `Officer@123` |
| **Administrator** | `admin@agrivision.com` | `Admin@123` |

*(1-click demo login buttons are also available on the landing page for quick evaluation).*

---

## 📄 License
This project is licensed under the MIT License.
