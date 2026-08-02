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
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2, // Low temperature for consistent JSON
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;
    
    if (!responseContent) {
      throw new Error("No content received from Groq.");
    }

    const parsedResponse = JSON.parse(responseContent);

    // --- Code-level Category Diversity Enforcement ---
    // The LLM may still return two products from the same blinkit_category.
    // We enforce uniqueness in code — not by re-prompting.
    // Build a map of product_id -> product for quick lookup
    const candidateMap = new Map(candidates.map((p: any) => [p.product_id, p]));

    const pickedCategories = new Set<string>();
    const diverseRecommendations: any[] = [];

    for (const rec of parsedResponse.recommendations) {
      if (diverseRecommendations.length === 3) break;

      const product = candidateMap.get(rec.product_id);
      if (!product) continue; // Safety: skip if LLM hallucinated a product_id

      const category = product.blinkit_category;

      if (!pickedCategories.has(category)) {
        pickedCategories.add(category);
        // Merge the LLM-generated why_this with the full product data
        diverseRecommendations.push({
          ...product,
          why_this: rec.why_this
        });
      }
    }

    return NextResponse.json({ recommendations: diverseRecommendations });
  } catch (error) {
    console.error('Error in recommend API:', error);
    return NextResponse.json(
      { error: "Failed to generate recommendations." },
      { status: 500 }
    );
  }
}
