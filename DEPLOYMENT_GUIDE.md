# BloxRazon Development Deployment Guide

## Option 1: Railway (Recommended - FREE $5/month credit)

### Prerequisites
1. GitHub account
2. Railway account (sign up at railway.app)
3. Your code in a GitHub repository

### Step-by-Step Deployment:

#### 1. Push Code to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/bloxrazon.git
git branch -M main
git push -u origin main
```

#### 2. Deploy Backend on Railway

1. Go to https://railway.app and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your bloxrazon repository
4. Railway will auto-detect Node.js

**Configure Environment Variables:**
- Click on your service → "Variables" tab
- Add all variables from your `.env` file:
  ```
  PORT=3000
  DB_HOST=<will set up in step 3>
  DB_USER=root
  DB_PASSWORD=<will get from Railway>
  DB_NAME=bloxrazon
  DISCORD_CLIENT_ID=your_discord_id
  DISCORD_CLIENT_SECRET=your_discord_secret
  DISCORD_REDIRECT_URI=https://your-app.railway.app/auth/discord/callback
  JWT_SECRET=your_jwt_secret
  ENCRYPTION_KEY=your_encryption_key
  ADURITE_API_KEY=your_key
  # ... add all other env variables
  ```

**Configure Start Command:**
- Go to "Settings" → "Build & Deploy"
- Build Command: `npm install && npm run build`
- Start Command: `node app.js`
- Add "Deploy Trigger": Enable automatic deploys on push

#### 3. Add MySQL Database

1. In Railway project, click "New" → "Database" → "Add MySQL"
2. Railway will provision a MySQL database
3. Click on MySQL service → "Variables" tab
4. Copy the connection details:
   - `MYSQL_HOST`
   - `MYSQL_USER`
   - `MYSQL_PASSWORD`
   - `MYSQL_DATABASE`
   - `MYSQL_PORT`

5. Go back to your backend service → Variables
6. Update your DB variables with MySQL details from above

#### 4. Initialize Database

1. Click on MySQL service → "Query" tab (or use MySQL client)
2. Run your schema file:
   ```sql
   -- Copy and paste contents from database/schema.sql
   ```

3. Or connect remotely:
   ```bash
   mysql -h MYSQL_HOST -u MYSQL_USER -p MYSQL_DATABASE < database/schema.sql
   ```

#### 5. Deploy Frontend (Vite Build)

Railway serves both frontend and backend from same service since you have a static build.

**Ensure app.js serves the built frontend:**
Check that app.js has:
```javascript
app.use(express.static('dist'));
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});
```

#### 6. Get Your URL

1. Go to your Railway service → "Settings" → "Domains"
2. Click "Generate Domain"
3. Your app will be available at: `https://your-app-name.railway.app`

#### 7. Update Discord OAuth Redirect

1. Go to Discord Developer Portal
2. Update OAuth2 Redirect URL to: `https://your-app-name.railway.app/auth/discord/callback`
3. Update `DISCORD_REDIRECT_URI` in Railway variables

---

## Option 2: Render (100% FREE - Slower)

### Step-by-Step:

#### 1. Push to GitHub (same as above)

#### 2. Deploy on Render

1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: bloxrazon-dev
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node app.js`
   - **Plan**: Free

#### 3. Add Environment Variables

In "Environment" tab, add all your `.env` variables

#### 4. Add MySQL Database

**Option A: Use Render's PostgreSQL (Free) - Requires code changes**
- Render doesn't offer free MySQL
- Would need to migrate to PostgreSQL

**Option B: Use external MySQL:**
1. Sign up for free MySQL at:
   - **Railway** (separate MySQL service)
   - **PlanetScale** (free tier: planetscale.com)
   - **Clever Cloud** (free tier: clever-cloud.com)

**Using PlanetScale (Recommended for Render):**
1. Go to planetscale.com, sign up
2. Create new database "bloxrazon"
3. Go to "Connect" → "Generate new password"
4. Copy connection details
5. Add to Render environment variables:
   ```
   DB_HOST=your-db.connect.psdb.cloud
   DB_USER=your-user
   DB_PASSWORD=your-password
   DB_NAME=bloxrazon
   ```

#### 5. Access Your Site

Your site will be at: `https://bloxrazon-dev.onrender.com`

**Note**: Free Render services spin down after 15 minutes of inactivity (slow first load)

---

## Option 3: Fly.io (FREE - $5 credit + Free tier)

### Step-by-Step:

#### 1. Install Fly CLI
```bash
# Windows (PowerShell)
iwr https://fly.io/install.ps1 -useb | iex

# Restart terminal after install
```

#### 2. Login and Setup
```bash
fly auth login
fly launch
```

Answer prompts:
- App name: `bloxrazon-dev`
- Region: Choose closest to you
- Would you like to set up a PostgreSQL database? **No** (we'll use MySQL)
- Deploy now? **No**

#### 3. Create fly.toml Configuration

Create `fly.toml` in your project root (Fly CLI may have created one):
```toml
app = "bloxrazon-dev"
primary_region = "iad"

[build]
  builder = "heroku/buildpacks:20"

[env]
  PORT = "8080"

[http_service]
  internal_port = 8080
  force_https = true
  auto_stop_machines = true
  auto_start_machines = true
  min_machines_running = 0
  processes = ["app"]

[[services.ports]]
  port = 80
  handlers = ["http"]

[[services.ports]]
  port = 443
  handlers = ["tls", "http"]
```

#### 4. Set Secrets (Environment Variables)
```bash
fly secrets set DB_HOST=your_db_host
fly secrets set DB_USER=your_db_user
fly secrets set DB_PASSWORD=your_db_password
fly secrets set JWT_SECRET=your_jwt_secret
# ... set all other secrets
```

#### 5. Add MySQL Database

Use **PlanetScale** (free) or **Railway MySQL** and connect via connection string

#### 6. Deploy
```bash
fly deploy
```

Your app will be at: `https://bloxrazon-dev.fly.dev`

---

## Recommended Setup for Your Use Case:

**BEST CHOICE: Railway**

Why:
- ✅ Both Node.js app AND MySQL in one place
- ✅ $5/month free credit (enough for development)
- ✅ Fast deployment and updates
- ✅ Automatic deploys from GitHub
- ✅ Easy environment variables
- ✅ Always-on (no cold starts)
- ✅ Can add password protection for pre-release

### Add Authentication for Pre-Release Testing

Add middleware to app.js to restrict access:

```javascript
// At the top of app.js
const PRE_RELEASE_PASSWORD = process.env.PRE_RELEASE_PASSWORD || 'your_secure_password';

// Add this middleware before other routes
app.use((req, res, next) => {
    // Skip auth for auth routes and static files
    if (req.path.startsWith('/auth') || req.path.startsWith('/assets')) {
        return next();
    }

    // Check if user has access cookie
    if (req.cookies.pre_release_access === PRE_RELEASE_PASSWORD) {
        return next();
    }

    // Show password page
    if (req.method === 'POST' && req.path === '/pre-release-auth') {
        if (req.body.password === PRE_RELEASE_PASSWORD) {
            res.cookie('pre_release_access', PRE_RELEASE_PASSWORD, { maxAge: 7 * 24 * 60 * 60 * 1000 });
            return res.redirect('/');
        }
    }

    // Show password form
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Pre-Release Access</title>
            <style>
                body { 
                    display: flex; 
                    justify-content: center; 
                    align-items: center; 
                    height: 100vh; 
                    background: #1a1a2e;
                    color: white;
                    font-family: Arial;
                }
                form { 
                    background: #16213e; 
                    padding: 40px; 
                    border-radius: 10px; 
                    text-align: center;
                }
                input { 
                    padding: 10px; 
                    margin: 10px 0; 
                    width: 250px; 
                    border-radius: 5px; 
                    border: none;
                }
                button { 
                    padding: 10px 30px; 
                    background: #F90; 
                    border: none; 
                    border-radius: 5px; 
                    color: white; 
                    cursor: pointer;
                }
            </style>
        </head>
        <body>
            <form method="POST" action="/pre-release-auth">
                <h2>🔒 Pre-Release Access</h2>
                <p>This site is in development</p>
                <input type="password" name="password" placeholder="Enter access code" required>
                <br>
                <button type="submit">Access Site</button>
            </form>
        </body>
        </html>
    `);
});
```

Add to Railway environment variables:
```
PRE_RELEASE_PASSWORD=YourSecurePassword123
```

---

## Quick Start Commands (Railway):

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Link to your project (after creating on Railway website)
railway link

# 4. Push code (alternative to GitHub auto-deploy)
railway up

# 5. View logs
railway logs

# 6. Open in browser
railway open
```

---

## Continuous Updates:

After initial deployment, just:
1. Make changes to your code
2. Commit and push to GitHub: `git push`
3. Railway automatically redeploys (2-3 minutes)

---

## Cost Breakdown (All FREE for development):

| Platform | FREE Tier | Database | Best For |
|----------|-----------|----------|----------|
| **Railway** | $5 credit/mo | MySQL included | Best all-around |
| **Render** | 750hrs/mo | Need external DB | Limited budget |
| **Fly.io** | $5 credit + free tier | Need external DB | Global distribution |

**My Recommendation: Use Railway** - Deploy now, worry about scaling later.
