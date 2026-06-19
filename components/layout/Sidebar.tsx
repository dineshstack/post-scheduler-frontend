'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart2, CalendarDays, LayoutDashboard, Lightbulb, Link2, ListTodo,
  LogOut, Moon, Plus, Search, Sun, User
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

function NavItem({ href, label, icon: Icon, exact }: NavItemProps) {
  const pathname = usePathname()
  const active = exact ? pathname === href : pathname.startsWith(href)

  return (
    <Link
      href={href}
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

export default function Sidebar() {
  const { user } = useAuthStore()
  const { mutate: logout } = useLogout()
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <aside className="flex flex-col w-56 shrink-0 border-r border-[var(--line)] bg-[var(--surface-card)] h-screen sticky top-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-[var(--line)] shrink-0">
        <span className="font-bold text-[var(--text-base)] tracking-tight">Post Scheduler</span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        <NavItem href="/dashboard"            label="Dashboard" icon={LayoutDashboard} exact />
        <NavItem href="/dashboard/compose"    label="Compose"   icon={Plus} exact />
        <NavItem href="/dashboard/posts"      label="Queue"     icon={ListTodo} />
        <NavItem href="/dashboard/ideas"      label="Ideas"     icon={Lightbulb} />
        <NavItem href="/dashboard/seo"        label="SEO"       icon={Search} />
        <NavItem href="/dashboard/calendar"   label="Calendar"  icon={CalendarDays} />
        <NavItem href="/dashboard/analytics"  label="Analytics" icon={BarChart2} />

        <div className="pt-4 pb-1 px-3">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">Settings</span>
        </div>
        {settings.map(({ href, label, icon }) => (
          <NavItem key={href} href={href} label={label} icon={icon} />
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
  )
}
