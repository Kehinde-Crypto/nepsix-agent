import { CalendarEvent } from '@/types';

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-1',
    title: 'Sprint Kickoff & Planning',
    description: 'Sprint 24 backlog review, priority alignment, and ticket assignment.',
    startTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(), // Starts in 45 mins
    endTime: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
    attendees: [
      { email: 'sarah@example.com', displayName: 'Sarah Connor' },
      { email: 'alex@example.com', displayName: 'Alex Mercer' },
      { email: 'dev-team@company.internal', displayName: 'Dev Engineering Team' },
    ],
    meetingLink: 'https://meet.google.com/npx-sprint-kick',
  },
  {
    id: 'evt-2',
    title: 'Client Demo & Architecture Review',
    description: 'Present Phase 1 and Phase 2 agent architecture to client team.',
    startTime: new Date(Date.now() + 180 * 60 * 1000).toISOString(), // Starts in 3 hours
    endTime: new Date(Date.now() + 240 * 60 * 1000).toISOString(),
    attendees: [
      { email: 'john.client@enterprise.com', displayName: 'John Doe', phone: '+15550192834' },
    ],
    meetingLink: 'https://meet.google.com/abc-client-demo',
  },
  {
    id: 'evt-3',
    title: 'Weekly Leadership Standup',
    description: 'Cross-functional sync on product milestones and roadmap.',
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
    endTime: new Date(Date.now() + 24.5 * 60 * 60 * 1000).toISOString(),
    attendees: [
      { email: 'leadership@company.internal', displayName: 'Leadership Team' },
    ],
    meetingLink: 'https://meet.google.com/lead-standup-sync',
  },
];
