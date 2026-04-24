# Sellora: Master Strategy & Vision Document

*This is the unified master plan, strategy, and engineering guideline for the Sellora platform. This document serves as the absolute boundary and foundation for all future development.*

---

## 1. Platform Vision Document

**"Shopify shows you revenue. We show you profit. And our AI agents do the work for you."**

Sellora is a next-generation, AI-powered e-commerce platform designed to give merchants complete control, true financial visibility, and an autonomous AI workforce. 
We are moving away from the "App Marketplace" model (where merchants install bloated, conflicting plugins) to an **"AI Agent Marketplace"** model (where merchants hire intelligent agents that work 24/7). 

Our primary market is emerging economies (Pakistan, MENA, South Asia) with first-class support for Cash on Delivery (COD) workflows, local payment gateways, and localized AI interactions, combined with a world-class, premium design system.

---

## 2. Technology Stack

Sellora uses a strict, modern, and high-performance stack designed for zero bloat and maximum developer velocity.

**Frontend Layer (`/client`)**
*   **Framework:** React 19 + TypeScript + Vite
*   **Styling:** Tailwind CSS v4 + ShadcnUI
*   **Routing:** Wouter (Lightweight)
*   **State / Data Fetching:** React Query + tRPC Client
*   **Design Paradigm:** Glassmorphism, highly dynamic micro-animations, OKLCH color spaces.

**Backend Layer (`/server`)**
*   **Runtime:** Node.js + Express 4
*   **API Layer:** tRPC 11 (End-to-end Type Safety)
*   **Database:** PostgreSQL (Neon Serverless)
*   **ORM:** Drizzle ORM
*   **Authentication:** Custom JWT + bcryptjs (Self-hosted, session-based)
*   **AI Integration:** Groq SDK (Llama 3) / OpenAI fallback

**Infrastructure & Deployment**
*   **Hosting:** Vercel
*   **Media Storage:** Cloudinary
*   **Package Manager:** pnpm

---

## 3. Engineering Quality Checklist

To maintain a zero-bloat, enterprise-grade codebase, all code commits must pass this checklist:

1.  **Strict Type Safety:** No `any` types. Everything must be strongly typed end-to-end via tRPC and Drizzle.
2.  **Zero Client-Side Bloat:** Complex logic, AI parsing, and heavy calculations MUST happen on the server.
3.  **Component Reusability:** Always use existing ShadcnUI components before building custom ones. Do not duplicate Tailwind utility classes unnecessarily.
4.  **Premium Aesthetics:** All UI additions must adhere to the premium design standard (smooth transitions, proper padding, glassmorphic elements where applicable).
5.  **Error Handling:** All tRPC endpoints must have proper `try/catch` blocks and return meaningful errors. Frontend must gracefully handle loading and error states via `useAuth` or React Query.
6.  **Database Integrity:** No raw SQL queries. Always use Drizzle ORM. Ensure foreign keys and indexes are used for relational data (e.g., `storeId` on all tenant-specific tables).
7.  **Responsive First:** Every new page or component must be tested for mobile, tablet, and desktop viewports.

---

## 4. Competitive Strategy

**Do not compete on generic AI.** Shopify has massive resources to build generic "magic text generators". 
We compete where Shopify's business model prevents them from competing:

*   **Profit vs. Revenue:** Shopify hides true costs because app fees and transaction fees are their revenue. We expose TRUE PROFIT (Revenue - COGS - Shipping - Ads).
*   **Agents vs. Apps:** Shopify relies on 3rd party apps for 20% commission. These apps slow down stores. We use server-side AI Agents that don't add a single byte of JavaScript to the storefront.
*   **Niche Domination:** Capture the massive, ignored COD/Local Courier market in Pakistan and South Asia before scaling globally.

---

## 5. Gap Analysis

**What is missing in the current market that Sellora fills?**

1.  **The Profit Gap:** Merchants use 3-4 different spreadsheets to calculate if they are actually making money after Facebook ad spend, returns, and COGS. *Solution: Sellora's native Profit Intelligence Engine.*
2.  **The Automation Gap:** Merchants spend hours writing descriptions, adjusting inventory, and analyzing sales. *Solution: The Autonomous AI Agent Workforce.*
3.  **The Performance Gap:** WooCommerce is too slow/technical; Shopify gets bloated after installing 10 apps. *Solution: Native, zero-bloat, server-side features.*
4.  **The Localization Gap:** No native support for JazzCash, EasyPaisa, or TCS/Leopards in major platforms without clunky workarounds. *Solution: Built-in local integrations.*

---

## 6. Shopify VS Us

| Category | Shopify | Sellora (Us) |
| :--- | :--- | :--- |
| **Primary Metric** | Gross Revenue | **True Net Profit** |
| **Ecosystem** | Dumb Apps (Client-side bloat) | **AI Agents (Server-side autonomy)** |
| **Financial Visibility**| Requires $50/mo 3rd party apps | **Built-in natively per SKU** |
| **Data Ownership** | Vendor Lock-in | **Open schemas, full exportability** |
| **Emerging Markets** | Ignored / Hard to configure | **First-class native support** |
| **Store Speed** | Degrades with each app installed | **Remains perfectly fast (Zero bloat)** |

---

## 7. Competitive Landscape

*   **Shopify:** The giant. Excellent for standard e-commerce, but expensive, bloated with apps, and completely ignores true profit and emerging market logistics.
*   **WooCommerce:** Highly customizable but requires a developer to maintain. Prone to security vulnerabilities and severe performance degradation.
*   **BigCommerce / Magento:** Enterprise-focused, extremely rigid, and very expensive to customize. No native AI agent philosophy.
*   **Sellora (Our Position):** The agile, highly intelligent alternative. Aimed at modern merchants who value **speed, profit visibility, and automation** over a massive (but bloated) app store. We are the "Tesla" of e-commerce platforms—built from the ground up for the AI era.
