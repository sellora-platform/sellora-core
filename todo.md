# Profit Intelligence Platform — TODO

## Current State Summary
- **Built:** Core e-commerce shell (products, orders, customers, cart, checkout, AI chat, storefront, dashboard)
- **Blocked:** 12 files locked to Manus platform — must be stripped before anything works
- **Missing:** ALL differentiating features (profit intelligence, agent marketplace, payments, shipping, emerging markets)

---

## Phase 0: Strip Manus Dependencies (BLOCKER — Must Do First)

### Manus Files to Replace/Remove
- [ ] `server/_core/sdk.ts` — Replace Manus OAuth SDK with our own JWT auth
- [ ] `server/_core/oauth.ts` — Replace Manus OAuth callback with Google/GitHub OAuth
- [ ] `server/_core/llm.ts` — Replace Manus Forge LLM with direct OpenAI/Gemini API
- [ ] `server/_core/env.ts` — Replace Manus env vars with our own system
- [ ] `server/storage.ts` — Replace Manus S3 with Cloudinary/Vercel Blob
- [ ] `server/_core/storageProxy.ts` — Replace Manus storage proxy with direct cloud storage
- [ ] `server/_core/imageGeneration.ts` — Remove (or replace with OpenAI DALL-E)
- [ ] `server/_core/notification.ts` — Remove (replace with Resend later)
- [ ] `server/_core/dataApi.ts` — Remove (unused)
- [ ] `server/_core/map.ts` — Remove (not core to e-commerce)
- [ ] `server/_core/voiceTranscription.ts` — Remove (not needed)
- [ ] `client/src/const.ts` — Replace Manus OAuth URL builder

### Config Files to Update
- [ ] `vite.config.ts` — Remove `vite-plugin-manus-runtime` + debug collector + Manus hosts
- [ ] `package.json` — Remove Manus deps, add `cross-env`, switch to PostgreSQL driver
- [ ] `client/index.html` — Remove Manus analytics script tag
- [ ] `drizzle.config.ts` — Switch from MySQL dialect to PostgreSQL
- [ ] `client/src/_core/hooks/useAuth.ts` — Remove `manus-runtime-user-info` localStorage
- [ ] `client/src/main.tsx` — Update auth redirect logic
- [ ] `components/ManusDialog.tsx` — Remove entirely

### Infrastructure Setup
- [ ] Set up PostgreSQL database (Neon)
- [ ] Migrate schema from MySQL to PostgreSQL
- [ ] Fix Windows compatibility (`cross-env` for NODE_ENV)
- [ ] Create `.env` file with our own variables
- [ ] Get dev server running locally on Windows
- [ ] Deploy to Vercel (first deployment)

---

## Phase 1: Core Platform (Foundation)

### Authentication
- [ ] Implement JWT-based session management
- [ ] Google OAuth integration (or email/password)
- [ ] Signup → Login → Dashboard → Logout flow working
- [ ] Protected routes enforced

### Database & Data
- [ ] All 10 tables created in PostgreSQL
- [ ] Seed data for development/testing
- [ ] All CRUD operations verified end-to-end

### Core Features Working
- [ ] Product CRUD (create, edit, delete, list)
- [ ] Product variants working
- [ ] Order management (create, update status)
- [ ] Customer management
- [ ] Discount/coupon system
- [ ] AI chat assistant (with our own OpenAI/Gemini key)
- [ ] Storefront loading real products from DB
- [ ] Cart → Checkout → Order creation flow
- [ ] CSV export working

### Branding & UI
- [ ] Rebrand from "ShopifyAI" to chosen name
- [ ] Update landing page content (competitive positioning)
- [ ] Update features/benefits pages
- [ ] Update meta tags, title, favicon

### Deployment
- [ ] Vercel deployment working
- [ ] Environment variables configured on Vercel
- [ ] Production build verified

---

## Phase 2: Profit Intelligence Dashboard (Core Differentiator #1)

### Schema Changes
- [ ] Add COGS (cost of goods) fields to products/variants
- [ ] Add cost tracking fields to orders (shipping cost, platform fee, ad attribution)
- [ ] Add profit metrics table (daily/weekly/monthly rollups)

### Profit Dashboard
- [ ] Revenue vs. True Profit charts
- [ ] Per-product P&L breakdown table
- [ ] Profit trend visualization (daily/weekly/monthly)
- [ ] Margin analysis per product/category
- [ ] Cost breakdown pie chart (COGS, shipping, fees, ads, returns)

### AI Profit Intelligence
- [ ] AI profit alerts ("Product X is losing $2.30/unit after ads")
- [ ] "Kill or Scale" recommendations per product
- [ ] Margin optimizer suggestions (price adjustments, supplier switches)
- [ ] Profit report generation (PDF/CSV)

---

## Phase 3: AI Agent Engine (Core Differentiator #2)

### Agent Runtime
- [ ] Agent execution engine (trigger-based activation)
- [ ] Agent permission system (read/write access per data type)
- [ ] Agent autonomy levels (Monitor / Suggest / Semi-Auto / Full Auto)
- [ ] Agent activity logging (every action tracked)
- [ ] Agent configuration storage (per-merchant settings)
- [ ] Agent credits consumption tracking

### Agent Communication
- [ ] Trigger system (event-based: new_order, low_stock, etc.)
- [ ] Schedule system (time-based: daily_6am, weekly_monday, etc.)
- [ ] Inter-agent messaging (agents can notify other agents)
- [ ] Merchant notification system (email, dashboard alerts)

### "My Team" Dashboard
- [ ] Active agents list with status
- [ ] Per-agent activity feed
- [ ] Per-agent credit usage
- [ ] Autonomy level controls
- [ ] Pause/resume/fire actions
- [ ] Agent performance metrics

---

## Phase 4: Core Platform Agents (First 5-8 Agents)

### Intelligence Agents
- [ ] **Profit Intelligence Agent** — Tracks P&L, alerts on losses, suggests optimizations
- [ ] **Analytics Agent** — Weekly reports, trend detection, anomaly alerts

### Operations Agents
- [ ] **Inventory Agent** — Low-stock alerts, reorder suggestions, overstock detection
- [ ] **Order Agent** — Fraud detection, fulfillment reminders, status management

### Marketing Agents
- [ ] **SEO Agent** — Meta tags audit, keyword suggestions, schema markup

### Customer Agents
- [ ] **Reviews Agent** — Review requests, response drafting, sentiment analysis

---

## Phase 5: Payments & Shipping

### Payment Infrastructure
- [ ] Stripe Connect (customer → merchant payments)
- [ ] Platform subscription billing (Stripe Billing)
- [ ] Apple Pay / Google Pay via Stripe
- [ ] PayPal integration
- [ ] Payment dashboard for merchants
- [ ] Refund/chargeback management

### Shipping & Fulfillment
- [ ] Shipping zones & profiles
- [ ] Rate calculation (flat, weight-based, carrier-calculated)
- [ ] Pakistani courier integration (TCS, Leopards, BlueEx)
- [ ] International shipping via EasyPost
- [ ] Label generation (PDF + thermal)
- [ ] Branded tracking page
- [ ] Returns & exchanges workflow
- [ ] AI Shipping Agent integration

---

## Phase 6: Agent Marketplace

### Marketplace Infrastructure
- [ ] Agent marketplace UI (browse, search, filter by category)
- [ ] Agent listing pages (description, permissions, pricing, reviews)
- [ ] Agent installation/hiring flow
- [ ] Agent billing integration (monthly subscription per agent)
- [ ] Agent review/rating system

### Developer Program
- [ ] Agent SDK documentation
- [ ] Agent development toolkit
- [ ] Agent submission & review process
- [ ] Developer analytics dashboard
- [ ] Revenue sharing system (70/30 split)

### Premium Platform Agents
- [ ] Email Marketing Agent ($14/mo)
- [ ] Ad Optimizer Agent ($19/mo)
- [ ] Customer Support Agent ($24/mo)
- [ ] Loyalty Agent ($19/mo)
- [ ] WhatsApp Commerce Agent ($29/mo)

---

## Phase 7: Emerging Markets

### Pakistan Market (Priority)
- [ ] JazzCash payment integration
- [ ] EasyPaisa payment integration
- [ ] SadaPay / Raast integration
- [ ] COD (Cash on Delivery) workflow with AI fraud scoring
- [ ] COD reconciliation tracking
- [ ] TCS deep integration (booking, tracking, COD, returns)
- [ ] Leopards deep integration
- [ ] BlueEx integration

### Localization
- [ ] RTL (right-to-left) theme support for Urdu/Arabic
- [ ] Multi-language AI (Urdu, Hindi, Arabic product descriptions)
- [ ] Local currency pricing with conversion
- [ ] Localized onboarding flow
- [ ] WhatsApp notifications (critical for South Asia)

---

## Phase 8: Predictive Intelligence Agents

- [ ] **Demand Forecasting Agent** — Predict stock needs by date
- [ ] **Price Optimizer Agent** — Elasticity modeling, competitor monitoring
- [ ] **Cash Flow Agent** — Revenue projections, capital planning
- [ ] **Trend Detection Agent** — Social media trend tracking
- [ ] **Scenario Planning Agent** — "What if I launch 3 new products?"

---

## Phase 9: Design Agents & Template System

### Template System
- [ ] Sections + Slots architecture
- [ ] Template config files (editable boundaries)
- [ ] 5-8 high-quality platform templates
- [ ] Template marketplace for 3rd party designers

### Design Agents
- [ ] **Theme Agent** — AI theme editing, seasonal changes, A/B testing
- [ ] **Design from Reference Agent** — Screenshot → store design (Vision Model)
- [ ] **Product Photo Agent** — Background removal, lifestyle images
- [ ] Version history & rollback system
- [ ] Live preview + approval flow

---

## Phase 10: Scale & Enterprise

- [ ] Enterprise plan with white-label option
- [ ] Multi-store dashboard
- [ ] Custom agent development (enterprise-only)
- [ ] SLA guarantees (99.9% uptime)
- [ ] Dedicated account management
- [ ] On-premise deployment option
- [ ] Migration engine (one-click import from Shopify/WooCommerce)
- [ ] Agency program (volume discounts + commission)

---

## Architecture Highlights

**Technology Stack:**
- Frontend: React 19 + TypeScript + Tailwind CSS 4
- Backend: Express 4 + tRPC 11 + Drizzle ORM
- Database: PostgreSQL (Neon) — target
- Auth: JWT + Google OAuth — target
- AI: OpenAI GPT-4o / Gemini — target
- Agent Runtime: Custom engine + BullMQ — target
- Storage: Cloudinary — target
- Deployment: Vercel — target
- Email: Resend — target
- Payments: Stripe Connect — target

**Design Principles:**
- Profit-first dashboard (not revenue-first)
- Agents, not apps (autonomous workers, not dumb features)
- Server-side AI (zero storefront bloat)
- Pakistan/emerging markets first
- Data portability (no lock-in)
- Merchant controls autonomy level per agent
