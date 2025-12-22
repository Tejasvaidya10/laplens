# 🚀 Deploy LapLens (No Credit Card Required)

This guide uses **100% free tiers** with **no credit card required**.

## Cost: $0 | Credit Card: ❌ Not Required

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Cloudflare Pages | Frontend hosting | Unlimited |
| Hugging Face Spaces | Backend hosting | 2 vCPU, 16GB RAM |
| Upstash Redis | Caching | 10K commands/day |
| Supabase | Auth + Database + Storage | 500MB DB, 1GB storage |

---

## Step 1: Supabase (Auth + Database + Storage)

1. Go to [supabase.com](https://supabase.com) → Sign up with GitHub
2. Create new project → Name it `laplens`, set database password
3. Wait for project to initialize (~2 min)

### Run Database Migration
Go to **SQL Editor** → New Query → Paste and run:

```sql
CREATE TABLE IF NOT EXISTS saved_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    season INTEGER NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    session_type VARCHAR(50) NOT NULL,
    driver_a VARCHAR(10) NOT NULL,
    driver_b VARCHAR(10) NOT NULL,
    lap_a INTEGER,
    lap_b INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON saved_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON saved_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON saved_analyses
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_saved_analyses_user_id ON saved_analyses(user_id);
```

### Create Storage Bucket
Go to **Storage** → **New bucket** → Name: `telemetry` → Public: OFF → Create

### Get Credentials
- **Project URL**: Settings → Data API
- **Publishable key**: Settings → API Keys
- **Secret key**: Settings → API Keys (reveal)
- **JWT Secret**: Settings → JWT Keys → Legacy JWT Secret

### Configure Auth
- Authentication → URL Configuration → Site URL: `http://localhost:5173`
- Add Redirect URL: `http://localhost:5173/auth/callback`

---

## Step 2: Upstash Redis

1. Go to [console.upstash.com](https://console.upstash.com) → Sign up with GitHub
2. Create Database → Name: `laplens` → Region: closest to you
3. Enable eviction → Create
4. Click **TCP** tab → Copy the Redis URL (change `redis://` to `rediss://`)

---

## Step 3: Deploy Backend on Hugging Face Spaces

1. Go to [huggingface.co](https://huggingface.co) → Sign up with GitHub
2. Profile → **New Space**
3. Configure:
   - **Space name**: `laplens-api`
   - **License**: MIT
   - **SDK**: Docker
   - **Hardware**: CPU basic (free)
   - **Visibility**: Public

4. Clone your Space:
```bash
git clone https://huggingface.co/spaces/YOUR_USERNAME/laplens-api
cd laplens-api
```

5. Copy API files:
```bash
cp -r /path/to/laplens/apps/api/* ./
```

6. Push:
```bash
git add .
git commit -m "Initial deployment"
git push
```

7. Add secrets in **Settings → Repository secrets**:

| Secret | Value |
|--------|-------|
| `REDIS_URL` | Your Upstash Redis URL (rediss://...) |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_KEY` | Your Supabase secret key |
| `SUPABASE_JWT_SECRET` | Your Supabase JWT Secret |
| `CORS_ORIGINS` | `http://localhost:5173` |

8. Space rebuilds automatically. API will be at:
   ```
   https://YOUR_USERNAME-laplens-api.hf.space
   ```

---

## Step 4: Deploy Frontend on Cloudflare Pages

1. Push your code to GitHub
2. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create project
3. Connect GitHub → Select your repo
4. Build settings:
   - **Build command**: `cd apps/web && npm install && npm run build`
   - **Build output**: `apps/web/dist`
5. Environment variables:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://YOUR_USERNAME-laplens-api.hf.space` |
| `VITE_SUPABASE_URL` | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase publishable key |

6. Deploy! Site will be at: `https://laplens.pages.dev`

---

## Step 5: Update CORS & Auth URLs

### Update HF Spaces secret:
`CORS_ORIGINS` → `https://laplens.pages.dev`

### Update Supabase:
- Site URL: `https://laplens.pages.dev`
- Redirect URL: `https://laplens.pages.dev/auth/callback`

---

## ✅ Done!

Visit your site and start analyzing F1 telemetry!

---

## Architecture

```
Users → Cloudflare Pages (Frontend)
           ↓
     Hugging Face Spaces (API)
        ↓         ↓
   Upstash     Supabase
   (Cache)  (Auth + DB + Storage)
```

---

## Troubleshooting

**Cold starts**: HF Spaces sleeps after ~15min idle. First request takes ~45s.
Fix: Use [UptimeRobot](https://uptimerobot.com) to ping `/health` every 5 min.

**CORS errors**: Make sure `CORS_ORIGINS` matches your frontend URL exactly (no trailing slash).

**Auth not working**: Check Supabase redirect URLs match your domain.
