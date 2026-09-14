import { AgentMessage, CalendarEvent, CalendarTrigger, Recipient } from '@/types';
import { INITIAL_CALENDAR_EVENTS } from '../calendar/mock-events';

export interface ParseResult {
  message: AgentMessage;
  triggerPreview?: CalendarTrigger;
}

export async function processAgentConversation(
  prompt: string,
  history: AgentMessage[] = []
): Promise<ParseResult> {
  const normalized = prompt.toLowerCase().trim();

  // 1. Quick intent: Show calendar events
  if (
    normalized.includes('view events') ||
    normalized.includes('show events') ||
    normalized.includes('list events') ||
    normalized.includes('calendar events') ||
    normalized.includes('what meetings') ||
    normalized.includes('what events')
  ) {
    const eventSummaries = INITIAL_CALENDAR_EVENTS.map(
      (e, i) =>
        `${i + 1}. **${e.title}** - starts at ${new Date(e.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    ).join('\n');

    return {
      message: {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        content: `Here are your upcoming synced Google Calendar events for today:\n\n${eventSummaries}\n\nWould you like to schedule an automated WhatsApp reminder for any of these?`,
        timestamp: new Date().toISOString(),
        actions: [
          {
            label: '⏰ Remind Dev Team 15m Before Sprint Kickoff',
            action: 'quick_reply',
            payload: 'Remind the Dev Team 15 minutes before Sprint Kickoff',
          },
          {
            label: '📱 Notify John at Client Demo Start',
            action: 'quick_reply',
            payload: 'Send WhatsApp message to John Doe at start of Client Demo',
          },
        ],
      },
    };
  }

  // 2. Intent: Schedule reminder / trigger
  // Check which event matches
  let matchedEvent: CalendarEvent | undefined;
  if (normalized.includes('sprint') || normalized.includes('kickoff') || normalized.includes('next meeting')) {
    matchedEvent = INITIAL_CALENDAR_EVENTS[0];
  } else if (normalized.includes('client') || normalized.includes('demo') || normalized.includes('alex') || normalized.includes('john')) {
    matchedEvent = INITIAL_CALENDAR_EVENTS[1];
  } else if (normalized.includes('standup') || normalized.includes('leadership')) {
    matchedEvent = INITIAL_CALENDAR_EVENTS[2];
  } else {
    // Default to the next upcoming meeting if unspecified
    matchedEvent = INITIAL_CALENDAR_EVENTS[0];
  }

  // Extract timing offset
  let offsetMinutes = 15;
  let timing: 'before_event' | 'at_event_start' | 'after_event' = 'before_event';

  if (normalized.includes('at start') || normalized.includes('starts') || normalized.includes('when it begins')) {
    timing = 'at_event_start';
    offsetMinutes = 0;
  } else if (normalized.includes('after') || normalized.includes('ended')) {
    timing = 'after_event';
    offsetMinutes = 10;
  } else {
    const minutesMatch = normalized.match(/(\d+)\s*(?:min|mins|minute|minutes)/);
    if (minutesMatch && minutesMatch[1]) {
      offsetMinutes = parseInt(minutesMatch[1], 10);
    }
  }

  // Extract target recipient (Group vs Individual)
  let recipient: Recipient;
  const isGroup =
    normalized.includes('group') ||
    normalized.includes('dev team') ||
    normalized.includes('team') ||
    normalized.includes('engineering') ||
    normalized.includes('channel');

  const phoneMatch = prompt.match(/\+?[1-9]\d{1,14}/);

  if (phoneMatch) {
    recipient = {
      id: `ind-${Date.now()}`,
      name: 'Direct Contact',
      type: 'individual',
      phone: phoneMatch[0],
    };
  } else if (isGroup || normalized.includes('sprint')) {
    recipient = {
      id: 'grp-1',
      name: 'Dev Engineering Team',
      type: 'group',
      jid: '120363024892@g.us',
    };
  } else if (normalized.includes('john')) {
    recipient = {
      id: 'ind-1',
      name: 'John Doe (Client)',
      type: 'individual',
      phone: '+15550192834',
    };
  } else {
    recipient = {
      id: 'grp-1',
      name: 'Dev Engineering Team',
      type: 'group',
      jid: '120363024892@g.us',
    };
  }

  // Calculate target dispatch time
  const eventStartTime = new Date(matchedEvent.startTime).getTime();
  const scheduledTimeMs =
    timing === 'before_event'
      ? eventStartTime - offsetMinutes * 60 * 1000
      : timing === 'after_event'
      ? new Date(matchedEvent.endTime).getTime() + offsetMinutes * 60 * 1000
      : eventStartTime;

  const scheduledTime = new Date(scheduledTimeMs).toISOString();

  // Craft message template & rendered message
  const offsetDescription =
    timing === 'at_event_start'
      ? 'at event start'
      : `${offsetMinutes} minutes before`;

  const renderedMessage =
    recipient.type === 'group'
      ? `📢 Reminder for @${recipient.name}: "${matchedEvent.title}" begins in ${offsetMinutes} mins. Meeting Link: ${matchedEvent.meetingLink || 'None'}`
      : `Hi ${recipient.name}, our session "${matchedEvent.title}" starts soon (${new Date(matchedEvent.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}). Link: ${matchedEvent.meetingLink || 'None'}`;

  const trigger: CalendarTrigger = {
    id: `trig-${Date.now()}`,
    eventId: matchedEvent.id,
    eventTitle: matchedEvent.title,
    condition: {
      timing,
      offsetMinutes,
    },
    scheduledTime,
    recipient,
    messageTemplate: renderedMessage,
    renderedMessage,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const responseText = `I have parsed your request! Here is the trigger draft for your Google Calendar event **"${matchedEvent.title}"**.\n\nI will dispatch this to **${recipient.name}** (${recipient.type === 'group' ? 'WhatsApp Group @g.us' : recipient.phone}) **${offsetDescription}**.\n\nPlease review and approve below:`;

  return {
    message: {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      content: responseText,
      timestamp: new Date().toISOString(),
      triggerPreview: trigger,
      actions: [
        {
          label: '📅 Choose a different meeting',
          action: 'quick_reply',
          payload: 'View upcoming calendar events',
        },
      ],
    },
    triggerPreview: trigger,
  };
}
