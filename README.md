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
| **Gmail SMTP (Nodemailer)** | Free transactional email delivery to any customer | **SMTP Mode**: Dispatches policy activation emails directly to any recipient using a Google App Password via `SMTP_USER` and `SMTP_PASS` (0 custom domain required). |
| **Stripe** | Payment link generation & hosted checkout | **Hybrid Checkout & Test Mode**: Generates real Stripe hosted checkout sessions (`https://checkout.stripe.com/...`) using test API keys, and supports simulation mode for instant policy activation. |
| **Resend** | Alternative transactional email delivery | **API Mode**: Dispatches emails via `RESEND_API_KEY` (with console fallback if unset). |
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
JWT_SECRET=super_secret_jwt_key_insurance_agent
JWT_EXPIRES_IN=7d

# Free Gmail SMTP (Sends real policy emails to ANY customer with 0 domain required)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_letter_gmail_app_password_without_spaces   # e.g., abcdxyzpqrstuvwx (no spaces)

# Resend Email (Alternative provider)
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
JWT_SECRET=super_secret_jwt_key_insurance_agent
JWT_EXPIRES_IN=7d
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_letter_gmail_app_password_without_spaces   # e.g., abcdxyzpqrstuvwx (no spaces)
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
   - `SMTP_USER` = your Gmail address (e.g. `your_email@gmail.com`)
   - `SMTP_PASS` = your 16-character Google App Password without spaces (e.g. `abcdxyzpqrstuvwx`)
   - `NEXT_PUBLIC_API_URL` = `/api`
6. Click **Deploy**. Vercel will build all static pages and serverless API functions automatically.

---

## 6. Running Automated Tests

Run backend unit tests for the Underwriting Eligibility Rules Engine:

```bash
cd backend
npm test
```

---

## 7. Policy Activation Email Delivery & Troubleshooting

Upon successful payment completion, the platform automatically dispatches an official **Policy Activation Confirmation Email** to whatever email address was entered for that customer (`customer.email`).

### What to Do If You Don't See the Email in Your Primary Inbox:

> [!IMPORTANT]
> **Check Your Spam / Junk Folder**:
> If the confirmation email is not visible in your regular inbox or "All Mail", **please check your Spam / Junk or Promotions folder**.
>
> - **Why this happens initially**: When receiving automated emails from a new script or when testing by sending from and to the same Gmail address, email spam filters (like Gmail AI) may temporarily place the first message in the Spam folder.
> - **How to fix it permanently**: Simply open the email inside your Spam folder and click **"Report not spam"** (or move it to your **Primary Inbox**). This immediately trains Google's filter to recognize the sender, and all subsequent policy documents and receipts will land straight into the Primary inbox.

### How to Configure Gmail SMTP:
1. Go to your **Google Account** $\rightarrow$ **Security** $\rightarrow$ Enable **2-Step Verification**.
2. Search for **"App Passwords"** in your Google Account search bar.
3. Create a new app password (e.g. name it `InsureShield`).
4. Copy the generated 16-character code and remove any spaces (e.g., `abcdxyzpqrstuvwx`).
5. Set `SMTP_USER=your_email@gmail.com` and `SMTP_PASS=your_16_letters_without_spaces` in your `.env` or Vercel Environment Variables.

