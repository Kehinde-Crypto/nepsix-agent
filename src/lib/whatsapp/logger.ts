import { MessageLog } from '@/types';

let logs: MessageLog[] = [
  {
    id: 'log-1',
    triggerId: 'seed-1',
    recipientName: 'Dev Engineering Team',
    recipientTarget: '120363024892@g.us',
    targetType: 'group',
    content: 'Daily standup begins in 10 mins. Meeting Link: https://meet.google.com/xyz',
    sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: 'sent',
  },
  {
    id: 'log-2',
    triggerId: 'seed-2',
    recipientName: 'John Doe',
    recipientTarget: '+1 (555) 019-2834',
    targetType: 'individual',
    content: 'Thank you for attending the onboarding call. Review recording here: https://meet.google.com/xyz',
    sentAt: 'Yesterday, 17:05',
    status: 'sent',
  },
];

export function getDeliveryLogs(): MessageLog[] {
  return [...logs];
}

export function addDeliveryLog(log: MessageLog): void {
  logs.unshift(log);
}
