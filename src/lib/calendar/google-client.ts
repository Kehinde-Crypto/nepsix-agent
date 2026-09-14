import { google } from 'googleapis';
import { CalendarEvent } from '@/types';
import { INITIAL_CALENDAR_EVENTS } from './mock-events';

// In-memory or local storage for OAuth tokens
interface StoredTokens {
  access_token?: string | null;
  refresh_token?: string | null;
  expiry_date?: number | null;
  token_type?: string | null;
}

let storedTokens: StoredTokens | null = null;

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly',
];

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/callback';

  if (!clientId || !clientSecret) {
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function getGoogleAuthUrl(): string | null {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) return null;

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
}

export async function handleOAuthCode(code: string): Promise<boolean> {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) return false;

  const { tokens } = await oauth2Client.getToken(code);
  storedTokens = tokens;
  return true;
}

export function isCalendarConnected(): boolean {
  return storedTokens !== null && !!storedTokens.access_token;
}

export function disconnectCalendar(): void {
  storedTokens = null;
}

export async function fetchUpcomingCalendarEvents(): Promise<{
  connected: boolean;
  events: CalendarEvent[];
}> {
  const oauth2Client = getOAuth2Client();

  if (!oauth2Client || !storedTokens?.access_token) {
    // Return sample/mock synced events when not authenticated
    return {
      connected: false,
      events: INITIAL_CALENDAR_EVENTS,
    };
  }

  try {
    oauth2Client.setCredentials(storedTokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const now = new Date().toISOString();
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now,
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const items = res.data.items || [];
    const formattedEvents: CalendarEvent[] = items.map((item, idx) => ({
      id: item.id || `gcal-${idx}`,
      title: item.summary || 'Untitled Meeting',
      description: item.description || '',
      startTime: item.start?.dateTime || item.start?.date || new Date().toISOString(),
      endTime: item.end?.dateTime || item.end?.date || new Date().toISOString(),
      attendees: (item.attendees || []).map((a) => ({
        email: a.email || '',
        displayName: a.displayName || a.email || '',
      })),
      meetingLink: item.hangoutLink || item.location || '',
    }));

    return {
      connected: true,
      events: formattedEvents.length > 0 ? formattedEvents : INITIAL_CALENDAR_EVENTS,
    };
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    return {
      connected: false,
      events: INITIAL_CALENDAR_EVENTS,
    };
  }
}
