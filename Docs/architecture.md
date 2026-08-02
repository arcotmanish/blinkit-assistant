# Blinkit AI Shopping Assistant — Architecture Document

> **Purpose:** This document translates the product spec into a technical architecture blueprint. It is intended to serve as the direct input for the Phase-wise Implementation Plan.

---

## 1. System Overview

The Blinkit AI Shopping Assistant is a **goal-driven AI decision layer** embedded inside the Blinkit shopping experience. It sits on top of the existing search/category infrastructure and does not replace it.

### Core Design Principle
- Most of the intelligence is **code-based (deterministic)**: goal detection, product filtering, feedback storage
- The **LLM is called exactly once** per user session, handling only ranking, explanation, comparison, and AI summary
- All product data, user data, and goal mappings live in **local JSON files** — no real Blinkit API calls in the prototype

### High-Level Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND (React / Next.js)            │
│                                                              │
│  ┌────────────┐   ┌──────────────┐   ┌───────────────────┐  │
│  │ Toggle +   │   │ Filter Panel │   │ Recommendation    │  │
│  │ Goal Input │──▶│ (Hardcoded)  │──▶│ Display + Compare │  │
│  └────────────┘   └──────────────┘   └───────────────────┘  │
│         │                                      │             │
│         ▼                                      ▼             │
│  ┌─────────────┐                      ┌──────────────────┐  │
│  │ Keyword     │                      │  Cart + Feedback │  │
│  │ Matcher     │                      │  Panel           │  │
│  └─────────────┘                      └──────────────────┘  │
└───────────┬──────────────────────────────────────┬──────────┘
            │  REST API Calls                       │
┌───────────▼──────────────────────────────────────▼──────────┐
│                        BACKEND (FastAPI / Express)           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Job 1        │  │ Job 2        │  │ Job 3            │   │
│  │ Goal Parser  │  │ Product      │  │ LLM Orchestrator │   │
│  │ (No LLM)     │  │ Retriever    │  │ (1 API call)     │   │
│  │              │  │ (No LLM)     │  │                  │   │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘   │
│         │                 │                    │             │
│  ┌──────▼─────────────────▼────────────────────▼──────────┐  │
│  │              JSON Data Layer                            │  │
│  │  users.json   |   products.json   |   goals.json       │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────┐                                            │
│  │ Job 4        │                                            │
│  │ Feedback     │                                            │
│  │ Collector    │                                            │
│  └──────────────┘                                            │
└──────────────────────────────────────────────────────────────┘
                            │
                   ┌────────▼────────┐
                   │   Groq LLM API  │
                   │  (llama-3.3-70b)│
                   └─────────────────┘
```

---

## 2. Tech Stack

| Layer       | Technology                             | Notes                                                            |
|-------------|----------------------------------------|------------------------------------------------------------------|
| Framework   | **Next.js (React)**                    | Full-stack — frontend + backend API routes in one project        |
| Backend     | **Next.js API Routes** (Node.js)       | Replaces a separate FastAPI/Express server; runs server-side     |
| LLM         | Groq API — `llama-3.3-70b-versatile`  | Called server-side only; key never exposed to browser            |
| Data Store  | JSON files (no database)               | 3 files: users, products, goal mapping — imported directly       |
| State       | Session-level only (no persistence)    | React state / Zustand; no DB needed for prototype                |
| Theme       | Black background, green + amber accents| Mirrors Blinkit's brand palette                                  |
| Deployment  | **Vercel (Free Hobby Tier)**           | Auto-deploys from GitHub; hosts frontend + API routes together   |
| Env Secrets | Vercel Environment Variables           | `GROQ_API_KEY` stored in Vercel dashboard; never in source code  |

---

## 3. Data Layer — Three JSON Datasets

### 3.1 `users.json` — User Profile & Order History
- Fixed demo user (`demo_user_01` — "Priya")
- Optional: 2–3 switchable personas for stakeholder demos
- Fields: `user_id`, `name`, `preferences` (budget, vegetarian), `order_history[]`
- Order history items carry: `product_id`, `category`, `times_ordered`

### 3.2 `goals.json` — Goal-to-Category Mapping
- Maps each `goal_id` → `label`, `primary_categories[]`, `filter_tags[]`
- Three goals defined: `healthy_snacking`, `better_skin`, `morning_energy`
- `morning_energy` is architected and present in the data file, but **not exposed in the demo UI**

### 3.3 `products.json` — Product Database
- Minimum 5–6 products per demo goal (more is better for LLM ranking quality)
- Each product carries all data the LLM and UI will ever need — **nothing is generated at read-time**
- Full schema per product:

```
product_id, name, brand, blinkit_category, blinkit_subcategory,
price_inr, weight_or_pack, price_per_unit,
goal_tags[], filter_tags[], compare_tags[],
benefits[], ingredients_highlights[],
nutrition_per_serving { calories, protein_g, carbs_g, sugar_g, fibre_g, fat_g },
allergens[],
skin_type_suitability, paraben_free, fragrance_free,
dermatologist_tested, moisturization_level, key_active_ingredients[]
```

> **Cached vs. Generated rule:** Every field in the product schema is **cached** (read from JSON, never generated by AI). The LLM only generates: ranking order, `why_this` text, comparison table values, and the AI summary.

---

## 4. The Four Backend Jobs

### Job 1 — Goal Understanding (Code Only, No LLM)

| | |
|---|---|
| **Input** | Raw text string typed by user |
| **Process** | Keyword/phrase matching (see Section 5) |
| **Output** | `{ goal_id, goal_label, display_text }` |

### Job 2 — Product Retrieval (Code Only, No LLM)

| | |
|---|---|
| **Input** | `goal_id` + selected hardcoded filter tags |
| **Process** | Filter `products.json` where `goal_tags` includes `goal_id`; additionally apply selected filter tags; cross-reference `order_history` and flag matches as `from_history: true` |
| **Output** | Up to 10 candidate product objects |

### Job 3 — LLM Ranking, Explanation & Comparison

| | |
|---|---|
| **Input** | 10 candidates + `goal_label` + free-text preference + order history context + (for compare) comparison schema |
| **Process** | Single Groq API call per user session with a structured prompt |
| **Output — Recommendations** | Top 3 products (each from a different `blinkit_category`) + `why_this.goal_match` + `why_this.ingredient_note` |
| **Output — Comparison** | Populated comparison table rows (`criterion`, `product_a`, `product_b`, `better_for_goal`) + 2-line `ai_summary` |

> **Important:** The LLM is called **at most twice per session** — once for recommendations, once (if user triggers compare) for the comparison table. These are separate, stateless calls.

### Job 4 — Feedback Collection (Code Only, No LLM)

| | |
|---|---|
| **Input** | Skipped product IDs, reason selected, `goal_id`, session timestamp |
| **Process** | `console.log()` the feedback data server-side (see note below) |
| **Output** | No real-time effect — data only for future improvement |

> **⚠️ Vercel Deployment Note — Read-Only File System:** Vercel runs Next.js API routes as serverless functions. The server file system is **read-only** at runtime, which means writing to a `feedback_log.json` file will fail silently or throw an error. For the prototype, feedback is logged to the server console (`console.log`) and visible in the Vercel Function Logs dashboard. This is acceptable since the spec states feedback is for future improvement only — no real-time retraining is needed.

---

## 5. Keyword Matcher — Goal Detection (Critical Rules)

> **⚠️ The keyword matcher must be GENEROUS, not exact.**
> Users will never type exact goal names. They will type natural sentences. The matcher must cast a wide net:
> - If the input contains **any skin or skincare-related word**, map to `better_skin`
> - If the input contains **any snack, health, or eating-related word**, map to `healthy_snacking`

### 5.1 Keyword Dictionary

**`better_skin` keywords** — match ANY of:
```
skin, skincare, skin care, glow, glowing, pimple, acne, dull, dry skin,
oily skin, face, serum, moisturiser, moisturizer, lotion, complexion,
fairness, brightening, hydration, radiant, blemish, pigmentation,
vitamin c, spf, sunscreen, toner, cleanse, cleanser, dermatologist,
beauty, skinroutine, skin routine, nourish skin, clear skin
```

**`healthy_snacking` keywords** — match ANY of:
```
snack, snacks, snacking, munchies, munching, eat, eating, food, hungry,
hunger, bite, bites, treat, treats, junk, guilt, low calorie, calorie,
protein, fibre, fiber, diet, weight, healthy, health, nutritious,
nutrition, wholesome, light food, light eating, grain, nuts, seeds,
chips, crackers, biscuit, bar, granola, muesli, yogurt, curd
```

**`morning_energy` keywords** — match ANY of (architecture ready, not in demo):
```
morning, energy, breakfast, fuel, wake up, boost, fatigue, tired,
afternoon slump, lunch, start the day, coffee, tea
```

### 5.2 Matching Logic (JavaScript — Next.js API Route)

```javascript
// lib/keywordMatcher.js
const BETTER_SKIN_KEYWORDS = [ /* see 5.1 */ ];
const HEALTHY_SNACKING_KEYWORDS = [ /* see 5.1 */ ];
const MORNING_ENERGY_KEYWORDS = [ /* see 5.1 */ ];

export function detectGoal(userInput) {
  const text = userInput.toLowerCase().trim();

  // Check each keyword list — return on FIRST match found
  // better_skin checked FIRST (more specific, takes priority)
  if (BETTER_SKIN_KEYWORDS.some(kw => text.includes(kw))) {
    return "better_skin";
  }
  if (HEALTHY_SNACKING_KEYWORDS.some(kw => text.includes(kw))) {
    return "healthy_snacking";
  }
  if (MORNING_ENERGY_KEYWORDS.some(kw => text.includes(kw))) {
    return "morning_energy";
  }

  return null; // No goal detected — prompt user to rephrase
}
```

> **Priority order:** `better_skin` is checked before `healthy_snacking` because some words (e.g., "healthy") could be ambiguous. Skincare intent is more specific and should take precedence.

### 5.3 Edge Cases
- **No match:** Show a friendly prompt: *"We couldn't detect a goal. Try typing something like 'I want healthier snacks' or 'help me with my skin'."*
- **Ambiguous (matches both):** The priority order above resolves this — `better_skin` wins.
- **Multiple words in input:** Scan the entire input string, not just the first word.

---

## 6. UI Component Map

### 6.1 Entry Point
- **AssistantToggleCard** — thin horizontal card below the search bar; contains toggle + label "Blinkit Assistant"
- **GoalSearchBar** — the existing search bar, but placeholder switches to "Tell us your personal goal…" when toggle is ON

### 6.2 Stage 2 — Filter Panel
- **FilterRow** — rendered immediately after goal submission
  - Two **FilterPill** components (hardcoded per goal, see table below)
  - One **FreeTextInput** labelled "Anything else? Type a preference…"
  - **SubmitButton** — optional step, skip = proceed with just goal

| Goal ID             | Filter Pill 1   | Filter Pill 2     |
|---------------------|-----------------|-------------------|
| `healthy_snacking`  | High Protein    | Low Sugar         |
| `better_skin`       | No Paraben      | Fragrance Free    |
| `morning_energy`    | High Protein    | No Added Sugar    |

### 6.3 Stage 4 — Recommendation Display
- **RecommendationHeader** — "Recommended for your [Goal Label]…"
- **ProductCardRow** — horizontal scrollable row (mobile) or 3-column grid (web)
- **ProductCard** (×3)
  - Product image
  - Weight / pack size
  - Brand + product name
  - Price (prominent) + price per unit (smaller)
  - **AddButton** → transforms into **QuantityStepper** (− 1 +) after tap
  - **WhyThisButton** (outlined) — opens/closes explanation box
- **WhyThisBox** — expands below the relevant card only; shows `goal_match` + `ingredient_note`; only one open at a time

### 6.4 Stage 6 — Compare
- **CompareButton** — amber/orange; always enabled
- **CompareBottomSheet** — slides up from bottom
  - Heading: "Choose 2 products to compare"
  - 3 **MiniProductCard** items (the recommendations)
  - 1 **CatalogSearchInput** with dropdown — lets user search full product catalog
  - Max 2 selections; selecting 3rd auto-deselects the earliest
- **ComparisonTable** — two-column layout; rows from goal-specific schema; ✓/✗ indicators; **AI Summary** at bottom

### 6.5 Stage 7 — Cart & Feedback
- **GoToCartButton** — green; disabled until at least one ADD is tapped
- **FeedbackCard** — thin card at bottom of cart page
- **FeedbackSheet** — shows up to 2 skipped AI-recommended products; reason buttons per product

---

## 7. API Endpoints (Backend)

| Method | Endpoint                | Job    | Description                                                         |
|--------|-------------------------|--------|---------------------------------------------------------------------|
| POST   | `/api/detect-goal`      | Job 1  | Accepts `{ input_text }`, returns `{ goal_id, goal_label, display_text }` |
| POST   | `/api/get-candidates`   | Job 2  | Accepts `{ goal_id, filters[] }`, returns up to 10 product objects  |
| POST   | `/api/recommend`        | Job 3  | Accepts candidates + goal + free_text + history; calls LLM; returns top 3 + why_this |
| POST   | `/api/compare`          | Job 3  | Accepts 2 product objects + goal; calls LLM; returns comparison table + AI summary |
| POST   | `/api/feedback`         | Job 4  | Accepts `{ skipped_products[], reasons[], goal_id, session_id }`; logs feedback |

---

## 8. LLM Prompt Structures

### 8.1 Recommendation Prompt

```
System: You are a product recommendation assistant for Blinkit, an Indian quick-commerce app.
Select exactly 3 products from the candidates. Rules:
- Each product must come from a different blinkit_category
- Prefer products not in the user's order history (those are reference only)
- For each product, write "why_this" with:
    - goal_match: 2 lines (how it matches the goal)
    - ingredient_note: 1 line (notable ingredient or quality signal)
- Return valid JSON only.

User Goal: {goal_label}
User Preferences: {free_text_preference}
User Order History: {order_history_array}
Candidate Products: {candidates_array}

Return:
{ "recommendations": [ { "product_id": "", "why_this": { "goal_match": "", "ingredient_note": "" } } ] }
```

### 8.2 Comparison Prompt

```
System: You are a product comparison assistant. Populate the comparison criteria with
factual values from the product data. Write a 2-line AI summary naming which product
better fits the stated goal. Return valid JSON only.

User Goal: {goal_label}
Comparison Criteria: {criteria_array}
Product A: {product_a_object}
Product B: {product_b_object}

Return:
{
  "rows": [ { "criterion": "", "product_a": "", "product_b": "", "better_for_goal": "a | b | tie" } ],
  "ai_summary": "2 lines"
}
```

---

## 9. Comparison Attribute Schemas (Per Goal)

### `healthy_snacking`
`Calories per serving`, `Protein content`, `Sugar content`, `Fibre content`,
`Presence of artificial additives`, `Allergens`, `Price per serving`

### `better_skin`
`Key active ingredients`, `Skin type suitability`, `Paraben free`, `Fragrance / Irritants`,
`Moisturization level`, `Dermatologist tested`, `Allergens / Sensitivities`, `Price`

### `morning_energy`
`Calories per serving`, `Protein content`, `Complex carbs vs simple carbs`, `Added sugar`,
`Fibre content`, `Preparation time`, `Price per serving`

---

## 10. Session State Shape

The frontend manages a single session state object. No persistence to a backend store.

```typescript
interface SessionState {
  assistantActive: boolean;            // toggle state
  goalInput: string;                   // raw user text
  detectedGoal: {
    goal_id: string;
    goal_label: string;
    display_text: string;
  } | null;
  selectedFilters: string[];           // e.g. ["high_protein", "low_sugar"]
  freeTextPreference: string;
  candidates: Product[];               // up to 10, from Job 2
  recommendations: Recommendation[];  // top 3, from Job 3
  openWhyThis: string | null;          // product_id of open WhyThis box
  cartItems: { product_id: string; qty: number }[];
  compareSelection: string[];          // product_ids, max 2
  comparisonResult: ComparisonResult | null;
  feedbackSubmitted: boolean;
}
```

---

## 11. Non-Goals (MVP Scope Boundary)

These are explicitly **out of scope** for the prototype and must not be built:

- Real Blinkit API integration
- Real-time inventory or pricing
- User authentication (use hardcoded demo user)
- Actual cart or checkout processing
- LLM fine-tuning or retraining from feedback
- Voice input
- More than 3 goals (even if data exists)
- Product Detail Page (PDP) integration
- Persistent state across sessions

---

## 12. File & Folder Structure (Suggested)

```
/ (Next.js project root — single repository)
│
├── app/                            ← Next.js App Router
│   ├── page.tsx                    ← Main homepage with Blinkit assistant UI
│   ├── layout.tsx                  ← Root layout, font imports, theme
│   ├── globals.css                 ← Blinkit dark theme tokens
│   │
│   └── api/                        ← All backend API routes (server-side, Node.js)
│       ├── detect-goal/route.ts    ← Job 1: keyword matcher
│       ├── get-candidates/route.ts ← Job 2: product filter
│       ├── recommend/route.ts      ← Job 3a: LLM ranking + why_this
│       ├── compare/route.ts        ← Job 3b: LLM comparison table
│       └── feedback/route.ts       ← Job 4: console.log feedback
│
├── components/                     ← Reusable UI components
│   ├── AssistantToggleCard.tsx
│   ├── GoalSearchBar.tsx
│   ├── FilterRow.tsx
│   ├── ProductCard.tsx
│   ├── WhyThisBox.tsx
│   ├── CompareBottomSheet.tsx
│   ├── ComparisonTable.tsx
│   ├── FeedbackSheet.tsx
│   └── QuantityStepper.tsx
│
├── lib/                            ← Pure logic, no UI
│   ├── keywordMatcher.ts           ← Job 1 logic
│   ├── productFilter.ts            ← Job 2 logic
│   ├── groqClient.ts               ← Groq SDK wrapper (reads GROQ_API_KEY)
│   └── prompts.ts                  ← LLM prompt templates
│
├── data/                           ← Static JSON datasets
│   ├── users.json
│   ├── products.json
│   └── goals.json
│
├── store/
│   └── sessionStore.ts             ← Session state (Zustand)
│
├── .env.local                      ← GROQ_API_KEY=... (never committed to Git)
├── .gitignore                      ← must include .env.local
└── next.config.js
```

> **Security rule:** `GROQ_API_KEY` is only ever read inside `app/api/` routes (server-side). It is never imported into any `components/` or `app/page.tsx` file. Next.js enforces this — environment variables without the `NEXT_PUBLIC_` prefix are inaccessible in the browser bundle.

---

## 13. Deployment Strategy — Vercel (Single Platform)

### Why Vercel Only
A full-stack Next.js app on Vercel is the correct and simplest approach for this prototype:
- **Frontend + Backend are the same project** — no CORS configuration needed
- **Vercel's Free Hobby Tier** covers this project entirely at zero cost
- **Automatic deployments** — every `git push` to the `main` branch deploys in ~30 seconds
- **Groq API key is secure** — stored as an encrypted Vercel Environment Variable; never in the codebase

### Deployment Steps (Summary)
1. Push the project to a GitHub repository
2. Connect the GitHub repository to Vercel (vercel.com → New Project → Import from GitHub)
3. In the Vercel dashboard → Project Settings → Environment Variables → add `GROQ_API_KEY`
4. Click Deploy — Vercel builds and hosts the app automatically
5. Every subsequent `git push` auto-deploys

### What the Free Tier Covers
| Resource             | Vercel Free Limit           | This Project's Usage                |
|----------------------|-----------------------------|-------------------------------------|
| Bandwidth            | 100 GB / month              | Prototype: well under 1 GB          |
| Serverless Functions | 100 GB-hours / month        | Prototype: negligible               |
| Build minutes        | 6,000 min / month           | Prototype: < 5 min per deploy       |
| Custom domain        | Supported on free tier      | Optional for demo                   |

---

## 14. Implementation Phase Overview (Preview)

This architecture supports a natural phase-wise breakdown:

| Phase | Focus                                                                           |
|-------|---------------------------------------------------------------------------------|
| 0     | Project setup — Next.js scaffold, Vercel connection, Groq key configured        |
| 1     | Data layer — build and validate all 3 JSON datasets                             |
| 2     | API: Goal detection — keyword matcher (Job 1)                                   |
| 3     | API: Product retrieval — filter logic (Job 2)                                   |
| 4     | API: LLM integration — Groq recommendations + Why This? (Job 3a)               |
| 5     | API: LLM comparison — comparison table + AI summary (Job 3b)                   |
| 6     | UI: Toggle + Goal input + Filter row                                            |
| 7     | UI: Recommendation cards + Why This? interaction                                |
| 8     | UI: Compare bottom sheet + comparison table                                     |
| 9     | UI: Cart state + Go to Cart + Feedback sheet (Job 4)                            |
| 10    | End-to-end integration, polish, and Vercel deploy                               |

---

*This architecture document is derived from the Blinkit AI Shopping Assistant Product Spec and is the direct input for the Phase-wise Implementation Plan.*
