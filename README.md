# 🏁 LapLens

**F1 telemetry analytics dashboard for comparing drivers, analyzing strategy, and visualizing race data.**

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10+-green.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)

## ✨ Features

### 📊 Telemetry Analysis
- **Driver Comparison**: Compare lap times, speed traces, throttle/brake inputs
- **Gear Visualization**: Stepped gear trace charts
- **Delta Analysis**: Lap time delta visualization between drivers

### 🛞 Strategy Insights
- **Tire Stints**: Visual timeline of compound usage per driver
- **Pit Stop Analysis**: Lap-by-lap pit stop timing
- **Compound Performance**: Track tire degradation patterns

### 📈 Race Analytics
- **Position Changes**: Lap-by-lap position battle visualization
- **Track Evolution**: Best lap trends and track improvement indicators
- **Gap Analysis**: Time gaps between drivers over race distance

### 🔐 User Features
- **Authentication**: Sign up/sign in with Supabase Auth
- **Saved Analyses**: Save and revisit your favorite comparisons

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts |
| **Backend** | Python 3.10+, FastAPI, FastF1, Pydantic |
| **Database** | Supabase PostgreSQL |
| **Cache** | Upstash Redis |
| **Storage** | Supabase Storage |
| **Auth** | Supabase Auth |
| **Hosting** | Cloudflare Pages (frontend), Hugging Face Spaces (backend) |

## 📁 Project Structure

```
laplens/
├── apps/
│   ├── web/                 # React frontend
│   │   ├── src/
│   │   │   ├── components/  # UI components
│   │   │   ├── hooks/       # Custom React hooks
│   │   │   ├── lib/         # Utilities and API client
│   │   │   ├── pages/       # Page components
│   │   │   └── types/       # TypeScript types
│   │   └── public/          # Static assets
│   └── api/                 # FastAPI backend
│       ├── app/
│       │   ├── routers/     # API route handlers
│       │   ├── services/    # Business logic
│       │   ├── middleware/  # Auth, rate limiting
│       │   ├── models/      # Pydantic models
│       │   └── utils/       # Helpers and utilities
│       └── tests/           # Pytest tests
├── packages/
│   └── shared/              # Shared types and utilities
├── infra/                   # Deployment configs
└── docker-compose.yml       # Local development setup
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- Supabase account (free tier)
- Upstash Redis account (free tier)
- Cloudflare account (free tier)

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd pitlane-telemetry
```

### 2. Environment Setup

```bash
# Frontend environment
cp apps/web/.env.example apps/web/.env

# Backend environment
cp apps/api/.env.example apps/api/.env
```

### 3. Start Local Services

```bash
# Start Redis for local development
docker-compose up -d

# Verify Redis is running
docker-compose ps
```

### 4. Install & Run Frontend

```bash
cd apps/web
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`

### 5. Install & Run Backend

```bash
cd apps/api

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --port 8000
```

API will be available at `http://localhost:8000`

### 6. Verify Setup

```bash
# Check API health
curl http://localhost:8000/health

# Open frontend
open http://localhost:5173
```

## 🔧 Environment Variables

### Frontend (`apps/web/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |

### Backend (`apps/api/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | `eyJ...` |
| `R2_ACCOUNT_ID` | Cloudflare account ID | `abc123...` |
| `R2_ACCESS_KEY_ID` | R2 access key | `...` |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | `...` |
| `R2_BUCKET_NAME` | R2 bucket name | `pitlane-telemetry` |
| `CACHE_TTL_SECONDS` | Redis cache TTL | `86400` |
| `RATE_LIMIT_REQUESTS` | Requests per window | `100` |
| `RATE_LIMIT_WINDOW` | Rate limit window (seconds) | `60` |

## 🗄 Database Setup

Run the SQL migrations in Supabase SQL Editor:

```bash
# Located at: infra/migrations/
001_create_saved_analyses.sql
```

## 🚢 Deployment

### 🆓 No Credit Card Required (Recommended)

Deploy for **$0** using Hugging Face Spaces, Cloudflare Pages, Upstash, and Supabase - all free tiers, no credit card.

👉 **[DEPLOY-FREE.md](./DEPLOY-FREE.md)** - Step-by-step deployment guide

**Stack**: HF Spaces (16GB RAM) + Supabase (auth + DB + storage) + Upstash (cache) + Cloudflare Pages (frontend)

## 🧪 Testing

### Backend Tests

```bash
cd apps/api
pytest tests/ -v
```

### Frontend Type Check

```bash
cd apps/web
npm run typecheck
```

## 📝 API Documentation

Interactive API docs available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/seasons` | List available seasons |
| GET | `/events` | Get events for a season |
| GET | `/sessions` | Get sessions for an event |
| GET | `/drivers` | Get drivers for a session |
| POST | `/telemetry/compare` | Compare driver telemetry |
| GET | `/strategy` | Get tire strategy data |
| GET | `/positions` | Get position changes |
| POST | `/saved-analyses` | Save an analysis (auth required) |
| GET | `/saved-analyses` | List saved analyses (auth required) |

## 🔒 Rate Limiting

The API implements rate limiting to prevent abuse:
- **Anonymous**: 100 requests per minute
- **Authenticated**: 200 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `X-RateLimit-Reset`: Time until limit resets

## 🐛 Troubleshooting

### Common Issues

**FastF1 cache issues**
```bash
# Clear FastF1 cache
rm -rf ~/.cache/fastf1
```

**Redis connection failed**
```bash
# Check Redis is running
docker-compose ps
docker-compose logs redis
```

**CORS errors in development**
- Ensure `VITE_API_BASE_URL` matches your backend URL
- Check backend CORS configuration in `app/main.py`

**Supabase auth not working**
- Verify redirect URLs in Supabase dashboard
- Check CORS settings include your frontend domain

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FastF1](https://github.com/theOehrly/Fast-F1) - The incredible F1 data library
- [Supabase](https://supabase.com) - Auth and database
- [shadcn/ui](https://ui.shadcn.com) - Beautiful UI components
- The F1 community for their passion and data

---

**Built with 🏎️ by the Pitlane Telemetry team**
