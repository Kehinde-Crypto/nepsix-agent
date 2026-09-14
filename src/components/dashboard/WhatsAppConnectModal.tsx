'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  QrCode, 
  CheckCircle2, 
  Smartphone, 
  RefreshCw, 
  Send, 
  LogOut, 
  AlertCircle,
  Users
} from 'lucide-react';
import { WhatsAppSessionState } from '@/lib/whatsapp/baileys-session';

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (status: string) => void;
}

export function WhatsAppConnectModal({
  isOpen,
  onClose,
  onStatusChange,
}: WhatsAppConnectModalProps) {
  const [session, setSession] = useState<WhatsAppSessionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testTarget, setTestTarget] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from WhatsApp Agent! 🤖');
  const [sendFeedback, setSendFeedback] = useState<string | null>(null);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/whatsapp/session');
      const data = await res.json();
      if (data.success && data.data) {
        setSession(data.data);
        if (onStatusChange) {
          onStatusChange(data.data.status);
        }
      }
    } catch (err) {
      console.error('Failed to fetch session:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchSession();
    // Poll every 2 seconds while modal is open to detect QR scan completion
    const interval = setInterval(fetchSession, 2000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleInitSession = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/whatsapp/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'init' }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSession(data.data);
      }
    } catch (err) {
      console.error('Failed to init session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/whatsapp/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
      await fetchSession();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendTestMessage = async () => {
    if (!testTarget.trim()) return;

    setSendFeedback('Sending...');
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testTarget,
          message: testMessage,
          isGroup: testTarget.includes('-') || testTarget.endsWith('@g.us'),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSendFeedback('Message dispatched successfully to WhatsApp!');
        setTimeout(() => setSendFeedback(null), 5000);
      } else {
        setSendFeedback(`Failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setSendFeedback(`Error: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl max-w-md w-full overflow-hidden shadow-2xl space-y-4">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-elevated/40">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">WhatsApp Web Linking (Baileys)</h3>
              <p className="text-[11px] text-text-muted">Direct Session for Groups & Individuals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-elevated border border-border">
            <div className="flex items-center gap-2">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  session?.status === 'connected'
                    ? 'bg-state-success animate-pulse'
                    : session?.status === 'qr_ready'
                    ? 'bg-state-warning animate-ping'
                    : 'bg-text-muted'
                }`}
              />
              <span className="text-xs font-medium text-text-primary capitalize">
                Status: {session?.status || 'Disconnected'}
              </span>
            </div>
            <button
              onClick={fetchSession}
              className="text-text-muted hover:text-primary transition-colors text-xs flex items-center gap-1"
              title="Refresh"
            >
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>

          {/* Connected View */}
          {session?.status === 'connected' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-state-success/15 border border-state-success/30 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-state-success mx-auto" />
                <h4 className="font-semibold text-sm text-white">WhatsApp Device Linked!</h4>
                <p className="text-xs text-text-muted">
                  Connected as <span className="text-primary font-mono font-medium">{session.userName || session.userJid}</span>
                </p>
                <p className="text-[11px] text-text-muted">
                  Ready to send automated messages to individual numbers and WhatsApp groups.
                </p>
              </div>

              {/* Quick Test Dispatch */}
              <div className="p-3.5 rounded-xl bg-elevated/60 border border-border space-y-2.5">
                <h5 className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <Send className="h-3.5 w-3.5 text-primary" /> Send Quick Test Message
                </h5>
                <input
                  type="text"
                  placeholder="Target Phone (e.g. +1234567890) or Group JID"
                  value={testTarget}
                  onChange={(e) => setTestTarget(e.target.value)}
                  className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
                <input
                  type="text"
                  placeholder="Message body"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="w-full bg-base border border-border rounded-lg px-3 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary"
                />
                <button
                  onClick={handleSendTestMessage}
                  disabled={!testTarget.trim()}
                  className="w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-black font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" /> Dispatch Real WhatsApp Message
                </button>
                {sendFeedback && (
                  <p className="text-xs text-center text-primary font-medium">{sendFeedback}</p>
                )}
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full py-2 rounded-lg bg-state-error/15 hover:bg-state-error/25 text-state-error border border-state-error/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" /> Disconnect & Unlink Device
              </button>
            </div>
          )}

          {/* QR Code Scan View */}
          {session?.status === 'qr_ready' && session.qrDataUrl && (
            <div className="space-y-4 text-center">
              <div className="bg-white p-3 rounded-2xl inline-block shadow-lg mx-auto">
                <img
                  src={session.qrDataUrl}
                  alt="WhatsApp QR Code"
                  className="w-56 h-56 mx-auto rounded-lg"
                />
              </div>

              <div className="space-y-1.5 text-xs text-text-muted text-left bg-elevated/80 p-3.5 rounded-xl border border-border">
                <p className="font-semibold text-white">How to scan with your phone:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-text-muted">
                  <li>Open <span className="text-primary font-medium">WhatsApp</span> on your phone.</li>
                  <li>Tap <span className="text-white">Settings</span> or the 3 dots menu.</li>
                  <li>Tap <span className="text-white">Linked Devices</span> → <span className="text-white">Link a Device</span>.</li>
                  <li>Scan the QR code above.</li>
                </ol>
              </div>
            </div>
          )}

          {/* Disconnected / Initial State */}
          {session?.status !== 'connected' && session?.status !== 'qr_ready' && (
            <div className="space-y-4 text-center py-4">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mx-auto">
                <Smartphone className="h-8 w-8" />
              </div>

              <div className="space-y-1">
                <h4 className="font-semibold text-sm text-white">Link WhatsApp via QR Code</h4>
                <p className="text-xs text-text-muted max-w-xs mx-auto">
                  Scan a QR code with your WhatsApp app to enable direct messaging to individuals and groups without needing API keys.
                </p>
              </div>

              <button
                onClick={handleInitSession}
                disabled={isLoading}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-black font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generating WhatsApp QR Code...</span>
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    <span>Generate QR Code</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
