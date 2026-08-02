# Blinkit AI Shopping Assistant — Complete Product Spec for MVP Prototype

## Strategic Context

**Blinkit's Goal:** Increase the percentage of Monthly Active Customers who purchase products from at least one new category every month.

**User Pain Point (from research):** Shoppers cannot confidently evaluate unfamiliar options related to their personal lifestyle goals within Blinkit. This forces them to seek validation from external sources before making a first purchase in a new category.

**Solution:** A goal-driven AI decision layer embedded inside Blinkit's existing shopping experience. It does not replace search or categories. It acts as a confidence-building bridge between the user's stated lifestyle goal and their first purchase in an unfamiliar category.

---

## Product Vision

**Blinkit AI Shopping Assistant helps users confidently choose unfamiliar products aligned with their personal lifestyle goals — without leaving their shopping journey.**

---

## Entry Point — How the User Activates the Assistant

On the Blinkit homepage, directly below the existing search bar, there is a thin horizontal card spanning the full width of the search bar. This card contains:

- A toggle switch on the left side
- Text beside the toggle that reads: **"Blinkit Assistant"**

**Default state (toggle OFF):** The existing search bar shows its normal placeholder — e.g., *"Search for Atta, Daal, Eggs…"*

**Activated state (toggle ON):** The search bar placeholder changes to — *"Tell us your personal goal…"* — signalling to the user that the AI mode is active and they should type a lifestyle goal, not a product name.

The toggle is always visible on the homepage. It does not require any navigation to find.

---

## The Three Supported Goals (MVP Scope)

The MVP covers **two goals for the prototype demo**. The full goal system is designed for three. The two demo goals are:

1. **Healthy Snacking**
2. **Better Skin**

The third goal (Morning Energy) is architected and ready but not part of the demo dataset.

### How Users Type Goals (Natural Language Variations)

Users will not type exact goal names. The system must detect intent from varied phrasing. Below are the phrases that map to each goal:

**Healthy Snacking**
- "I want healthier snacks"
- "snacks that aren't junk"
- "guilt-free munchies"
- "something to snack without gaining weight"
- "light snacking options"

**Better Skin**
- "I want better skin"
- "help me with my skincare"
- "my skin is dry and dull"
- "I want to glow"
- "skin care routine"
- "reduce pimples"

**Morning Energy (architecture ready, not in demo dataset)**
- "I need energy in the morning"
- "good morning breakfast"
- "something to keep me going till lunch"
- "morning routine fuel"

A simple keyword/phrase matching function can handle this for the prototype — no LLM needed for intent detection at this stage. Map keywords to goal IDs: `healthy_snacking`, `better_skin`, `morning_energy`.

---

## Stage 1 — Goal Understanding

User types their personal goal into the AI-activated search bar.

The system performs **keyword-based intent extraction** (no LLM). It maps the typed phrase to one of the three supported goal IDs.

Output: A structured goal object.

```json
{
  "goal_id": "healthy_snacking",
  "goal_label": "Healthy Snacking",
  "display_text": "Recommended for your Healthy Snacking..."
}
```

---

## Stage 2 — Preference Filters (Hardcoded Per Goal)

Immediately after the user types their goal and submits, before any recommendations appear, the interface shows a filter row. This is **not** a conversational AI question. It is a hardcoded, goal-aware filter panel that renders based on which goal was detected.

### Filter Layout

- Two pill-shaped toggle buttons (the hardcoded filters for that goal)
- One small open text input box labelled: *"Anything else? Type a preference…"*

The user can select none, one, or both of the hardcoded filters. They can additionally type a free-text preference. This entire filter step is optional — if the user skips it and submits, the system proceeds with just the goal.

### Hardcoded Filters Per Goal

**Goal: Healthy Snacking**
- Filter 1: High Protein
- Filter 2: Low Sugar

**Goal: Better Skin**
- Filter 1: No Paraben
- Filter 2: Fragrance Free

**Goal: Morning Energy**
- Filter 1: High Protein
- Filter 2: No Added Sugar

---

## Stage 3 — Two-Stage Retrieval Logic

### Step 3A — Code-Based Filtering (No LLM)

Using the detected goal and any selected hardcoded filters, the system queries the local product dataset using standard filtering logic:

- Match products whose `goal_tags` array includes the detected `goal_id`
- If Filter 1 is selected, additionally filter where `tags` includes the filter tag (e.g., `high_protein`)
- If Filter 2 is selected, additionally filter where `tags` includes that filter tag (e.g., `low_sugar`)
- Also check the user's order history dataset — if any products in the history match the goal, flag them as `from_history: true`

This step returns up to **10 candidate products**.

### Step 3B — LLM Ranking (Claude / GPT)

The 10 candidate products, along with the user's stated goal, any free-text preference typed, and their order history, are sent to the LLM. The LLM is instructed to:

- Return exactly **3 product recommendations**
- Each recommendation must come from a **different Blinkit category** (cross-category discovery is the core business outcome)
- Rank by best fit to the stated goal and free-text preference
- For each product, generate a 2–3 line explanation under "Why This?"
- Products from the user's order history may be used as a comparison reference but should not occupy a recommendation slot

The LLM receives a structured prompt — not a free-form conversation.

---

## Stage 4 — Recommendation Display

After the LLM returns, the homepage shows a horizontal scrollable card row (or 3-column grid on web) with the heading:

**"Recommended for your [Goal Label]…"**

### Each Product Card Contains

- Product image (top)
- Weight / pack size below image
- Brand and product name
- Price (prominent)
- Price per unit (smaller, below price)
- **ADD button** (green, Blinkit-style) — clicking adds to cart; button changes to a quantity stepper (− 1 +)
- **Why This? button** (outlined, beside ADD)

### Below the Product Cards

Two full-width buttons:
- **COMPARE** (amber/orange background) — always enabled, even before adding anything
- **Go to Cart** (green background) — disabled until at least one product is added; activates once any ADD is tapped

---

## Stage 5 — Why This? Interaction

When the user taps **Why This?** on any product card:

- The button highlights (fills with colour)
- A small description box appears below that specific product card (not a full-screen modal)
- The box shows two labelled sections:
  - **Matches your [Goal] Goal —** 2 lines explaining why this product fits the goal
  - **Clean Ingredients —** 1 line about a notable ingredient or absence of a harmful one

Tapping **Why This?** again collapses the box and the button returns to its outlined state.

Only one Why This? box can be open at a time. Opening a second one closes the previous.

---

## Stage 6 — Compare Flow

### Trigger
User taps the **COMPARE** button below the recommendation row.

### What Opens
A bottom sheet slides up. It shows:

**Heading:** *"Choose 2 products to compare"*

**Option list (4 items):**
1. [Product Card — Recommendation 1]
2. [Product Card — Recommendation 2]
3. [Product Card — Recommendation 3]
4. A text input box labelled: *"Search any other product…"* — as the user types, a dropdown shows matching products from the full Blinkit catalog. Selecting one adds it to the compare pool.

The user selects exactly 2 products from these 4 options (any combination). Selecting a 3rd deselects the earliest selected.

### Comparison Table Generation

The two selected products are sent to the LLM along with:
- The user's goal
- The comparison attribute schema for that goal (see Comparison Attributes section below)

The LLM generates a value for each attribute for each product and writes a 2-line AI Summary at the bottom.

### Comparison Table Layout

A clean two-column table. Left column: attribute names. Middle two columns: one per product. Each cell has a value and optionally a ✓ (good) or ✗ (not ideal) indicator relative to the stated goal.

Below the table: **AI Summary** — 2 lines written by the LLM, naming which product better fits the stated goal and why.

### Comparison Attributes Per Goal

**Goal: Healthy Snacking**

| Criterion | Product A | Product B |
|---|---|---|
| Calories per serving | | |
| Protein content | | |
| Sugar content | | |
| Fibre content | | |
| Presence of artificial additives | | |
| Allergens | | |
| Price per serving | | |

**Goal: Better Skin**

| Criterion | Product A | Product B |
|---|---|---|
| Key active ingredients | | |
| Skin type suitability | | |
| Paraben free | | |
| Fragrance / Irritants | | |
| Moisturization level | | |
| Dermatologist tested | | |
| Allergens / Sensitivities | | |
| Price | | |

**Goal: Morning Energy**

| Criterion | Product A | Product B |
|---|---|---|
| Calories per serving | | |
| Protein content | | |
| Complex carbs vs simple carbs | | |
| Added sugar | | |
| Fibre content | | |
| Preparation time | | |
| Price per serving | | |

---

## Stage 7 — Cart & Feedback

### Cart Behaviour
When the user taps **Go to Cart**, they are taken to the standard Blinkit cart page. The AI assistant layer closes. The cart shows added items normally.

### Feedback Card (Bottom of Cart Page)
A thin card appears below the cart item list. It reads:

**"Help us improve your recommendations"**
*"You skipped some suggestions. Can you tell us why?"*

Tapping the card opens a small sheet showing only the **products from the AI recommendation that were NOT added to cart** (maximum 2 shown). For each skipped product, the user sees the product image, name, and a row of reason buttons:

- Too expensive
- Doesn't match my preference
- Didn't trust the brand
- Already have something similar
- Other

The user answers for one or at most two products. The entire interaction should take under 10 seconds. No forced answering — there is an X to dismiss.

**Special case:** If the user used the Compare free-text option (Option 4) and added that manually searched product to cart instead of any recommendation, that manually searched product is not shown in feedback. Only the original AI recommendations not added are shown.

---

## Stage 8 — Checkout

No AI involvement. Standard Blinkit checkout flow.

---

## AI Architecture (4 Separate Jobs)

### Job 1 — Goal Understanding (Code, No LLM)
- Input: Raw text typed by user
- Process: Keyword/phrase matching against goal dictionary
- Output: `goal_id`, `goal_label`

### Job 2 — Product Retrieval (Code, No LLM)
- Input: `goal_id` + selected hardcoded filters
- Process: Filter local product dataset by `goal_tags` and `tags`
- Also cross-reference user order history dataset
- Output: Up to 10 candidate products

### Job 3 — Reasoning, Ranking, Explanation, Comparison (LLM)
- Input: 10 candidate products + goal + free-text preference + order history context + comparison schema
- Output: Top 3 ranked products (from different categories) + Why This? text per product + comparison table values + AI summary
- This is the only place the LLM is called

### Job 4 — Feedback Collection (Code, No LLM)
- Store: skipped product ID, reason selected, goal, session timestamp
- No real-time retraining. Feedback collection only for future improvement.

---

## Cached vs. Generated

### Cached (retrieved from dataset, never generated)
- Product name, brand, category
- Price, weight, pack size
- Nutrition values (calories, protein, sugar, fibre, carbs)
- Ingredients list
- Allergens
- Tags (goal tags, filter tags, compare tags)
- Benefits list
- Dermatologist tested flag
- Skin type suitability

### Generated by LLM
- Ranking of top 3 from candidates
- Why This? explanation text (2–3 lines per product)
- Comparison table values (LLM interprets cached data into human-readable judgements)
- AI Summary in comparison view

---

## Prototype Datasets

The prototype uses three hardcoded JSON datasets. Real Blinkit API is not used.

---

### Dataset 1 — User Profile & Order History

One fixed demo user. Optionally, 2–3 switchable personas can be created to demonstrate personalisation during a stakeholder review.

```json
{
  "user_id": "demo_user_01",
  "name": "Priya",
  "preferences": {
    "budget": "medium",
    "vegetarian": true
  },
  "order_history": [
    { "product_id": "lays_classic", "category": "Chips & Namkeen", "times_ordered": 6 },
    { "product_id": "amul_butter", "category": "Dairy, Bread & Eggs", "times_ordered": 4 },
    { "product_id": "maggi_noodles", "category": "Instant Food", "times_ordered": 3 },
    { "product_id": "dove_shampoo", "category": "Hair", "times_ordered": 2 },
    { "product_id": "cetaphil_lotion", "category": "Skin & Face", "times_ordered": 1 }
  ]
}
```

---

### Dataset 2 — Goal-to-Category Mapping

```json
{
  "healthy_snacking": {
    "label": "Healthy Snacking",
    "primary_categories": ["Chips & Namkeen", "Dry Fruits & Cereals", "Dairy, Bread & Eggs"],
    "filter_tags": ["high_protein", "low_sugar", "high_fibre", "low_fat", "no_maida"]
  },
  "better_skin": {
    "label": "Better Skin",
    "primary_categories": ["Skin & Face", "Dry Fruits & Cereals", "Drinks & Juices"],
    "filter_tags": ["no_paraben", "fragrance_free", "vitamin_c", "dermatologist_tested", "no_sulphate"]
  },
  "morning_energy": {
    "label": "Morning Energy",
    "primary_categories": ["Dairy, Bread & Eggs", "Dry Fruits & Cereals", "Tea, Coffee & Milk Drinks"],
    "filter_tags": ["high_protein", "no_added_sugar", "complex_carbs", "high_fibre"]
  }
}
```

---

### Dataset 3 — Product Database

Every product has the following fields. A minimum of **5–6 products per demo goal** is recommended so the LLM has meaningful candidates to rank. Products should span different categories.

**Schema per product:**
```json
{
  "product_id": "",
  "name": "",
  "brand": "",
  "blinkit_category": "",
  "blinkit_subcategory": "",
  "price_inr": 0,
  "weight_or_pack": "",
  "price_per_unit": "",
  "goal_tags": [],
  "filter_tags": [],
  "compare_tags": [],
  "benefits": [],
  "ingredients_highlights": [],
  "nutrition_per_serving": {
    "calories": "",
    "protein_g": "",
    "carbs_g": "",
    "sugar_g": "",
    "fibre_g": "",
    "fat_g": ""
  },
  "allergens": [],
  "skin_type_suitability": "",
  "paraben_free": null,
  "fragrance_free": null,
  "dermatologist_tested": null,
  "moisturization_level": "",
  "key_active_ingredients": []
}
```

---

### Demo Products — Goal: Healthy Snacking

#### Product 1 — Too Yumm Multigrain Chips
```json
{
  "product_id": "too_yumm_multigrain",
  "name": "Too Yumm Multigrain Chips",
  "brand": "Too Yumm",
  "blinkit_category": "Snacks & Drinks",
  "blinkit_subcategory": "Chips & Namkeen",
  "price_inr": 20,
  "weight_or_pack": "30g",
  "price_per_unit": "₹67/100g",
  "goal_tags": ["healthy_snacking"],
  "filter_tags": ["low_fat", "no_maida", "baked"],
  "compare_tags": ["lays", "potato chips", "packaged snacks"],
  "benefits": ["Baked not fried", "Multigrain blend", "Lower fat than regular chips"],
  "ingredients_highlights": ["Rice", "Corn", "Oats", "Wheat", "No artificial colours"],
  "nutrition_per_serving": {
    "calories": "110 kcal",
    "protein_g": "2g",
    "carbs_g": "18g",
    "sugar_g": "1g",
    "fibre_g": "2g",
    "fat_g": "3.5g"
  },
  "allergens": ["Wheat", "Gluten"]
}
```

#### Product 2 — Farmley Roasted Makhana (Fox Nuts)
```json
{
  "product_id": "farmley_makhana",
  "name": "Roasted Makhana – Classic Salt",
  "brand": "Farmley",
  "blinkit_category": "Grocery & Kitchen",
  "blinkit_subcategory": "Dry Fruits & Cereals",
  "price_inr": 99,
  "weight_or_pack": "70g",
  "price_per_unit": "₹141/100g",
  "goal_tags": ["healthy_snacking"],
  "filter_tags": ["high_protein", "low_fat", "high_fibre", "no_maida", "gluten_free"],
  "compare_tags": ["chips", "popcorn", "puffed snacks"],
  "benefits": ["High in protein", "Low calorie", "Rich in fibre", "Gluten free", "Antioxidant rich"],
  "ingredients_highlights": ["Makhana (Lotus Seeds)", "Rock Salt", "Sunflower Oil"],
  "nutrition_per_serving": {
    "calories": "95 kcal",
    "protein_g": "4.5g",
    "carbs_g": "16g",
    "sugar_g": "0g",
    "fibre_g": "3g",
    "fat_g": "2g"
  },
  "allergens": []
}
```

#### Product 3 — Yoga Bar Greek Yogurt (Plain)
```json
{
  "product_id": "yogabar_greek_yogurt",
  "name": "Greek Yogurt – Plain Unsweetened",
  "brand": "Yoga Bar",
  "blinkit_category": "Grocery & Kitchen",
  "blinkit_subcategory": "Dairy, Bread & Eggs",
  "price_inr": 89,
  "weight_or_pack": "200g",
  "price_per_unit": "₹44.5/100g",
  "goal_tags": ["healthy_snacking", "morning_energy"],
  "filter_tags": ["high_protein", "low_sugar", "probiotic"],
  "compare_tags": ["curd", "flavoured yogurt", "dahi"],
  "benefits": ["2x protein vs regular curd", "Probiotic cultures", "No added sugar", "Gut friendly"],
  "ingredients_highlights": ["Skimmed Milk", "Live Bacterial Cultures"],
  "nutrition_per_serving": {
    "calories": "90 kcal",
    "protein_g": "10g",
    "carbs_g": "6g",
    "sugar_g": "4g (natural lactose)",
    "fibre_g": "0g",
    "fat_g": "2g"
  },
  "allergens": ["Milk", "Dairy"]
}
```

#### Product 4 — Yoga Bar High Protein Muesli
```json
{
  "product_id": "yogabar_muesli",
  "name": "High Protein Muesli – No Added Sugar",
  "brand": "Yoga Bar",
  "blinkit_category": "Grocery & Kitchen",
  "blinkit_subcategory": "Dry Fruits & Cereals",
  "price_inr": 297,
  "weight_or_pack": "700g",
  "price_per_unit": "₹42/100g",
  "goal_tags": ["healthy_snacking", "morning_energy"],
  "filter_tags": ["high_protein", "low_sugar", "high_fibre", "no_maida"],
  "compare_tags": ["corn flakes", "oats", "breakfast cereal"],
  "benefits": ["20g protein per 100g", "No refined sugar", "Whole grain oats", "Contains nuts and seeds"],
  "ingredients_highlights": ["Rolled Oats", "Almonds", "Pumpkin Seeds", "Whey Protein", "No artificial sweetener"],
  "nutrition_per_serving": {
    "calories": "355 kcal",
    "protein_g": "20g",
    "carbs_g": "45g",
    "sugar_g": "2g",
    "fibre_g": "7g",
    "fat_g": "8g"
  },
  "allergens": ["Milk", "Nuts", "Gluten"]
}
```

#### Product 5 — Epigamia Almond Milk Yogurt
```json
{
  "product_id": "epigamia_almond_yogurt",
  "name": "Almond Milk Yogurt – Vanilla",
  "brand": "Epigamia",
  "blinkit_category": "Grocery & Kitchen",
  "blinkit_subcategory": "Dairy, Bread & Eggs",
  "price_inr": 75,
  "weight_or_pack": "90g",
  "price_per_unit": "₹83/100g",
  "goal_tags": ["healthy_snacking"],
  "filter_tags": ["low_sugar", "no_maida", "plant_based"],
  "compare_tags": ["flavoured yogurt", "dessert", "sweet snack"],
  "benefits": ["Plant-based", "No cholesterol", "Lower calorie sweet option", "Probiotic"],
  "ingredients_highlights": ["Almond Milk", "Live Cultures", "Natural Vanilla Extract"],
  "nutrition_per_serving": {
    "calories": "70 kcal",
    "protein_g": "1.5g",
    "carbs_g": "12g",
    "sugar_g": "7g",
    "fibre_g": "1g",
    "fat_g": "2g"
  },
  "allergens": ["Tree Nuts (Almonds)"]
}
```

---

### Demo Products — Goal: Better Skin

#### Product 1 — Minimalist Vitamin C Serum 10%
```json
{
  "product_id": "minimalist_vitc_serum",
  "name": "Vitamin C 10% + Acetyl Glucosamine 1% Face Serum",
  "brand": "Minimalist",
  "blinkit_category": "Beauty & Personal Care",
  "blinkit_subcategory": "Skin & Face",
  "price_inr": 599,
  "weight_or_pack": "30ml",
  "price_per_unit": "₹1997/100ml",
  "goal_tags": ["better_skin"],
  "filter_tags": ["no_paraben", "fragrance_free", "vitamin_c", "dermatologist_tested"],
  "compare_tags": ["face serum", "brightening serum", "glow serum"],
  "benefits": ["Brightens skin tone", "Reduces pigmentation", "Antioxidant protection", "Improves texture"],
  "key_active_ingredients": ["Vitamin C (Ascorbyl Glucoside) 10%", "Acetyl Glucosamine 1%"],
  "ingredients_highlights": ["No fragrance", "No paraben", "No alcohol", "Minimal formulation"],
  "allergens": [],
  "skin_type_suitability": "All skin types including sensitive",
  "paraben_free": true,
  "fragrance_free": true,
  "dermatologist_tested": true,
  "moisturization_level": "Light — serum base, not moisturising on its own"
}
```

#### Product 2 — Cetaphil Moisturising Cream
```json
{
  "product_id": "cetaphil_moisturising_cream",
  "name": "Moisturising Cream for Dry to Normal Skin",
  "brand": "Cetaphil",
  "blinkit_category": "Beauty & Personal Care",
  "blinkit_subcategory": "Skin & Face",
  "price_inr": 349,
  "weight_or_pack": "80g",
  "price_per_unit": "₹436/100g",
  "goal_tags": ["better_skin"],
  "filter_tags": ["no_paraben", "fragrance_free", "dermatologist_tested"],
  "compare_tags": ["face cream", "moisturiser", "lotion"],
  "benefits": ["Long-lasting hydration", "Gentle on sensitive skin", "Repairs skin barrier", "Non-comedogenic"],
  "key_active_ingredients": ["Glycerin", "Panthenol", "Niacinamide"],
  "ingredients_highlights": ["No fragrance", "No paraben", "Hypoallergenic"],
  "allergens": [],
  "skin_type_suitability": "Dry, Normal, Sensitive",
  "paraben_free": true,
  "fragrance_free": true,
  "dermatologist_tested": true,
  "moisturization_level": "High — rich cream, suitable for dry skin"
}
```

#### Product 3 — Soulfull Ragi Crackers (Skin via Nutrition)
```json
{
  "product_id": "soulfull_ragi_crackers",
  "name": "Ragi Crackers – Pepper & Herbs",
  "brand": "Soulfull",
  "blinkit_category": "Snacks & Drinks",
  "blinkit_subcategory": "Chips & Namkeen",
  "price_inr": 55,
  "weight_or_pack": "150g",
  "price_per_unit": "₹37/100g",
  "goal_tags": ["better_skin", "healthy_snacking"],
  "filter_tags": ["no_maida", "high_fibre", "no_paraben"],
  "compare_tags": ["biscuits", "crackers", "snacks for skin"],
  "benefits": ["Ragi is rich in calcium and antioxidants", "Supports skin health from within", "No refined flour", "High fibre aids digestion which reflects on skin"],
  "ingredients_highlights": ["Finger Millet (Ragi)", "Whole Wheat", "No maida", "No artificial flavours"],
  "nutrition_per_serving": {
    "calories": "130 kcal",
    "protein_g": "3g",
    "carbs_g": "22g",
    "sugar_g": "1g",
    "fibre_g": "4g",
    "fat_g": "4g"
  },
  "allergens": ["Wheat", "Gluten"]
}
```

#### Product 4 — Raw Pressery Amla Juice
```json
{
  "product_id": "raw_pressery_amla",
  "name": "Cold Pressed Amla Juice",
  "brand": "Raw Pressery",
  "blinkit_category": "Snacks & Drinks",
  "blinkit_subcategory": "Drinks & Juices",
  "price_inr": 150,
  "weight_or_pack": "250ml",
  "price_per_unit": "₹60/100ml",
  "goal_tags": ["better_skin"],
  "filter_tags": ["vitamin_c", "no_paraben", "fragrance_free"],
  "compare_tags": ["fruit juice", "health drink", "vitamin c drink"],
  "benefits": ["Extremely high Vitamin C content", "Boosts collagen production", "Antioxidant rich", "Supports skin glow from within"],
  "key_active_ingredients": ["Amla (Indian Gooseberry)", "Natural Vitamin C"],
  "ingredients_highlights": ["Cold pressed — no heat treatment", "No preservatives", "No added sugar"],
  "allergens": []
}
```

#### Product 5 — Minimalist SPF 50 Sunscreen
```json
{
  "product_id": "minimalist_spf50",
  "name": "SPF 50 PA+++ Sunscreen with Hyaluronic Acid",
  "brand": "Minimalist",
  "blinkit_category": "Beauty & Personal Care",
  "blinkit_subcategory": "Skin & Face",
  "price_inr": 319,
  "weight_or_pack": "50ml",
  "price_per_unit": "₹638/100ml",
  "goal_tags": ["better_skin"],
  "filter_tags": ["no_paraben", "fragrance_free", "dermatologist_tested"],
  "compare_tags": ["sunscreen", "SPF cream", "sun protection"],
  "benefits": ["Broad spectrum UVA + UVB protection", "Prevents pigmentation from sun", "Hydrates skin with Hyaluronic Acid", "No white cast"],
  "key_active_ingredients": ["Ethylhexyl Methoxycinnamate", "Hyaluronic Acid", "Niacinamide"],
  "ingredients_highlights": ["No fragrance", "No paraben", "Lightweight formula"],
  "allergens": [],
  "skin_type_suitability": "All skin types",
  "paraben_free": true,
  "fragrance_free": true,
  "dermatologist_tested": true,
  "moisturization_level": "Moderate — hydrating but not heavy"
}
```

---

## Full User Flow (Reference for Engineer)

```
User opens Blinkit homepage
        |
        v
Toggle card below search bar — user sees "Blinkit Assistant" + toggle
        |
        v
User turns ON the toggle
        |
        v
Search bar placeholder changes to "Tell us your personal goal…"
        |
        v
User types goal (e.g. "I want healthier snacks")
        |
        v
System detects goal via keyword matching → goal_id: healthy_snacking
        |
        v
Filter row appears:
[ High Protein ] [ Low Sugar ]  [ Anything else? Type here... ]
User selects filters (optional) → submits
        |
        v
STAGE 3A: Code filters product dataset → up to 10 candidates
        |
        v
STAGE 3B: LLM receives candidates + goal + filters + order history
         → Returns top 3 products (from different categories)
         → Returns Why This? text for each
        |
        v
Homepage shows recommendation row:
"Recommended for your Healthy Snacking…"
[ Product Card 1 ]  [ Product Card 2 ]  [ Product Card 3 ]
Each card: image | weight | price | ADD button | Why This? button
        |
Below cards: [ COMPARE (always active) ]  [ Go to Cart (disabled until ADD tapped) ]
        |
        +---> User taps Why This? on any card
        |          → Small box expands below that card
        |          → Shows 2-line goal match + 1-line ingredient note
        |          → Tap again to close
        |
        +---> User taps ADD on any card
        |          → ADD changes to (− 1 +) stepper
        |          → Go to Cart becomes active
        |
        +---> User taps COMPARE
                   → Bottom sheet opens
                   → Shows 3 recommended products + 1 free-text search option
                   → User selects 2
                   → LLM generates comparison table + AI summary
                   → Table shows with criteria relevant to the goal
        |
        v
User taps Go to Cart
        |
        v
Standard Blinkit cart page
        |
At bottom of cart: feedback card
"Help us improve your recommendations — why did you skip these?"
        |
Shows only the AI-recommended products NOT added to cart (max 2)
Reason buttons per skipped product → user selects → dismisses
        |
        v
Standard Blinkit Checkout (no AI)
```

---

## What the LLM Prompt Should Contain (Reference)

### For Recommendation Ranking

```
System: You are a product recommendation assistant for Blinkit, an Indian quick-commerce app.
Your job is to select the 3 best products from the given candidate list that match the user's lifestyle goal.
Rules:
- Return exactly 3 products
- Each product must come from a different Blinkit category
- Prefer products the user has not bought before unless the history item is highly relevant as a comparison reference
- For each product, write a "Why This?" explanation in 2-3 lines. First line: how it matches the goal. Second line: a notable ingredient or quality signal.
- Return your response as valid JSON only.

User Goal: [goal_label]
User Preferences: [free-text preference if any]
User Order History: [array of past products]
Candidate Products: [array of up to 10 product objects from dataset]

Return format:
{
  "recommendations": [
    {
      "product_id": "",
      "why_this": {
        "goal_match": "2 lines",
        "ingredient_note": "1 line"
      }
    }
  ]
}
```

### For Comparison Table

```
System: You are a product comparison assistant. Given two products and a user's lifestyle goal, populate the comparison criteria with factual values from the product data provided. Then write a 2-line AI summary stating which product better fits the goal and why.
Return valid JSON only.

User Goal: [goal_label]
Comparison Criteria: [array of criteria for this goal]
Product A: [full product object]
Product B: [full product object]

Return format:
{
  "rows": [
    { "criterion": "", "product_a": "", "product_b": "", "better_for_goal": "a | b | tie" }
  ],
  "ai_summary": "2 lines"
}
```

---

## Non-Goals for MVP

- No real Blinkit API integration
- No real-time inventory or pricing
- No user authentication (use the hardcoded demo user)
- No actual cart or checkout processing
- No LLM fine-tuning or retraining from feedback
- No voice input
- No support for more than 3 goals in the prototype
- No PDP (Product Detail Page) integration in the first cut — the Compare feature lives only in the AI assistant layer

---

## Tech Stack Suggestions (Engineer's Choice, Not Prescriptive)

- **Frontend:** React or Next.js (mobile-first layout, Blinkit dark theme — black background, green and amber accents)
- **Backend:** FastAPI or Node/Express
- **LLM Provider:** Groq
- **Model:** llama-3.3-70b-versatile 
- **Data:** JSON files for all three datasets (no database needed for prototype)
- **State:** Session-level state only (no persistence needed for demo)

---

*This document is the complete handoff spec for the MVP prototype of the Blinkit AI Shopping Assistant. All product data, flows, LLM prompt structures, and UI behaviours described here are sufficient to build and demo the prototype without additional clarification.*
