# WebScrap Pro — Zero Cost Deployment Guide

> Complete guide to deploy ALL features at $0/month with no cold starts.

---

## Final Stack — $0/month

| Service | Provider | Free Tier | Spin Down |
|---------|----------|-----------|-----------|
| Frontend | Vercel Hobby | 100GB bandwidth | ❌ Never |
| Backend | Fly.io | 3 shared VMs | ❌ Never |
| Redis | Fly.io (Docker) | Unlimited commands | ❌ Never |
| Email (n8n) | Fly.io (Docker) | 5 workflows | ❌ Never |
| Database | MongoDB Atlas M0 | 512MB storage | ❌ Never |
| AI | OpenAI Credits | $5 initial (~1M tokens) | — |
| CI/CD | GitHub Actions | 2K min/month | — |
| Error Tracking | Sentry Free | 5K errors/month | — |
| Analytics | Vercel Analytics | Basic | — |

**Total: $0/month | Cold starts: NONE | Redis limits: NONE**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FLY.IO (3 Free VMs)                      │
│                     $0 — Never Spins Down                   │
├─────────────────────────────────────────────────────────────┤
│ VM 1: Backend (Node.js + Express)                           │
│   ├── API routes (auth, scrape, PDF, AI, analytics)         │
│   ├── Socket.IO (real-time updates)                         │
│   └── BullMQ workers (scrape + PDF)                         │
├─────────────────────────────────────────────────────────────┤
│ VM 2: Redis (Docker)                                        │
│   ├── BullMQ queue (scrape + PDF jobs)                      │
│   ├── Response cache                                        │
│   ├── Per-user rate limiting                                │
│   └── Session storage                                       │
├─────────────────────────────────────────────────────────────┤
│ VM 3: n8n (Docker)                                          │
│   ├── Email workflow (OTP, welcome, job complete)            │
│   ├── Visual template editor                                │
│   ├── Retry logic (built-in)                                │
│   └── Gmail SMTP integration                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│ Vercel: React + Vite frontend (100GB bandwidth)             │
│ MongoDB Atlas M0: Database (512MB)                          │
│ OpenAI: AI features (summarize, keywords, classify, chat)   │
│ Sentry: Error tracking (5K errors)                          │
│ GitHub: CI/CD (2K min)                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Prerequisites

| Tool | Purpose | Link |
|------|---------|------|
| Fly.io account | Backend + Redis + n8n hosting | [fly.io](https://fly.io) |
| Vercel account | Frontend hosting | [vercel.com](https://vercel.com) |
| MongoDB Atlas | Database | [cloud.mongodb.com](https://cloud.mongodb.com) |
| GitHub account | Source code + CI/CD | [github.com](https://github.com) |
| OpenAI account | AI features | [platform.openai.com](https://platform.openai.com) |
| Gmail account | Email (SMTP) | [gmail.com](https://gmail.com) |
| Sentry account | Error tracking | [sentry.io](https://sentry.io) |

---

## Step 1: MongoDB Atlas (Database)

### 1.1 Create Cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click **Build a Database**
3. Choose **M0 Free** tier
4. Select region: **AWS us-east-1** (closest to Fly.io)
5. Cluster name: `webscrap-pro`

### 1.2 Create Database User

1. Security → Database Access → **Add New Database User**
2. Authentication method: **Password**
3. Username: `webscrap_admin`
4. Password: Generate secure password (save it)
5. Database User Privileges: **Read and write to any database**
6. Click **Add User**

### 1.3 Whitelist IPs

1. Security → Network Access → **Add IP Address**
2. Enter: `0.0.0.0/0` (allow all — required for Fly.io)
3. Comment: `Fly.io + Vercel`
4. Click **Confirm**

### 1.4 Get Connection String

1. Deployment → Database → **Connect**
2. Choose **Connect your application**
3. Driver: **Node.js**, Version: **5.0 or later**
4. Copy connection string:

```
mongodb+srv://webscrap_admin:YOUR_PASSWORD@webscrap-pro.xxxxx.mongodb.net/webscrap_pro?retryWrites=true&w=majority
```

5. Replace `YOUR_PASSWORD` with your database user password
6. **Save this somewhere safe**

---

## Step 2: Fly.io Setup (Backend + Redis + n8n)

### 2.1 Install Fly.io CLI

```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Or download from: https://fly.io/docs/hands-on/install-flyctl/
```

### 2.2 Create Account

```bash
fly auth signup
# Or if you have account:
fly auth login
```

### 2.3 Create App for Backend

```bash
# From project root
fly launch --name webscrap-backend --no-deploy
```

This creates `fly.toml` in your root directory.

### 2.4 Set Backend Environment Variables

```bash
fly secrets set \
  NODE_ENV=production \
  MONGO_URI="mongodb+srv://webscrap_admin:YOUR_PASSWORD@webscrap-pro.xxxxx.mongodb.net/webscrap_pro?retryWrites=true&w=majority" \
  JWT_SECRET="your-32-char-minimum-random-secret-key-here" \
  REDIS_URL="redis://default:YOUR_REDIS_PASSWORD@webscrap-redis.fly.dev:6379" \
  FRONTEND_URL="https://your-app.vercel.app" \
  BACKEND_URL="https://webscrap-backend.fly.dev" \
  N8N_WEBHOOK_URL="https://webscrap-n8n.fly.dev/webhook/YOUR_WEBHOOK_ID" \
  SMTP_HOST="smtp.gmail.com" \
  SMTP_PORT="587" \
  SMTP_USER="your-email@gmail.com" \
  SMTP_PASS="your-gmail-app-password" \
  EMAIL_FROM="your-email@gmail.com" \
  OPENAI_API_KEY="sk-your-openai-key" \
  OPENAI_MODEL="gpt-4o-mini" \
  EMBEDDING_MODEL="text-embedding-3-small" \
  EMBEDDING_DIMENSIONS="1536" \
  SENTRY_DSN="https://your-sentry-dsn"
```

### 2.5 Configure fly.toml

```toml
# fly.toml
app = "webscrap-backend"
primary_region = "iad"

[build]

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true
  min_machines_running = 0

  [http_service.concurrency]
    type = "requests"
    hard_limit = 250
    soft_limit = 200

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1
```

---

## Step 3: Redis on Fly.io

### 3.1 Create Redis App

```bash
fly launch --name webscrap-redis --no-deploy
```

### 3.2 Create Dockerfile for Redis

```dockerfile
# Dockerfile.redis
FROM redis:7-alpine

# Set password
CMD ["redis-server", "--appendonly", "yes", "--requirepass", "YOUR_REDIS_PASSWORD"]
```

### 3.3 Deploy Redis

```bash
# Build and deploy
fly deploy --dockerfile Dockerfile.redis --app webscrap-redis

# Get Redis password
fly secrets list --app webscrap-redis
```

### 3.4 Get Redis URL

After deployment, your Redis URL is:

```
redis://default:YOUR_REDIS_PASSWORD@webscrap-redis.fly.dev:6379
```

**Save this for backend env vars**

---

## Step 4: n8n on Fly.io (Email Automation)

### 4.1 Create n8n App

```bash
fly launch --name webscrap-n8n --no-deploy
```

### 4.2 Create Dockerfile for n8n

```dockerfile
# Dockerfile.n8n
FROM n8nio/n8n

# Set environment
ENV GENERIC_TIMEZONE=UTC
ENV N8N_SECURE_COOKIE=false
```

### 4.3 Create fly.toml for n8n

```toml
# fly.toml.n8n
app = "webscrap-n8n"
primary_region = "iad"

[build]

[env]
  GENERIC_TIMEZONE = "UTC"
  N8N_SECURE_COOKIE = "false"

[http_service]
  internal_port = 5678
  force_https = true
  auto_stop_machines = false
  auto_start_machines = true

[[vm]]
  memory = "256mb"
  cpu_kind = "shared"
  cpus = 1
```

### 4.4 Deploy n8n

```bash
fly deploy --dockerfile Dockerfile.n8n --app webscrap-n8n
```

### 4.5 Setup n8n

1. Open `https://webscrap-n8n.fly.dev`
2. Create owner account
3. Create email workflow:

```
[Webhook] → [Switch] → [Gmail] → [Respond]
     │
     ├── OTP: Send 6-digit code
     ├── Welcome: Welcome email
     └── Job Complete: Job finished notification
```

### 4.6 Get Webhook URL

1. In n8n, create workflow
2. Add **Webhook** node
3. Copy webhook URL (looks like: `https://webscrap-n8n.fly.dev/webhook/xxx-xxx-xxx`)
4. Add this to backend env vars as `N8N_WEBHOOK_URL`

---

## Step 5: Vercel (Frontend)

### 5.1 Import Repository

1. Go to [vercel.com](https://vercel.com)
2. Click **Import Project**
3. Select GitHub repository
4. Framework: **Vite**
5. Root Directory: `frontend`

### 5.2 Set Environment Variables

```
VITE_API_URL=https://webscrap-backend.fly.dev/api
VITE_SENTRY_DSN=https://your-sentry-dsn
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 5.3 Deploy

1. Click **Deploy**
2. Wait for build (1-2 minutes)
3. Note the URL: `https://your-app.vercel.app`

### 5.4 Update Backend CORS

After frontend deploys, update backend env:

```bash
fly secrets set FRONTEND_URL="https://your-app.vercel.app" --app webscrap-backend
```

---

## Step 6: OpenAI (AI Features)

### 6.1 Get API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Login
3. Go to **API Keys**
4. Click **Create new secret key**
5. Copy the key (starts with `sk-`)

### 6.2 Free Credits

- New accounts get **$5 free credits**
- ~1M tokens (enough for ~500 summaries)

### 6.3 Set in Backend

Already set in Step 2.4:

```bash
fly secrets set \
  OPENAI_API_KEY="sk-your-key" \
  OPENAI_MODEL="gpt-4o-mini" \
  EMBEDDING_MODEL="text-embedding-3-small" \
  EMBEDDING_DIMENSIONS="1536" \
  --app webscrap-backend
```

---

## Step 7: Gmail SMTP (Email)

### 7.1 Enable 2FA

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**

### 7.2 Generate App Password

1. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Select app: **Mail**
3. Select device: **Other (Custom name)** → Enter `WebScrap Pro`
4. Click **Generate**
5. Copy 16-character password (e.g., `abcd efgh ijkl mnop`)

### 7.3 Set in Backend

```bash
fly secrets set \
  SMTP_HOST="smtp.gmail.com" \
  SMTP_PORT="587" \
  SMTP_USER="your-email@gmail.com" \
  SMTP_PASS="abcdefghijklmnop" \
  EMAIL_FROM="your-email@gmail.com" \
  --app webscrap-backend
```

---

## Step 8: Sentry (Error Tracking)

### 8.1 Create Project

1. Go to [sentry.io](https://sentry.io)
2. Create account
3. Create project → **Node.js**
4. Copy DSN

### 8.2 Set in Backend

```bash
fly secrets set SENTRY_DSN="https://xxx@sentry.io/xxx" --app webscrap-backend
```

### 8.3 Frontend Sentry

1. Create another project → **React**
2. Copy DSN
3. Set in Vercel:

```
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## Step 9: Deploy Backend

### 9.1 Update Server Port

Make sure `server.js` uses `PORT` env var:

```javascript
const PORT = process.env.PORT || 8080;
```

### 9.2 Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY . .

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
```

### 9.3 Deploy

```bash
fly deploy --app webscrap-backend
```

### 9.4 Verify Health

```bash
curl https://webscrap-backend.fly.dev/api/health
```

Expected:

```json
{
  "status": "healthy",
  "timestamp": "2026-07-18T...",
  "uptime": 123.456,
  "database": { "status": "connected" },
  "memory": { "heapUsed": "45 MB" }
}
```

---

## Step 10: GitHub Actions CI/CD

### 10.1 Add Repository Secrets

Go to GitHub → Settings → Secrets and variables → Actions

| Secret | Value |
|--------|-------|
| `VERCEL_TOKEN` | Vercel deploy token |
| `VERCEL_ORG_ID` | Vercel org ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `FLY_API_TOKEN` | Fly.io API token |

### 10.2 Get Fly.io Token

```bash
fly auth token
```

### 10.3 CI/CD Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: cd backend && npm ci
      - run: cd backend && npm test

  deploy-backend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: fly deploy --app webscrap-backend
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}

  deploy-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Step 11: Google OAuth (Optional)

### 11.1 Create Credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project: `webscrap-pro`
3. APIs & Services → Credentials → Create → **OAuth 2.0 Client ID**
4. Application type: **Web application**
5. Authorized redirect URIs:
   ```
   https://webscrap-backend.fly.dev/api/auth/google/callback
   ```
6. Copy Client ID and Client Secret

### 11.2 Set in Backend

```bash
fly secrets set \
  GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com" \
  GOOGLE_CLIENT_SECRET="your-client-secret" \
  GOOGLE_REDIRECT_URI="https://webscrap-backend.fly.dev/api/auth/google/callback" \
  --app webscrap-backend
```

### 11.3 Set in Frontend

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

---

## Complete Environment Variables

### Backend (Fly.io)

```bash
# Required
MONGO_URI=mongodb+srv://webscrap_admin:xxx@webscrap-pro.xxxxx.mongodb.net/webscrap_pro?retryWrites=true&w=majority
JWT_SECRET=your-32-char-minimum-secret-key

# Infrastructure
NODE_ENV=production
PORT=8080
REDIS_URL=redis://default:xxx@webscrap-redis.fly.dev:6379

# URLs
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://webscrap-backend.fly.dev

# Email (n8n)
N8N_WEBHOOK_URL=https://webscrap-n8n.fly.dev/webhook/xxx

# Email (SMTP fallback)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop
EMAIL_FROM=your-email@gmail.com

# AI (OpenAI)
OPENAI_API_KEY=sk-xxx
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536

# Error Tracking
SENTRY_DSN=https://xxx@sentry.io/xxx

# Google OAuth (optional)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_REDIRECT_URI=https://webscrap-backend.fly.dev/api/auth/google/callback

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

### Frontend (Vercel)

```
VITE_API_URL=https://webscrap-backend.fly.dev/api
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
VITE_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

---

## Cost Breakdown

| Service | Provider | Cost | Limits |
|---------|----------|------|--------|
| Frontend | Vercel Hobby | $0 | 100GB bandwidth |
| Backend | Fly.io | $0 | 3 shared VMs, 160GB |
| Redis | Fly.io | $0 | Unlimited commands |
| n8n | Fly.io | $0 | 5 workflows |
| Database | MongoDB Atlas M0 | $0 | 512MB storage |
| AI | OpenAI | $0 | $5 free credits |
| Email | Gmail SMTP | $0 | 500/day |
| CI/CD | GitHub Actions | $0 | 2K min/month |
| Error Tracking | Sentry | $0 | 5K errors/month |
| **TOTAL** | | **$0/month** | |

---

## Feature Verification

| Feature | Status | How to Test |
|---------|--------|-------------|
| Auth (Register/Login) | ✅ | Register new user |
| Google OAuth | ✅ | Click "Sign in with Google" |
| JWT Refresh | ✅ | Wait for token expiry |
| Web Scraping | ✅ | Submit URL in Scraper |
| PDF Processing | ✅ | Upload PDF file |
| AI Summarize | ✅ | Click "Summarize" on job |
| AI Keywords | ✅ | Click "Extract Keywords" |
| AI Classify | ✅ | Click "Classify" |
| Semantic Search | ✅ | Search across embeddings |
| Chat with Data | ✅ | Start chat on job |
| Job Scheduling | ✅ | Create scheduled job |
| PDF Reports | ✅ | Generate report |
| Email OTP | ✅ | Forgot password flow |
| Welcome Email | ✅ | Register new user |
| Job Complete Email | ✅ | Complete a scrape job |
| Dark Mode | ✅ | Toggle in settings |
| Real-time Updates | ✅ | Start a job, watch progress |
| Rate Limiting | ✅ | Make 51 requests (free tier) |
| Caching | ✅ | Hit same endpoint twice |
| Error Tracking | ✅ | Check Sentry dashboard |
| Background Animation | ✅ | Landing page |

---

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
fly logs --app webscrap-backend

# SSH into machine
fly ssh console --app webscrap-backend

# Check env vars
fly secrets list --app webscrap-backend
```

### Redis Connection Failed

```bash
# Check Redis status
fly status --app webscrap-redis

# Test connection
fly ssh console --app webscrap-redis
redis-cli ping
```

### n8n Not Receiving Webhooks

```bash
# Check n8n logs
fly logs --app webscrap-n8n

# Verify webhook URL
curl https://webscrap-n8n.fly.dev/webhook/YOUR_WEBHOOK_ID
```

### MongoDB Connection Issues

1. Check Atlas IP whitelist (should be `0.0.0.0/0`)
2. Verify username/password in connection string
3. Check database name matches (`webscrap_pro`)

### Cold Starts

**No cold starts with Fly.io** — VMs stay running.

If you see delays:
1. Check VM status: `fly status --app webscrap-backend`
2. Ensure `auto_stop_machines = false` in fly.toml

---

## Quick Commands

```bash
# Check all services
fly status --app webscrap-backend
fly status --app webscrap-redis
fly status --app webscrap-n8n

# View logs
fly logs --app webscrap-backend
fly logs --app webscrap-redis
fly logs --app webscrap-n8n

# Restart service
fly restart --app webscrap-backend

# Update secrets
fly secrets set KEY=VALUE --app webscrap-backend

# Scale (if needed)
fly scale count 2 --app webscrap-backend
```

---

## Summary

| Metric | Value |
|--------|-------|
| **Monthly Cost** | $0 |
| **Cold Starts** | 0 (Fly.io never spins down) |
| **Redis Limits** | Unlimited (self-hosted) |
| **Email Automation** | n8n visual editor |
| **Email Limits** | 500/day (Gmail) |
| **Database** | 512MB (Atlas M0) |
| **AI Credits** | $5 free (~500 summaries) |
| **Setup Time** | ~1 hour |
| **Maintenance** | Minimal (monthly updates) |

---

*All features enabled. Zero cost. No cold starts. Production ready.*
