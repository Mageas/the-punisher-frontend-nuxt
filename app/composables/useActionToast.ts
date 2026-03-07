import { toast } from 'vue-sonner'

type ActionToastKind = 'add' | 'consume' | 'create' | 'delete' | 'remove' | 'resolve' | 'update'

export function useActionToast() {
  const { t } = useI18n()

  function notify(kind: ActionToastKind, message?: string) {
    toast.success(message ?? t(`common.feedback.${kind}Success`), {
      position: 'bottom-right',
      richColors: true,
    })
  }

  return {
    notifyAddSuccess: (message?: string) => notify('add', message),
    notifyConsumeSuccess: (message?: string) => notify('consume', message),
    notifyCreateSuccess: (message?: string) => notify('create', message),
    notifyDeleteSuccess: (message?: string) => notify('delete', message),
    notifyRemoveSuccess: (message?: string) => notify('remove', message),
    notifyResolveSuccess: (message?: string) => notify('resolve', message),
    notifyUpdateSuccess: (message?: string) => notify('update', message),
  }
}
