import { CalendarTrigger } from '@/types';

// In-memory trigger store for development and runtime
let triggers: CalendarTrigger[] = [
  {
    id: 'trig-1',
    eventId: 'evt-1',
    eventTitle: 'Sprint Kickoff & Planning',
    condition: {
      timing: 'before_event',
      offsetMinutes: 15,
    },
    scheduledTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 15m before event start
    recipient: {
      id: 'grp-1',
      name: 'Dev Engineering Team',
      type: 'group',
      jid: '120363024892@g.us',
    },
    messageTemplate: 'Reminder: Sprint Kickoff begins in 15 minutes at {time}. Meeting link: {link}',
    renderedMessage: 'Reminder: Sprint Kickoff begins in 15 minutes. Meeting link: https://meet.google.com/npx-sprint-kick',
    status: 'pending',
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: 'trig-2',
    eventId: 'evt-2',
    eventTitle: 'Client Demo & Architecture Review',
    condition: {
      timing: 'at_event_start',
      offsetMinutes: 0,
    },
    scheduledTime: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
    recipient: {
      id: 'ind-1',
      name: 'John Doe',
      type: 'individual',
      phone: '+15550192834',
    },
    messageTemplate: 'Hi John, our Client Demo is starting now. Join here: {link}',
    renderedMessage: 'Hi John, our Client Demo is starting now. Join here: https://meet.google.com/abc-client-demo',
    status: 'pending',
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

export function getTriggers(): CalendarTrigger[] {
  return [...triggers];
}

export function addTrigger(trigger: CalendarTrigger): CalendarTrigger {
  // Check if exists
  const existingIdx = triggers.findIndex((t) => t.id === trigger.id);
  if (existingIdx >= 0) {
    triggers[existingIdx] = trigger;
  } else {
    triggers.unshift(trigger);
  }
  return trigger;
}

export function updateTriggerStatus(id: string, status: CalendarTrigger['status']): boolean {
  const trig = triggers.find((t) => t.id === id);
  if (trig) {
    trig.status = status;
    if (status === 'sent') {
      trig.sentAt = new Date().toISOString();
    }
    return true;
  }
  return false;
}
