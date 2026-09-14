import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  WASocket,
} from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import pino from 'pino';
import path from 'path';
import fs from 'fs';

export type WhatsAppSessionStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected';

export interface WhatsAppSessionState {
  status: WhatsAppSessionStatus;
  qrDataUrl: string | null;
  userJid: string | null;
  userName: string | null;
  lastUpdated: string;
  error?: string;
}

const AUTH_FOLDER = path.join(process.cwd(), '.baileys_auth');

// Singleton in-memory state
let sock: WASocket | null = null;
let isInitializing = false;
let sessionState: WhatsAppSessionState = {
  status: 'disconnected',
  qrDataUrl: null,
  userJid: null,
  userName: null,
  lastUpdated: new Date().toISOString(),
};

export function getWhatsAppSessionState(): WhatsAppSessionState {
  return { ...sessionState };
}

export async function initBaileysSession(): Promise<WhatsAppSessionState> {
  if (sock && sessionState.status === 'connected') {
    return sessionState;
  }

  if (isInitializing) {
    return sessionState;
  }

  isInitializing = true;
  sessionState.status = 'connecting';
  sessionState.lastUpdated = new Date().toISOString();

  try {
    if (!fs.existsSync(AUTH_FOLDER)) {
      fs.mkdirSync(AUTH_FOLDER, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
    const { version } = await fetchLatestBaileysVersion();

    const logger = pino({ level: 'silent' });

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      logger,
      browser: ['NepSix WhatsApp Agent', 'Chrome', '1.0.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        try {
          const qrDataUrl = await QRCode.toDataURL(qr, { margin: 2, scale: 8 });
          sessionState.status = 'qr_ready';
          sessionState.qrDataUrl = qrDataUrl;
          sessionState.lastUpdated = new Date().toISOString();
        } catch (qrErr) {
          console.error('[Baileys] Error generating QR code image:', qrErr);
        }
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as any)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

        console.log(`[Baileys] Connection closed. Status: ${statusCode}, Should Reconnect: ${shouldReconnect}`);

        sessionState.status = 'disconnected';
        sessionState.qrDataUrl = null;
        sessionState.userJid = null;
        sessionState.userName = null;
        sessionState.lastUpdated = new Date().toISOString();
        sock = null;
        isInitializing = false;

        if (shouldReconnect) {
          setTimeout(() => {
            initBaileysSession();
          }, 3000);
        }
      } else if (connection === 'open') {
        console.log('[Baileys] WhatsApp connected successfully!');
        const user = sock?.user;
        sessionState.status = 'connected';
        sessionState.qrDataUrl = null;
        sessionState.userJid = user?.id || null;
        sessionState.userName = user?.name || user?.notify || 'Connected WhatsApp User';
        sessionState.lastUpdated = new Date().toISOString();
        isInitializing = false;
      }
    });

    isInitializing = false;
    return sessionState;
  } catch (err: any) {
    console.error('[Baileys] Initialization error:', err);
    sessionState.status = 'disconnected';
    sessionState.error = err.message;
    sessionState.lastUpdated = new Date().toISOString();
    isInitializing = false;
    sock = null;
    return sessionState;
  }
}

export async function sendBaileysMessage(
  to: string,
  text: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!sock || sessionState.status !== 'connected') {
    return {
      success: false,
      error: 'WhatsApp is not connected. Please scan the QR code to connect.',
    };
  }

  try {
    let jid = to.trim();

    // If it's a group: ensure it ends with @g.us
    if (jid.includes('-') && !jid.endsWith('@g.us')) {
      jid = `${jid}@g.us`;
    } else if (!jid.includes('@')) {
      // Clean phone number to digits only
      const cleanPhone = jid.replace(/[^\d]/g, '');
      jid = `${cleanPhone}@s.whatsapp.net`;
    }

    const result = await sock.sendMessage(jid, { text });

    return {
      success: true,
      messageId: result?.key?.id || `msg-${Date.now()}`,
    };
  } catch (err: any) {
    console.error('[Baileys] Failed to send message:', err);
    return {
      success: false,
      error: err.message || 'Failed to send WhatsApp message',
    };
  }
}

export async function logoutBaileysSession(): Promise<boolean> {
  try {
    if (sock) {
      await sock.logout();
      sock = null;
    }
    if (fs.existsSync(AUTH_FOLDER)) {
      fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
    }
    sessionState = {
      status: 'disconnected',
      qrDataUrl: null,
      userJid: null,
      userName: null,
      lastUpdated: new Date().toISOString(),
    };
    return true;
  } catch (err) {
    console.error('[Baileys] Error logging out:', err);
    return false;
  }
}
