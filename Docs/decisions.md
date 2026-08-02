# Blinkit AI Shopping Assistant — Decision Log

> **Purpose:** This document captures every significant technical or architectural decision made during the build of this prototype. Each entry records what was decided, why it was decided, what was rejected, and any known tradeoffs or future considerations.
> 
> **How to use:** Before starting a new phase or making a design change, check this file first. If a similar decision has already been made, follow the established pattern unless there is a strong reason to deviate — and if you do deviate, add a new entry here.

---

## Index

| # | Decision | Phase | Category |
|---|----------|-------|----------|
| D-01 | Vercel-only deployment (no Railway) | Phase 0 | Deployment |
| D-02 | Full-stack Next.js API Routes instead of separate backend | Phase 0 | Architecture |
| D-03 | Groq API key stored in Vercel environment variables only | Phase 0 | Security |
| D-04 | Feedback collection via console.log — no file write | Phase 0 | Architecture |
| D-05 | Generous keyword matching with priority order | Phase 2 | AI / Logic |
| D-06 | Category diversity enforced in code, not in LLM prompt | Phase 4 | AI / Logic |
| D-07 | Third blinkit_category added for healthy_snacking dataset | Phase 4 | Data |
| D-08 | Unicode escape sequences for special characters in JSON | Phase 4 | Data |
| D-09 | Two-pass recommendation selection (LLM rank + code fallback) | Phase 4 | AI / Logic |
| D-10 | LLM model: llama-3.3-70b-versatile via Groq | Phase 4 | AI / Infra |
| D-11 | Data stored in 3 local JSON files — no database | Phase 1 | Architecture |
| D-12 | Vanilla CSS — no Tailwind | Phase 0 | Frontend |

---

## Decisions

---

### D-01 — Vercel-Only Deployment (No Railway)

**Phase:** 0 — Project Setup  
**Category:** Deployment  
**Status:** Active

**Decision:**  
Deploy the entire application (frontend + backend API routes) on Vercel's free Hobby tier. Do not use a separate backend hosting platform (Railway, Render, Fly.io).

**Reason:**  
- Railway's free tier was discontinued and requires a minimum $5 payment. This violates the "must be free" constraint.
- Vercel's Hobby tier is completely free with no credit card required for this usage level.
- Full-stack Next.js means the frontend and backend live in the same project and the same deployment — no cross-origin (CORS) issues, no separate deployment pipeline.

**Alternatives Rejected:**  
- **Railway** — No longer free.
- **Render** — Free tier available, but free services "sleep" after 15 minutes of inactivity, causing a 30–50 second cold start at the beginning of a stakeholder demo. Unacceptable for a live demo.
- **Split deployment (Vercel frontend + Render backend)** — Introduces CORS complexity and two separate deployment pipelines for no benefit in this project.

**Tradeoffs:**  
- Vercel serverless functions have a maximum execution time (10 seconds on Hobby tier). Groq LLM calls typically respond in 2–5 seconds, so this is not a concern for now.
- If the project ever needs a persistent database or long-running background jobs, Vercel alone will not suffice.

---

### D-02 — Next.js API Routes Instead of Separate Backend

**Phase:** 0 — Project Setup  
**Category:** Architecture  
**Status:** Active

**Decision:**  
Use Next.js App Router API routes (`app/api/*/route.ts`) for all backend logic (Job 1 through Job 4). Do not create a separate FastAPI or Express application.

**Reason:**  
- All backend logic for this prototype is stateless and request-response in nature — a perfect fit for serverless functions.
- Using Next.js API routes keeps the entire project in one repository, one language (TypeScript), and one deployment target (Vercel).
- FastAPI (Python) would require a separate repository, Dockerfile, and hosting platform. The added complexity is not justified for an MVP prototype.

**Alternatives Rejected:**  
- **FastAPI (Python)** — Good for ML-heavy backends, but overkill here since the only AI call is a single Groq API HTTP request. Requires separate hosting.
- **Express.js (separate server)** — Same language (Node.js) but adds an unnecessary server-management layer.

**File convention:**  
All API route files live at `app/api/<endpoint-name>/route.ts`.  
All pure logic (no HTTP, no Next.js imports) lives in `lib/`.

---

### D-03 — Groq API Key Stored in Vercel Environment Variables Only

**Phase:** 0 — Project Setup  
**Category:** Security  
**Status:** Active — Non-negotiable rule

**Decision:**  
The `GROQ_API_KEY` is stored exclusively in:
1. Vercel dashboard → Project Settings → Environment Variables (for production)
2. `.env.local` file (for local development — this file is listed in `.gitignore` and is never committed)

The key is never imported in any `components/`, `app/page.tsx`, or any file that runs in the browser.

**Reason:**  
Next.js enforces a security boundary: environment variables without the `NEXT_PUBLIC_` prefix are only accessible in server-side code (API routes and server components). Placing the key in a `NEXT_PUBLIC_` variable would expose it in the browser bundle, allowing anyone to extract it from the network tab.

**Rule to follow in all future phases:**  
Only import `process.env.GROQ_API_KEY` inside files located at `app/api/` or `lib/groqClient.ts`. Never in component files.

---

### D-04 — Feedback Collection via console.log (No File Write)

**Phase:** 0 — Project Setup  
**Category:** Architecture  
**Status:** Active

**Decision:**  
The `/api/feedback` route will log feedback data to the server console using `console.log()` instead of writing to a `feedback_log.json` file.

**Reason:**  
Vercel runs Next.js API routes as serverless functions. The server file system is read-only at runtime — writing to a JSON file will silently fail or throw a runtime error. This is a known constraint of all serverless platforms.

**Why this is acceptable:**  
The product spec explicitly states: *"No real-time retraining. Feedback collection only for future improvement."* Logging to console (visible in Vercel Function Logs) is sufficient to capture the data for a prototype demo. No user-facing feature depends on feedback being persisted.

**Future consideration:**  
If real feedback persistence is needed in a future version, integrate a free-tier database such as Supabase (PostgreSQL) or PlanetScale (MySQL). Do not use local file writes in a serverless context.

---

### D-05 — Generous Keyword Matching with Priority Order

**Phase:** 2 — API Goal Detection  
**Category:** AI / Logic  
**Status:** Active

**Decision:**  
The keyword matcher (`lib/keywordMatcher.ts`) uses broad keyword lists and checks `better_skin` keywords before `healthy_snacking` keywords. Any partial match in the input string triggers a goal detection.

**Reason:**  
Users will never type exact goal names like `healthy_snacking`. They type natural sentences: *"I want something light to munch on"*, *"my skin is dry and dull"*. An exact-match or short keyword list would miss most real inputs.

**Priority order rationale:**  
`better_skin` is checked first because some words (e.g., "healthy") could ambiguously match both `healthy_snacking` and `better_skin` (e.g., "I want healthy skin"). Skincare intent is more specific and should take precedence when both match.

**Matching rule:**  
- If input contains **any** skin/skincare word → `better_skin`
- If input contains **any** snack/health/eating word → `healthy_snacking`
- If input contains **any** morning/energy word → `morning_energy`
- If no match → return `null` and show a friendly rephrase prompt

**Edge case:**  
"I want healthy skin" matches both `healthy_snacking` (via "healthy") AND `better_skin` (via "skin"). Priority order ensures `better_skin` is returned correctly.

---

### D-06 — Category Diversity Enforced in Code, Not in LLM Prompt

**Phase:** 4 — API LLM Recommendations  
**Category:** AI / Logic  
**Status:** Active — Critical rule

**Decision:**  
The rule "each recommendation must come from a different `blinkit_category`" is enforced by a post-processing code filter **after** the LLM returns its response. The LLM prompt only includes a soft hint about category diversity.

**Reason:**  
During Phase 4 testing, the LLM returned two products from the same `blinkit_category` despite a hard rule in the prompt. LLMs are probabilistic — they cannot reliably enforce structural constraints.

**Implementation:**  
After the LLM responds, the code iterates the ranked list in order and maintains a `Set<string>` of seen categories. A product is included only if its category has not been seen yet. See Pass 1 in `app/api/recommend/route.ts`.

**The prompt still mentions it** (soft hint) to reduce how often the LLM violates the rule, but code is the real safeguard.

**Principle established:**  
> Any structural or business rule that must be reliably enforced (count limits, uniqueness, format constraints) should be enforced in code after the LLM responds — not trusted to the LLM alone.

---

### D-07 — Third blinkit_category Added for healthy_snacking Dataset

**Phase:** 4 — Data fix  
**Category:** Data  
**Status:** Active

**Decision:**  
Added **RiteBite Max Protein Bar** (`product_id: ritebite_max_protein_bar`) to `data/products.json` under `blinkit_category: "Health & Wellness"` with `goal_tags: ["healthy_snacking"]`.

**Reason:**  
The original `healthy_snacking` products only spanned 2 distinct `blinkit_category` values (`Snacks & Drinks`, `Grocery & Kitchen`). The code-level category diversity filter (D-06) could never produce 3 diverse recommendations from only 2 categories. A third category was required in the data layer.

**Category coverage after fix:**

| Goal | blinkit_categories covered |
|------|---------------------------|
| `healthy_snacking` | Snacks & Drinks, Grocery & Kitchen, Health & Wellness |
| `better_skin` | Beauty & Personal Care, Snacks & Drinks |

**Note:** `better_skin` has only 2 distinct top-level categories in the current dataset (Amla juice and Ragi crackers share `Snacks & Drinks`). This is sufficient for now because the `better_skin` product set covers the 3 required recommendations. Monitor during testing.

---

### D-08 — Unicode Escape Sequences for Special Characters in JSON

**Phase:** 4 — Data fix  
**Category:** Data  
**Status:** Active

**Decision:**  
All special Unicode characters in `data/products.json` are stored as JSON Unicode escape sequences rather than raw UTF-8 characters:
- `₹` (Indian Rupee sign, U+20B9) → `\u20B9`
- `–` (en dash, U+2013) → `\u2013`
- `—` (em dash, U+2014) → `\u2014`

**Reason:**  
During testing, `₹` and `–` displayed as garbled text (`â¹`, `â`) in PowerShell's `Invoke-RestMethod` output. This is caused by Windows PowerShell reading UTF-8 bytes with the Windows-1252 (Latin-1) code page.

**Why escapes are the right fix (not re-encoding):**  
Unicode escape sequences (`\uXXXX`) are part of the JSON specification (RFC 8259) and are pure ASCII. They are decoded to the correct Unicode characters by every JSON parser in every language and browser — with zero encoding ambiguity.

**What is not affected:**  
Browsers, React, and the Next.js JSON import system all handle these escapes transparently. Users will see `₹` and `–` rendered correctly in the UI.

---

### D-09 — Two-Pass Recommendation Selection

**Phase:** 4 — API LLM Recommendations fix  
**Category:** AI / Logic  
**Status:** Active

**Decision:**  
The recommendation selection in `app/api/recommend/route.ts` uses a two-pass strategy:

- **Pass 1:** Iterate the LLM's ranked list in order. Pick each product whose `blinkit_category` hasn't been seen yet. Stop when 3 diverse products are found.
- **Pass 2 (Fallback):** If Pass 1 yields fewer than 3 products (because the LLM returned fewer than 3 items or had duplicate categories), iterate the full `candidates` array directly and fill remaining slots from uncovered categories.

For fallback products (Pass 2), `why_this` is auto-generated from the product's `benefits[]` and `ingredients_highlights[]` fields.

**Reason:**  
During testing, the LLM returned only 2 products in its response despite being instructed to return 3. Without a fallback, the API would return only 2 cards to the user — a visible, broken experience.

**Tradeoff:**  
Pass 2 `why_this` text is less eloquent than LLM-generated text. However, it is always factually accurate (derived directly from the product data) and is only used as a last resort.

---

### D-10 — LLM Model: llama-3.3-70b-versatile via Groq

**Phase:** 4 — API LLM Recommendations  
**Category:** AI / Infra  
**Status:** Active

**Decision:**  
Use the Groq-hosted `llama-3.3-70b-versatile` model for all LLM calls (recommendations and comparison).

**Reason:**  
- Specified directly in the product spec.
- Groq provides extremely fast inference (typically 2–5 seconds for our prompts) compared to other providers.
- `llama-3.3-70b-versatile` has strong instruction-following and JSON output quality.
- Groq's free tier is sufficient for prototype usage.

**Settings:**  
- `temperature: 0.2` — Low temperature for consistent, structured JSON output. Higher values cause more varied but less reliable JSON structure.
- `response_format: { type: "json_object" }` — Forces JSON output mode, reducing parse errors.

**Future consideration:**  
If Groq's free tier limits are exceeded during stakeholder demos, rate-limit can be mitigated by caching LLM responses for identical goal + filter combinations.

---

### D-11 — Data Stored in 3 Local JSON Files (No Database)

**Phase:** 1 — Data Layer  
**Category:** Architecture  
**Status:** Active

**Decision:**  
All product, user, and goal data is stored in three static JSON files inside the `data/` directory:
- `data/products.json`
- `data/users.json`
- `data/goals.json`

These files are imported directly into the Next.js API routes using Node.js `require`/`import`. No database (PostgreSQL, MongoDB, SQLite, etc.) is used.

**Reason:**  
- Specified in the product spec: *"JSON files for all three datasets (no database needed for prototype)"*.
- Eliminates all database setup, connection management, and migration complexity.
- Zero additional cost — databases on free tiers often have connection limits and cold-start penalties.
- Sufficient for a prototype with a fixed, small dataset (< 20 products, 1–3 users).

**Constraint:**  
Data is read-only at runtime on Vercel (serverless, no file writes). This is acceptable because the product data does not change during a demo session.

---

### D-12 — Vanilla CSS (No Tailwind)

**Phase:** 0 — Project Setup  
**Category:** Frontend  
**Status:** Active

**Decision:**  
Use Vanilla CSS (`app/globals.css` and CSS Modules where needed) for all styling. Do not use Tailwind CSS.

**Reason:**  
- Project coding guidelines specify Vanilla CSS for maximum flexibility and control.
- Blinkit's theme (black background, green `#1ca672` and amber `#f7c948` accents) is best expressed through a small set of CSS custom properties (design tokens) rather than Tailwind utility classes.
- Avoiding Tailwind reduces the initial bundle size and removes the Tailwind PostCSS build step.

**Convention to follow:**  
Design tokens (colours, font sizes, spacing) are defined as CSS custom properties (`--color-green`, `--color-amber`, etc.) in `app/globals.css`. Components reference these tokens, never hardcoded hex values.

---

*Last updated: Phase 4 completion. Add new entries in chronological order as new decisions are made.*
