# AgriConnect Vercel Deployment Guide

AgriConnect is configured as a full-stack **React (Vite) + FastAPI (Serverless Python)** application natively on **Vercel**.

---

## 🚀 1-Click Deployment (Recommended)

### Option 1: Deploy via Vercel Web Dashboard (GitHub)
1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure full-stack Vercel deployment"
   git push origin main
   ```
2. Open **[vercel.com/new](https://vercel.com/new)** and import your GitHub repository (`AgriConnect2`).
3. **Project Settings**:
   - **Framework Preset**: `Other` (or `Vite`)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (auto-detected from `vercel.json`)
   - **Output Directory**: `frontend/dist` (auto-detected from `vercel.json`)
4. **Environment Variables**:
   Add the following variables in the Vercel Dashboard under **Project Settings > Environment Variables**:

   | Variable Name | Description | Example / Required |
   | :--- | :--- | :--- |
   | `SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
   | `SUPABASE_ANON_KEY` | Public client API key | `eyJhbGciOi...` |
   | `SUPABASE_SERVICE_ROLE_KEY` | Secret backend service key | `eyJhbGciOi...` |
   | `RAZORPAY_KEY_ID` | Razorpay Key ID | `rzp_test_...` |
   | `RAZORPAY_KEY_SECRET` | Razorpay Secret Key | `secret_...` |
   | `DATA_GOV_IN_API_KEY` | Agmarknet data.gov.in API Key | `579b464db66ec23bdd...` |
   | `ORS_API_KEY` | OpenRouteService HeiGIT Key | `5b3ce359785111000...` |
   | `JWT_SECRET` | Secret for token signing | Random 32+ char string |

5. Click **Deploy**. Your app will be live at `https://your-project.vercel.app`!

---

### Option 2: Deploy via Vercel CLI
1. Install Vercel CLI (if not already installed):
   ```bash
   npm i -g vercel
   ```
2. In the repository root directory, run:
   ```bash
   vercel
   ```
3. To deploy to production:
   ```bash
   vercel --prod
   ```

---

## 📁 Architecture Overview

- **Static Frontend**: Compiled Vite React SPA assets located in `frontend/dist`, distributed globally via Vercel's Edge CDN.
- **Serverless API**: Handled by `api/index.py` which mounts the FastAPI backend (`backend/main.py`) using Vercel's native Python runtime.
- **Rewrites (`vercel.json`)**:
  - `/api/*` $\rightarrow$ `/api/index.py` (FastAPI Serverless endpoints)
  - `/*` $\rightarrow$ `/index.html` (React Router SPA pushState fallback)
