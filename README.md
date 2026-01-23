# LapLens

F1 telemetry analytics dashboard for comparing drivers head-to-head with real race data.

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10+-green.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Overview

LapLens transforms raw F1 telemetry into actionable insights. Select any two drivers from any session since 2018 and instantly compare their performance through interactive visualizations and plain-language explanations.

## Features

### Telemetry Comparison
- **Speed Trace**: Overlay speed (km/h) across lap distance to see where drivers gain or lose time
- **Sector Times**: S1, S2, S3 breakdown with delta highlighting
- **Throttle/Brake**: Input comparison showing driver aggression and smoothness
- **Gear Usage**: Stepped gear trace showing shift points and gear selection
- **Lap Delta**: Cumulative time difference at every point on track

### Race Analysis
- **Race Pace**: Lap time trends over the full race distance
- **Stint Analysis**: Tire compounds, stint lengths, and degradation patterns
- **Race Story**: Auto-generated narrative of key moments (start, pit stops, finish)

### User Experience
- **Quick Start**: Pre-configured iconic races load instantly (cached)
- **Key Takeaways**: AI-generated insights explaining what the data means
- **Responsive Design**: Works on desktop and mobile

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Zustand |
| Backend | Python 3.10+, FastAPI, FastF1, Pandas |
| Hosting | Cloudflare Pages (frontend), Oracle Cloud (backend API) |

## Project Structure
```
laplens/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # API client and utilities
│   │   │   └── pages/       # Page components
│   │   └── public/          # Static assets
│   └── api/                 # FastAPI backend
│       └── app/
│           ├── routers/     # API route handlers
│           ├── services/    # FastF1 data processing
│           └── models/      # Pydantic schemas
├── packages/
│   └── shared/              # Shared types
└── infra/                   # Deployment configs
```

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+

### Frontend
```bash
cd apps/web
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

### Backend
```bash
cd apps/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API runs at `http://localhost:8000`

### Verify Setup
```bash
curl http://localhost:8000/health
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/seasons` | List available seasons (2018-present) |
| GET | `/events` | Get events for a season |
| GET | `/sessions` | Get sessions for an event |
| GET | `/drivers` | Get drivers for a session |
| POST | `/telemetry/compare` | Compare two drivers' telemetry |
| POST | `/telemetry/race-pace` | Get race pace data |
| GET | `/strategy` | Get tire strategy data |
| GET | `/positions` | Get position changes |

API documentation available at `/docs` (Swagger UI)

## Environment Variables

### Frontend

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL |

### Backend

| Variable | Description |
|----------|-------------|
| `ALLOWED_ORIGINS` | CORS allowed origins |

## Deployment

### Frontend (Cloudflare Pages)

1. Connect GitHub repo to Cloudflare Pages
2. Build command: `cd apps/web && npm install && npx vite build`
3. Output directory: `apps/web/dist`
4. Add environment variable: `VITE_API_URL`

### Backend (Oracle Cloud / Any VPS)

1. Clone repo on server
2. Install Python dependencies
3. Run with: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
4. Use systemd or PM2 for process management
5. Set up Cloudflare Tunnel or reverse proxy for HTTPS

## Cache Warming

To pre-cache data for instant loading:
```bash
# On the backend server
./warm-cache.sh
```

This fetches telemetry for Quick Start races so they load instantly.

## Acknowledgments

- [FastF1](https://github.com/theOehrly/Fast-F1) - F1 data library that makes this possible
- [Recharts](https://recharts.org/) - React charting library
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS

## License

MIT License - see [LICENSE](LICENSE) for details.
