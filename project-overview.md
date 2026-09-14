# WhatsApp Agent (WAPulse / NepSix Agent)

## Overview

WhatsApp Agent is an intelligent conversational widget and automation system that helps individuals and businesses schedule and dispatch messages to **individuals and groups** on WhatsApp. It connects directly with **Google Calendar** to monitor upcoming events, evaluate timing conditions (e.g. 15 minutes before meeting, upon event end, or custom time rules), and automatically trigger targeted WhatsApp messages without manual intervention.

## Goals

1. **Conversational Widget**: Provide an embeddable and floating AI chat widget where users can talk to the agent to setup reminders, schedule messages, or craft announcements.
2. **Group & Individual Delivery**: Seamlessly deliver messages to both individual phone numbers and WhatsApp groups (`@g.us`).
3. **Google Calendar Trigger Engine**: Sync with Google Calendar to automatically read scheduled events, match contacts/groups, and trigger WhatsApp messages based on event timing conditions.
4. **Condition & Template Rules**: Allow users to set dynamic message templates (e.g. `"Hi {name}, our meeting '{event_title}' starts in 15 minutes at {event_time}. Here is the link: {meeting_link}"`).

## Core User Flow

1. **Connect & Setup**: User links their WhatsApp account (via QR code / session or API) and authenticates Google Calendar with OAuth.
2. **Interact via Widget or Dashboard**:
   - User or website visitor interacts with the floating widget.
   - Example prompt: *"Remind the Dev Team group 10 minutes before our Sprint Review today."*
   - Agent parses the intent, confirms the Google Calendar event and target group/phone number, and registers the trigger.
3. **Automated Triggering**:
   - The background scheduler monitors Google Calendar events and time-based triggers.
   - When a condition matches (e.g. 15 minutes prior to event), the scheduler renders the message template with event details.
4. **Dispatch to WhatsApp**:
   - The system dispatches the message to the WhatsApp recipient (individual or group) via the WhatsApp adapter.
   - Delivery status and logs are recorded and shown in the dashboard.

## Features

### AI Conversational Widget
- Floating widget with expandable chat interface.
- Conversational intent extraction (target recipient, schedule time, calendar event association, message body).
- Quick action pills ("Sync Calendar", "Schedule Reminder", "Broadcast to Group").

### Google Calendar Sync & Triggers
- Google OAuth2 integration for reading calendars and events.
- Configurable condition presets:
  - *Before Event* (e.g. 1 hour, 30 min, 10 min before).
  - *At Event Start* (e.g. send meeting link).
  - *After Event End* (e.g. follow-up feedback form).
- Recipient mapping (attendee email/phone matching or pre-configured WhatsApp group).

### WhatsApp Multi-Target Dispatcher
- Direct phone number messaging (E.164 format: `+1234567890`).
- WhatsApp Group messaging (`<group-id>@g.us`).
- Multi-provider architecture:
  - Session Provider (Baileys / linked device multi-device protocol for individual + group support).
  - Cloud API Provider (Meta Cloud API / Twilio for 1-to-1 official messages).
  - Click-to-Chat fallback link generator (`wa.me`).

## Scope

### In Scope
- Next.js web application with dashboard and embeddable floating widget.
- Google Calendar API integration (OAuth2 flow, event fetching, webhook/polling).
- Rule and condition evaluation engine (cron/background scheduler).
- WhatsApp adapter interface with session and Cloud API support.
- Local SQLite / Prisma database for storing triggers, schedules, calendar sync status, and message logs.

### Out of Scope
- Direct voice call automation over WhatsApp.
- Mass spam broadcasting violating WhatsApp Terms of Service.
- Multi-tenant enterprise billing (initial scaffold focuses on single/team instance).

## Success Criteria

1. A user can open the chat widget, type a natural scheduling request, and have the agent parse and register the trigger.
2. Google Calendar events are fetched and mapped to automated trigger rules.
3. Trigger rules fire at the designated condition time and successfully dispatch a message to a WhatsApp individual or group.
4. Message logs and delivery states are recorded and visible in the dashboard.
