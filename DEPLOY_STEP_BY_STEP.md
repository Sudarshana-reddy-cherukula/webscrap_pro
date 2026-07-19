# WebScrap Pro - Deployment Guide (For Freshers)

Step-by-step instructions to deploy your project. Follow each step in order.

---

## What You're Building

```
┌─────────────────────────────────────────────────────────────┐
│                        YOUR STACK                           │
├─────────────────────────────────────────────────────────────┤
│ Render (Free)                                               │
│   └── Backend: Node.js + Express API                        │
│                                                             │
│ Vercel (Free)                                               │
│   └── Frontend: React + Vite                                │
│                                                             │
│ MongoDB Atlas (Free)                                         │
│   └── Database: 512MB storage                               │
│                                                             │
│ Your Windows PC (Docker)                                    │
│   ├── Redis: localhost:6379 (unlimited commands)             │
│   └── n8n: localhost:5678 (email automation)                 │
└─────────────────────────────────────────────────────────────┘
```

**Cost: $0/month | Cold starts: 30-60 seconds | Email: Unlimited locally**

---

## What You Need

- [ ] GitHub account (you have this)
- [ ] MongoDB Atlas account (free)
- [ ] Vercel account (free)
- [ ] Render account (free)
- [ ] Gmail account (for SMTP emails)
- [ ] OpenAI account (for AI features - optional)
- [ ] Docker Desktop installed (for n8n + Redis)

---

## Step 1: Install Docker Desktop (10 minutes)

Docker runs n8n and Redis on your Windows PC.

### 1.1 Download Docker

1. Go to: https://www.docker.com/products/docker-desktop/
2. Click **Download for Windows**
3. Run the installer
4. Follow the setup wizard
5. Restart your computer when prompted

### 1.2 Verify Installation

Open PowerShell and run:

```powershell
docker --version
```

You should see: `Docker version 24.x.x`

If it says "command not found", restart your computer and try again.

---

## Step 2: Start n8n + Redis (5 minutes)

### 2.1 Open the Project Folder

Open PowerShell and navigate to your project:

```powershell
cd F:\webscrap_pro
```

### 2.2 Start Docker Services

```powershell
docker-compose up -d
```

This starts:
- Redis on `localhost:6379`
- n8n on `localhost:5678`

### 2.3 Verify Services Are Running

```powershell
docker-compose ps
```

You should see both services with status "Up".

### 2.4 Open n8n

1. Open your browser
2. Go to: `http://localhost:5678`
3. Create an admin account:
   - Email: `admin@email.com`
   - Password: `n8n-admin-123`

### 2.5 Import Email Workflow

1. In n8n, click **Workflows** in the left menu
2. Click **Import from File**
3. Select: `F:\webscrap_pro\n8n-workflows\email-automation.json`
4. Click **Import**

### 2.6 Configure Gmail OAuth in n8n

1. In n8n, go to **Credentials** in the left menu
2. Click **Add Credential**
3. Search for **Gmail OAuth2**
4. Click on it
5. Click **Create**
6. A Google login page opens - sign in with your Gmail
7. Click **Allow** to give n8n access
8. Credential is created - no password needed!

### 2.7 Connect Gmail to Workflow

1. Open the imported workflow
2. Click on **Send OTP Email** node
3. In **Credential** dropdown, select your Gmail account
4. Repeat for **Send Welcome Email** and **Send Job Complete Email**

### 2.8 Activate the Workflow

1. Click the **Active** toggle in the top right
2. The workflow is now listening for webhooks

**Your n8n email automation is running! No SMTP password needed.**

---

## Step 4: Create MongoDB Atlas Database (10 minutes)

### 4.1 Create Account

1. Go to: https://cloud.mongodb.com
2. Sign up for free
3. Create an organization (any name)
4. Create a project (name: `webscrap-pro`)

### 4.2 Create Cluster

1. Click **Build a Database**
2. Select **M0 Free** tier
3. Choose region: **AWS us-east-1** (closest to Render)
4. Cluster name: `webscrap-pro`
5. Click **Create**

### 4.3 Create Database User

1. Go to **Security** → **Database Access**
2. Click **Add New Database User**
3. Authentication method: **Password**
4. Username: `webscrap_admin`
5. Password: Click **Autogenerate Secure Password** and save it
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### 4.4 Whitelist IPs

1. Go to **Security** → **Network Access**
2. Click **Add IP Address**
3. Enter: `0.0.0.0/0` (allow all)
4. Comment: `Render + Local`
5. Click **Confirm**

### 4.5 Get Connection String

1. Go to **Deployment** → **Database**
2. Click **Connect**
3. Choose **Connect your application**
4. Driver: **Node.js**, Version: **5.0 or later**
5. Copy the connection string

It looks like this:
```
mongodb+srv://webscrap_admin:YOUR_PASSWORD@webscrap-pro.xxxxx.mongodb.net/webscrap_pro?retryWrites=true&w=majority
```

**Save this somewhere safe!**

---

## Step 5: Create Render Account (5 minutes)

### 5.1 Create Account

1. Go to: https://render.com
2. Sign up with GitHub

### 5.2 Create Backend Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** `webscrap-pro-backend`
   - **Region:** US East (Ohio)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `cd backend && npm install`
   - **Start Command:** `cd backend && node server.js`

### 5.3 Set Environment Variables

Click **Environment** tab and add:

```
NODE_ENV=production
PORT=10000
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-32-char-random-string
REDIS_URL=redis://localhost:6379
FRONTEND_URL=https://your-app.vercel.app
BACKEND_URL=https://webscrap-pro-backend.onrender.com
N8N_WEBHOOK_URL=http://localhost:5678/webhook/email
EMAIL_FROM=WebScrap Pro <your-email@gmail.com>
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000
```

**Important:** Replace all `your-xxx` values with your actual credentials.

**Note:** SMTP is NOT needed - n8n handles emails via Gmail OAuth (no password required).

### 5.4 Deploy

1. Click **Create Web Service**
2. Wait for deployment (5-10 minutes)
3. Note the URL: `https://webscrap-pro-backend.onrender.com`

### 5.5 Test Backend

Open browser and go to:
```
https://webscrap-pro-backend.onrender.com/api/health
```

You should see:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "...",
  "checks": {
    "database": {
      "status": "connected"
    }
  }
}
```

---

## Step 6: Create Vercel Account (5 minutes)

### 6.1 Create Account

1. Go to: https://vercel.com
2. Sign up with GitHub

### 6.2 Import Repository

1. Click **Import Project**
2. Select your GitHub repository
3. Framework: **Vite**
4. Root Directory: `frontend`

### 6.3 Set Environment Variables

```
VITE_API_URL=https://webscrap-pro-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### 6.4 Deploy

1. Click **Deploy**
2. Wait for build (1-2 minutes)
3. Note the URL: `https://your-app.vercel.app`

---

## Step 7: Update CORS Settings (2 minutes)

### 7.1 Update Render Environment

Go to Render dashboard → Environment and update:

```
FRONTEND_URL=https://your-app.vercel.app
```

### 7.2 Redeploy Backend

1. Render will auto-redeploy
2. Wait 1-2 minutes

---

## Step 8: Test Everything (10 minutes)

### 8.1 Test Backend Health

```
https://webscrap-pro-backend.onrender.com/api/health
```

### 8.2 Test Frontend

1. Open: `https://your-app.vercel.app`
2. Try to register a new account
3. Check your email for verification

### 8.3 Test Email Automation

1. Open n8n: `http://localhost:5678`
2. Go to **Executions**
3. You should see the email workflow runs

### 8.4 Test AI Features

1. In the app, go to Dashboard
2. Try the AI summarization feature
3. It should work if OpenAI key is set

---

## Troubleshooting

### Backend Won't Start

**Check Render logs:**
1. Go to Render dashboard
2. Click on your service
3. Go to **Logs** tab
4. Look for error messages

**Common issues:**
- Missing environment variables
- Wrong MongoDB connection string
- JWT_SECRET too short (min 32 characters)

### MongoDB Connection Failed

1. Check IP whitelist (should be `0.0.0.0/0`)
2. Verify username/password
3. Check database name matches (`webscrap_pro`)

### n8n Not Receiving Webhooks

1. Make sure n8n is running: `docker-compose ps`
2. Check n8n is active (toggle is ON)
3. Verify webhook URL matches

### Cold Starts (30-60 second delay)

This is normal on Render free tier. First request takes time.

**Workaround:** Upgrade to Render paid tier ($7/month) for no cold starts.

---

## Daily Commands

```powershell
# Start n8n + Redis
cd F:\webscrap_pro
docker-compose up -d

# Stop n8n + Redis
docker-compose down

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

---

## What Each Service Does

| Service | Where | What It Does |
|---------|-------|--------------|
| **Frontend** | Vercel | React app for users |
| **Backend** | Render | API server (Node.js) |
| **Database** | MongoDB Atlas | Stores users, jobs, data |
| **Redis** | Your PC (Docker) | Caching, rate limiting (unlimited) |
| **n8n** | Your PC (Docker) | Email automation |
| **AI** | OpenAI | Summarization, keywords |

---

## Cost Summary

| Service | Free Tier | Monthly Cost |
|---------|-----------|--------------|
| Render | 750 hrs/month | $0 |
| Vercel | 100GB bandwidth | $0 |
| MongoDB Atlas | 512MB storage | $0 |
| Redis (Docker) | Unlimited | $0 |
| n8n (Docker) | Unlimited | $0 |
| OpenAI | $5 free credits | $0 |
| **TOTAL** | | **$0** |

---

## Next Steps (Optional)

1. **Add Google OAuth** - See context dump
2. **Set up Sentry** - Error tracking
3. **Add monitoring** - Vercel Analytics
4. **Scale up** - When you have users

---

**Deployment complete! Your app is live at $0/month.**
