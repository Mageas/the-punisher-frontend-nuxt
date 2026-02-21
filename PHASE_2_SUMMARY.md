# Phase 2: Component Reorganization - Completed

**Date:** February 21, 2026

## Changes Implemented

### 1. Colocation of Modals
Feature-specific modals have been moved from a central `app/components/modals` directory into their respective feature directories. This follows the principle of "colocation" where components that are used together or share a domain live together.

- **Moved:**
  - `Bonus*.vue` -> `app/components/features/bonus/modals/`
  - `Classroom*.vue` -> `app/components/features/classroom/modals/`
  - `Penalty*.vue` -> `app/components/features/penalty/modals/`
  - `Punishment*.vue` -> `app/components/features/punishment/modals/`
  - `Rule*.vue` -> `app/components/features/rule/modals/`
  - `Student*.vue` -> `app/components/features/student/modals/`
  - `ConfirmActionModal.vue` -> `app/components/shared/modals/` (Still shared across features)

### 2. Colocation of Feature-Specific Shared Components
Components previously in `app/components/shared` that are conceptually linked to a specific domain feature have been moved to those features' directories.

- **Moved:**
  - `BonusTypeSelect.vue` -> `app/components/features/bonus/`
  - `ClassroomSelect.vue` -> `app/components/features/classroom/`
  - `PenaltyTypeSelect.vue` -> `app/components/features/penalty/`
  - `PunishmentTypeSelect.vue` -> `app/components/features/punishment/`
  - `StudentAvatar.vue` -> `app/components/features/student/`
  - `StudentSelect.vue` -> `app/components/features/student/`

### 3. Cleanup
- Removed the now empty `app/components/modals` directory.
- Verified that no explicit imports were broken (Nuxt auto-imports handle the new locations seamlessly due to `pathPrefix: false`).

## Next Steps (Phase 3)
- **Testing & Hardening:**
  - Add unit tests for key composables (`useStudents`, `useAuth`).
  - Add component tests for critical forms and modals.
