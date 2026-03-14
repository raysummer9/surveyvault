export function formatLastSavedLabel(updatedAt: string | null | undefined) {
  if (!updatedAt) return ''

  const savedAtMs = new Date(updatedAt).getTime()
  if (!Number.isFinite(savedAtMs)) return ''

  const elapsedMs = Date.now() - savedAtMs
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000))

  if (elapsedSeconds < 60) return 'Last saved just now'

  const minutes = Math.floor(elapsedSeconds / 60)
  if (minutes < 60) return `Last saved ${minutes} min${minutes === 1 ? '' : 's'} ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Last saved ${hours} hour${hours === 1 ? '' : 's'} ago`

  const days = Math.floor(hours / 24)
  return `Last saved ${days} day${days === 1 ? '' : 's'} ago`
}
