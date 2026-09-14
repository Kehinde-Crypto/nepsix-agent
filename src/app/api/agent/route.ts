import { NextRequest, NextResponse } from 'next/server';
import { processAgentConversation } from '@/lib/agent/engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, history } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'A valid text prompt is required.' },
        { status: 400 }
      );
    }

    const result = await processAgentConversation(prompt, history || []);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Agent Error' },
      { status: 500 }
    );
  }
}
