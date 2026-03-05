# Deployment Guide

This guide walks you through hosting this MERN project for free using:

- **Vercel** – Frontend (React/Vite)
- **Render** – Backend (Node/Express)
- **MongoDB Atlas** – Cloud database

You can update the frontend URL anytime via **Environment Variables** on Render (e.g. after changing the Vercel URL). No need to push to GitHub for CORS changes.

---

## 1. MongoDB Atlas (Database)

### 1.1 Create an account and cluster

1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign up / log in.
2. Create a **free** M0 cluster (e.g. choose a cloud provider and region, then **Create**).
3. Wait for the cluster to finish provisioning.

### 1.2 Database access (user)

1. In the left sidebar, go to **Database Access** → **Add New Database User**.
2. Choose **Password** authentication.
3. Set a username and a strong password (save them somewhere safe).
4. Under **Database User Privileges**, leave **Read and write to any database** (or restrict later if you prefer).
5. Click **Add User**.

### 1.3 Network access (allow connections)

1. Go to **Network Access** → **Add IP Address**.
2. For production, click **Allow Access from Anywhere** (adds `0.0.0.0/0`). This lets Render connect. You can restrict IPs later.
3. Confirm with **Add IP Address**.

### 1.4 Get connection string

1. Go to **Database** → **Connect** on your cluster.
2. Choose **Connect your application**.
3. Copy the connection string. It looks like:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<username>` and `<password>` with your database user and password. If the password has special characters, URL-encode them (e.g. `@` → `%40`).
5. Optional but recommended: add a database name before `?`:
   ```text
   mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/yourdbname?retryWrites=true&w=majority
   ```
   Use the same name in your app (e.g. `construction-db`). This value is your **MONGO_URI** for the backend.

---

## 2. Render (Backend – Node/Express)

### 2.1 Prepare the repo

- Backend code should be in your GitHub repo in the `server` folder.
- **Easiest:** In Render, set **Root Directory** to `server` (see Option B below); then Build = `npm install`, Start = `npm start`.
- Render will run the app from the **root** of the repo, so you need a way to start the server from the root.

**Option A – Start script at root (recommended)**

In the **project root** (same level as `server/` and `client/`), add a `package.json` if you don’t have one:

```json
{
  "name": "construction-management",
  "scripts": {
    "start": "cd server && node server.js",
    "install:server": "cd server && npm install"
  },
  "engines": {
    "node": ">=18"
  }
}
```

On Render, set **Build Command** to: `npm run install:server`  
and **Start Command** to: `npm start`.

**Option B – Only backend in repo**

If you deploy a repo that contains only the `server` folder (e.g. a separate “backend” repo):

- **Root Directory**: `server` (in Render’s settings).
- **Build Command**: `npm install`
- **Start Command**: `npm start`

Ensure `server/package.json` has:

```json
"scripts": {
  "start": "node server.js"
}
```

### 2.2 Create Web Service on Render

1. Go to [https://render.com](https://render.com) and sign up / log in (e.g. with GitHub).
2. **Dashboard** → **New** → **Web Service**.
3. Connect the GitHub repo that contains your backend (and optionally the root `package.json` as above).
4. Configure:
   - **Name**: e.g. `construction-api`
   - **Region**: Choose one close to your users.
   - **Branch**: `main` (or your default branch).
   - **Runtime**: **Node**.
   - **Root Directory**: `server` (so Render uses only the backend folder).
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: **Free**.

### 2.3 Environment variables on Render

In the Web Service → **Environment** tab, add:

| Key            | Value                                                                 |
|----------------|-----------------------------------------------------------------------|
| `MONGO_URI`    | Your full MongoDB Atlas connection string (from step 1.4)            |
| `JWT_SECRET`   | A long random string (e.g. 32+ characters). Generate one and keep it secret. |
| `FRONTEND_URL` | Your Vercel frontend URL (e.g. `https://your-app.vercel.app`)        |

- For **local** development, the server uses `FRONTEND_URL` default `http://localhost:5173` in code.
- When you deploy the frontend to Vercel, set `FRONTEND_URL` to that Vercel URL. You can change it anytime in Render **Environment**; no GitHub push needed for CORS.

Save. Render will redeploy with the new env vars.

### 2.4 Deploy and get backend URL

- Click **Create Web Service**. Render builds and runs the server.
- Once live, the backend URL will be like: `https://construction-api.onrender.com`
- Use this URL as the API base for the frontend (see Vercel step).

---

## 3. Vercel (Frontend – React/Vite)

### 3.1 Prepare the project

- Frontend should be in the `client` folder and use Vite.
- API base URL is read from **environment variable** in the client.

Your `client/src/utils/api.js` already uses:

```js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

So you only need to set **VITE_API_URL** on Vercel to your Render backend API URL.

### 3.2 Build settings (Vite)

- **Framework Preset**: Vite (or leave default and set commands below).
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (Vite’s default)
- **Install Command**: `npm install`

### 3.3 Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign up / log in (e.g. with GitHub).
2. **Add New** → **Project** → import your GitHub repo.
3. Set **Root Directory** to `client` (so Vercel only builds the frontend).
4. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Environment Variables** (important):
   - **Key**: `VITE_API_URL`  
   - **Value**: Your Render backend API base URL including `/api`, e.g.  
     `https://construction-api.onrender.com/api`  
   - Apply to **Production** (and Preview if you want).
6. Deploy. Vercel will build and give you a URL like `https://your-app.vercel.app`.

### 3.4 Connect frontend and backend (CORS)

1. Copy the **production** Vercel URL (e.g. `https://your-app.vercel.app`).
2. In **Render** → your Web Service → **Environment**:
   - Set `FRONTEND_URL` to that URL (no trailing slash), e.g. `https://your-app.vercel.app`
3. Save. Render will redeploy. CORS is already configured in the backend to use `process.env.FRONTEND_URL`, so the browser will allow requests from your Vercel domain.

If you later change the Vercel URL (e.g. new project or custom domain), update **only** `FRONTEND_URL` on Render; no code change or GitHub push needed.

---

## 4. Quick checklist

- [ ] MongoDB Atlas: cluster created, user created, Network Access allows Render (e.g. 0.0.0.0/0), connection string copied.
- [ ] Render: Web Service created, `MONGO_URI`, `JWT_SECRET`, and `FRONTEND_URL` set, deploy successful, backend URL copied.
- [ ] Vercel: Project created with root `client`, `VITE_API_URL` = `https://your-render-app.onrender.com/api`, deploy successful.
- [ ] Render: `FRONTEND_URL` set to final Vercel URL (e.g. `https://your-app.vercel.app`).

---

## 5. Optional: root `package.json` for Render

If your repo has both `client` and `server` at the root and you want Render to run only the server from the root, create this **at the project root** (not inside `server/`):

**package.json (project root)**

```json
{
  "name": "construction-management",
  "private": true,
  "scripts": {
    "start": "cd server && node server.js",
    "install:server": "cd server && npm install"
  },
  "engines": {
    "node": ">=18"
  }
}
```

- **Build Command** on Render: `npm run install:server`
- **Start Command**: `npm start`

---

## 6. Troubleshooting

- **CORS errors in browser**  
  - Ensure `FRONTEND_URL` on Render exactly matches the origin (e.g. `https://your-app.vercel.app`) with no trailing slash.  
  - Redeploy the backend after changing env vars.

- **Frontend can’t reach API**  
  - Confirm `VITE_API_URL` on Vercel is the full API base URL including `/api`.  
  - Rebuild and redeploy the frontend after changing `VITE_API_URL`.

- **Database connection failed**  
  - Check `MONGO_URI`: correct user, password (URL-encoded if needed), and that Network Access allows Render’s IPs (or 0.0.0.0/0).

- **401 Unauthorized**  
  - Ensure `JWT_SECRET` is set on Render and is the same as what you use when issuing tokens (no rotation without a coordinated change).

---

## 7. Summary of environment variables

| Where   | Variable       | Example / description                                      |
|---------|----------------|-------------------------------------------------------------|
| Render  | `MONGO_URI`    | `mongodb+srv://user:pass@cluster.mongodb.net/dbname?retryWrites=true&w=majority` |
| Render  | `JWT_SECRET`   | Long random secret string                                  |
| Render  | `FRONTEND_URL` | `https://your-app.vercel.app` (update when frontend URL changes) |
| Vercel  | `VITE_API_URL` | `https://your-render-app.onrender.com/api`                 |

Using this setup, you can change the frontend URL anytime by updating **FRONTEND_URL** in Render’s Environment and redeploying, without editing code or pushing to GitHub.
