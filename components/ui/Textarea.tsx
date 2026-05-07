import { cn } from '@/lib/utils'
import { forwardRef, type TextareaHTMLAttributes } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  charCount?: number
  charLimit?: number
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, charCount: charCountProp, charLimit, className, id, ...props }, ref) => {
    const inputId  = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    const charCount = charCountProp ?? (typeof props.value === 'string' ? props.value.length : undefined)
    const overLimit = charLimit !== undefined && charCount !== undefined && charCount > charLimit

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <div className="flex items-center justify-between">
            <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-base)]">
              {label}
            </label>
            {charLimit !== undefined && charCount !== undefined && (
              <span className={cn('text-xs tabular-nums', overLimit ? 'text-red-500 font-medium' : 'text-[var(--text-faint)]')}>
                {charCount} / {charLimit}
              </span>
            )}
          </div>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-lg border bg-[var(--surface-card)] px-3 py-2 text-sm text-[var(--text-base)]',
            'placeholder:text-[var(--text-faint)] resize-y min-h-[100px]',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent',
            error || overLimit
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
Textarea.displayName = 'Textarea'
export default Textarea
