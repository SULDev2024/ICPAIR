# 🚀 Full Stack Deployment Guide (Render + GitHub Pages)

Since GitHub Pages only hosts your **Frontend**, we need to host your **Backend** and **Database** on a service that supports them. We will use **Render.com** (it's free and easy).

---

## Part 1: Deploy Backend & Database to Render

### Step 1: Create a Render Account
1. Go to [dashboard.render.com](https://dashboard.render.com/)
2. Sign up with **GitHub** (this makes it easy to connect your repo).

### Step 2: Create the Database (PostgreSQL)
1. Click **New +** button → Select **PostgreSQL**.
2. **Name**: `aqm-db`
3. **Region**: Frankfurt (or closest to you).
4. **Instance Type**: Free.
5. Click **Create Database**.
6. **Wait** for it to be created.
7. **Copy** the `Internal Database URL` (looks like `postgres://aqm_user:...`). You'll need this in Step 3.

### Step 3: Create the Backend Service
1. Click **New +** button → Select **Web Service**.
2. Select **Build and deploy from a Git repository**.
3. Connect your repository: `ICPAIR`.
4. **Name**: `aqm-backend`
5. **Region**: Same as database (e.g., Frankfurt).
6. **Branch**: `main`
7. **Root Directory**: `aqm-backend` (⚠️ Important!)
8. **Runtime**: Node
9. **Build Command**: `npm install`
10. **Start Command**: `node src/app.js`
11. **Instance Type**: Free.

**Environment Variables (Scroll down to "Environment Variables"):**
Click "Add Environment Variable" for each:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Paste the `Internal Database URL` from Step 2 |
| `NODE_VERSION` | `18` |
| `PORT` | `10000` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | `/etc/secrets/firebase-service-account.json` |

**Secret Files (Click "Secret Files" tab next to Env Vars):**
1. **Filename**: `firebase-service-account.json`
2. **Content**: Open your local `aqm-backend/firebase-service-account.json`, copy ALL the text, and paste it here.
3. Click **Save Changes**.

**Finalize:**
Click **Create Web Service**.

### Step 4: Wait & Get URL
1. Render will start building your app. It might take 2-3 minutes.
2. Once it says **"Live"**, look at the top left for your URL.
3. It will look like: `https://aqm-backend-xxxx.onrender.com`
4. **Copy this URL**.

---

## Part 2: Connect Frontend to Live Backend

Now that your backend is online, we need to tell your Frontend to talk to it instead of `localhost`.

### Step 1: Update Environment Variable
1. Open `aqm-frontend/.env.production` file (I created this for you).
2. Replace the placeholder with your **Render Backend URL**:
   ```
   REACT_APP_API_URL=https://aqm-backend-xxxx.onrender.com/api
   ```
   *(Make sure to keep `/api` at the end!)*

### Step 2: Redeploy Frontend
Run these commands in your terminal:

```powershell
cd aqm-frontend
npm run deploy
```

---

## 🎉 You're Done!

1. Wait a few minutes for GitHub Pages to update.
2. Visit your website: `https://SULDev2024.github.io/ICPAIR/`
3. It should now be working fully (Login, Map, Notifications, etc.)!

**Note on Free Tier:**
Render's free tier "spins down" after inactivity. The first time you visit your site after a while, the backend might take **50 seconds** to wake up. This is normal for the free plan.
