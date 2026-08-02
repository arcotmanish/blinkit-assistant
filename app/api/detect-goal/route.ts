import { NextResponse } from 'next/server';
import { detectGoal, getGoalResponse } from '@/lib/keywordMatcher';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input_text } = body;

    if (!input_text || typeof input_text !== 'string') {
      return NextResponse.json(
        { goal_id: null, error: "Please provide a valid input string." },
        { status: 400 }
      );
    }

    const detectedGoalId = detectGoal(input_text);
    const responseData = getGoalResponse(detectedGoalId);

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in detect-goal API:', error);
    return NextResponse.json(
      { goal_id: null, error: "Internal server error." },
      { status: 500 }
    );
  }
}
