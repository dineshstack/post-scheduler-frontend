'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart2, CalendarDays, LayoutDashboard, Lightbulb, Link2, ListTodo,
  LogOut, Moon, Plus, Search, Sun, User, X
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { useLogout } from '@/lib/hooks'
import { useAuthStore } from '@/lib/stores/auth.store'

const settings = [
  { href: '/settings/connections', label: 'Connections', icon: Link2 },
  { href: '/settings/profile',     label: 'Profile',     icon: User },
]

interface NavItemProps {
  href: string
  label: string
  icon: React.ElementType
  exact?: boolean
}

function NavItem({ href, label, icon: Icon, exact, onNavigate }: NavItemProps & { onNavigate?: () => void }) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
        active
          ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] font-medium'
          : 'text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-base)]'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  )
}

interface SidebarProps {
  /** Mobile drawer open state — irrelevant at the `lg` breakpoint and up, where the sidebar is always visible. */
  open?: boolean
  onClose?: () => void
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
  const { user } = useAuthStore()
  const { mutate: logout } = useLogout()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      {/* Mobile backdrop — tapping it closes the drawer. Desktop never shows it. */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 transition-opacity lg:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          'flex flex-col w-64 shrink-0 border-r border-[var(--line)] bg-[var(--surface-card)]',
          'fixed inset-y-0 left-0 z-50 transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:static lg:z-auto lg:w-56 lg:translate-x-0 lg:h-screen lg:sticky lg:top-0'
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--line)] shrink-0">
          <span className="font-bold text-[var(--text-base)] tracking-tight">Post Scheduler</span>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-base)] transition-colors"
            aria-label="Close menu"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Main nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <NavItem href="/dashboard"            label="Dashboard" icon={LayoutDashboard} exact onNavigate={onClose} />
          <NavItem href="/dashboard/compose"    label="Compose"   icon={Plus} exact onNavigate={onClose} />
          <NavItem href="/dashboard/posts"      label="Queue"     icon={ListTodo} onNavigate={onClose} />
          <NavItem href="/dashboard/ideas"      label="Ideas"     icon={Lightbulb} onNavigate={onClose} />
          <NavItem href="/dashboard/seo"        label="SEO"       icon={Search} onNavigate={onClose} />
          <NavItem href="/dashboard/calendar"   label="Calendar"  icon={CalendarDays} onNavigate={onClose} />
          <NavItem href="/dashboard/analytics"  label="Analytics" icon={BarChart2} onNavigate={onClose} />

          <div className="pt-4 pb-1 px-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">Settings</span>
          </div>
          {settings.map(({ href, label, icon }) => (
            <NavItem key={href} href={href} label={label} icon={icon} onNavigate={onClose} />
          ))}
        </nav>

      {/* User footer */}
      <div className="px-3 pb-4 pt-2 border-t border-[var(--line)] space-y-0.5 shrink-0">
        {user && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
            <div className="h-7 w-7 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
              <span className="text-xs font-semibold text-[var(--accent-text)]">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--text-base)] truncate">{user.name}</p>
              <p className="text-[10px] text-[var(--text-faint)] truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-base)] transition-colors"
        >
          {mounted && resolvedTheme === 'dark'
            ? <Sun  className="h-4 w-4 shrink-0" />
            : <Moon className="h-4 w-4 shrink-0" />}
          {mounted ? (resolvedTheme === 'dark' ? 'Light mode' : 'Dark mode') : 'Dark mode'}
        </button>
        <button
          onClick={() => logout()}
          className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-red-500 transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </div>
    </aside>
    </>
  )
}
