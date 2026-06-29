# Deployment & Database Setup Guide

This guide explains how to deploy the **IoT Device Simulator Dashboard** with a split architecture:
1. **Frontend**: Hosted on **Vercel**
2. **Backend**: Hosted on **Render**
3. **Database**: Hosted on **Railway** (already configured, accessible via **MySQL Workbench**)

---

## 1. Connecting MySQL Workbench to the Database

The backend is configured to connect to a hosted MySQL database on Railway. You can connect your local **MySQL Workbench** directly to this database to inspect and query the tables (`Devices` and `ProcessingHistory`) in real-time as the frontend simulator runs.

### Connection Details:
- **Connection Method**: Standard (TCP/IP)
- **Hostname / Endpoint**: `reseau.proxy.rlwy.net`
- **Port**: `13614`
- **Username**: `root`
- **Password**: `MYtarMYSooyIDZCcVhNWswJyGDQJLcVa`
- **Default Schema / Database**: `railway`

### Steps in MySQL Workbench:
1. Open MySQL Workbench.
2. Click the **`+`** icon next to "MySQL Connections" to add a new connection.
3. Name it `IoT Simulator (Railway)`.
4. Enter the **Hostname**, **Port**, and **Username** from the connection details above.
5. Click **Store in Vault...** next to Password, and enter the password above.
6. (Optional) Enter `railway` in the **Default Schema** field.
7. Click **Test Connection** to verify. If successful, click **OK** to save and open the connection.

---

## 2. Deploying the Backend on Render

Render is ideal for hosting Node.js/Express APIs.

### Steps:
1. Log in to [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Configure the Web Service settings:
   - **Name**: `iot-device-simulator-backend` (or your preferred name)
   - **Region**: Select the region closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend` *(CRITICAL: This tells Render to only look at the backend folder)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (or `npm start`)
5. Under **Environment Variables**, add the following keys using the credentials from your `.env` file:
   - `DB_HOST` = `reseau.proxy.rlwy.net`
   - `DB_PORT` = `13614`
   - `DB_USER` = `root`
   - `DB_PASSWORD` = `MYtarMYSooyIDZCcVhNWswJyGDQJLcVa`
   - `DB_NAME` = `railway`
   - `PORT` = `5000` (Render will automatically override this if needed)
6. Click **Deploy Web Service**.
7. Note down your backend URL (e.g., `https://iot-device-simulator-backend.onrender.com`). You will need this for the Vercel deployment.

---

## 3. Deploying the Frontend on Vercel

Vercel is optimized for fast, static frontend builds (Vite + React).

### Steps:
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository.
4. Configure the Project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select the `frontend` folder.
   - **Build & Development Settings**: Leave as default (it will use `npm run build` and output to the `dist` directory).
5. Expand the **Environment Variables** section and add the following variable:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: The URL of your Render backend (e.g., `https://iot-device-simulator-backend.onrender.com`)
     *(Note: Do not include a trailing slash, e.g. use `https://your-backend.onrender.com` instead of `https://your-backend.onrender.com/`)*
6. Click **Deploy**.
7. Once the build completes, Vercel will provide you with a live URL for your frontend (e.g., `https://iot-device-simulator-dashboard.vercel.app`).
