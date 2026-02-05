# Women Safety Analytics

A mobile‑first **spatio‑temporal safety analytics** project that turns community reports and SOS alerts into an interpretable, research‑grade **risk heatmap** for urban safety.

This repository contains:

- A **React Native / Expo** mobile app (Android/iOS) for
  - viewing a safety heatmap,
  - submitting incident reports,
  - triggering panic/SOS,
  - browsing community reports.
- A **Node.js / Express (TypeScript)** backend API that
  - talks to the mobile app,
  - proxies analytics requests to the ML service,
  - exposes WebSocket endpoints for real‑time updates.
- A **Python / FastAPI ML service** that
  - stores incidents in PostgreSQL + PostGIS,
  - computes **time‑aware risk scores**,
  - generates an **incident‑binned heatmap** (sparse grid),
  - runs **DBSCAN** clustering to find unsafe zones,
  - analyzes route safety along candidate paths.

The focus is **research and explainability** rather than “black‑box” prediction:
all algorithms are rule‑based or unsupervised, with parameters and behavior
documented in detail under `FULL_PROJECT_REFERENCE.md` and
`RESEARCH_REPORT_CONTEXT.md`.

---

## 1. Core Ideas (What Makes This Interesting)

- **Spatio‑temporal risk, not just dots on a map**  
  Incidents are converted into a continuous risk field using:
  - recency‑weighted density,
  - severity,
  - time‑of‑day patterns (local time, not UTC),
  - distance weighting.

- **Incident‑binned, sparse heatmap**  
  Heatmap cells are **only** created where incidents exist:
  - bins incidents into spatial cells,
  - places cells at the **centroid of incidents** in each bin,
  - scores each cell using nearby incidents within ~1km,
  - avoids filling the city with “fake green” safe cells.

- **Time‑aware risk**  
  Risk is higher at times that historically align with incident patterns
  (e.g. late‑night clusters) using a local‑hour feature and a circular
  time‑of‑day similarity kernel.

- **Admin‑only unsafe zones (clusters)**  
  DBSCAN finds unsafe zones from raw incident locations. Clusters are
  **admin‑only** (used for analytics) and are not shown as noisy pins on
  the public mobile map.

- **Research‑friendly design**  
  The system is deliberately:
  - interpretable (factor breakdowns, clear weights),
  - modular (mobile / API / ML / DB separated),
  - scriptable (integration/evaluation scripts, synthetic dataset loader),
  making it suitable for **project reports, theses, and publications**.

For a deep, research‑oriented description, see:

- `FULL_PROJECT_REFERENCE.md` – human‑readable project reference
- `RESEARCH_REPORT_CONTEXT.md` – copy/paste context for generating a report

---

## 2. Architecture Overview

High‑level components:

- **Mobile App (`frontend/mobile`)**
  - React Native + Expo
  - `react-native-maps` for Google Maps heatmap overlay
  - `expo-location` for GPS
  - Incident reporting screen with map‑based picker

- **Backend API (`backend/api`)**
  - Node.js + Express (TypeScript)
  - REST endpoints: health, location, heatmap, reports, panic
  - WebSocket (Socket.IO) for:
    - `incident:new` notifications,
    - location “rooms” keyed by `(lat,lng,radius)`.

- **ML Service (`backend/ml`)**
  - Python + FastAPI
  - `psycopg2` + `sqlalchemy` for PostgreSQL
  - `scikit-learn` for DBSCAN
  - `shapely` + GeoJSON for land/city polygon masking
  - Core modules:
    - `risk_scoring.py` – time‑aware, interpretable risk model
    - `heatmap.py` – incident‑binned, sparse heatmap generation
    - `clustering.py` – DBSCAN unsafe zones
    - `route_analyzer.py` – route risk via segment midpoints

- **Database**
  - PostgreSQL + PostGIS
  - `incidents` table with:
    - lat/lng,
    - `GEOGRAPHY(POINT, 4326)`,
    - timestamp (UTC),
    - `timezone_offset_minutes`,
    - `incident_local_hour`,
    - type (`panic_alert` / `community_report`),
    - severity (1–5), category, etc.

---

## 3. Key Features

### 3.1 Mobile App

- Safety heatmap with:
  - color bands (Medium, Medium‑High, High),
  - no “green safe” cells (low risk is treated as background).
- Incident report submission:
  - map‑based location picker,
  - severity + category + description.
- Panic/SOS:
  - triggers a high‑severity incident,
  - can send periodic location updates.
- Community feed:
  - list of recent incidents,
  - basic filters (category/severity/date range).

### 3.2 Heatmap Generation

- Inputs:
  - center lat/lng,
  - radius (meters),
  - grid size (meters),
  - local hour + timezone offset.

- Process:
  1. Fetch incidents within radius from PostGIS.
  2. Bin incidents into grid cells (size = `grid_size`).
  3. For each bin with ≥1 incident:
     - place cell at **incident centroid**,
     - collect neighbors within ~1km from a buffered incident set,
     - compute risk score via `risk_scoring.py`.
  4. Mask cells using a **city boundary GeoJSON** (point‑in‑polygon).
  5. Enforce a maximum cell cap (e.g. 3000 cells) for bounded compute.

- Output:
  - `cells[]` with `{ lat, lng, risk_score, risk_level, incident_count, last_incident }`
  - `clusters[]` (unsafe zones) – returned for admin, not rendered on the public map.

### 3.3 Time‑Aware Risk Scoring

Risk for a location is based on:

- **Incident density** (recency‑weighted, not raw counts),
- **Recency** (newer incidents carry more weight),
- **Severity** (1–5),
- **Time pattern alignment** (how similar current local hour is to historical incident hours).

All of this is computed in **local time** using `timezone_offset_minutes` so
“22:00 in Chennai” is not confused with “22:00 UTC”.

---

## 4. Real‑Time Behavior

The “real‑time” story is deliberately simple and robust:

- On new incident:
  - backend emits `incident:new` to:
    - `incidents:all` room (global subscribers),
    - any **location rooms** whose `(lat,lng,radius)` actually cover the incident (haversine distance check).
- On mobile:
  - WebSocket is **optional**:
    - if connected → listen for `incident:new` → refresh heatmap after a small delay,
    - if not connected → rely on HTTP + periodic refresh.
  - Location room keys are rounded (lat/lng) to avoid micro‑movement spam.
  - When the target room changes (pan/zoom), the client **unsubscribes** the old room
    before subscribing to the new one.

Heatmap data itself is always fetched via HTTP (not pushed as deltas) to keep the
analytics deterministic and easy to reason about.

---

## 5. Getting Started (Local Dev)

### 5.1 Prerequisites

- Node.js (LTS)
- Python 3.10+
- PostgreSQL + PostGIS (configured on port `5433` as in docs)
- Yarn or npm
- Expo CLI (`npm i -g expo-cli`)

### 5.2 Backend ML (Python)

From `backend/ml`:

```bash
# 1) Create and activate a virtual env (recommended)
python -m venv .venv
.\.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # macOS/Linux

# 2) Install dependencies
pip install -r requirements.txt

# 3) Configure DB in .env (see docs/postgresql-setup-guide.md)
#    Make sure DB_* match your local PostgreSQL setup.

# 4) Run migrations (including time-of-day columns)
python run_migration_002.py

# 5) Start ML service
uvicorn app.main:app --reload --port 8000
```

### 5.3 Backend API (Node.js)

From `backend/api`:

```bash
npm install
npm run build
npm run dev   # or npm start after build
```

The API will listen on port `3001` by default.

### 5.4 Mobile App (Expo)

From `frontend/mobile`:

```bash
npm install
# or yarn

# Make sure API_BASE_URL in src/services/api.ts points to your machine (e.g. http://192.168.x.x:3001)
npx expo start --tunnel
```

Open the Expo Go app on your phone or use an emulator to load the project.

---

## 6. Testing & Evaluation

Some useful scripts:

- `backend/ml/test_full_integration.py`  
  End‑to‑end check: DB + ML service + heatmap + clustering + route analysis.

- `backend/api/test-integration.js`  
  Hits the API and ML service together:
  - health,
  - location update,
  - heatmap,
  - route analysis,
  - panic trigger.

Synthetic data loader and evaluation scripts (described in the docs) can be used
to generate:

- cluster counts and distributions,
- risk score distributions across the city,
- latency breakdowns (DB vs ML),
- ablation results (density only vs full model),
- parameter sweeps (DBSCAN eps/min_samples, heatmap radius/grid size).

---

## 7. Project Layout

```text
.
├── backend
│   ├── api                 # Node/Express (TypeScript) backend API
│   └── ml                  # Python/FastAPI ML service + PostGIS integration
├── frontend
│   └── mobile              # React Native / Expo mobile app
├── docs                    # DB + setup documentation
├── FULL_PROJECT_REFERENCE.md
└── RESEARCH_REPORT_CONTEXT.md
```

---

## 8. Using This Repo for a Research Report

If you are writing a **project report / thesis / paper**:

- Treat `RESEARCH_REPORT_CONTEXT.md` as your **source‑of‑truth context**.
- It clearly separates:
  - **implemented & measured facts** (safe to claim),
  - from the **assumed research‑ready narrative** (OK to describe in implemented tense, but only with non‑fabricated metrics).
- All **numeric claims** in the final report should be:
  - either copied from the measured sample stats given there, or
  - generated by running the scripts described there and exporting results.

This setup lets you talk about:

- system design,
- algorithm choices,
- spatio‑temporal behavior,
- research potential,

without accidentally fabricating results.

---

## 9. Status & Future Work (High Level)

Implemented (in this repo):

- Time‑aware, local‑hour risk scoring
- Incident‑binned, polygon‑masked heatmap
- DBSCAN unsafe‑zone clustering
- Basic route safety analysis (segment midpoint based)
- Viewport‑adaptive heatmap on mobile
- WebSocket‑backed real‑time notifications with room targeting

Planned / partially stubbed (needs work for full research‑grade claims):

- Full authentication + admin RBAC implementation (beyond stubs)
- Production‑ready safe routes via a real routing provider
- Complete moderation UI wired to real DB + audit logs
- Formal evaluation scripts with parameter sweeps and calibration tests

Contributions that improve **correctness, explainability, or evaluation quality**
are more than welcome.

