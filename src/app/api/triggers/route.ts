import { NextRequest, NextResponse } from 'next/server';
import { addTrigger, getTriggers } from '@/lib/triggers/store';
import { CalendarTrigger } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const triggers = getTriggers();
  return NextResponse.json({
    success: true,
    data: triggers,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const trigger: CalendarTrigger = body.trigger;

    if (!trigger || !trigger.id || !trigger.eventTitle || !trigger.recipient) {
      return NextResponse.json(
        { success: false, error: 'Invalid trigger data provided.' },
        { status: 400 }
      );
    }

    const saved = addTrigger(trigger);

    return NextResponse.json({
      success: true,
      data: saved,
      message: 'Trigger scheduled successfully!',
    });
  } catch (error: any) {
    console.error('Trigger API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
