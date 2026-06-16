# WorldCup Intel 2026

Real-time match intelligence for the FIFA World Cup 2026 — live scores, Poisson score models, Six Sigma control charts, tactical formation diagrams, crowd factor analysis, and full head-to-head history.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS + Recharts |
| Backend | Python 3.12 + FastAPI + APScheduler (60s polling) |
| Data source | Football-Data.org API v4 |
| Database | Supabase (PostgreSQL) |
| Backend hosting | Railway |
| Frontend hosting | Vercel |

## Features

- **Live scores** auto-refresh every 60 seconds
- **Poisson probability grid** — auto-calculated xG from each team's last 10 matches
- **Six Sigma I-chart** — per-team goals-scored control chart with UCL/LCL signals
- **Tactical formations** — real starting lineups from Football-Data.org when available
- **Crowd factor** — atmosphere index, venue capacity, host-nation bias for all 18 WC stadiums
- **Head-to-head history** — full historical record from Football-Data.org
- **Group standings** and **top scorers** sidebar

## Local Development

### Prerequisites
- Python 3.12+
- Node.js 18+
- A [Supabase](https://supabase.com) project with the schema from `supabase_schema.sql`
- A [Football-Data.org](https://www.football-data.org) API key (free tier works)

### 1. Clone and configure
```bash
git clone https://github.com/YOUR_USERNAME/worldcup-intel.git
cd worldcup-intel
cp .env.example .env
# Edit .env and fill in your keys
```

### 2. Create Supabase tables
Paste `supabase_schema.sql` into your Supabase SQL editor and run it.

### 3. Start the backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Swagger UI at http://localhost:8000/docs
```

### 4. Start the frontend
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:3000
```

## Deployment

### Backend → Railway

1. Create a new Railway project at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set the **Root Directory** to `/` (Railway uses `railway.toml` at the repo root)
4. Add the following **Environment Variables** in Railway dashboard:

| Variable | Value |
|---|---|
| `FOOTBALL_DATA_API_KEY` | Your Football-Data.org key |
| `SUPABASE_URL` | `https://your-project.supabase.co` |
| `SUPABASE_KEY` | Your Supabase service role key |
| `POLL_INTERVAL_SECONDS` | `60` |
| `ENV` | `production` |

5. Railway auto-assigns `PORT` — **do not add it manually**
6. Deploy — Railway will build the Dockerfile and start the server

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project → Import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Framework preset: **Vite** (auto-detected)
4. Add the following **Environment Variable** in Vercel dashboard:

| Variable | Value |
|---|---|
| `VITE_API_URL` | Your Railway backend URL (e.g. `https://worldcup-intel-production.up.railway.app`) |

5. Deploy — Vercel will build and publish automatically

### Auto-deploy on push
Both Railway and Vercel watch the connected GitHub branch. Every `git push` to `main` triggers a new deployment automatically.

## Environment Variables Reference

See `.env.example` for the full list with descriptions.

## Project Structure

```
worldcup-intel/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app + scheduler
│   │   ├── config.py        # Pydantic settings
│   │   ├── database.py      # Supabase client
│   │   ├── routers/         # API route handlers
│   │   └── services/        # Football-Data.org client, Poisson, Six Sigma
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Chart and UI components
│   │   ├── pages/           # Dashboard and MatchDetail
│   │   ├── hooks/           # Data fetching hooks
│   │   └── services/        # API client
│   └── vercel.json
├── railway.toml
├── supabase_schema.sql
└── .env.example
```

## License

MIT
