'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2, 
  ChevronDown, 
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { AgentMessage, CalendarTrigger } from '@/types';

interface ChatWidgetProps {
  onTriggerCreated?: (trigger: CalendarTrigger) => void;
}

export function ChatWidget({ onTriggerCreated }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AgentMessage[]>([
    {
      id: 'welcome',
      sender: 'agent',
      content: "Hello! I am your **WhatsApp Calendar Agent**. You can tell me what to remind people about, and I will sync with your Google Calendar and dispatch messages to your WhatsApp contacts or groups.\n\nTry asking me to remind a team before a meeting!",
      timestamp: new Date().toISOString(),
      actions: [
        {
          label: '📅 View Upcoming Events',
          action: 'quick_reply',
          payload: 'View upcoming calendar events',
        },
        {
          label: '⏰ Remind Dev Team 15m Before',
          action: 'quick_reply',
          payload: 'Remind the Dev Team 15 minutes before Sprint Kickoff',
        },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmedTriggers, setConfirmedTriggers] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: AgentMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: [...messages, userMessage],
        }),
      });

      const data = await response.json();
      if (data.success && data.data?.message) {
        setMessages((prev) => [...prev, data.data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sender: 'agent',
            content: "I encountered an issue understanding that request. Could you rephrase it or pick one of the suggestions below?",
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          sender: 'agent',
          content: "Network error connecting to the agent. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmTrigger = async (trigger: CalendarTrigger) => {
    try {
      const res = await fetch('/api/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmedTriggers((prev) => ({ ...prev, [trigger.id]: true }));
        if (onTriggerCreated) {
          onTriggerCreated(trigger);
        }
      }
    } catch (err) {
      console.error('Failed to confirm trigger:', err);
    }
  };

  return (
    <>
      {/* 1. Floating Launch Bubble (Desktop & Mobile trigger) */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open WhatsApp Agent Assistant"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary-hover text-black shadow-xl shadow-primary/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95 group relative"
          >
            <Bot className="h-7 w-7 text-black transition-transform group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 h-3.5 w-3.5 bg-state-success rounded-full border-2 border-base"></span>
          </button>
        </div>
      )}

      {/* 2. Responsive Modal / Popover */}
      {isOpen && (
        <>
          {/* Mobile Backdrop Overlay (only on small screens <640px) */}
          <div 
            onClick={() => setIsOpen(false)}
            className="sm:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Chat Container: Bottom sheet on mobile, floating box on desktop */}
          <div
            className={`
              fixed z-50 transition-all duration-300 flex flex-col bg-surface border border-border shadow-2xl
              /* Mobile phone modal behavior: bottom drawer */
              bottom-0 left-0 right-0 max-h-[90vh] h-[85vh] rounded-t-3xl sm:rounded-2xl
              /* Desktop behavior: floating window at bottom-right */
              sm:bottom-6 sm:right-6 sm:left-auto sm:w-[400px] sm:h-[600px] sm:max-h-[85vh]
            `}
          >
            {/* Top Drag handle indicator for mobile sheet */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-surface/90 backdrop-blur rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    WhatsApp Agent
                    <span className="h-2 w-2 rounded-full bg-state-success"></span>
                  </h3>
                  <p className="text-[11px] text-text-muted flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-primary" /> Synced with Google Calendar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-elevated text-text-muted hover:text-text-primary transition-colors"
                  aria-label="Close chat"
                >
                  <ChevronDown className="h-5 w-5 sm:hidden" />
                  <X className="h-5 w-5 hidden sm:block" />
                </button>
              </div>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  {/* Bubble */}
                  <div
                    className={`
                      max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed
                      ${
                        msg.sender === 'user'
                          ? 'bg-primary text-black font-medium rounded-tr-sm'
                          : 'bg-elevated text-text-primary border border-border/80 rounded-tl-sm shadow-sm'
                      }
                    `}
                  >
                    <div className="whitespace-pre-line">{msg.content}</div>
                  </div>

                  {/* Inline Trigger Preview Card (if generated by agent) */}
                  {msg.triggerPreview && (
                    <div className="w-full max-w-[92%] mt-2 p-3.5 rounded-xl bg-elevated/90 border border-primary/40 shadow-lg space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> Proposed Trigger
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-state-warning/20 text-state-warning font-mono">
                          {msg.triggerPreview.condition.timing === 'at_event_start' ? 'At Event Start' : `${msg.triggerPreview.condition.offsetMinutes}m Before`}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-text-muted" />
                          <span className="font-medium text-white">{msg.triggerPreview.eventTitle}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-3.5 w-3.5 text-text-muted" />
                          <span className="text-text-muted">Target: </span>
                          <span className="font-mono text-primary font-medium">
                            {msg.triggerPreview.recipient.name} ({msg.triggerPreview.recipient.type === 'group' ? 'WhatsApp Group' : 'Direct'})
                          </span>
                        </div>
                      </div>

                      {/* Rendered WhatsApp Message Preview */}
                      <div className="p-2 rounded bg-base/90 border border-border/80 text-[11px] font-mono text-text-muted">
                        &quot;{msg.triggerPreview.renderedMessage}&quot;
                      </div>

                      {/* Action button */}
                      <div>
                        {confirmedTriggers[msg.triggerPreview.id] ? (
                          <div className="w-full py-2 rounded-lg bg-state-success/15 border border-state-success/30 text-state-success text-xs font-medium flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" /> Trigger Scheduled on WhatsApp
                          </div>
                        ) : (
                          <button
                            onClick={() => handleConfirmTrigger(msg.triggerPreview!)}
                            className="w-full py-2 rounded-lg bg-primary hover:bg-primary-hover text-black text-xs font-semibold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                          >
                            <CheckCircle2 className="h-4 w-4" /> Approve & Schedule Trigger
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Pills */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                      {msg.actions.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(act.payload || act.label)}
                          className="px-2.5 py-1 text-[11px] rounded-full bg-elevated hover:bg-elevated/80 border border-border text-text-muted hover:text-text-primary transition-colors text-left"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-text-muted p-2">
                  <Bot className="h-4 w-4 text-primary animate-pulse" />
                  <span>Agent is analyzing calendar & conditions...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-border bg-surface/80 backdrop-blur rounded-b-2xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. Remind Dev Team 15m before Sprint..."
                  className="flex-1 bg-elevated border border-border rounded-xl px-3.5 py-2.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                  className="h-9 w-9 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-40 text-black flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
}
