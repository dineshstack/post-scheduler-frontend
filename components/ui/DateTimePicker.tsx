'use client'

import { cn } from '@/lib/utils'
import { format, parseISO } from 'date-fns'
import { Calendar } from 'lucide-react'

interface DateTimePickerProps {
  label?: string
  value: string       // ISO string in UTC
  onChange: (iso: string) => void
  error?: string
  min?: string
  className?: string
}

export default function DateTimePicker({ label, value, onChange, error, min, className }: DateTimePickerProps) {
  // Convert stored UTC ISO → local datetime-local string for the input
  const toLocalInput = (iso: string) => {
    if (!iso) return ''
    try {
      const d = new Date(iso)
      // datetime-local expects "YYYY-MM-DDTHH:mm"
      return format(d, "yyyy-MM-dd'T'HH:mm")
    } catch {
      return ''
    }
  }

  // Convert local datetime-local string → UTC ISO
  const toUTC = (local: string) => {
    if (!local) return ''
    return new Date(local).toISOString()
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <label className="text-sm font-medium text-[var(--text-base)]">{label}</label>}
      <div className="relative">
        <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-faint)]" />
        <input
          type="datetime-local"
          value={toLocalInput(value)}
          min={min ? toLocalInput(min) : undefined}
          onChange={(e) => onChange(toUTC(e.target.value))}
          className={cn(
            'h-9 w-full rounded-lg border bg-[var(--surface-card)] pl-9 pr-3 text-sm text-[var(--text-base)]',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
            error ? 'border-red-500' : 'border-[var(--line)] hover:border-[var(--text-faint)]',
          )}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
