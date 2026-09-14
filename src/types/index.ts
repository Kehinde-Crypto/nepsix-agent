export type RecipientType = 'individual' | 'group';

export interface Recipient {
  id: string;
  name: string;
  type: RecipientType;
  phone?: string; // E.164 international format e.g. +1234567890
  jid?: string;   // WhatsApp JID e.g. 123456789-group@g.us
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  attendees?: {
    email: string;
    displayName?: string;
    phone?: string;
  }[];
  meetingLink?: string;
}

export type ConditionTiming = 'before_event' | 'at_event_start' | 'after_event' | 'exact_time';

export interface TriggerCondition {
  timing: ConditionTiming;
  offsetMinutes: number; // e.g., 15 for 15 minutes before, 0 for at start
}

export type TriggerStatus = 'pending' | 'triggered' | 'sent' | 'failed' | 'cancelled';

export interface CalendarTrigger {
  id: string;
  eventId?: string;
  eventTitle: string;
  condition: TriggerCondition;
  scheduledTime: string; // ISO 8601 when the message should be fired
  recipient: Recipient;
  messageTemplate: string;
  renderedMessage: string;
  status: TriggerStatus;
  createdAt: string;
  sentAt?: string;
  error?: string;
}

export interface MessageLog {
  id: string;
  triggerId?: string;
  recipientName: string;
  recipientTarget: string; // Phone number or group JID
  targetType: RecipientType;
  content: string;
  sentAt: string;
  status: 'sent' | 'failed';
  error?: string;
}

export interface AgentAction {
  label: string;
  action: 'schedule_trigger' | 'sync_calendar' | 'open_whatsapp_link' | 'quick_reply';
  payload?: any;
}

export interface AgentMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
  actions?: AgentAction[];
  triggerPreview?: CalendarTrigger;
}

export interface WhatsAppAdapter {
  name: string;
  sendMessage(to: string, message: string, isGroup?: boolean): Promise<{ success: boolean; messageId?: string; error?: string }>;
  generateClickToChatUrl(phone: string, message: string): string;
  isConnected(): Promise<boolean>;
}
