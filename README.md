# CivilApp

CivilApp is a construction intelligence platform with two separate user experiences:

- **CivilApp Infra** — roads, railway and earthwork projects
- **CivilApp Build** — villas, buildings and residential developments

The public frontend never contains login credentials. Authentication is handled by the FastAPI backend.

## Structure

- `frontend/` — React + TypeScript + Vite
- `backend/` — FastAPI + SQLAlchemy
- `docker-compose.yml` — local PostgreSQL
- `.env.example` — environment-variable template

## Secure demo bootstrap

Demo accounts are optional and are created only when `ENABLE_DEMO_SEED=true`. Email addresses and passwords must be supplied as hosting environment variables:

- `BOOTSTRAP_INFRA_EMAIL`
- `BOOTSTRAP_INFRA_PASSWORD`
- `BOOTSTRAP_BUILD_EMAIL`
- `BOOTSTRAP_BUILD_PASSWORD`

Never commit real values to this repository.

## Frontend deployment

The frontend can be deployed to Vercel. Set:

`VITE_API_URL=https://your-backend-domain.example`

Without a reachable backend, secure login cannot work.

## Backend deployment

For the demo, FastAPI can run on a managed Python/container host with PostgreSQL. After approval, the same backend can be moved to AWS and object storage can be connected for project photos, documents and drone media.

## Local development

Start PostgreSQL with `docker compose up -d db`, install the backend requirements and run `uvicorn app.main:app --reload`. In `frontend/`, run `npm install` followed by `npm run dev`.
