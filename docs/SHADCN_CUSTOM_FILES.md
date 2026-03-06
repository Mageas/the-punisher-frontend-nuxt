# Shadcn Custom Files (Do Not Overwrite)

Only the files listed below were customized locally and must not be overwritten by `shadcn-vue` updates.

## Custom UI Files

- `app/components/ui/dialog/DialogContent.vue`
- `app/components/ui/dialog/DialogOverlay.vue`
- `app/components/ui/dialog/DialogScrollContent.vue`
- `app/components/ui/pagination/PaginationEllipsis.vue`
- `app/components/ui/pagination/PaginationFirst.vue`
- `app/components/ui/pagination/PaginationLast.vue`
- `app/components/ui/pagination/PaginationNext.vue`
- `app/components/ui/pagination/PaginationPrevious.vue`
- `app/components/ui/sheet/SheetContent.vue`
- `app/components/ui/sidebar/Sidebar.vue`
- `app/components/ui/sidebar/SidebarRail.vue`
- `app/components/ui/sidebar/SidebarTrigger.vue`
- `app/components/ui/command/Command.vue`
- `app/components/ui/command/CommandEmpty.vue`
- `app/components/ui/command/CommandGroup.vue`
- `app/components/ui/command/CommandInput.vue`
- `app/components/ui/command/CommandItem.vue`
- `app/components/ui/command/index.ts`

## Header Marker

Each customized file keeps this header:

```ts
// This shadcn-generated file was locally modified and must not be overwritten.
// Local change summary:
// - <local customization summary>
```

## Local UI Notes

- Dialog overlays use a low-radius `backdrop-filter` blur (`2px`) with a darker solid fallback when blur is unsupported, to keep the modal backdrop readable without adding a heavier full-screen effect.

## Safety Rules

1. Do not run overwrite flows on listed files (`add -o`, update commands that rewrite existing components).
2. If you need upstream shadcn changes, merge manually into local files.
3. Keep this list updated when a `ui/*` file is customized or reverted.
