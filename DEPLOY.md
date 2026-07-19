# WebScrap Pro — Deployment Guide

> Complete guide to deploy WebScrap Pro to production.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Variables](#environment-variables)
4. [MongoDB Atlas Setup](#mongodb-atlas-setup)
5. [Redis Setup](#redis-setup)
6. [Backend Deployment (Render)](#backend-deployment-render)
7. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
8. [Python Microservices](#python-microservices)
9. [GitHub Actions CI/CD](#github-actions-cicd)
10. [Post-Deployment Verification](#post-deployment-verification)
11. [Security Checklist](#security-checklist)
12. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vercel (FE)   │────▶│  Render (BE)    │────▶│  MongoDB Atlas  │
│   React + Vite  │     │  Node.js/Express│     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │  Redis   │ │  S3      │ │  SMTP    │
              │ (BullMQ) │ │ (Files)  │ │ (Email)  │
              └──────────┘ └──────────┘ └──────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
                    ▼            ▼            ▼
              ┌──────────┐ ┌──────────┐
              │ Scraping │ │ PDF      │
              │ Service  │ │ Service  │
              │ (Flask)  │ │ (Flask)  │
              └──────────┘ └──────────┘
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Backend runtime |
| npm | 10+ | Package manager |
| Git | Latest | Version control |
| MongoDB Atlas | Free tier+ | Database |
| Vercel account | Free tier+ | Frontend hosting |
| Render account | Free tier+ | Backend hosting |
| Google Cloud Console | — | OAuth (optional) |
| OpenAI account | — | AI features (optional) |

---

## Environment Variables

### Required (Backend)

| Variable | Description | How to Generate |
|----------|-------------|-----------------|
| `MONGO_URI` | MongoDB connection string | MongoDB Atlas dashboard |
| `JWT_SECRET` | Min 32 chars, random string | `openssl rand -base64 48` |

### Optional (Backend)

| Variable | Purpose | Default |
|----------|---------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `LOG_LEVEL` | Log verbosity | `info` |
| `FRONTEND_URL` | CORS origin | — |
| `BACKEND_URL` | OAuth callbacks | — |
| `REDIS_URL` | BullMQ + caching | — (disabled) |
| `S3_BUCKET` | File storage | — (local disk) |
| `S3_REGION` | AWS region | — |
| `S3_ACCESS_KEY` | AWS access key | — |
| `S3_SECRET_KEY` | AWS secret key | — |
| `SENTRY_DSN` | Error tracking | — |
| `GOOGLE_CLIENT_ID` | Google OAuth | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Google OAuth | Google Cloud Console |
| `GOOGLE_REDIRECT_URI` | OAuth callback | `{BACKEND_URL}/api/auth/google/callback` |
| `SMTP_HOST` | Email server | — |
| `SMTP_PORT` | SMTP port | `587` |
| `SMTP_USER` | Email username | — |
| `SMTP_PASS` | Email password | — |
| `EMAIL_FROM` | Sender address | — |
| `OPENAI_API_KEY` | AI features | platform.openai.com |
| `OPENAI_MODEL` | LLM model | `gpt-4o-mini` |
| `EMBEDDING_MODEL` | Embedding model | `text-embedding-3-small` |
| `EMBEDDING_DIMENSIONS` | Embedding size | `1536` |

### Frontend (Vercel)

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_SENTRY_DSN` | Frontend error tracking |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## MongoDB Atlas Setup

### 1. Create Cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create free M0 cluster
3. Choose region closest to Render (AWS us-east-1 recommended)

### 2. Create Database User

1. Security → Database Access → Add New Database User
2. Create user with **password authentication**
3. Save credentials securely

### 3. Whitelist IPs

1. Security → Network Access → Add IP Address
2. Add `0.0.0.0/0` (allow all) for Render
3. Or add Render's outbound IP range

### 4. Get Connection String

1. Deployment → Database → Connect
2. Choose **Connect your application**
3. Select **Node.js** driver
4. Copy connection string
5. Replace `<password>` with your database user password

```
mongodb+srv://username:password@cluster.mongodb.net/webscrap_pro?retryWrites=true&w=majority
```

---

## Redis Setup

### Option A: Docker (Recommended — Free + Unlimited)

Redis runs locally in Docker with your n8n setup.

1. Navigate to project folder:
   ```bash
   cd F:\webscrap_pro
   ```

2. Start Redis:
   ```bash
   docker-compose up -d redis
   ```

3. Verify it's running:
   ```bash
   docker-compose ps
   ```

4. Redis URL: `redis://localhost:6379`

**Benefits:**
- No command limits
- No external account needed
- Zero cost

### Option B: Upstash (Cloud)

1. Go to [upstash.com](https://upstash.com)
2. Create Redis database
3. Copy `REDIS_URL` from dashboard
4. Free tier: 10,000 commands/day

### Option C: Redis Cloud

1. Go to [redis.com](https://redis.com)
2. Create free database (30MB)
3. Copy connection string

**Note:** App works without Redis — queue, caching, and rate limiting gracefully degrade.

---

## Backend Deployment (Render)

### 1. Create Web Service

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect GitHub repository
4. Configure:
   - **Name:** `webscrap-pro-backend`
   - **Region:** US East (Virginia)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:**
     ```bash
     cd backend && npm install
     ```
   - **Start Command:**
     ```bash
     cd backend && node server.js
     ```

### 2. Set Environment Variables

Go to Environment tab and add:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/webscrap_pro?retryWrites=true&w=majority
JWT_SECRET=<your-32-char-secret>
PORT=5000
LOG_LEVEL=info
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://your-app.onrender.com
REDIS_URL=redis://default:password@redis-host:6379
```

### 3. Deploy

1. Click **Create Web Service**
2. Wait for first deploy (5-10 minutes)
3. Note the service URL: `https://your-app.onrender.com`

### 4. Health Check

```bash
curl https://your-app.onrender.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-07-18T...",
  "uptime": 123.456,
  "database": { "status": "connected" },
  "memory": { "heapUsed": "45 MB" },
  "correlationId": "uuid"
}
```

---

## Frontend Deployment (Vercel)

### 1. Import Repository

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Framework: **Vite**
4. Root directory: `frontend`

### 2. Build Settings

```
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

### 3. Environment Variables

```
VITE_API_URL=https://your-app.onrender.com/api
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### 4. Deploy

1. Click **Deploy**
2. Wait for build (1-2 minutes)
3. Note the URL: `https://your-app.vercel.app`

### 5. Custom Domain (Optional)

1. Settings → Domains
2. Add your domain
3. Configure DNS as instructed

---

## Python Microservices

### Option A: Docker on Render

1. Create new **Web Service** for each:
   - `scraping-service`
   - `pdf-service`

2. Settings:
   - **Runtime:** Docker
   - **Dockerfile:** `backend/python-services/scraping-service/Dockerfile`
   - **Port:** 5001 (scraping) / 5002 (PDF)

3. Environment Variables:
   ```
   NODE_ENV=production
   ```

### Option B: Railway

1. Go to [railway.app](https://railway.app)
2. Deploy from GitHub
3. Select `backend/python-services/scraping-service`
4. Railway auto-detects Dockerfile
5. Repeat for PDF service

### Option C: Local/Development Only

```bash
# Terminal 1: Scraping Service
cd backend/python-services/scraping-service
pip install -r requirements.txt
python app.py

# Terminal 2: PDF Service
cd backend/python-services/pdf-service
pip install -r requirements.txt
python app.py
```

---

## GitHub Actions CI/CD

### 1. Add Repository Secrets

Go to GitHub repo → Settings → Secrets and variables → Actions

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel deploy token |
| `VERCEL_ORG_ID` | Vercel org ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `RENDER_SERVICE_ID` | Render service ID |
| `RENDER_API_KEY` | Render API key |

### 2. Get Vercel Credentials

```bash
# Install Vercel CLI
npm i -g vercel

# Link project
cd frontend
vercel link

# Get IDs
cat .vercel/project.json
```

### 3. Get Render Credentials

1. Render dashboard → Account Settings → API Keys
2. Create API key
3. Service ID from URL: `https://dashboard.render.com/web/svc-xxxxx`

### 4. Workflow Triggers

CI/CD runs automatically on:
- Push to `main` → Deploy to production
- Push to `develop` → Deploy to preview
- Pull request → Run tests only

---

## Post-Deployment Verification

### 1. Backend Health

```bash
# Health check
curl https://your-app.onrender.com/api/health

# API docs
curl https://your-app.onrender.com/api/docs/json
```

### 2. Frontend Check

1. Open `https://your-app.vercel.app`
2. Check landing page loads
3. Test login/register flow
4. Verify dark mode toggle works

### 3. Integration Test

```bash
# Register
curl -X POST https://your-app.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"TestPass123!"}'

# Login
curl -X POST https://your-app.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123!"}'
```

### 4. Verify Features

| Feature | Check |
|---------|-------|
| Auth | Register, login, refresh token |
| Scraping | Submit URL, check job status |
| PDF | Upload PDF, extract text |
| AI | Summarize content (needs OpenAI key) |
| Dark mode | Toggle in settings |
| WebSocket | Real-time job updates |

---

## Security Checklist

### Critical

- [ ] Rotate JWT secret (if old `.env` was exposed)
- [ ] Rotate MongoDB Atlas password
- [ ] Enable MongoDB IP whitelist (restrict in production)
- [ ] Set `NODE_ENV=production` (disables debug info)
- [ ] Use HTTPS only (enforced by Vercel/Render)

### Recommended

- [ ] Enable MongoDB encryption at rest
- [ ] Set up Sentry error tracking
- [ ] Enable Vercel Analytics
- [ ] Configure CORS to only allow your frontend domain
- [ ] Set up monitoring alerts (Render metrics, Vercel analytics)
- [ ] Review rate limiting thresholds
- [ ] Enable 2FA on all service accounts (GitHub, Vercel, Render, MongoDB)

### Optional

- [ ] Set up CloudFlare for DDoS protection
- [ ] Configure WAF rules
- [ ] Enable audit logging
- [ ] Set up backup schedule for MongoDB

---

## Troubleshooting

### Backend Won't Start

**Symptom:** Render shows "Build failed" or service crashes

**Check:**
```bash
# Check logs
curl https://your-app.onrender.com/api/health

# Verify env vars
# Render dashboard → Environment tab
```

**Common fixes:**
- Missing required env vars (`MONGO_URI`, `JWT_SECRET`)
- `JWT_SECRET` less than 32 characters
- MongoDB connection string incorrect

### Frontend Can't Connect to Backend

**Symptom:** API calls fail with CORS or 404

**Check:**
- `VITE_API_URL` is correct
- `FRONTEND_URL` is set in backend env vars
- Backend CORS config allows your Vercel domain

### Database Connection Issues

**Symptom:** Health check shows `"database": {"status": "disconnected"}`

**Check:**
- MongoDB Atlas IP whitelist includes `0.0.0.0/0`
- Database user has correct permissions
- Connection string format is correct

### Redis Not Connecting

**Symptom:** Queue/caching disabled warnings

**Check:**
- `REDIS_URL` format: `redis://default:password@host:port`
- Redis instance is running
- Network access allowed

### Build Failures

**Frontend:**
```bash
# Test locally
cd frontend
npm run build

# Check for errors
npm run lint
```

**Backend:**
```bash
cd backend
npm install
node server.js
```

### Cold Start Delays

Render free tier spins down after inactivity. First request may take 30-60 seconds.

**Solutions:**
- Upgrade to paid tier
- Add cron job to ping `/api/health` every 5 minutes

---

## Cost Estimation (Free Tiers)

| Service | Free Tier | Limits |
|---------|-----------|--------|
| Vercel | Hobby | 100GB bandwidth/month |
| Render | Free | 750 hours/month, spins down |
| MongoDB Atlas | M0 | 512MB storage |
| Upstash | Free | 10,000 commands/day |
| Sentry | Free | 5,000 errors/month |

**Total:** $0/month for hobby project

---

## Production Recommendations

| Area | Free Tier | Recommended |
|------|-----------|-------------|
| Backend | Render Free | Render Starter ($7/mo) |
| Database | Atlas M0 | Atlas M10 ($57/mo) |
| Redis | Upstash Free | Upstash Pay-as-you-go |
| CDN | Vercel | Cloudflare Pro ($20/mo) |
| Monitoring | — | Sentry Team ($26/mo) |

---

## Quick Deploy Commands

```bash
# 1. Clone and setup
git clone https://github.com/your-username/webscrap_pro.git
cd webscrap_pro

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Test locally
cd backend && npm test

# 4. Build frontend
cd frontend && npm run build

# 5. Push to GitHub
git add .
git commit -m "production ready"
git push origin main

# 6. Deploy (auto via GitHub Actions)
# Or manual:
cd frontend && vercel --prod
```

---

## Support

- **Issues:** GitHub Issues
- **Docs:** `/api/docs` endpoint
- **Logs:** Render dashboard → Logs tab

---

*Last updated: July 2026*
