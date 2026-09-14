import { NextResponse } from 'next/server';
import { getDeliveryLogs } from '@/lib/whatsapp/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  const logs = getDeliveryLogs();
  return NextResponse.json({
    success: true,
    data: logs,
  });
}
