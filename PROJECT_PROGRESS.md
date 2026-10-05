# AgriVision — AI-Driven Crop Disease Prediction Platform
## Project Documentation & Progress Tracker

> **Project Path:** `D:\project\FSD\crop-disease-prediction`
> **Last Updated:** October 6, 2026
> **Author:** Madhan V M | Register No: 310624104172 | CSE III C | Easwari Engineering College

---

## Tech Stack Overview

| Layer | Technology | Description |
|---|---|---|
| Frontend | React.js + Vite + Tailwind CSS v4 | Responsive UI, separate role workspaces, real-time widgets |
| Routing | React Router DOM | Protected routes with role workspace redirection |
| Real-Time Recommendation Engine | Custom Agronomic Knowledge Base + Open-Meteo Integration | Microclimate spray windows, pathogen-specific remedies, interactive dosage calculator |
| Weather & Microclimate | Open-Meteo REST API | Geolocation + district-level live temperature, humidity, wind, and fungal spore risk |
| Timezone | Intl API + Live Ticking Clock | Auto-detects client timezone (e.g. `Asia/Kolkata`) with live digital clock |
| Mobile & Device Intake | Multi-channel camera capture | Direct mobile camera shutter (`capture="environment"`), gallery picker, and WebRTC viewfinder |
| Backend API | Node.js + Express.js | Role-based REST endpoints, multi-part file handling, operational queuing |
| Database | MongoDB Atlas + In-Memory Fallback | Fully fault-tolerant dual-mode store (MongoDB Atlas + memoryStore fallback) |
| Auth | JSON Web Tokens (JWT) + Bcrypt.js | Secure password hashing, multi-role registration & demo 1-click accounts |
| AI Microservice | Python + Flask + PyTorch (ResNet50) | Serves `plant_disease_model.pth` with 38 disease classes on port 5000 |

---

## 3 Distinct Functional Workspaces with Real-Time Recommendations

### 1. 🌾 Farmer Workspace (`FarmerDashboard.jsx`)
- **Live Local Weather Widget:** Live temperature, apparent temperature, relative humidity, wind speed, rain probability, and crop pathogen environmental risk index.
- **AI Real-Time Agronomic Advisor (`RecommendationEngine.jsx`):**
  - **Live Spray Window:** Evaluates ambient wind (< 15 km/h) and temperature (< 32°C) to alert farmers whether it's safe to spray or if high drift/evaporation will occur.
  - **Microclimate Irrigation Schedule:** Tunes irrigation recommendations according to current soil moisture and rain probability.
  - **Crop & Pathogen Selection Pills:** Instant access to treatment guides for Tomato, Potato, Apple, Corn, and Grape.
  - **Field Dosage Calculator:** Farmers can input farm acreage (e.g. 1.5 acres) and knapsack tank size (e.g. 16L) to compute total water, formulation in kg, and exact grams to mix per tank.
- **Intelligent Crop Intake Scanner (`Scanner.jsx`):**
  - Mobile Camera Shutter (`capture="environment"`)
  - Device Gallery / File Picker
  - Live in-app Desktop Webcam Viewfinder
  - Crop species selector & field plot block identifier

### 2. 📋 Agricultural Field Officer Workspace (`OfficerDashboard.jsx`)
- **Priority Agronomic Directives:** Recommends inspection priority based on current disease severity and ambient humidity.
- **Chemical Dilution Guidance:** Pre-calculated recommended dilution ratios (g/L or ml/L), pre-harvest safety interval (PHI) days, and mode of action.
- **Physical Inspection Form:** Allows recording **Soil pH Level**, **Soil Moisture %**, **Affected Area %**, and prescribed treatment actions.
- **Containment Radius:** Guidance on isolating adjacent rows to prevent airborne conidial spread.

### 3. 🛡️ Central Administration Workspace (`AdminDashboard.jsx`)
- **District Outbreak Early Warnings:** Microclimate hazard monitoring to identify potential solanaceous blight outbreaks before they spread.
- **Agronomist Dispatch Recommendations:** Suggests prioritizing field officers to high-risk polyhouses and high-density orchards experiencing elevated moisture.
- **Supply Stocking Guidelines:** Recommends proactive procurement of copper hydroxides and bio-agents at local extension depots.
- **Incoming Disease Queue & Officer Dispatch:** Full verification, severity adjustment, and officer dispatching.

---

## 🔑 Pre-Seeded Direct Test Accounts (1-Click Login Available)

| Role | Email | Password | Display Name |
|---|---|---|---|
| **Farmer** | `farmer@agrivision.com` | `Farmer@123` | Ramesh Kumar |
| **Field Officer** | `officer@agrivision.com` | `Officer@123` | Dr. Priya Sharma |
| **Administrator** | `admin@agrivision.com` | `Admin@123` | Dr. Vikramaditya |

---

## 📡 API Endpoints Reference

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/recommendations/advisories` | Real-time agronomic advisories, spray windows, and role directives |
| `POST` | `/api/recommendations/calculate-dosage` | Interactive chemical & biological knapsack dilution calculator |
| `GET` | `/api/weather` | Live Open-Meteo weather, district presets, and pathogen risk index |
| `GET` | `/api/auth/demo-accounts` | Returns test credentials for 1-click role testing |
| `POST` | `/api/auth/register` | Registers new user with specific role (`farmer`, `officer`, `admin`) |
| `POST` | `/api/auth/login` | Authenticates user, returns JWT and user payload |
| `POST` | `/api/predict` | Uploads leaf image, runs ResNet50 inference, logs report with crop plot |
| `GET` | `/api/history` | Fetches scan history for logged-in farmer |
| `GET` | `/api/operations/reports` | Role-filtered incident queue (Admin, Officer, Farmer) |
| `GET` | `/api/operations/summary` | Real-time platform statistics (Farmers, Officers, Reports, Incidents) |
| `GET` | `/api/operations/officers` | List of registered agricultural officers for admin dispatching |
| `PATCH` | `/api/operations/reports/:id/verify` | Admin verifies report severity & notes |
| `PATCH` | `/api/operations/reports/:id/assign` | Admin assigns field officer to report |
| `PATCH` | `/api/operations/reports/:id/action` | Officer logs physical soil pH, moisture, and treatment actions |

---

## 🚀 Active Services Status

| Service | Port / URL | Status |
|---|---|---|
| **Frontend (React + Vite)** | `http://localhost:5173/` | 🟢 Online |
| **Backend API (Node.js)** | `http://localhost:4000/` | 🟢 Online |
| **AI Microservice (PyTorch)** | `http://localhost:5000/` | 🟢 Online (`plant_disease_model.pth` loaded) |
