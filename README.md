# CivilApp Demo

Demo-first civil/construction project monitoring app.

## Structure

- `frontend/` — React + TypeScript + Vite
- `backend/` — FastAPI + SQLAlchemy
- `docker-compose.yml` — local PostgreSQL
- `.env.example` — environment template

## Demo accounts

- MD: `md@civilapp.local` / `demo123`
- Manager: `manager@civilapp.local` / `demo123`
- Field: `field@civilapp.local` / `demo123`

## Local run

### 1) Database
```bash
docker compose up -d db
```

### 2) Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env
uvicorn app.main:app --reload
```

Backend: http://localhost:8000  
API docs: http://localhost:8000/docs

### 3) Frontend
```bash
cd frontend
npm install
cp ../.env.example .env
npm run dev
```

Frontend: http://localhost:5173

## Deployment plan

For demo:
- Frontend: Vercel
- Backend: Render/Railway/Fly.io or similar Python host
- DB: managed PostgreSQL

After approval:
- move backend/database/object storage to AWS without rewriting the app.
