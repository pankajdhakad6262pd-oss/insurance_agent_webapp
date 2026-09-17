# InsureShield Deployment Guide

This guide covers deploying the frontend on **Vercel**, the backend on **Render**, and the database on **MongoDB Atlas**, as well as local deployment using **Docker Compose**.

---

## 1. MongoDB Atlas Configuration

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Under **Database Access**, create a database user with read/write privileges.
3. Under **Network Access**, add IP `0.0.0.0/0` (or Render's outbound IPs) to allow incoming traffic.
4. Copy your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/insurance_platform?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment on Render

1. Sign in to [Render](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository: `insurance-agent-platform`.
4. Select the **Root Directory**: `backend`.
5. Configuration:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Under **Environment Variables**, add:
   ```env
   NODE_ENV=production
   PORT=10000
   CLIENT_URL=https://your-frontend-app.vercel.app
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/insurance_platform
   JWT_SECRET=your_long_random_production_jwt_secret
   JWT_EXPIRES_IN=7d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   RESEND_API_KEY=re_...
   EMAIL_FROM=onboarding@resend.dev
   ```
7. Click **Deploy Web Service**.
8. Once deployed, run the seed script via Render's shell:
   ```bash
   npm run seed
   ```

---

## 3. Frontend Deployment on Vercel

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New** -> **Project**.
3. Import the `insurance-agent-platform` repository.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, configure:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com/api
   ```
6. Click **Deploy**. Vercel will automatically build the Next.js 15 App Router static pages and API routing.

---

## 4. Local Deployment with Docker Compose

To run MongoDB, Backend, and Frontend locally in isolated containers:

```bash
docker-compose up --build
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api`
- MongoDB: `localhost:27017`

