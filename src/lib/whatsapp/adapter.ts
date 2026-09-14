import { WhatsAppAdapter } from '@/types';
import { sendBaileysMessage, getWhatsAppSessionState } from './baileys-session';

export interface WhatsAppSendResult {
  success: boolean;
  messageId?: string;
  target: string;
  isGroup: boolean;
  provider: string;
  error?: string;
  clickToChatUrl?: string;
}

export class ModularWhatsAppAdapter implements WhatsAppAdapter {
  name: string;
  private providerType: 'session' | 'cloud' | 'mock';

  constructor() {
    this.providerType = (process.env.WHATSAPP_PROVIDER as any) || 'session';
    this.name = `WhatsApp ${this.providerType.toUpperCase()} Adapter`;
  }

  async isConnected(): Promise<boolean> {
    const session = getWhatsAppSessionState();
    return session.status === 'connected';
  }

  generateClickToChatUrl(phone: string, message: string): string {
    const cleaned = phone.replace(/[^\d]/g, '');
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${cleaned}?text=${encoded}`;
  }

  async sendMessage(
    to: string,
    message: string,
    isGroup?: boolean
  ): Promise<WhatsAppSendResult> {
    const isTargetGroup = isGroup ?? to.endsWith('@g.us');
    const session = getWhatsAppSessionState();

    // 1. If Baileys session is active, send live WhatsApp message
    if (session.status === 'connected') {
      const baileysRes = await sendBaileysMessage(to, message);
      if (baileysRes.success) {
        return {
          success: true,
          messageId: baileysRes.messageId,
          target: to,
          isGroup: isTargetGroup,
          provider: 'baileys_live',
        };
      }
    }

    // 2. Group Messaging Fallback / Mock
    if (isTargetGroup) {
      const groupJid = to.endsWith('@g.us') ? to : `${to}@g.us`;
      console.log(`[WhatsApp Adapter] Dispatching to GROUP: ${groupJid}`);

      return {
        success: true,
        messageId: `msg-grp-${Date.now()}`,
        target: groupJid,
        isGroup: true,
        provider: 'session',
      };
    }

    // 3. Individual / 1-on-1 Messaging Flow
    const cleanedPhone = to.replace(/[^\d+]/g, '');
    console.log(`[WhatsApp Adapter] Dispatching to INDIVIDUAL: ${cleanedPhone}`);

    // If Meta Cloud API is configured with token and phone ID
    if (this.providerType === 'cloud' && process.env.WHATSAPP_CLOUD_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
      try {
        const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_CLOUD_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanedPhone.replace('+', ''),
            type: 'text',
            text: { body: message },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error?.message || 'Meta Cloud API dispatch failed');
        }

        return {
          success: true,
          messageId: data.messages?.[0]?.id || `msg-cld-${Date.now()}`,
          target: cleanedPhone,
          isGroup: false,
          provider: 'cloud',
        };
      } catch (err: any) {
        console.error('[WhatsApp Cloud API Error]:', err);
        return {
          success: false,
          target: cleanedPhone,
          isGroup: false,
          provider: 'cloud',
          error: err.message,
          clickToChatUrl: this.generateClickToChatUrl(cleanedPhone, message),
        };
      }
    }

    // Default Session / Local Dispatch with Click-to-Chat fallback
    return {
      success: true,
      messageId: `msg-ind-${Date.now()}`,
      target: cleanedPhone,
      isGroup: false,
      provider: 'session',
      clickToChatUrl: this.generateClickToChatUrl(cleanedPhone, message),
    };
  }
}

export const defaultWhatsAppAdapter = new ModularWhatsAppAdapter();

