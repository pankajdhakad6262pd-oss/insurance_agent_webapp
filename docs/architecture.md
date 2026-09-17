# InsureShield Agent Platform - Architecture & Design Document

## 1. Executive Summary

InsureShield is a production-ready MVP platform purpose-built for licensed insurance advisors and underwriters. It streamlines customer onboarding, dynamically evaluates underwriting rules across multiple policy domains, issues personalized PDF quotations, enables one-click WhatsApp client communication, processes Stripe payments, and triggers automated policy activations and Resend transactional notifications.

---

## 2. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------------+
|                              Next.js 15 App Router Frontend                             |
|  - Modern Glassmorphism Tailwind UI                                                     |
|  - React Hook Form + Zod Client Validation                                              |
|  - Real-time Eligibility Presentation & Skeletons                                       |
|  - Routes: /login, /register, /dashboard, /customers, /products, /quotes, /payments     |
+--------------------------------------------+--------------------------------------------+
                                             |
                                  HTTPS / REST API (JWT Bearer)
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                              Node.js + Express API Backend                              |
|                                                                                         |
|  +-----------------------+     +------------------------+     +----------------------+  |
|  |   Controllers Layer   | --> |     Services Layer     | --> |  Repositories Layer  |  |
|  |  (Input Sanitization, |     | (Core Business Logic,  |     |  (Mongoose DB Data   |  |
|  |   Zod Schema Guard)   |     |  Eligibility Engine)   |     |   Access Pattern)    |  |
|  +-----------------------+     +------------------------+     +----------------------+  |
|                                            |                             |              |
|                                            v                             v              |
|                                +------------------------+     +----------------------+  |
|                                |   PDFKit Generation    |     |  Mongoose Models     |  |
|                                | (Vector Branded PDF)   |     |  - Agent             |  |
|                                +------------------------+     |  - Customer          |  |
|                                            |                  |  - Category          |  |
|                                            v                  |  - Product           |  |
|                                +------------------------+     |  - Quote             |  |
|                                |   Cloudinary Storage   |     |  - Payment           |  |
|                                | (Upload + Static Fall) |     |  - PolicyActivation  |  |
|                                +------------------------+     +----------------------+  |
|                                            |                                            |
|                                            v                                            |
|                                +------------------------+                               |
|                                | Third-Party Connectors |                               |
|                                | - Stripe Checkout      |                               |
|                                | - Resend Email Service |                               |
|                                | - WhatsApp Share Links |                               |
|                                +------------------------+                               |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                      Database Layer                                     |
|             MongoDB Atlas Cluster / Local Replica / Embedded Memory Server              |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Core Subsystems

### 3.1 Clean Layered Architecture
The backend follows Clean Architecture principles separating responsibilities:
- **Routes Layer** (`src/routes/`): URL route definitions, middleware attachment.
- **Middleware Layer** (`src/middleware/`): JWT verification, role authorization, request validation via Zod, error handling.
- **Controllers Layer** (`src/controllers/`): HTTP request extraction, status code handling, response formatting.
- **Services Layer** (`src/services/`): Business rules, PDF generation orchestration, payment sessions, email dispatching.
- **Repositories Layer** (`src/repositories/`): Direct Mongoose ODM interaction, queries, aggregations, and mutations.
- **Models Layer** (`src/models/`): Mongoose schema definitions, field validation, password hashing hooks, and indexes.

### 3.2 Eligibility Business Rules Engine
The eligibility engine evaluates prospective applicants against underwriting criteria:
- **Term Insurance**: Age constraint 18–60 years, income verification.
- **Health Insurance**: Age constraint 18–70 years.
- **Vehicle Insurance**: Requires active `vehicleType` matching product constraints (`car`, `two-wheeler`, `commercial`).
- **Travel Insurance**: Age constraint 18–80 years.
- **Life Insurance**: Age constraint 18–65 years.

### 3.3 Personalized PDF Generation
Using `pdfkit`, the backend constructs multi-section official insurance quotation certificates directly in memory:
- Visual company branding and document reference numbers.
- Detailed customer underwriting profile.
- Plan coverage amount, term duration, and feature bullet points.
- Base premium, regulatory surcharges, and total payable amounts.
- Digital platform signature and official validity terms.

### 3.4 Payment & Policy Lifecycle
1. **Creation**: When an agent initiates payment collection, `paymentService` initializes a Stripe Checkout session.
2. **Sharing**: A personalized WhatsApp link (`https://wa.me/{mobile}?text=...`) is generated containing the checkout URL.
3. **Fulfillment**: Upon successful payment (via Stripe Webhook or the simulation test endpoint):
   - Payment status is updated to `completed`.
   - Quote status is transitioned to `paid`.
   - A unique `PolicyActivation` record is generated (e.g., `POL-2026-XXXXX`).
   - A branded HTML certificate email is dispatched via Resend to the customer.

