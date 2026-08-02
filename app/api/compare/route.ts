import { NextResponse } from 'next/server';
import groq from '@/lib/groqClient';
import { getComparisonPrompt } from '@/lib/prompts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { products, goal_label, free_text_preference } = body;

    if (!products || !Array.isArray(products) || products.length !== 3 || !goal_label) {
      return NextResponse.json(
        { error: "Invalid request payload. Must provide exactly 3 products and a goal_label." },
        { status: 400 }
      );
    }

    const prompt = getComparisonPrompt(
      goal_label,
      free_text_preference || '',
      products
    );

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1, // Even lower temperature to strictly enforce no hallucinations
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No content received from Groq.");
    }

    const parsedResponse = JSON.parse(responseContent);

    // Explicit charset=utf-8 in response header
    return new Response(JSON.stringify(parsedResponse), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });

  } catch (error) {
    console.error('Error in compare API:', error);
    return NextResponse.json(
      { error: "Failed to generate comparison." },
      { status: 500 }
    );
  }
}
