import { NextRequest, NextResponse } from 'next/server';
import {
  getWhatsAppSessionState,
  initBaileysSession,
  logoutBaileysSession,
} from '@/lib/whatsapp/baileys-session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const state = getWhatsAppSessionState();
  return NextResponse.json({
    success: true,
    data: state,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'init') {
      const state = await initBaileysSession();
      return NextResponse.json({
        success: true,
        data: state,
      });
    }

    if (action === 'logout') {
      const success = await logoutBaileysSession();
      return NextResponse.json({
        success,
        message: 'Logged out of WhatsApp session',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Unknown action specified' },
      { status: 400 }
    );
  } catch (err: any) {
    console.error('WhatsApp session API error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Session error' },
      { status: 500 }
    );
  }
}
