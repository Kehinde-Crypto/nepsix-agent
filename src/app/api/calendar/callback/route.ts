import { NextRequest, NextResponse } from 'next/server';
import { handleOAuthCode } from '@/lib/calendar/google-client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', req.url));
  }

  try {
    const success = await handleOAuthCode(code);
    if (success) {
      return NextResponse.redirect(new URL('/?calendar=connected', req.url));
    } else {
      return NextResponse.redirect(new URL('/?error=oauth_failed', req.url));
    }
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(new URL('/?error=token_exchange_failed', req.url));
  }
}
