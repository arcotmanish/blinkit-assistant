# Blinkit AI Shopping Assistant — Phase-wise Implementation Plan

> **How to use this document:**
> Each phase has a **What gets built** section (for the developer) and a **✅ How you verify it** section written specifically for you — no technical depth required. You verify by looking at what's visible in the browser or in a file, not by reading code.

---

## Phase 0 — Project Setup & Deployment Pipeline

### What gets built
- A new Next.js project is created and a GitHub repository is made
- The project is connected to Vercel so that every code push auto-deploys
- The `GROQ_API_KEY` is added as a secret environment variable in the Vercel dashboard
- A `.env.local` file is created locally (never pushed to GitHub)
- The app has a placeholder homepage that says "Blinkit Assistant — Coming Soon"

### Files created in this phase
- `next.config.js`, `package.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`
- `.env.local` (local only, not in GitHub)
- `.gitignore` (includes `.env.local`)

---

### ✅ How you verify Phase 0

**Step 1 — Check the GitHub repo exists**
> Go to github.com → Your repositories → You should see a repository named something like `blinkit-assistant`

**Step 2 — Check the Vercel deployment is live**
> Go to vercel.com → Your dashboard → Open the project → Click "Visit" → A webpage should open in your browser showing "Blinkit Assistant — Coming Soon" (or any placeholder text)

**Step 3 — Confirm the Groq API key is safely stored**
> In the Vercel dashboard → Project → Settings → Environment Variables → You should see a row with `GROQ_API_KEY` and the value hidden behind dots (●●●●●●). You should NOT see the actual key value displayed anywhere.

**Step 4 — Confirm the key is NOT in GitHub**
> Go to the GitHub repository → Browse the files → Open `.gitignore` → You should see `.env.local` listed inside it → Open any other file (like `package.json`) — you should NOT see the word `GROQ_API_KEY` anywhere in the source files.

---

## Phase 1 — Data Layer (The Three JSON Files)

### What gets built
The three hardcoded datasets that power the entire prototype are created and placed inside the `data/` folder:
- `data/users.json` — the demo user "Priya" with order history
- `data/goals.json` — goal-to-category mapping for all 3 goals
- `data/products.json` — minimum 10 products (5+ for Healthy Snacking, 5+ for Better Skin) with full schema

Every field the app will ever need is pre-filled in the JSON files. The LLM will read these files but never overwrite them.

### Files created in this phase
- `data/users.json`
- `data/goals.json`
- `data/products.json`

---

### ✅ How you verify Phase 1

**Step 1 — Check the files exist**
> In the GitHub repository (or your local file explorer) → Open the `data/` folder → You should see exactly 3 files: `users.json`, `goals.json`, `products.json`

**Step 2 — Check the products file has enough items**
> Open `data/products.json` → Count the number of products → There should be at least 10 products total

**Step 3 — Spot-check a product**
> Open `data/products.json` → Find "Farmley Makhana" → It should have: a price, a weight, a list of `goal_tags` containing `"healthy_snacking"`, and a `filter_tags` list containing `"high_protein"`

**Step 4 — Check the demo user**
> Open `data/users.json` → You should see a user named `"Priya"` with an `order_history` array containing items like `"lays_classic"` and `"cetaphil_lotion"`

**Step 5 — Check goals are mapped**
> Open `data/goals.json` → You should see three keys: `"healthy_snacking"`, `"better_skin"`, `"morning_energy"` — each with a `label` and `primary_categories` list

---

## Phase 2 — API: Goal Detection (Keyword Matcher — Job 1)

### What gets built
- The keyword dictionary is written in `lib/keywordMatcher.ts`
- A Next.js API route is created at `app/api/detect-goal/route.ts`
- When the API receives a text string, it runs the keyword matcher and returns the detected goal
- The matcher is generous: any skin/skincare word → `better_skin`, any snack/health/eating word → `healthy_snacking`
- If no goal is detected, the API returns a helpful error message

### Files created in this phase
- `lib/keywordMatcher.ts`
- `app/api/detect-goal/route.ts`

---

### ✅ How you verify Phase 2

> The developer will share a simple way to test this — called hitting the API endpoint. You can do this directly in your browser or using a free tool called **Hoppscotch** (hoppscotch.io) — no installation needed.

**Test 1 — A typical skincare sentence**
> Send the text: `"my skin is so dry lately"`
> Expected response: `{ "goal_id": "better_skin", "goal_label": "Better Skin" }`

**Test 2 — A typical snacking sentence**
> Send the text: `"I want something light to munch on"`
> Expected response: `{ "goal_id": "healthy_snacking", "goal_label": "Healthy Snacking" }`

**Test 3 — An unrelated sentence**
> Send the text: `"I need to book a flight"`
> Expected response: something like `{ "goal_id": null, "error": "We couldn't detect a goal..." }`

**Test 4 — An ambiguous sentence**
> Send the text: `"I want healthy skin"`
> Expected response: `{ "goal_id": "better_skin" }` — NOT `healthy_snacking` (skin takes priority)

---

## Phase 3 — API: Product Retrieval (Filter Logic — Job 2)

### What gets built
- Filter logic is written in `lib/productFilter.ts`
- A Next.js API route is created at `app/api/get-candidates/route.ts`
- Given a `goal_id` and selected filter tags, it reads `products.json` and returns up to 10 matching products
- Products that also appear in Priya's order history are flagged with `from_history: true`

### Files created in this phase
- `lib/productFilter.ts`
- `app/api/get-candidates/route.ts`

---

### ✅ How you verify Phase 3

**Test 1 — Basic goal filter**
> Send: `{ "goal_id": "healthy_snacking", "filters": [] }`
> Expected: A list of products — every product in the response should have `"healthy_snacking"` somewhere in its data. There should be at least 5 products returned.

**Test 2 — With a filter applied**
> Send: `{ "goal_id": "healthy_snacking", "filters": ["high_protein"] }`
> Expected: Fewer products — only those tagged with `high_protein`. Yogurt and Muesli should appear; Too Yumm Chips should NOT appear (it lacks the high_protein tag).

**Test 3 — Order history flag**
> Send: `{ "goal_id": "better_skin", "filters": [] }`
> Expected: `cetaphil_moisturising_cream` should appear in the results with a field like `"from_history": true` — because Priya previously ordered Cetaphil lotion.

**Test 4 — Maximum count**
> For any goal, the response should never return more than 10 products.

---

## Phase 4 — API: LLM Recommendations + Why This? (Job 3a)

### What gets built
- The Groq API client is set up in `lib/groqClient.ts` (reads `GROQ_API_KEY` securely)
- The recommendation prompt template is written in `lib/prompts.ts`
- A Next.js API route is created at `app/api/recommend/route.ts`
- The route receives the 10 candidates + goal + free-text preference + Priya's order history
- It sends one structured call to the Groq LLM (`llama-3.3-70b-versatile`)
- The LLM returns exactly 3 products (from different categories) + a `why_this` explanation for each

### Files created in this phase
- `lib/groqClient.ts`
- `lib/prompts.ts` (recommendation section)
- `app/api/recommend/route.ts`

---

### ✅ How you verify Phase 4

**Test 1 — Basic recommendation call**
> Trigger the `/api/recommend` endpoint (developer will show you how)
> Expected: A response containing exactly **3 products**

**Test 2 — Different categories rule**
> Look at the 3 returned products → Check the `blinkit_category` field of each one → All 3 should be from **different categories** (e.g., "Grocery & Kitchen", "Snacks & Drinks", "Beauty & Personal Care" — not all three from the same one)

**Test 3 — Why This? text is present**
> Each of the 3 products should have a `why_this` object with:
> - `goal_match` — 2 lines explaining how the product fits the goal
> - `ingredient_note` — 1 line about a notable ingredient

**Test 4 — History item not recommended**
> For the `better_skin` goal: `cetaphil_moisturising_cream` is in Priya's order history → It should either NOT appear in the top 3, or if it does appear, the `why_this` note should acknowledge it as something she already uses (not present as a new discovery)

**Test 5 — Response speed**
> The response should come back within about 5–10 seconds. If it takes longer than 30 seconds, something is wrong.

---

## Phase 5 — API: LLM Comparison Table + AI Summary (Job 3b)

### What gets built
- The comparison prompt template is added to `lib/prompts.ts`
- A Next.js API route is created at `app/api/compare/route.ts`
- The route receives 2 product objects + the active `goal_id`
- It sends one call to the Groq LLM with the goal-specific comparison schema
- The LLM returns a filled comparison table (rows with criterion, product A value, product B value, and which is better) + a 2-line AI summary

### Files created in this phase
- `app/api/compare/route.ts`
- `lib/prompts.ts` (comparison section added)

---

### ✅ How you verify Phase 5

**Test 1 — Comparison table structure**
> Send 2 products from the `healthy_snacking` goal (e.g., Makhana and Greek Yogurt)
> Expected: A table with exactly these rows: Calories per serving, Protein content, Sugar content, Fibre content, Presence of artificial additives, Allergens, Price per serving

**Test 2 — Each row has values for both products**
> Every row in the response should have a `product_a` value AND a `product_b` value — no empty cells

**Test 3 — Better-for-goal indicator**
> Each row should have a `better_for_goal` field with the value `"a"`, `"b"`, or `"tie"` — never blank

**Test 4 — AI summary is present**
> The response should include an `ai_summary` field — 2 lines of text naming which product better fits the stated goal and why

**Test 5 — Goal-specific schema**
> Run a comparison for `better_skin` → The rows should be completely different criteria: Key active ingredients, Skin type suitability, Paraben free, etc. — NOT the nutrition rows from `healthy_snacking`

---

## Phase 6 — UI: Toggle, Goal Input & Filter Row

### What gets built
The homepage is built with the visual shell of the Blinkit AI assistant:
- A dark-themed Blinkit-style homepage layout
- A thin horizontal card below the search bar with a toggle switch and "Blinkit Assistant" label
- When the toggle is OFF: search bar shows normal placeholder ("Search for Atta, Daal, Eggs…")
- When the toggle is ON: search bar placeholder changes to "Tell us your personal goal…"
- After the user types a goal and submits:
  - The keyword matcher API (Phase 2) is called
  - If a goal is detected: a filter row appears with 2 pill buttons + a free-text input
  - If no goal is detected: a friendly error message is shown below the search bar

### Files created/updated in this phase
- `app/page.tsx` (main UI)
- `app/globals.css` (dark theme, green + amber colour tokens)
- `components/AssistantToggleCard.tsx`
- `components/GoalSearchBar.tsx`
- `components/FilterRow.tsx`
- `store/sessionStore.ts`

---

### ✅ How you verify Phase 6

**Step 1 — Open the app in the browser**
> Visit the Vercel URL (or `localhost:3000` locally) → The page should have a **dark/black background** with green and amber accents — it should look like Blinkit's colour scheme, not a plain white page

**Step 2 — Toggle OFF state**
> The search bar should show a grey placeholder like "Search for Atta, Daal, Eggs…" → The toggle should be in the OFF position (grey/unlit)

**Step 3 — Toggle ON state**
> Click/tap the toggle → It should switch to ON (green/lit) → The search bar placeholder should immediately change to "Tell us your personal goal…"

**Step 4 — Type a snacking goal**
> With the toggle ON, type: `"I want something healthy to munch on"` and press Enter (or click Submit)
> Expected: Two filter pills appear below the search bar — **High Protein** and **Low Sugar** — plus a small text box labelled "Anything else? Type a preference…"

**Step 5 — Type a skin goal**
> Reset and type: `"my skin is dull"` and press Enter
> Expected: Two different filter pills appear — **No Paraben** and **Fragrance Free**

**Step 6 — Type an unrecognised goal**
> Reset and type: `"I need to book a hotel"` and press Enter
> Expected: A friendly message appears like "We couldn't detect a goal. Try something like 'I want healthier snacks' or 'help me with my skin'"

---

## Phase 7 — UI: Recommendation Cards + Why This?

### What gets built
After the user submits their goal (and optionally their filters):
- The product retrieval API (Phase 3) and LLM recommendation API (Phase 4) are called
- A loading state is shown while the LLM processes (spinner or skeleton cards)
- 3 product cards appear with the heading "Recommended for your [Goal Label]…"
- Each card shows: product image, weight, brand, product name, price, price per unit, ADD button, Why This? button
- Tapping ADD changes the button to a quantity stepper (− 1 +)
- Tapping Why This? expands a small explanation box below that card only
- Opening a second Why This? box closes the previous one
- A COMPARE button (amber) and a Go to Cart button (green, disabled) appear below the cards

### Files created/updated in this phase
- `components/ProductCard.tsx`
- `components/WhyThisBox.tsx`
- `components/QuantityStepper.tsx`
- `app/page.tsx` (updated to show recommendation row)

---

### ✅ How you verify Phase 7

**Step 1 — Recommendation cards appear**
> Type a goal (e.g., `"I want guilt-free snacks"`), submit → After a few seconds of loading, **exactly 3 product cards** should appear on screen with the heading "Recommended for your Healthy Snacking…"

**Step 2 — Each card has all required information**
> Each card should show: a product image, the product name, the brand name, the price in ₹, the weight (e.g., "70g"), and two buttons — **ADD** and **Why This?**

**Step 3 — ADD button works**
> Click ADD on any card → The button should change to show **− 1 +** (a quantity stepper). Click **+** → the number should increase to 2. Click **−** → back to 1.

**Step 4 — Why This? toggle works**
> Click "Why This?" on the first card → A small box should appear below that card showing 2–3 lines of explanation. Click it again → the box should collapse.

**Step 5 — Only one Why This? open at a time**
> Open Why This? on card 1 → Now click Why This? on card 2 → Card 1's explanation box should close automatically, and card 2's should open.

**Step 6 — COMPARE button is always visible**
> The COMPARE button (amber/orange colour) should be visible below the cards, and clicking it should do something (even if compare is not fully built yet — it can show "Coming Soon" temporarily)

**Step 7 — Go to Cart is disabled initially**
> The "Go to Cart" button should appear greyed out (disabled). After clicking ADD on any card, it should turn green and become clickable.

---

## Phase 8 — UI: Compare Bottom Sheet & Comparison Table

### What gets built
- Tapping COMPARE slides up a bottom sheet from the bottom of the screen
- The sheet shows the 3 recommended products as selectable cards + a search input for adding a 4th product from the catalog
- The user selects exactly 2 products (selecting a 3rd auto-deselects the earliest selection)
- After selection, the comparison table API (Phase 5) is called
- A clean two-column comparison table is displayed with the goal-specific criteria rows
- Each row has a ✓ (green check) or ✗ (red cross) indicator for which product is better
- A 2-line AI Summary appears below the table

### Files created/updated in this phase
- `components/CompareBottomSheet.tsx`
- `components/ComparisonTable.tsx`
- `app/page.tsx` (updated to handle compare state)

---

### ✅ How you verify Phase 8

**Step 1 — Bottom sheet opens**
> On the recommendations screen, click the COMPARE button → A panel should slide up from the bottom of the screen. The heading should read "Choose 2 products to compare"

**Step 2 — All 3 recommended products are listed**
> Inside the bottom sheet, you should see all 3 recommendation cards listed as options to select

**Step 3 — Selection works (max 2)**
> Click on product 1 → It should show as selected (highlighted/checked). Click on product 2 → Both are selected. Now click on product 3 → Product 1 (the earliest) should automatically deselect, and only products 2 and 3 are selected.

**Step 4 — Comparison table loads**
> With 2 products selected, click "Compare" (or the selection triggers it automatically) → A table should appear. It should have the correct columns for the goal:
> - For Healthy Snacking: Calories, Protein, Sugar, Fibre, Additives, Allergens, Price per serving
> - For Better Skin: Key ingredients, Skin type, Paraben free, Fragrance, Moisturization, Dermatologist tested, Allergens, Price

**Step 5 — ✓ / ✗ indicators are present**
> Each row in the table should have a visual indicator (✓ or ✗ or "Tie") showing which product is better for that attribute

**Step 6 — AI Summary appears**
> Below the table, 2 lines of text should appear written by the AI, naming which product is the better fit and giving a brief reason

---

## Phase 9 — UI: Cart State, Go to Cart & Feedback Sheet

### What gets built
- When the user taps "Go to Cart", they are taken to a simple cart page showing the products they added
- A thin "feedback card" appears at the bottom of the cart page: "Help us improve your recommendations"
- Tapping the feedback card opens a small sheet showing the AI-recommended products that were NOT added to cart (maximum 2 shown)
- For each skipped product, 5 reason buttons appear: Too expensive / Doesn't match my preference / Didn't trust the brand / Already have something similar / Other
- An X button dismisses the sheet without answering
- Selecting a reason sends it to the `/api/feedback` endpoint (which logs it server-side)

### Files created/updated in this phase
- `components/FeedbackSheet.tsx`
- `app/cart/page.tsx` (cart page)
- `app/api/feedback/route.ts`

---

### ✅ How you verify Phase 9

**Step 1 — Go to Cart works**
> Add at least one product (click ADD) → The "Go to Cart" button should turn green → Click it → You should be taken to a new page showing the products you added

**Step 2 — Cart shows correct items**
> The cart page should list only the products you clicked ADD on — not all 3 recommendations, only the ones you added

**Step 3 — Feedback card appears**
> At the bottom of the cart page, a thin card should appear saying "Help us improve your recommendations" — this only shows if you skipped at least one AI recommendation

**Step 4 — Feedback sheet shows skipped products**
> Tap the feedback card → A sheet slides up showing the products you did NOT add (maximum 2) → Each product shows its image, name, and 5 reason buttons

**Step 5 — Reason selection works**
> Tap one of the reason buttons (e.g., "Too expensive") → It should highlight/select → The sheet should either close or show a "Thank you" message

**Step 6 — X dismiss works**
> Open the feedback sheet → Tap the X button → The sheet should close without requiring you to select a reason

**Step 7 — Manually searched product is excluded from feedback**
> If you used the Compare sheet to search for a product (the 4th free-text search option) and added THAT product to cart instead of the AI recommendations → That manually-searched product should NOT appear in the feedback sheet. Only the original 3 AI recommendations that were skipped should appear.

---

## Phase 10 — Integration, Polish & Vercel Deployment

### What gets built
- The full end-to-end flow is tested from Toggle ON → Goal Input → Filter → Recommendations → Why This? → Compare → Cart → Feedback
- All loading states, error states, and edge cases are handled
- Mobile-first responsiveness is verified (the app should look good on a phone screen width)
- The Blinkit dark theme is polished (fonts, spacing, card shadows, button animations)
- The project is pushed to GitHub and deployed live on Vercel
- Optional: A second demo persona (e.g., "Rahul" with different order history) is added for stakeholder demo variety

### Final files touched
- All components (final polish pass)
- `app/globals.css` (final design tokens)
- `data/users.json` (optional: add 2nd persona)

---

### ✅ How you verify Phase 10

**Step 1 — Full end-to-end flow works (the main demo)**
> Run through the entire flow once without touching the code:
> 1. Open the Vercel URL
> 2. Turn the toggle ON
> 3. Type `"I want better skin"`
> 4. Select one filter pill (e.g., No Paraben)
> 5. Submit → 3 product cards should appear
> 6. Click "Why This?" on one card → explanation appears
> 7. Click COMPARE → select 2 products → comparison table appears with AI Summary
> 8. Close compare → click ADD on one card → click "Go to Cart"
> 9. Feedback card appears at bottom of cart page
> 10. Tap the feedback card → select a reason → sheet closes
>
> **If all 10 steps work without errors — the prototype is complete.**

**Step 2 — Mobile layout looks good**
> Open the Vercel URL on your phone (or right-click in Chrome → Inspect → toggle mobile view) → The app should look clean and properly laid out — cards should not be cut off or overlapping

**Step 3 — The live Vercel URL works for someone else**
> Share the Vercel URL with someone else (a friend or colleague) → They should be able to open it and run through the flow on their device without you doing anything

**Step 4 — No API key visible anywhere public**
> Go to the GitHub repository → Search for the word `GROQ_API_KEY` → It should ONLY appear in `.gitignore` and possibly in a `README.md` as an instruction (e.g., "Add GROQ_API_KEY to your .env.local file") — **never as an actual key value**

**Step 5 — Groq LLM is responding (not mocked)**
> Type an unusual preference in the free-text box (e.g., "I prefer Indian brands") → The Why This? explanation for the recommended products should acknowledge this preference. If the explanations are generic and clearly pre-written, the LLM may not be connected properly.

---

## Phase Summary Table

| Phase | What You'll See When It's Done                                                  | Time Estimate |
|-------|----------------------------------------------------------------------------------|---------------|
| 0     | A live Vercel URL with a placeholder page; Groq key visible (hidden) in dashboard | 1–2 hours     |
| 1     | 3 JSON files in the `data/` folder with all product and user data                | 2–3 hours     |
| 2     | API returns the correct goal when you type a natural sentence                    | 1–2 hours     |
| 3     | API returns filtered products when you pass a goal and filters                   | 1–2 hours     |
| 4     | API returns 3 ranked products + Why This? text from the LLM                     | 2–3 hours     |
| 5     | API returns a filled comparison table + AI Summary from the LLM                 | 1–2 hours     |
| 6     | Blinkit dark-themed homepage with working toggle, goal input, and filter pills   | 3–4 hours     |
| 7     | 3 recommendation cards with working ADD stepper and Why This? toggle            | 3–4 hours     |
| 8     | Working compare bottom sheet with comparison table and AI Summary                | 3–4 hours     |
| 9     | Cart page + feedback sheet with reason buttons                                   | 2–3 hours     |
| 10    | Full end-to-end flow live on Vercel with polish and mobile layout                | 2–4 hours     |

**Total estimated build time: 21–33 hours** (for a single developer working on the MVP prototype)

---

*This implementation plan follows the architecture defined in `architecture.md` and fulfils all requirements from `blinkit_ai_assistant_spec.md`.*
