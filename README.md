# InsureShield - Insurance Agent Platform

A modern web-based insurance CRM and underwriting platform for certified agents, enabling end-to-end policy sales across Term, Health, Vehicle, Travel, and Life insurance.

---

## 1. Agent Login Credentials

Use the following credentials to access and evaluate the application:

- **Email**: `agent@test.com`
- **Password**: `Password123!`

*(Admin credentials if needed: `admin@test.com` / `AdminPassword123!`)*

---

## 2. Third-Party Services Used & Configuration Modes

| Third-Party Service | Purpose | Mode / Configuration |
| :--- | :--- | :--- |
| **MongoDB Atlas** | Primary cloud database for agents, customers, products, quotes, payments, and policy records | **Live Cloud Cluster**: Direct connection via `MONGODB_URI` string (with automated embedded fallback for local offline testing). |
| **Stripe** | Payment link generation & hosted checkout | **Hybrid Checkout & Test Mode**: Generates real Stripe hosted checkout sessions (`https://checkout.stripe.com/...`) using test API keys, and supports simulation mode for instant policy activation. |
| **Resend** | Transactional email delivery for policy certificates | **API Mode**: Dispatches official HTML policy activation confirmation emails to customer inboxes via `RESEND_API_KEY` (with console fallback if unset). |
| **PDFKit** | Dynamic personalized quote document generation | **In-Memory Vector PDF Engine**: Generates official branded quotation documents and serves them directly without third-party dependencies. |
| **WhatsApp URL Scheme** | Mobile quotation and checkout link delivery | **Direct Deep-Link Scheme**: Generates pre-formatted, URL-encoded WhatsApp messages (`https://wa.me/{phone}?text=...`) targeting customer phone numbers. |

---

## 3. Required Environment Variables

### Frontend (`frontend/.env.local` or Vercel Environment Variables)

```env
# Base API URL (/api for self-contained Next.js Serverless routes on Vercel)
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_APP_NAME="InsureShield Agent CRM"

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/insurance_platform?retryWrites=true&w=majority

# JWT Authentication
JWT_SECRET=super_secret_jwt_key_insurance_agent_platform_2026
JWT_EXPIRES_IN=7d

# Resend Email (Optional - console fallback active if unset)
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=onboarding@resend.dev

# Stripe Payments (Optional - simulation mode active if placeholder)
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
```

### Backend (`backend/.env`) *(Only if running standalone Express server)*

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/insurance_platform?retryWrites=true&w=majority
JWT_SECRET=super_secret_jwt_key_insurance_agent_platform_2026
JWT_EXPIRES_IN=7d
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=onboarding@resend.dev
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder
```

---

## 4. How to Run the Application

### Prerequisites
- **Node.js**: >= 20.x
- **npm**: >= 10.x

---

### Option A: Run Full-Stack with Next.js (Recommended)

The frontend includes self-contained Next.js App Router API route handlers that run both the UI and backend logic in a single process:

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env.local file from template
cp .env.example .env.local

# 4. Start development server
npm run dev
```

Open **`http://localhost:3000`** in your browser and log in with the agent credentials above.

---

### Option B: Run Express Backend + Next.js Frontend Separately

```bash
# Terminal 1: Backend API (port 5000)
cd backend
npm install
npm run build
npm start

# Terminal 2: Frontend (port 3000)
cd frontend
npm install
npm run dev
```

---

### Option C: Run with Docker Compose

```bash
docker-compose up --build
```

---

## 5. Deployment on Vercel (1-Click Ready)

1. Push this repository to **GitHub**.
2. Go to **[Vercel](https://vercel.com)** and click **"Add New Project"**.
3. Import this GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = your secure JWT secret string
   - `RESEND_API_KEY` = your Resend API key (optional)
   - `EMAIL_FROM` = your sender email (e.g. `onboarding@resend.dev`)
   - `NEXT_PUBLIC_API_URL` = `/api`
6. Click **Deploy**. Vercel will build all static pages and serverless API functions automatically.

---

## 6. Running Automated Tests

Run backend unit tests for the Underwriting Eligibility Rules Engine:

```bash
cd backend
npm test
```
