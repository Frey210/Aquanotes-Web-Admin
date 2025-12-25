# Aquanotes Admin

Web admin dashboard for AquaNotes (Management Tambak). Built with React 18, Vite, Tailwind, shadcn/ui patterns, React Query, and TanStack Table.

## Features
- Token auth with protected routes
- Dashboard KPIs + sensor trend chart
- Tambak/Kolam, Devices, Readings, Alerts, Users, Settings
- Server-side pagination headers for users + readings
- CSV export for readings
- Light/Dark mode

## Local Setup
1) Copy environment file
```powershell
Copy-Item .env.example .env
```
2) Install dependencies
```powershell
npm install
```
3) Generate types from OpenAPI
```powershell
npm run generate:api
```
4) Run dev server
```powershell
npm run dev
```

The backend base URL is controlled by `VITE_API_BASE_URL`. The backend exposes routes at `/`, so use `http://localhost:8000` unless you proxy it.

Auth storage: the access token is cached in memory and mirrored to `localStorage` to persist reloads. Consider switching to httpOnly refresh cookies if the backend adds them.

## Environment Variables
| Key | Description | Example |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Base URL API backend. | `https://api.example.com` |

## Docker
Build and run the admin with nginx:
```powershell
docker build -t aquanotes-admin .
docker run -p 5174:80 aquanotes-admin
```

Or via docker-compose (adjust backend service/image as needed):
```powershell
docker-compose up --build
```

Healthcheck endpoint: `http://localhost:5174/healthz`

## Build Arg untuk Production
Vite membaca env saat build. Untuk set base URL di Docker build:
```powershell
docker build -t aquanotes-admin `
  --build-arg VITE_API_BASE_URL=https://api.example.com .
```

Pastikan `Dockerfile` membaca build arg:
```
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
```

## Kubernetes (K3s)
Contoh deployment untuk cluster Raspberry Pi (arm64):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: aquanotes-web-admin
  namespace: aquanotes
spec:
  replicas: 1
  selector:
    matchLabels:
      app: aquanotes-web-admin
  template:
    metadata:
      labels:
        app: aquanotes-web-admin
    spec:
      containers:
        - name: web-admin
          image: <registry>/aquanotes-admin:1.0.0
          ports:
            - containerPort: 80
          readinessProbe:
            httpGet:
              path: /healthz
              port: 80
            initialDelaySeconds: 5
            periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: aquanotes-web-admin
  namespace: aquanotes
spec:
  selector:
    app: aquanotes-web-admin
  type: ClusterIP
  ports:
    - name: http
      port: 80
      targetPort: 80
```

## Cloudflare Tunnel (Opsional)
Expose `admin.<domain>` ke Service `aquanotes-web-admin` via Cloudflare Tunnel.

## OpenAPI Types
- Source schema: `docs/openapi.json`
- Generated types: `src/api/generated/openapi.ts`

Regenerate types after backend changes:
```powershell
npm run generate:api
```
