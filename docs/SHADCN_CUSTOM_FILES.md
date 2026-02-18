# Shadcn Custom Files (Do Not Overwrite)

These files were customized locally and must not be overwritten by `shadcn-vue` updates:

- `app/components/ui/dialog/DialogContent.vue`
- `app/components/ui/dialog/DialogScrollContent.vue`

## Why

Custom UX behavior was added for dialog close buttons:

- explicit `cursor-pointer` on close button in regular dialogs
- explicit `cursor-pointer` on close button in scroll dialogs

## Safety Rules

1. Do not run overwrite flows for these files (`add -o`, update commands that rewrite existing components).
2. If you need upstream changes, merge manually into these files.
3. Keep this list updated when new `ui/*` files are customized.
