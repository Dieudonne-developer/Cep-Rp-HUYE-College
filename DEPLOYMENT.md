Deploying to Render (Backend + Frontend)
========================================

This repository is set up for a smooth Render deployment using a single `render.yaml` at the repo root. It provisions:
- A Node web service for the backend (`backend/`)
- A Static Site for the frontend (`frontend/`)

Prerequisites
-------------
- A MongoDB connection string (e.g., MongoDB Atlas)
- A GitHub repository with this code pushed
- Render account

What’s already prepared
-----------------------
- `render.yaml` defines both services and wires the frontend to the backend URL automatically
- Backend listens on `process.env.PORT` and has CORS configured for Render domains
- Frontend uses `VITE_API_BASE_URL` at build-time, auto-populated from the backend service URL

Steps
-----
1) Push to GitHub
- Commit and push this repo to GitHub

2) Create Backend on Render
- From `render.yaml`, Render will create the web service `cep-backend`
- In Render dashboard → `cep-backend` → Environment
  - Add `MONGODB_URI` (required)
  - Optional: `CLIENT_ORIGIN`, `FRONTEND_URL`, `BACKEND_URL` will be auto-populated by render.yaml; you can override if needed
- First deploy will run `npm install` then `node server.js`

3) Create Frontend on Render
- From `render.yaml`, Render will create the static site `cep-frontend`
- Build command: `npm install && npm run build`
- Publish path: `dist`
- `VITE_API_BASE_URL` is automatically set to your backend’s URL

4) Verify CORS and Socket
- CORS middleware allows:
  - Local dev origins
  - `CLIENT_ORIGIN` from env
  - Any `https://*.onrender.com`/`https://*.render.com`
- If you later add a custom domain, set `CLIENT_ORIGIN=<https://your-domain>` in backend env

5) Environment variables summary
- Backend (web):
  - PORT: set by Render (render.yaml default 10000 is fine; Render injects one)
  - NODE_ENV=production
  - MONGODB_URI=your Mongo URI (required)
  - CLIENT_ORIGIN: auto from `cep-frontend` URL (can be overridden)
  - BACKEND_URL: auto from backend service URL (informational)
- Frontend (static):
  - VITE_API_BASE_URL: auto from backend URL at build time

6) Local development tips
- Backend: `cd backend && npm install && npm run dev`
- Frontend: `cd frontend && npm install && npm run dev`
- For local frontend, create `frontend/.env`:
  - `VITE_API_BASE_URL=http://localhost:4000`

Troubleshooting
---------------
- 404 or CORS on API calls from production:
  - Ensure `MONGODB_URI` is set and backend is healthy
  - Check backend logs on Render
  - Confirm frontend’s `VITE_API_BASE_URL` is set to the backend URL (Render sets automatically)
  - If using a custom domain, add it to backend env as `CLIENT_ORIGIN`
- Socket.IO not connecting:
  - Ensure the frontend uses the same base URL (it does via `VITE_API_BASE_URL`)
  - Check Render logs for any CORS errors


