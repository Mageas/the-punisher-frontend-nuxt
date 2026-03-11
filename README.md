# The Punisher Frontend (Nuxt)

Modern web application for classroom management, built with Nuxt 3, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Classroom Management:** Create, update, and manage student rosters.
- **Bulk Student Import:** Import students/classrooms from CSV/XLSX with translated row-level validation errors.
- **Behavior Tracking:** Log penalties and assign punishments based on rules, with due dates computed either in days or from the next lessons.
- **Reward System:** Distribute and track bonus points for students, including hundredth precision (`0.25`) during bonus entry.
- **Success Feedback:** Successful create, update, delete, consume, resolve, and roster actions display a bottom-right success toast.
- **Schedule Management:** Configure a weekly timetable with recurring slots, weekday parity, and classroom assignments.
- **Event Metadata Forms:** Create and edit bonus/penalty/punishment entries with optional event datetime (`occurred_at`) and evaluation label (`evaluation_label`), plus classroom resolution during penalty creation when automatic rules depend on `next_lessons`.
- **Business Date Display:** Lists, dashboard cards, and student history display the business event datetime (`occurred_at`) when available.
- **Student Profile Navigation:** Inline per-section pagination (`< page/total >`) for punishments, bonuses, penalties, and history (profile requests use `item_per_page=5`, respect section page query params like `punishments_page` and `history_page`, keep default profile section states: punishments=`pending`, bonuses=`unused`, and automatically fallback to the previous section page after consume/resolve when the current page becomes empty).
- **Dashboard Section Queries:** Dashboard KPIs still come from `/dashboard`, but the penalties / bonuses / punishments cards now fetch their own paginated `/penalties`, `/bonuses`, and `/punishments` lists with `item_per_page=5`, reuse the student-style section query params (`penalties_page`, `bonuses_page`, `punishments_page`), and keep the same default states for bonuses/punishments (`unused`, `pending`).
- **Type Management:** Customizable types for bonuses, penalties, and punishments.
- **Authentication:** Secure teacher login/registration with token rotation, email confirmation, and forgot/reset password flows.
- **User Security Settings:** Dedicated user settings page to change password and revoke all active sessions.
- **Form Submission UX:** Submit buttons show an animated spinner and become non-clickable only while the API request is actually running, never on client-side validation failures.
- **Internationalization:** Full French (fr-FR) support.

## 🛠 Tech Stack

- **Framework:** [Nuxt 3](https://nuxt.com/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **State Management:** [Pinia](https://pinia.vuejs.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn Vue](https://www.shadcn-vue.com/)
- **Package Manager:** [Bun](https://bun.sh/)
- **Testing:** [Vitest](https://vitest.dev/) (Unit) + [Playwright](https://playwright.dev/) (E2E)

### 🎨 Design Tokens

- Subtle semantic background tokens use the `*-bg-subtle` suffix (example: `bg-warning-bg-subtle`).
- Hover variants use `*-bg-subtle-hover` (example: `bg-destructive-bg-subtle` with `hover:bg-destructive-bg-subtle-hover`).
- Shared dialog overlays use a lightweight `backdrop-filter` blur (`2px`) with a solid dark fallback when the browser does not support blur, to keep modal rendering inexpensive.

## 📁 Architecture

- `app/components/features`: Domain-specific components grouped by feature.
- `app/components/shared`: Reusable cross-feature building blocks (for example `SectionHeaderPagination`, `AvailableBonusesSection`, `PenaltiesSection`, `PendingPunishmentsSection`, and `LoadingButton` for pending form actions).
- `app/components/ui`: Reusable UI primitives (Shadcn).
- `app/services`: API communication layer. **All API calls must go through services.**
- `app/composables`: Reusable business logic and state orchestration, including `useApiActionState` to scope loading states to real API calls after frontend validation passes and shared section composables reused by both dashboard and student-profile adapters.
- `app/types/api`: TypeScript definitions for API responses and payloads.
- `i18n/locales/fr.json`: Locale messages with shared keys centralized under `common.*` (`actions`, `labels`, `placeholders`, `states`, `titles`, etc.) and feature-specific keys kept only for domain wording.

## ⚙️ Setup

1. **Install dependencies:**

   ```bash
   bun install
   ```

2. **Configure environment:**

   ```bash
   cp .env.example .env
   # Edit .env and set NUXT_PUBLIC_API_BASE_URL
   ```

3. **Start development server:**
   ```bash
   bun run dev
   ```

## 🧪 Testing & Quality

- **Linting:** `bun run lint`
- **Type Check:** `bun run typecheck`
- **Unit Tests:** `bun run test`
- **E2E Tests:** `bun run test:e2e`

## 📖 Documentation

- [Project Overview](docs/projet.md)
- [UI Documentation](docs/projet-ui.md)
- [API Reference](docs/api-reference.md)

## 🕒 Date Handling

- API response datetime fields ending with `*_at` are normalized to RFC3339 UTC (`Z`) in the shared utility `app/lib/date-time.ts`, wired through the global API plugin.
- Request body datetime fields ending with `*_at` are serialized to RFC3339 UTC (`.toISOString()`) before being sent.
- Event datetime pickers only expose `HH:mm` in the UI; new datetimes are sent with seconds forced to `00`, while edit flows preserve API-provided seconds until the user actively changes the date/time, at which point seconds are reset to `00`.
- Date filters in query params (`created_from`, `created_to`, `due_from`, `due_to`) stay as `YYYY-MM-DD`.
