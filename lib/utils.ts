import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScheduledAt(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return 'UTC'
  }
}

// Next future occurrence of a given day-of-week (0=Sunday) + hour, so a
// recurring "best time" slot becomes a concrete datetime to schedule against.
export function nextOccurrenceOf(day: number, hour: number): Date {
  const result = new Date()
  result.setHours(hour, 0, 0, 0)
  result.setDate(result.getDate() + ((day - result.getDay() + 7) % 7))
  if (result <= new Date()) result.setDate(result.getDate() + 7)
  return result
}
