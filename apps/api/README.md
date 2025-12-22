---
title: LapLens API
emoji: 🏎️
colorFrom: red
colorTo: gray
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# LapLens API

FastAPI backend for LapLens F1 telemetry analytics.

## Endpoints

- `GET /health` - Health check
- `GET /seasons` - List available F1 seasons
- `GET /events?season=YYYY` - Get events for a season
- `GET /sessions?season=YYYY&event=...` - Get sessions
- `GET /drivers?season=YYYY&event=...&session=...` - Get drivers
- `POST /telemetry/compare` - Compare driver telemetry
- `GET /strategy?...` - Get tire strategy data
- `GET /positions?...` - Get position changes

## API Docs

- Swagger UI: `/docs`
- ReDoc: `/redoc`

## Environment Variables

Set in Settings → Repository Secrets:

| Variable | Description |
|----------|-------------|
| `REDIS_URL` | Upstash Redis URL |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase secret key |
| `SUPABASE_JWT_SECRET` | Supabase JWT secret |
| `CORS_ORIGINS` | Frontend URL |
