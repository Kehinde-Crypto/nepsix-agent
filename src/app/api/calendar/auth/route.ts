import { NextResponse } from 'next/server';
import { getGoogleAuthUrl } from '@/lib/calendar/google-client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authUrl = getGoogleAuthUrl();

  if (!authUrl) {
    return NextResponse.json({
      success: false,
      error: 'Google Client ID or Secret is not configured in .env. Using mock calendar events.',
    }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    authUrl,
  });
}
