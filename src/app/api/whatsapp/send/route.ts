import { NextRequest, NextResponse } from 'next/server';
import { defaultWhatsAppAdapter } from '@/lib/whatsapp/adapter';
import { addDeliveryLog } from '@/lib/whatsapp/logger';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, message, isGroup } = body;

    if (!to || !message) {
      return NextResponse.json(
        { success: false, error: 'Target recipient (to) and message are required.' },
        { status: 400 }
      );
    }

    const result = await defaultWhatsAppAdapter.sendMessage(to, message, isGroup);

    if (result.success) {
      addDeliveryLog({
        id: `log-${Date.now()}`,
        recipientName: to,
        recipientTarget: to,
        targetType: result.isGroup ? 'group' : 'individual',
        content: message,
        sentAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
      });
    }

    return NextResponse.json({
      success: result.success,
      data: result,
      error: result.error,
    });
  } catch (err: any) {
    console.error('WhatsApp send error:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to dispatch message' },
      { status: 500 }
    );
  }
}
