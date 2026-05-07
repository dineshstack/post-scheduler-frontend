import { cn } from '@/lib/utils'
import { forwardRef, type InputHTMLAttributes } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-base)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'h-9 w-full rounded-lg border bg-[var(--surface-card)] px-3 text-sm text-[var(--text-base)]',
            'placeholder:text-[var(--text-faint)]',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-[var(--line)] hover:border-[var(--text-faint)]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-faint)]">{hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
export default Input
