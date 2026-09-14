# Code Standards

## General

- Keep modules small, decoupled, and single-purpose.
- Fix root causes directly rather than layering temporary workarounds.
- Do not mix unrelated concerns in one component or route handler.
- Always handle async errors gracefully with clear user-facing error messages.

## TypeScript

- Strict mode (`strict: true`) is required throughout the project.
- Avoid `any` — use explicit interfaces, discriminated unions, or narrowly scoped types.
- Validate unknown external input at system boundaries (e.g. using Zod or custom type guards) before trusting it.
- Model domain concepts (Trigger, Event, WhatsAppMessage, Recipient) explicitly in `src/types/`.

## Next.js (App Router)

- Default to React Server Components (RSC) for data fetching and layout structure.
- Add `'use client'` only when browser interactivity, state, or DOM events are required.
- Keep route handlers (`route.ts`) focused on a single responsibility: validate input, invoke core service, return standard JSON response `{ success: boolean, data?: T, error?: string }`.
- Abstract third-party SDK calls (Google APIs, Baileys) into dedicated `src/lib/` modules.

## Styling

- Use Tailwind CSS utility classes and CSS variables defined in `ui-context.md`.
- No hardcoded ad-hoc hex colors in components; use theme semantic tokens.
- Follow mobile-first responsive design patterns.

## API Routes & Handlers

- Validate and parse request query/body parameters before running any logic.
- Always return HTTP status codes matching the outcome (200 for OK, 400 for bad input, 404 for not found, 500 for internal errors).
- Never block API requests on long-lived asynchronous tasks; offload long tasks or run them asynchronously.

## Data and Storage

- Metadata, user settings, triggers, and message logs belong in SQLite/Prisma database.
- Keep trigger execution records idempotent to prevent sending duplicate WhatsApp messages.
- WhatsApp session auth credentials must be stored in secure dedicated auth files/directories (gitignored).

## File Organization

- `src/app/` — App Router pages, layouts, and API routes.
- `src/components/` — Reusable UI components (widget, dashboard, layout, common).
- `src/lib/` — Core business logic, Google Calendar service, WhatsApp adapters, and scheduler.
- `src/types/` — TypeScript interfaces, enums, and shared schemas.
- `src/hooks/` — Custom React hooks (e.g. useWidget, useCalendarEvents).
