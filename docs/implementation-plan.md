# Implementation Plan (Aquanotes Admin)

## 1) Discovered Backend Resources
- Auth: bearer token via `POST /users/login` and `Authorization: Bearer <token>`.
- Core entities: Users, Tambak (farm), Kolam (pond), Devices, SensorData, Notifications, Device Thresholds.
- Admin device provisioning: `X-API-Key` for `/admin/devices`.
- Monitoring: aggregated latest + historical per kolam/device at `/monitoring`.
- Export: CSV download at `/export/csv`.

## 2) Chosen Routes / Pages
- `/login`
- `/` dashboard overview
- `/ponds` (tambak + kolam hierarchy)
- `/devices` (claim, assign, thresholds, status)
- `/readings` (sensor data table + detail view)
- `/alerts` (notifications list + unread controls)
- `/users` (admin only)
- `/settings` (profile, notification preferences)

## 3) Auth Approach
- Use bearer token login (`/users/login`).
- Store access token in memory, mirror to `localStorage` for refresh fallback.
- Attach token in `Authorization` header via API wrapper.
- Route guards for auth; role guard for admin once RBAC is added.

## 4) Milestones Checklist
- Milestone 1: project setup + Tailwind + shadcn/ui + layout + auth flows.
- Milestone 2: dashboard + core lists (tambak/kolam, devices, alerts).
- Milestone 3: CRUD forms + detail views + charting.
- Milestone 4: data tables with filtering, pagination, export.
- Milestone 5: Docker/nginx, env config, README/docs.
