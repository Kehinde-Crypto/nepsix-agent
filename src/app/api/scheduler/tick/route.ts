import { NextRequest, NextResponse } from 'next/server';
import { runSchedulerConditionCheck } from '@/lib/scheduler/runner';

export async function POST(req: NextRequest) {
  try {
    let forceTriggerId: string | undefined;
    try {
      const body = await req.json();
      forceTriggerId = body.forceTriggerId;
    } catch {
      // Empty body is acceptable for periodic tick
    }

    const result = await runSchedulerConditionCheck(forceTriggerId);

    return NextResponse.json({
      success: true,
      data: result,
      message: `Evaluated ${result.evaluated} triggers. Dispatched ${result.dispatched} messages.`,
    });
  } catch (error: any) {
    console.error('Scheduler tick error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Scheduler tick failed' },
      { status: 500 }
    );
  }
}
