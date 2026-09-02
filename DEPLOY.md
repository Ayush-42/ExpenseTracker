# Deploy Expense Tracker (free)

Stack: **Vercel** (client) + **Render** (API) + **MongoDB Atlas** (database) + **Firebase** (auth).

## Before you deploy

### 1. MongoDB Atlas — allow cloud access

Render runs in the cloud, so Atlas must allow it:

1. [MongoDB Atlas](https://cloud.mongodb.com/) → **Network Access**
2. **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`)

Your database is still protected by username/password in `MONGODB_URI`. Remove your home-only IP rule if you no longer need local-only access.

### 2. Firebase — authorized domains

After the frontend URL is live:

1. [Firebase Console](https://console.firebase.google.com/) → **Authentication** → **Settings** → **Authorized domains**
2. Add your Vercel URL, e.g. `expense-tracker-xyz.vercel.app`

---

## Step 1 — Deploy the API (Render)

1. Open [Render Blueprint](https://dashboard.render.com/select-repo?type=blueprint) and connect GitHub repo **Ayush-42/ExpenseTracker**.
2. Render reads `render.yaml` and creates **expense-tracker-api**.
3. When prompted, set environment variables:

   | Key | Value |
   |-----|--------|
   | `MONGODB_URI` | Your Atlas connection string (from `server/.env`) |
   | `CLIENT_URL` | `https://YOUR-VERCEL-APP.vercel.app` (update after Step 2; use a placeholder first if needed) |

4. Deploy. Note the URL, e.g. `https://expense-tracker-api.onrender.com`.
5. Test: open `https://expense-tracker-api.onrender.com/health` — should return `{"status":"ok",...}`.

**Free tier:** the service sleeps after ~15 minutes idle; the first request may take 30–60 seconds.

---

## Step 2 — Deploy the client (Vercel)

1. Open [vercel.com/new](https://vercel.com/new) → import **Ayush-42/ExpenseTracker**.
2. **Root Directory:** `client`
3. Framework: Vite (auto-detected). Build: `npm run build`, Output: `dist`.
4. Add **Environment Variables** (copy from `client/.env`):

   | Name | Example |
   |------|---------|
   | `VITE_FIREBASE_API_KEY` | from Firebase |
   | `VITE_FIREBASE_AUTH_DOMAIN` | `expense-tracker-58331.firebaseapp.com` |
   | `VITE_FIREBASE_PROJECT_ID` | your project id |
   | `VITE_FIREBASE_STORAGE_BUCKET` | your bucket |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | your sender id |
   | `VITE_FIREBASE_APP_ID` | your app id |
   | `VITE_API_URL` | `https://expense-tracker-api.onrender.com/api` |

   **Important:** the URL must include `/api` at the end (or the app will append it automatically after the next deploy).

5. Deploy. Copy your live URL, e.g. `https://expense-tracker.vercel.app`.

---

## Step 3 — Wire CORS

1. Render dashboard → **expense-tracker-api** → **Environment**
2. Set `CLIENT_URL` to your exact Vercel URL (no trailing slash):
   ```
   https://your-app.vercel.app
   ```
3. **Save Changes** (Render redeploys automatically).

---

## Step 4 — Firebase domain

Add the Vercel hostname to Firebase **Authorized domains** (see above).

---

## Redeploy after code changes

- **Git push to `main`** → Vercel and Render redeploy automatically if connected to GitHub.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| API slow first load | Render free tier cold start — wait ~1 minute |
| CORS error | `CLIENT_URL` on Render must match Vercel URL exactly |
| MongoDB connection failed | Atlas Network Access must include `0.0.0.0/0` |
| Firebase auth error | Add Vercel domain to Firebase authorized domains |
| Wrong API URL | Redeploy Vercel after changing `VITE_API_URL` |
