# Pitlane Telemetry - Deployment Guide

This guide covers deploying Pitlane Telemetry with **$0 total cost** using only free tiers.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                              │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Cloudflare Pages (Frontend)                         │
│              pitlane-telemetry.pages.dev                         │
│              React + Vite + Tailwind                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │ API Requests
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Cloudflare Tunnel (Free)                            │
│              api.pitlane-telemetry.example                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│              Oracle Cloud VM (Always Free)                       │
│              FastAPI + FastF1 + Docker                           │
├─────────────────────────┼───────────────────────────────────────┤
│                         │                                        │
│    ┌────────────────────┼────────────────────┐                  │
│    │                    ▼                    │                  │
│    │    ┌───────────────────────────────┐   │                  │
│    │    │      Upstash Redis (Free)      │   │                  │
│    │    │      Cache Layer               │   │                  │
│    │    └───────────────────────────────┘   │                  │
│    │                    │                    │                  │
│    │    ┌───────────────┴───────────────┐   │                  │
│    │    ▼                               ▼   │                  │
│    │ ┌─────────────────┐ ┌─────────────────┐│                  │
│    │ │   Supabase      │ │  Cloudflare R2  ││                  │
│    │ │   (Free Tier)   │ │  (Free Tier)    ││                  │
│    │ │   - Auth        │ │  - Telemetry    ││                  │
│    │ │   - PostgreSQL  │ │    Artifacts    ││                  │
│    │ └─────────────────┘ └─────────────────┘│                  │
│    └─────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────┘
```

## Free Tier Limits

| Service | Free Tier Limits |
|---------|------------------|
| Cloudflare Pages | Unlimited sites, 500 builds/month |
| Cloudflare R2 | 10GB storage, 10M Class A ops/month |
| Cloudflare Tunnel | Unlimited tunnels |
| Oracle Cloud | 2 AMD VMs (1GB RAM each) or 4 ARM VMs |
| Upstash Redis | 10,000 commands/day, 256MB |
| Supabase | 500MB DB, 50,000 monthly active users |

---

## Step 1: Supabase Setup

### 1.1 Create Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Note your project URL and keys:
   - **Project URL**: `https://xxxx.supabase.co`
   - **Anon Key**: For frontend auth
   - **Service Role Key**: For backend operations
   - **JWT Secret**: For token verification

### 1.2 Run Database Migration

1. Go to SQL Editor in Supabase dashboard
2. Copy contents from `infra/migrations/001_create_saved_analyses.sql`
3. Run the migration

### 1.3 Configure Authentication

1. Go to Authentication → URL Configuration
2. Set Site URL: `https://pitlane-telemetry.pages.dev`
3. Add Redirect URLs:
   - `https://pitlane-telemetry.pages.dev/auth/callback`
   - `http://localhost:5173/auth/callback` (for local dev)

### 1.4 Enable OAuth Providers (Optional)

1. Go to Authentication → Providers
2. Enable GitHub:
   - Create OAuth app at github.com/settings/developers
   - Set callback URL: `https://xxxx.supabase.co/auth/v1/callback`
   - Add Client ID and Secret to Supabase
3. Enable Google:
   - Create OAuth credentials at console.cloud.google.com
   - Set authorized redirect URI to Supabase callback
   - Add Client ID and Secret to Supabase

---

## Step 2: Upstash Redis Setup

### 2.1 Create Database

1. Go to [upstash.com](https://upstash.com) and sign up
2. Create a new Redis database
3. Select closest region to your backend
4. Copy the Redis URL (starts with `rediss://`)

---

## Step 3: Cloudflare R2 Setup

### 3.1 Create Bucket

1. Go to Cloudflare dashboard → R2
2. Create a new bucket named `pitlane-telemetry`

### 3.2 Create API Token

1. Go to R2 → Manage R2 API Tokens
2. Create token with Object Read & Write permissions
3. Note:
   - **Account ID**: From dashboard URL
   - **Access Key ID**
   - **Secret Access Key**

---

## Step 4: Oracle Cloud VM Setup

### 4.1 Create Always Free Account

1. Go to [cloud.oracle.com](https://cloud.oracle.com)
2. Sign up for Always Free tier
3. Note: Requires credit card but won't charge

### 4.2 Create Compute Instance

1. Go to Compute → Instances → Create
2. Select "Always Free Eligible" shape:
   - **AMD**: VM.Standard.E2.1.Micro (1GB RAM)
   - **ARM** (recommended): VM.Standard.A1.Flex (up to 4 cores, 24GB RAM)
3. Use Ubuntu 22.04 image
4. Create or upload SSH key
5. Note the public IP address

### 4.3 Configure Security List

1. Go to Networking → Virtual Cloud Networks
2. Select your VCN → Security Lists
3. Add ingress rules:
   - Port 22 (SSH)
   - Port 8000 (API) - Optional if using Cloudflare Tunnel
   - Port 443 (HTTPS) - If using direct access

### 4.4 Connect and Setup

```bash
# SSH into your VM
ssh -i your-key.pem ubuntu@<VM_PUBLIC_IP>

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Log out and back in for docker group to take effect
exit
ssh -i your-key.pem ubuntu@<VM_PUBLIC_IP>

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create project directory
mkdir -p ~/pitlane-telemetry
cd ~/pitlane-telemetry

# Clone your repo (or copy files)
git clone https://github.com/YOUR_USERNAME/Pitlane-Telemetry.git .

# Create .env file
cp infra/.env.example .env
nano .env  # Edit with your values
```

### 4.5 Deploy Backend

```bash
cd ~/pitlane-telemetry

# Build and start
docker-compose -f infra/docker-compose.prod.yml up -d --build

# Check logs
docker-compose -f infra/docker-compose.prod.yml logs -f

# Verify health
curl http://localhost:8000/health
```

---

## Step 5: Cloudflare Tunnel Setup (Recommended)

Cloudflare Tunnel provides free HTTPS access to your backend without exposing ports.

### 5.1 Install cloudflared on VM

```bash
# Download cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/

# Login to Cloudflare
cloudflared tunnel login
```

### 5.2 Create Tunnel

```bash
# Create tunnel
cloudflared tunnel create pitlane-api

# Note the tunnel ID and credentials file path
```

### 5.3 Configure Tunnel

Create `~/.cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL_ID>
credentials-file: /home/ubuntu/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: api.pitlane-telemetry.<YOUR_DOMAIN>.com
    service: http://localhost:8000
  - service: http_status:404
```

### 5.4 Create DNS Record

```bash
cloudflared tunnel route dns pitlane-api api.pitlane-telemetry.<YOUR_DOMAIN>.com
```

### 5.5 Run as Service

```bash
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

### Alternative: Free Subdomain

If you don't have a domain, use Cloudflare's free trycloudflare.com:

```bash
# Quick tunnel (temporary URL)
cloudflared tunnel --url http://localhost:8000
```

For persistent URL, create a tunnel and use the `.cfargotunnel.com` domain.

---

## Step 6: Cloudflare Pages Deployment

### 6.1 Connect Repository

1. Go to Cloudflare dashboard → Pages
2. Create a project → Connect to Git
3. Select your repository

### 6.2 Configure Build

- **Framework preset**: Vite
- **Build command**: `cd apps/web && npm install && npm run build`
- **Build output directory**: `apps/web/dist`
- **Root directory**: `/`

### 6.3 Environment Variables

Add these in Pages → Settings → Environment Variables:

```
VITE_API_BASE_URL=https://api.pitlane-telemetry.YOUR_DOMAIN.com
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 6.4 Custom Domain (Optional)

1. Go to Pages → Custom domains
2. Add `pitlane-telemetry.pages.dev` is automatic
3. For custom domain, add DNS records as instructed

---

## Step 7: GitHub Actions CI/CD

### 7.1 Repository Secrets

Add these secrets in GitHub → Settings → Secrets:

```
# Cloudflare Pages
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID

# Docker Hub (optional)
DOCKER_USERNAME
DOCKER_PASSWORD

# Oracle VM (for auto-deploy)
ORACLE_SSH_KEY
ORACLE_HOST
```

### 7.2 Workflows

Workflows are in `.github/workflows/`:
- `ci.yml`: Run on every PR
- `deploy-frontend.yml`: Deploy to Cloudflare Pages
- `deploy-backend.yml`: Build and push Docker image

---

## Environment Variables Reference

### Frontend (.env)

```bash
VITE_API_BASE_URL=https://api.pitlane-telemetry.example.com
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbG...
```

### Backend (.env)

```bash
# Redis
REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379

# Supabase
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...
SUPABASE_JWT_SECRET=your-jwt-secret

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=pitlane-telemetry

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_AUTHENTICATED_REQUESTS=200
RATE_LIMIT_WINDOW=60

# Cache
CACHE_TTL_SECONDS=86400

# CORS (optional)
CORS_ORIGINS=https://custom-domain.com
```

---

## Troubleshooting

### Backend not starting

```bash
# Check logs
docker-compose -f infra/docker-compose.prod.yml logs api

# Common issues:
# - Missing environment variables
# - Port already in use
# - Memory limits on free tier
```

### CORS errors

1. Verify `CORS_ORIGINS` includes your frontend URL
2. Check API is accessible via the tunnel
3. Ensure credentials are enabled in frontend fetch

### Rate limiting issues

1. Check Redis connection
2. Verify rate limit settings aren't too restrictive
3. For development, increase limits temporarily

### FastF1 errors

1. Ensure cache directory is writable
2. Check network connectivity for data fetching
3. Some sessions may not have telemetry data

### Supabase auth not working

1. Verify redirect URLs are configured
2. Check anon key matches frontend config
3. Ensure JWT secret matches backend config

---

## Monitoring & Maintenance

### Check service health

```bash
# Backend health
curl https://api.pitlane-telemetry.example.com/health

# Docker status
docker-compose -f infra/docker-compose.prod.yml ps

# Resource usage
docker stats
```

### View logs

```bash
# Follow logs
docker-compose -f infra/docker-compose.prod.yml logs -f

# Last 100 lines
docker-compose -f infra/docker-compose.prod.yml logs --tail=100
```

### Restart services

```bash
# Restart backend
docker-compose -f infra/docker-compose.prod.yml restart

# Full rebuild
docker-compose -f infra/docker-compose.prod.yml down
docker-compose -f infra/docker-compose.prod.yml up -d --build
```

### Clear cache

```bash
# Clear Redis cache (via Upstash dashboard or CLI)
# Clear FastF1 cache
docker-compose -f infra/docker-compose.prod.yml exec api rm -rf /app/fastf1_cache/*
```

---

## Cost Summary

| Service | Monthly Cost |
|---------|-------------|
| Cloudflare Pages | $0 |
| Cloudflare R2 | $0 (within free tier) |
| Cloudflare Tunnel | $0 |
| Oracle Cloud VM | $0 (Always Free) |
| Upstash Redis | $0 (within free tier) |
| Supabase | $0 (within free tier) |
| **Total** | **$0** |

---

## Next Steps

1. ✅ Deploy backend on Oracle Cloud
2. ✅ Setup Cloudflare Tunnel
3. ✅ Deploy frontend to Cloudflare Pages
4. ✅ Configure Supabase auth
5. ✅ Test full flow
6. 📊 Monitor usage and optimize
7. 🚀 Share with the community!
