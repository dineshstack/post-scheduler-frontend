import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'react'
import type { Post, Platform } from '@/lib/types'

//  Status badge 

const statusStyles: Record<Post['status'], string> = {
  draft:      'bg-[var(--surface-overlay)] text-[var(--text-muted)]',
  scheduled:  'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  publishing: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  published:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  failed:     'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
}

export function StatusBadge({ status, className }: { status: Post['status']; className?: string }) {
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', statusStyles[status], className)}>
      {status}
    </span>
  )
}

//  Platform chip 

const platformEmoji: Record<string, string> = {
  twitter: '', instagram: '📸', linkedin: '💼',
  facebook: '📘', tiktok: '🎵', blog: '📝',
}

const platformColors: Record<string, string> = {
  twitter:   'bg-sky-100   text-sky-700   dark:bg-sky-950/40   dark:text-sky-300',
  instagram: 'bg-pink-100  text-pink-700  dark:bg-pink-950/40  dark:text-pink-300',
  linkedin:  'bg-blue-100  text-blue-700  dark:bg-blue-950/40  dark:text-blue-300',
  facebook:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
  tiktok:    'bg-slate-100 text-slate-700  dark:bg-slate-800    dark:text-slate-300',
  blog:      'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
}

export function PlatformChip({ platform, className }: { platform: string; className?: string }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
      platformColors[platform] ?? 'bg-[var(--surface-subtle)] text-[var(--text-muted)]',
      className
    )}>
      <span>{platformEmoji[platform] ?? platform}</span>
      <span className="capitalize">{platform}</span>
    </span>
  )
}

export function PlatformChips({ platforms, className }: { platforms: Platform[]; className?: string }) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {platforms.map((p) => <PlatformChip key={p} platform={p} />)}
    </div>
  )
}

//  Generic badge 

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

const badgeVariants = {
  default: 'bg-[var(--surface-overlay)] text-[var(--text-muted)]',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  danger:  'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  info:    'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', badgeVariants[variant], className)}
      {...props}
    >
      {children}
    </span>
  )
}
