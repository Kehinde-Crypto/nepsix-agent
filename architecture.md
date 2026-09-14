# Architecture Context

## Stack

| Layer                | Technology                         | Role                                                      |
| -------------------- | ---------------------------------- | --------------------------------------------------------- |
| Framework            | Next.js 14+ (App Router) + TypeScript | Full-stack application, API routes, and Server Components |
| UI & Styling         | Tailwind CSS + Lucide Icons        | Dashboard, settings interface, and floating chat widget    |
| Agent / AI Engine    | OpenAI / Google Gemini API         | Conversational intent parsing, parameter extraction        |
| Calendar Integration | Google APIs (`googleapis`)         | Google OAuth2 & Google Calendar event sync                |
| Messaging Adapters   | WhatsApp Web Multi-Device / Cloud  | Modular adapter sending to numbers and groups (`@g.us`)   |
| Scheduler / Triggers | Node Scheduler / Cron Engine       | Periodic event checking and condition evaluation          |
| Storage / ORM        | Prisma ORM + SQLite / PostgreSQL   | Event tracking, triggers, contacts, group mappings, logs   |

## System Boundaries

- `src/app/` — Next.js App Router pages (Dashboard, Settings, Widget demo) and API routes (`/api/agent`, `/api/calendar`, `/api/whatsapp`, `/api/triggers`).
- `src/components/widget/` — Embeddable floating chat widget UI, state management, and messaging interface.
- `src/components/dashboard/` — Admin controls for Google Calendar sync, WhatsApp session status, active triggers, and delivery logs.
- `src/lib/agent/` — Conversational agent logic, intent classification, prompt engineering, and parameter extraction.
- `src/lib/calendar/` — Google Calendar client, OAuth2 token handling, event retrieval, and attendee parsing.
- `src/lib/whatsapp/` — WhatsApp adapter interface with implementations (Baileys/Session, Cloud API, `wa.me` generator).
- `src/lib/scheduler/` — Condition matching engine, timing calculation (e.g. before/after event), and dispatch runner.
- `src/lib/db/` — Database client (Prisma/SQLite) and repositories for triggers, contacts, and logs.

## Storage Model

- **Database (SQLite / PostgreSQL via Prisma)**:
  - `UserConfig`: Google OAuth tokens, WhatsApp connection credentials/session state.
  - `ContactGroup`: Saved individuals (phone numbers) and WhatsApp groups (JIDs like `12345@g.us`).
  - `CalendarTrigger`: Registered conditions (event ID, trigger timing offset, recipient, message template, status).
  - `MessageLog`: History of sent messages, recipient, timestamp, status (`sent`, `failed`, `pending`), error details.

## Auth and Access Model

- **Google OAuth2**: Web-based OAuth consent flow with offline access token (`access_type=offline`) to refresh calendar access tokens in the background.
- **WhatsApp Multi-Device Session**: QR-code handshake stored securely in local auth credentials folder (`.baileys_auth` or DB tokens).
- **Environment Variables**: API keys (`GEMINI_API_KEY` or `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_SECRET`).

## Invariants

1. **Adapter Decoupling**: Application business logic must never call raw WhatsApp APIs directly; it must always go through the `WhatsAppAdapter` interface.
2. **Idempotent Trigger Execution**: A trigger must never dispatch duplicate messages for the same calendar event condition. State transitions (`PENDING` -> `TRIGGERED` -> `SENT`) must be recorded atomically.
3. **Graceful Degradation**: If WhatsApp session is disconnected, triggers must enter a `RETRY` or `FLAGGED` state rather than silently failing, and notify the user via the dashboard/widget.
4. **Phone & JID Sanitation**: All phone numbers must be sanitized to international E.164 format, and group JIDs must validate the `@g.us` suffix before dispatch.
