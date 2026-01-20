Perfect — here’s the **revised, mobile-first PRD**, with the **web dashboard clearly secondary**, fully structured for your MVP and realistic features.

---

# 🧭 PRODUCT REQUIREMENTS DOCUMENT (PRD) — MOBILE-FIRST

**Project Title:** Women Safety Analytics: Real-Time Monitoring & Proactive Crime Prevention
**Type:** Research-grade MVP → Deployable Mobile Application
**Domain:** Environment
**Areas:** AI, ML, HCI, IoT, Mobile App Development
**Version:** v1.1 (Mobile-first MVP)
**Owner:** UROP Project Team
**Last Updated:** October 2025

---

## 1️⃣ Problem Statement

Women’s safety in public spaces is reactive rather than proactive. Existing apps mostly focus on post-incident SOS and lack **predictive risk analytics, real-time unsafe-zone alerts, and personalized safety recommendations**.

**Need:** A **mobile app** that combines predictive analytics, instant emergency response, and community-based safety support to prevent incidents and improve real-time situational awareness.

---

## 2️⃣ Objective

Deliver a **personalized mobile app** that:

* Tracks user location safely in real-time
* Detects and warns about unsafe areas using ML
* Sends instant SOS alerts to trusted contacts
* Provides safe routing and community support features

**Secondary (Web) Module:** Admin/police dashboard for monitoring alerts and managing reports.

---

## 3️⃣ Target Users

| Type                        | Description                        | Goals                                         |
| --------------------------- | ---------------------------------- | --------------------------------------------- |
| Individual Women            | Students, commuters, professionals | Stay safe, receive alerts, SOS support        |
| Safety Authorities / Police | Campus or city security            | Access actionable alerts, monitor hotspots    |
| Community Users             | Nearby app users (opt-in)          | Coordinate walking together, mutual support   |
| Admins                      | Project team / moderators          | Validate reports, manage data, monitor system |

---

## 4️⃣ Core Value Proposition

> “A mobile-first, AI-powered personal safety app that predicts, prevents, and responds to risks — putting control in the user’s hands before danger occurs.”

---

## 5️⃣ Goals & Success Metrics

| Metric                          | Target  | Measurement                             |
| ------------------------------- | ------- | --------------------------------------- |
| SOS response latency            | < 5 sec | End-to-end test of alert delivery       |
| Unsafe-zone prediction accuracy | ≥ 85%   | ML evaluation on historical + test data |
| User retention                  | 70%+    | App analytics (DAU/MAU)                 |
| Heatmap refresh latency         | < 5 sec | Backend + mobile sync logs              |
| Report validation accuracy      | ≥ 90%   | Admin dashboard audit                   |

---

## 6️⃣ Scope Breakdown

### ✅ In-Scope (MVP)

* Mobile app (iOS & Android)
* Panic/SOS button (manual, gesture, optional voice)
* Live location sharing & tracking
* ML-based unsafe-zone alerts
* Safety heatmap overlay on map
* Safe-route planning using risk-weighted paths
* Community reporting & incident feedback
* Secondary web dashboard (admin/police visualization)

### 🚫 Out-of-Scope (v2+)

* Wearable IoT integration
* Camera-based behavior analytics
* AR safety lens
* Blockchain incident ledger
* Full automated police dispatch

---

## 7️⃣ Core Mobile App Features

### 🆘 Panic / Emergency

* Manual button, gesture, voice activation
* Sends location to emergency contacts & nearby responders
* Optional fake siren or silent SOS mode
* Local audio recording (if consented)

### 📍 Real-Time Location & Alerts

* Background GPS tracking with low power optimization
* Unsafe-zone alerts when entering high-risk clusters
* Live location sharing with trusted contacts for a defined period

### 🔥 Safety Heatmap

* ML clustering of incident reports
* Dynamic risk scoring (0–5) per grid cell
* Heatmap updates in real-time as new reports arrive

### 🗺️ Safe Route Planning

* Uses map APIs (Google Maps / Mapbox)
* Routes computed to minimize risk exposure
* Real-time rerouting based on updated heatmap data

### 🤝 Community Features

* User-generated incident reports (category, optional photo)
* Safety Pods / trusted contacts group for shared alerts
* Community feed of verified local incidents

### 🗣️ Optional / Stretch MVP

* Voice-activated panic mode
* Silent gesture SOS
* Personalized predictive risk index

---

## 8️⃣ Web Dashboard (Secondary Module)

* Real-time map of incidents & unsafe zones
* Monitor SOS alerts
* Validate/flag false reports
* Analytics: top unsafe zones, active alerts, trend analysis

> Note: Dashboard is **support-only**, not a user-facing product.

---

## 9️⃣ System Modules Overview

| Module              | Description                          | Stack                                    | Notes                                   |
| ------------------- | ------------------------------------ | ---------------------------------------- | --------------------------------------- |
| **Mobile App**      | Core UX for SOS, tracking, heatmap   | React Native / Expo / Mapbox             | Android + iOS                           |
| **Backend API**     | SOS routing, reports, ML inference   | Node.js + Express / PostgreSQL + PostGIS | Handles requests from mobile clients    |
| **ML Engine**       | Unsafe-zone clustering & predictions | Python / FastAPI / Scikit-learn          | Exposes API for mobile heatmap & alerts |
| **Notifications**   | Push/SMS alerts                      | Firebase Cloud Messaging, Twilio         | Emergency delivery                      |
| **Admin Dashboard** | Web interface for authorities        | React.js + WebSockets                    | Optional access                         |
| **Auth & Security** | User login, emergency contacts       | Firebase Auth / JWT                      | Privacy & encryption enforced           |

---

## 10️⃣ Tech Stack (Mobile-First)

| Layer           | Tools                                                |
| --------------- | ---------------------------------------------------- |
| Mobile App      | React Native, Expo bare workflow, Mapbox/Google Maps |
| Backend         | Node.js + Express, PostgreSQL + PostGIS              |
| ML/AI           | Python, Scikit-learn, TensorFlow (optional), FastAPI |
| Notifications   | Firebase Cloud Messaging, Twilio (SMS fallback)      |
| Security        | AES encryption, HTTPS, JWT/Firebase Auth             |
| Cloud / Hosting | AWS / Render / Firebase                              |
| Testing         | Jest, Mocha, PyTest, Detox (React Native)            |

---

## 11️⃣ Data Flow Overview

1. User opens mobile app → location enabled
2. Mobile app fetches local heatmap + risk scores
3. User moves → ML engine updates risk for current location
4. Unsafe-zone alert triggers push notification
5. Panic/SOS triggers:

   * Emergency contacts (mobile push, SMS)
   * Nearby opted-in Safety Pods
   * Admin dashboard updates live
6. User reports feed back into ML model for refinement
7. Admin dashboard shows verified incidents in near real-time

---

## 12️⃣ MVP Delivery Plan

| Phase                             | Timeline   | Deliverables                                          |
| --------------------------------- | ---------- | ----------------------------------------------------- |
| Phase 1: Research & Design        | Week 1–2   | Architecture, dataset planning, wireframes            |
| Phase 2: Mobile MVP Build         | Week 3–6   | Panic/SOS, live location, heatmap overlay, safe-route |
| Phase 3: Backend & ML Integration | Week 7–8   | Reports API, heatmap & cluster updates, routing       |
| Phase 4: Testing & Evaluation     | Week 9–10  | Functional + performance + UX testing                 |
| Phase 5: Deployment & Demo        | Week 11–12 | Mobile app + admin dashboard demo                     |
| Phase 6: Post-MVP Enhancements    | Week 13+   | Predictive ML, IoT integration, voice/gesture SOS     |

---

## 13️⃣ Evaluation Metrics

| Area             | Metric                | Target                |
| ---------------- | --------------------- | --------------------- |
| ML / Unsafe-Zone | Accuracy              | ≥ 85%                 |
| SOS              | Response latency      | < 5 sec               |
| UX               | Panic & alert success | ≥ 95% success in test |
| App Performance  | Heatmap refresh       | < 5 sec               |
| Reliability      | Crash-free sessions   | ≥ 99%                 |

---

## 14️⃣ Risks & Mitigation

| Risk             | Impact | Mitigation                          |
| ---------------- | ------ | ----------------------------------- |
| GPS accuracy     | Medium | Smoothing, multi-source tracking    |
| Privacy concerns | High   | Opt-in, encrypted data, minimal PII |
| False reports    | Medium | Admin validation + trust score      |
| Alert latency    | High   | Push + SMS fallback                 |
| Model bias       | Medium | Diverse datasets, fairness checks   |

---

## 15️⃣ Future Roadmap (v2+)

* Predictive risk index & personalized alert thresholds
* Smart wearable SOS integration
* AR safety lens for visualization
* Behavioral anomaly detection via motion sensors
* Emotion analysis for distress detection
* Enhanced police/campus security integration

---

✅ **Summary:**

* Mobile app = **primary product** (MVP: SOS, location, heatmap, safe routes)
* Web dashboard = **secondary module** for authorities
* AI/ML = unsafe-zone detection & predictive analytics
* Community reporting = feedback loop for heatmap & risk scoring
* Privacy & security embedded throughout

---

I can also **generate this as a ready-to-drop `/docs/PRD.md` file** with checklists for Cursor to track MVP features, stretch features, and tasks.

Do you want me to do that next?
