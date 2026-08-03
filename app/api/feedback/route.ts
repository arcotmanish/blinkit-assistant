import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log the feedback to the console as per requirements
    console.log("Feedback Received:", {
      timestamp: body.timestamp || new Date().toISOString(),
      goal_id: body.goal_id,
      product_id: body.product_id,
      reason: body.reason,
      free_text: body.free_text
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing feedback:", error);
    return NextResponse.json({ success: false, error: "Failed to process feedback" }, { status: 500 });
  }
}
