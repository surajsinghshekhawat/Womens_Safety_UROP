# Women Safety Analytics — Admin Dashboard

Web dashboard for moderators and admins: incident moderation, heatmap with clusters, analytics, and audit log.

## Setup

1. **Backend API** must be running (port 3001) with ML service (port 8000).
2. **Run migration 003** (moderation column) from `backend/ml`:
   ```bash
   cd backend/ml
   python run_migration_003.py
   ```
3. **Environment** (optional): set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, or `ADMIN_SECRET` and `JWT_SECRET` on the backend. Default login: `admin` / `admin`.

## Run

```bash
cd frontend/admin
npm install
npm run dev
```

Open http://localhost:5174. Log in with admin credentials, then use:

- **Dashboard** — Overview, recent incidents, ML health.
- **Moderation** — List incidents, filter by status/type, verify or reject.
- **Heatmap** — Load admin heatmap (with clusters) for a center/radius; view unsafe zones and high-risk cells.
- **Analytics** — Trends by day and severity (7d / 30d).
- **Audit** — Moderation history.

API requests are proxied to the backend via Vite proxy (`/api` → `http://192.168.1.12:3001`). All admin routes require a valid JWT from `POST /api/auth/admin-login`.
