# UI Context

## Theme

Modern dark technical dashboard with crisp emerald / WhatsApp green accents. High-contrast, clean layered glassmorphism cards, and an unobtrusive floating widget interface suitable for embedding on external websites or using in the main app.

## Colors

All components must use these CSS variable tokens — no hardcoded hex values.

| Role            | CSS Variable       | Value     | Description                                  |
| --------------- | ------------------ | --------- | -------------------------------------------- |
| Page background | `--bg-base`        | `#0b1015` | Deep slate-black canvas                     |
| Surface         | `--bg-surface`     | `#131b23` | Dark card surface                           |
| Elevated Surface| `--bg-elevated`    | `#1c2833` | Interactive surfaces & modals               |
| Primary text    | `--text-primary`   | `#f3f4f6` | Clean white/slate-50                        |
| Muted text      | `--text-muted`     | `#9ca3af` | Secondary labels & timestamps               |
| Primary accent  | `--accent-primary` | `#25d366` | WhatsApp emerald green                      |
| Primary hover   | `--accent-hover`   | `#1ebe5d` | Darker emerald hover state                  |
| Border          | `--border-default` | `#263545` | Subtle slate border line                    |
| Error           | `--state-error`    | `#ef4444` | Crimson alert / failed state                |
| Success         | `--state-success`  | `#10b981` | Positive feedback / connected               |
| Warning         | `--state-warning`  | `#f59e0b` | Pending or expiring token notice            |

## Typography

| Role      | Font              | Variable      |
| --------- | ----------------- | ------------- |
| UI text   | Inter / system-ui | `--font-sans` |
| Code/mono | JetBrains / Consolas | `--font-mono` |

## Border Radius

| Context           | Class            |
| ----------------- | ---------------- |
| Inline / small UI | `rounded-md` (6px)  |
| Cards / panels    | `rounded-xl` (12px) |
| Modals / widget   | `rounded-2xl` (16px)|
| Floating bubble   | `rounded-full`   |

## Component Guidelines

- **Floating Widget Bubble**: Fixed at bottom-right (`bottom-6 right-6`), 56px circular button with smooth pulse or badge indicator.
- **Widget Chat Window**: 380px wide × 560px tall on desktop, full-width responsive sheet on mobile (<640px).
- **Icons**: Lucide React. Stroke-based icons only. Sizes: `h-4 w-4` for inline, `h-5 w-5` for buttons.

## Layout Patterns

- **Dashboard**: Responsive top navigation with status indicators (Google Calendar Connected, WhatsApp Connected), 2-column or 3-column responsive card grid for:
  1. Upcoming Google Calendar Events with Quick-Trigger actions.
  2. Active WhatsApp Triggers & Rules.
  3. Message Delivery History & Logs.
- **Embedded Widget**: Clean iframe-friendly or floating component with header (Agent avatar, status), scrollable chat stream, and quick-action suggestions.
