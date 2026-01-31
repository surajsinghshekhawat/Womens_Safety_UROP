# Women Safety Analytics — Research Readiness Checklist (Strict)

This checklist captures **everything that should be improved/added/removed/changed** to make the system academically defensible, consistent, and “no loose ends”.

**Rule:** Do not claim a capability in reports unless the corresponding checklist item is completed *or* it is explicitly labeled as future work.

---

## P0 — Must fix (security, correctness, credibility)

### Security / secrets / repo hygiene
- [ ] **Remove all secrets from repo history**
  - **Current issue:** a Google Maps API key was previously present in config; keys must be treated as compromised once committed anywhere public.
  - **Fix:** rotate keys, restrict keys (Android package + SHA1, iOS bundle ID), and keep keys out of git.
- [ ] **Standardize configuration management**
  - Use environment-based config for:
    - backend URLs (dev/staging/prod),
    - maps keys,
    - ML service URL.
- [ ] **Eliminate hardcoded user identity**
  - Reports/SOS/location updates currently use placeholder IDs in places.
  - Must switch to authenticated user identity before claiming “user-level safety system”.

### Data validity & trust
- [ ] **Anti-abuse & trust controls for community reports**
  - Rate limiting, spam detection, duplicate detection, device/user reputation, and/or moderation.
  - Without this, risk maps are trivially gameable.
- [ ] **Clarify dataset provenance**
  - If using synthetic data for demos: label clearly as synthetic.
  - For research claims: define plan for verified/official datasets or verified reporting process.

### Risk scoring correctness (must be fixed for research-quality)
- [ ] **Recency must affect density**
  - **Current issue:** very old incidents can still inflate the *density* factor because density uses raw counts.
  - **Fix options (choose one):**
    - time-window density (e.g., last 90/180 days),
    - or recency-weighted density (preferred).
- [ ] **Timezone correctness for incident timestamps**
  - Ensure incident “hour-of-day” features are computed in the intended local timezone.
  - Current system uses “local hour now” but must confirm incident timestamps align.
- [ ] **Distance weighting should be meter-based**
  - Current distance weighting uses Euclidean degrees; improve by:
    - haversine distance in meters, or
    - PostGIS distance functions for accuracy.

### Heatmap correctness (geospatial)
- [ ] **Replace heuristic sea filtering with polygon masking**
  - Current coastline handling is heuristic (longitude cutoff).
  - Research-grade solution: land polygon (GeoJSON) + point-in-polygon or PostGIS containment.
- [ ] **Cell fields must be truthful**
  - If heatmap returns `incident_count` / `last_incident`, compute them correctly or remove them from responses to avoid misleading outputs.

### Real-time claims (WebSocket)
- [ ] **Define what “real-time” means and implement accordingly**
  - If “real-time = incident notification triggers refresh”, document that.
  - If “real-time = server pushes heatmap deltas”, implement `heatmap:update` properly.
- [ ] **Location-room targeting**
  - Current behavior may broadcast widely; implement true radius-based targeting or stop claiming it.

---

## P1 — Should fix (feature completeness + consistency)

### Safe route feature (end-to-end completion)
- [ ] **Real routing provider integration**
  - Integrate a routing engine (Google Directions / Mapbox / OSRM) to obtain real road polylines and alternatives.
  - Keep API keys on backend (not in app).
- [ ] **Efficient route risk scoring**
  - Avoid per-point DB queries at scale by using corridor/batch queries or cached incident sets.
- [ ] **Mobile route UI**
  - Destination picker, multiple route display, recommended “safest” route selection, highlight high-risk segments.

### Media upload (if you want to claim it as implemented)
- [ ] **Backend media ingestion + storage**
  - Decide storage: local dev storage vs S3/GCS.
  - Implement upload endpoint, validation, and retrieval.
- [ ] **Link media to incidents**
  - Store media metadata (URL, mime type) with incident record.

### Authentication & admin (if you want to claim them)
- [ ] **Authentication implementation**
  - Replace mock auth flows with real auth (Firebase Auth is present in dependencies but must be wired end-to-end).
- [ ] **Admin analytics must be real**
  - Replace mock dashboards with DB-derived metrics.
  - Add authorization.

### Documentation consistency
- [ ] **Remove contradictions across docs**
  - Some docs may describe components as “not built” while they exist.
  - Ensure a single, consistent truth across documentation and reports.

---

## P2 — Nice to have (research strength + scalability + polish)

### Evaluation framework (publishable methodology)
- [ ] **Define ground truth and evaluation protocol**
  - temporal holdout, spatial leakage controls, calibration testing.
- [ ] **Ablation studies**
  - density-only vs density+recency vs full model.
- [ ] **Parameter sensitivity**
  - DBSCAN eps/min_samples sweeps, stability analysis.

### Performance engineering
- [ ] **Caching**
  - Heatmap caching by query parameters/time buckets.
- [ ] **Viewport tiling / progressive refinement**
  - Coarse heatmap first, refine as user zooms.
- [ ] **Load testing**
  - Define SLOs and test concurrency.

### Product UX
- [ ] **Explainability UI**
  - Show why a location is risky (factor breakdown).
- [ ] **Privacy controls**
  - Retention policy, anonymization/aggregation for public views.

---

## “Ready” definitions (so you know when it’s safe to claim completion)

### Hackathon-ready (demo)
- Heatmap loads reliably on device.
- Reporting works and updates map on refresh.
- SOS triggers backend and logs incident.
- Clear disclaimers about synthetic data, heuristics, and mock admin/auth.

### Research-prototype ready (approval / journal planning)
- No secrets in repo; keys rotated and restricted.
- Risk scoring is time-zone correct and recency affects density.
- Geospatial masking is polygon-based (not heuristic cutoff).
- Safe-route is either fully implemented OR explicitly “future work”.
- Clear evaluation plan; no invented “accuracy” metrics.

