import { NextResponse } from 'next/server';
import groq from '@/lib/groqClient';
import { getRecommendationPrompt } from '@/lib/prompts';
import usersData from '@/data/users.json';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidates, goal_label, free_text_preference } = body;

    if (!candidates || !Array.isArray(candidates) || !goal_label) {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400 }
      );
    }

    // Get the demo user's order history
    const demoUser = usersData[0];
    const orderHistory = demoUser.order_history;

    const prompt = getRecommendationPrompt(
      goal_label,
      free_text_preference || '',
      orderHistory,
      candidates
    );

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No content received from Groq.");
    }

    const parsedResponse = JSON.parse(responseContent);

    // --- Code-level Category Diversity Enforcement ---
    // Build a map of product_id -> full product for quick lookup
    const candidateMap = new Map(candidates.map((p: any) => [p.product_id, p]));

    const pickedCategories = new Set<string>();
    const diverseRecommendations: any[] = [];

    // Pass 1: Walk the LLM's ranked list in order, pick unique-category products
    for (const rec of (parsedResponse.recommendations || [])) {
      if (diverseRecommendations.length === 3) break;

      const product = candidateMap.get(rec.product_id);
      if (!product) continue; // Skip if LLM hallucinated a product_id

      if (!pickedCategories.has(product.blinkit_category)) {
        pickedCategories.add(product.blinkit_category);
        diverseRecommendations.push({ ...product, why_this: rec.why_this });
      }
    }

    // Pass 2: Fallback — LLM returned fewer than 3 diverse products.
    // Fill remaining slots from the candidates list (code-filtered), preserving LLM rank priority.
    if (diverseRecommendations.length < 3) {
      for (const candidate of candidates) {
        if (diverseRecommendations.length === 3) break;

        if (!pickedCategories.has(candidate.blinkit_category)) {
          pickedCategories.add(candidate.blinkit_category);
          // Build a simple why_this from the product's own benefits / ingredients
          const benefit1 = candidate.benefits?.[0] ?? "Great fit for your goal.";
          const benefit2 = candidate.benefits?.[1] ?? "A well-rounded option.";
          const ingredient =
            candidate.ingredients_highlights?.[0] ??
            candidate.key_active_ingredients?.[0] ??
            "Quality ingredients.";
          diverseRecommendations.push({
            ...candidate,
            why_this: {
              goal_match: `${benefit1}. ${benefit2}.`,
              ingredient_note: `Key ingredient: ${ingredient}.`
            }
          });
        }
      }
    }

    // Explicit charset=utf-8 in response header
    return new Response(JSON.stringify({ recommendations: diverseRecommendations }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (error) {
    console.error('Error in recommend API:', error);
    return NextResponse.json(
      { error: "Failed to generate recommendations." },
      { status: 500 }
    );
  }
}
