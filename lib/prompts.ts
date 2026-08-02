export const getRecommendationPrompt = (
  goalLabel: string,
  freeTextPreference: string,
  orderHistory: any[],
  candidates: any[]
) => {
  return `System: You are a product recommendation assistant for Blinkit, an Indian quick-commerce app.
Your job is to select the 3 best products from the given candidate list that match the user's lifestyle goal.
Rules:
- Return exactly 3 products.
- Important: attempt to return products from different blinkit_category values, but the final enforcement will be done in code.
- Rank by best fit to the stated goal and free-text preference.
- Products from the user's order history may be used as a comparison reference but should generally NOT occupy a recommendation slot if there are other good options.
- For each product, write a "Why This?" explanation. First line (goal_match): 2 lines explaining how it matches the goal. Second line (ingredient_note): 1 line about a notable ingredient or quality signal.
- Return your response as valid JSON only, exactly matching the structure below.

User Goal: ${goalLabel}
User Preferences: ${freeTextPreference || 'None'}
User Order History: ${JSON.stringify(orderHistory, null, 2)}
Candidate Products: ${JSON.stringify(candidates, null, 2)}

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
}
  ]
}`;
};

export const getComparisonPrompt = (
  goalLabel: string,
  freeTextPreference: string,
  products: any[]
) => {
  return `System: You are an analytical product comparison assistant for Blinkit.
Your job is to generate an AI summary and organize product data into a comparison table for the 3 given products.

Rules:
1. Write a 2-line AI summary (ai_summary) highlighting the key differences between the 3 products in the context of the user's goal (${goalLabel}) and preference (${freeTextPreference || 'None'}).
2. Create an array of comparison_rows. Each row represents a feature/metric (e.g., "Protein", "Calories", "Price", "Key Ingredients").
3. CRITICAL: Do NOT invent, hallucinate, or calculate any product facts. All comparison values (product_1_value, product_2_value, product_3_value) MUST be extracted directly from the provided product JSON data (e.g., nutrition_per_serving, price_per_unit, ingredients_highlights, benefits). If a value is missing for a product, output "N/A".
4. The order of products in the row values must exactly match the order of the products provided in the input array.
5. Return ONLY valid JSON exactly matching the structure below.

Products Array (Order: Product 1, Product 2, Product 3):
${JSON.stringify(products, null, 2)}

Return format:
{
  "ai_summary": "2-line summary here...",
  "comparison_rows": [
    {
      "feature_name": "Feature Name (e.g. Protein)",
      "product_1_value": "Value for Product 1 from JSON",
      "product_2_value": "Value for Product 2 from JSON",
      "product_3_value": "Value for Product 3 from JSON"
    }
  ]
}`;
};
