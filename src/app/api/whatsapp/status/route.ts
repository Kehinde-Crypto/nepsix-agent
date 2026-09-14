import { NextResponse } from 'next/server';
import { defaultWhatsAppAdapter } from '@/lib/whatsapp/adapter';

export const dynamic = 'force-dynamic';

export async function GET() {
  const isConnected = await defaultWhatsAppAdapter.isConnected();
  return NextResponse.json({
    success: true,
    data: {
      provider: defaultWhatsAppAdapter.name,
      connected: isConnected,
      supportsGroups: true,
      supportsDirect: true,
    },
  });
}
