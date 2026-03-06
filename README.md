# The Punisher Frontend (Nuxt)

Modern web application for classroom management, built with Nuxt 3, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Classroom Management:** Create, update, and manage student rosters.
- **Bulk Student Import:** Import students/classrooms from CSV/XLSX with translated row-level validation errors.
- **Behavior Tracking:** Log penalties and assign punishments based on rules.
- **Reward System:** Distribute and track bonus points for students, including hundredth precision (`0.25`) during bonus entry.
- **Student Profile Navigation:** Inline per-section pagination (`< page/total >`) for punishments, bonuses, penalties, and history (profile requests use `item_per_page=5`, respect section page query params like `punishments_page` and `history_page`, keep default profile section states: punishments=`pending`, bonuses=`unused`, and automatically fallback to the previous section page after consume/resolve when the current page becomes empty).
- **Type Management:** Customizable types for bonuses, penalties, and punishments.
- **Authentication:** Secure teacher login/registration with token rotation, email confirmation, and forgot/reset password flows.
- **User Security Settings:** Dedicated user settings page to change password and revoke all active sessions.
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

## 📁 Architecture

- `app/components/features`: Domain-specific components grouped by feature.
- `app/components/shared`: Reusable cross-feature building blocks (for example `SectionHeaderPagination`).
- `app/components/ui`: Reusable UI primitives (Shadcn).
- `app/services`: API communication layer. **All API calls must go through services.**
- `app/composables`: Reusable business logic and state orchestration.
- `app/types/api`: TypeScript definitions for API responses and payloads.

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
- Date filters in query params (`created_from`, `created_to`, `due_from`, `due_to`) stay as `YYYY-MM-DD`.
