import { NextResponse } from 'next/server';
import { fetchUpcomingCalendarEvents } from '@/lib/calendar/google-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await fetchUpcomingCalendarEvents();
    return NextResponse.json({
      success: true,
      connected: result.connected,
      data: result.events,
    });
  } catch (error: any) {
    console.error('Fetch calendar events error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch calendar events',
    }, { status: 500 });
  }
}
