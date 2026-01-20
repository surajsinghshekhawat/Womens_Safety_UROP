# 📚 Critical Workflow Steps - Women Safety Analytics

## 🧠 Memory Restoration Guide
*If memory resets, use this to quickly restore project context*

### Project Context
- **Project:** Women Safety Analytics - Real-Time Monitoring & Proactive Crime Prevention
- **Type:** Mobile-first MVP with secondary web dashboard
- **Domain:** Environment, AI/ML, HCI, IoT
- **Current Phase:** Foundation Setup

### Key Files & Locations
- **PRD:** `prd.md` (comprehensive product requirements)
- **Task Tracker:** `tasks/todo.md`
- **Dev Notes:** `tasks/dev.md`
- **This File:** `tasks/steps.md`

### Tech Stack Decisions Made
- **Mobile:** React Native/Expo (iOS & Android)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL + PostGIS (local development setup)
- **Auth:** Firebase Auth
- **ML:** Python + FastAPI + Scikit-learn
- **Maps:** Mapbox/Google Maps integration
- **Notifications:** Firebase Cloud Messaging + Twilio

### MVP Priority Order (From PRD)
1. Panic/SOS button (manual, gesture, optional voice)
2. Live location sharing & tracking
3. ML-based unsafe-zone alerts
4. Safety heatmap overlay on map
5. Safe-route planning using risk-weighted paths
6. Community reporting & incident feedback
7. Secondary web dashboard (admin/police visualization)

### Security Standards
- No secrets in repository
- Firebase Auth for authentication
- AES encryption for location data
- HTTPS for all communications
- Opt-in consent for all data collection

### Development Workflow
1. **Read → Plan → Confirm → Execute**
2. Always update `tasks/todo.md` before coding
3. Wait for user confirmation before implementation
4. Work atomically - one task at a time
5. Mark complete ✅ and document changes

### Current Status
- Project structure setup in progress
- Mobile app foundation next
- Firebase Auth integration planned
- Local PostgreSQL setup needed

### Next Immediate Steps
1. Create project folder structure
2. Initialize mobile app with Expo
3. Configure Firebase Auth
4. Set up backend API foundation

---

## 🔄 Quick Context Restore Commands
*If starting fresh, run these to understand current state*

```bash
# Check project structure
ls -la

# Review current tasks
cat tasks/todo.md

# Check development notes
cat tasks/dev.md

# Review PRD for full context
cat prd.md
```

---

## 📞 Key Decisions Made
- **Authentication:** Firebase Auth (confirmed by user)
- **Database:** PostgreSQL with local development setup (confirmed by user)
- **Approach:** Mobile-first with web dashboard as secondary (from PRD)
- **Starting Point:** Foundation setup, then Panic/SOS button (highest priority MVP feature)

