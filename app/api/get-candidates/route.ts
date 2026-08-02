import { NextResponse } from 'next/server';
import { getCandidates } from '@/lib/productFilter';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { goal_id, filters } = body;

    if (!goal_id || typeof goal_id !== 'string') {
      return NextResponse.json(
        { error: "Please provide a valid goal_id string." },
        { status: 400 }
      );
    }

    const selectedFilters = Array.isArray(filters) ? filters : [];
    const candidates = getCandidates(goal_id, selectedFilters);

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error('Error in get-candidates API:', error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
