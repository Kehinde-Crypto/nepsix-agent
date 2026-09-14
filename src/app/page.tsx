'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Sliders,
  Send,
  ExternalLink,
  Bot,
  RefreshCw,
  Zap,
  Radio
} from 'lucide-react';
import { ChatWidget } from '@/components/widget/ChatWidget';
import { WhatsAppConnectModal } from '@/components/dashboard/WhatsAppConnectModal';
import { CalendarTrigger, CalendarEvent, MessageLog } from '@/types';

export default function DashboardPage() {
  const [triggers, setTriggers] = useState<CalendarTrigger[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [whatsAppStatus, setWhatsAppStatus] = useState<string>('disconnected');

  // Fetch all live dashboard data
  const refreshDashboardData = async () => {
    setIsSyncing(true);
    try {
      // 1. Fetch triggers
      const trigRes = await fetch('/api/triggers');
      const trigData = await trigRes.json();
      if (trigData.success && trigData.data) {
        setTriggers(trigData.data);
      }

      // 2. Fetch calendar events & connection status
      const calRes = await fetch('/api/calendar/events');
      const calData = await calRes.json();
      if (calData.success && calData.data) {
        setEvents(calData.data);
        setCalendarConnected(calData.connected);
      }

      // 3. Fetch delivery logs
      const logRes = await fetch('/api/whatsapp/logs');
      const logData = await logRes.json();
      if (logData.success && logData.data) {
        setLogs(logData.data);
      }

      // 4. Fetch WhatsApp session status
      const waRes = await fetch('/api/whatsapp/session');
      const waData = await waRes.json();
      if (waData.success && waData.data) {
        setWhatsAppStatus(waData.data.status);
      }
    } catch (err) {
      console.error('Failed to refresh dashboard data:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshDashboardData();
    // Auto-poll every 10 seconds for real-time status
    const interval = setInterval(refreshDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectCalendar = async () => {
    try {
      const res = await fetch('/api/calendar/auth');
      const data = await res.json();
      if (data.success && data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        alert('Google OAuth credentials not configured in .env yet. Currently using synchronized simulated events.');
      }
    } catch (err) {
      console.error('Calendar auth error:', err);
      alert('Unable to initialize Google OAuth flow.');
    }
  };

  const handleForceDispatch = async (triggerId: string) => {
    setDispatchingId(triggerId);
    try {
      const res = await fetch('/api/scheduler/tick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceTriggerId: triggerId }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshDashboardData();
      }
    } catch (err) {
      console.error('Failed to force trigger dispatch:', err);
    } finally {
      setDispatchingId(null);
    }
  };

  const handleTriggerCreated = (newTrigger: CalendarTrigger) => {
    setTriggers((prev) => [newTrigger, ...prev.filter((t) => t.id !== newTrigger.id)]);
    refreshDashboardData();
  };

  return (
    <div className="min-h-screen bg-base text-text-primary flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-lg tracking-tight flex items-center gap-2">
              WhatsApp Agent <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30 font-mono">v0.4-integrated</span>
            </h1>
            <p className="text-xs text-text-muted">Calendar Condition & Multi-Target Messaging</p>
          </div>
        </div>

        {/* Integration Status Badges */}
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={refreshDashboardData}
            disabled={isSyncing}
            className="p-2 rounded-lg bg-elevated border border-border text-text-muted hover:text-text-primary transition-colors flex items-center gap-1.5"
            title="Sync status"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin text-primary' : ''}`} />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated border border-border">
            <span className={`h-2 w-2 rounded-full ${calendarConnected ? 'bg-state-success animate-pulse' : 'bg-state-warning'}`}></span>
            <span className="text-text-muted">Google Calendar:</span>
            <span className="font-medium text-text-primary">
              {calendarConnected ? 'OAuth Live' : 'Simulated'}
            </span>
            {!calendarConnected && (
              <button 
                onClick={handleConnectCalendar}
                className="ml-1 text-[10px] text-primary hover:underline font-semibold"
              >
                Connect
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated border border-border">
            <span
              className={`h-2 w-2 rounded-full ${
                whatsAppStatus === 'connected'
                  ? 'bg-state-success animate-pulse'
                  : whatsAppStatus === 'qr_ready'
                  ? 'bg-state-warning animate-ping'
                  : 'bg-text-muted'
              }`}
            ></span>
            <span className="text-text-muted">WhatsApp:</span>
            <span className="font-medium text-text-primary capitalize">
              {whatsAppStatus === 'connected' ? 'Live Session' : 'Device Unlinked'}
            </span>
            <button
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="ml-1 px-2 py-0.5 rounded bg-primary/20 hover:bg-primary/30 text-primary text-[10px] font-semibold border border-primary/30 transition-colors"
            >
              {whatsAppStatus === 'connected' ? 'Manage' : 'Scan QR'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Banner / Overview Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-surface via-elevated to-surface border border-border relative overflow-hidden">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-medium border border-primary/25">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Phases 1-4 Complete: Widget, Google Calendar & WhatsApp Adapter Active</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Automated WhatsApp Messaging for Individuals & Groups
            </h2>
            <p className="text-sm text-text-muted leading-relaxed">
              Open the floating widget to schedule messages using natural language. The system pairs with Google Calendar, checks timing conditions, and delivers targeted notifications to WhatsApp groups (<span className="text-primary font-mono">@g.us</span>) and direct phone numbers.
            </p>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-4">
            <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Synced Events</p>
              <h3 className="text-xl font-bold">{events.length} Upcoming</h3>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary/10 text-primary border border-primary/20">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Active Triggers</p>
              <h3 className="text-xl font-bold">{triggers.length} Registered</h3>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-4">
            <div className="p-3 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">WhatsApp Dispatcher</p>
              <h3 className="text-xl font-bold text-white">Groups & 1:1</h3>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-border flex items-center gap-4">
            <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-text-muted font-medium">Total Dispatched</p>
              <h3 className="text-xl font-bold text-state-success">{logs.length} Messages</h3>
            </div>
          </div>
        </div>

        {/* Two-Column Grid: Calendar Events vs Active Triggers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Calendar Events */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Google Calendar Events</h3>
              </div>
              <span className="text-xs text-text-muted">Live sync active</span>
            </div>

            <div className="space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="p-3.5 rounded-lg bg-elevated/60 border border-border/80 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-white">{evt.title}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                        {evt.attendees?.some(a => a.displayName?.toLowerCase().includes('team')) ? 'Group Event' : '1-on-1'}
                      </span>
                    </div>
                    <p className="text-xs text-text-muted flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Starts at {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-text-muted">
                      Attendees: <span className="text-text-primary">{evt.attendees?.map(a => a.displayName || a.email).join(', ')}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Triggers */}
          <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Scheduled WhatsApp Triggers ({triggers.length})</h3>
              </div>
              <span className="text-xs text-primary font-medium flex items-center gap-1">
                <Radio className="h-3 w-3 animate-pulse text-state-success" /> Condition Engine Ready
              </span>
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {triggers.length === 0 ? (
                <div className="p-6 text-center text-xs text-text-muted border border-dashed border-border rounded-xl">
                  No active triggers scheduled. Use the chat widget below to create one!
                </div>
              ) : (
                triggers.map((trig) => (
                  <div key={trig.id} className="p-3.5 rounded-lg bg-elevated/60 border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm text-white">
                        {trig.condition.timing === 'at_event_start' ? 'At event start' : `${trig.condition.offsetMinutes}m before`} — {trig.eventTitle}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${trig.status === 'sent' ? 'bg-state-success/20 text-state-success' : 'bg-state-warning/20 text-state-warning'}`}>
                          {trig.status.toUpperCase()}
                        </span>
                        {trig.status === 'pending' && (
                          <button
                            onClick={() => handleForceDispatch(trig.id)}
                            disabled={dispatchingId === trig.id}
                            className="px-2 py-0.5 rounded bg-primary/15 hover:bg-primary/30 text-primary border border-primary/30 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                            title="Test dispatch condition now"
                          >
                            <Zap className="h-2.5 w-2.5" />
                            {dispatchingId === trig.id ? 'Sending...' : 'Test Send'}
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-text-muted flex items-center gap-2">
                      <span>Recipient:</span>
                      <span className="text-primary font-mono font-medium">
                        {trig.recipient.name} ({trig.recipient.type === 'group' ? 'WhatsApp Group @g.us' : 'Direct'})
                      </span>
                    </p>
                    <div className="p-2 rounded bg-base/80 border border-border text-xs font-mono text-text-muted">
                      &quot;{trig.renderedMessage}&quot;
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message Delivery Logs */}
        <div className="p-5 rounded-xl bg-surface border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-state-success" />
              <h3 className="font-semibold text-sm">WhatsApp Dispatch History & Logs ({logs.length})</h3>
            </div>
            <span className="text-xs text-text-muted">Multi-target delivery history</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-2 font-medium">Target Recipient</th>
                  <th className="pb-2 font-medium">Type</th>
                  <th className="pb-2 font-medium">Rendered Message</th>
                  <th className="pb-2 font-medium">Dispatched At</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="py-2.5 font-medium text-text-primary">{log.recipientName}</td>
                    <td className="py-2.5">
                      <span className={`px-1.5 py-0.5 rounded font-mono text-[10px] ${log.targetType === 'group' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {log.targetType === 'group' ? 'Group (@g.us)' : 'Direct Phone'}
                      </span>
                    </td>
                    <td className="py-2.5 text-text-muted font-mono max-w-md truncate">{log.content}</td>
                    <td className="py-2.5 text-text-muted">{log.sentAt}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded bg-state-success/20 text-state-success font-medium">
                        Delivered
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Live Interactive Chat Widget */}
      <ChatWidget onTriggerCreated={handleTriggerCreated} />

      {/* WhatsApp QR Pairing & Test Send Modal */}
      <WhatsAppConnectModal
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        onStatusChange={(newStatus) => setWhatsAppStatus(newStatus)}
      />
    </div>
  );
}
