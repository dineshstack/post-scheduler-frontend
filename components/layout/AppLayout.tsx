'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
  title?: string
  action?: ReactNode
}

export default function AppLayout({ children, title, action }: AppLayoutProps) {
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-[var(--surface-bg)]">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Always rendered (even without a title/action) so the mobile menu
            toggle is reachable from every page — the sidebar has no other
            entry point below the `lg` breakpoint. */}
        <header className="sticky top-0 z-30 h-14 flex items-center gap-3 justify-between px-4 sm:px-6 border-b border-[var(--line)] bg-[var(--surface-bg)]/90 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              className="lg:hidden -ml-1.5 p-1.5 rounded-lg text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text-base)] transition-colors shrink-0"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            {title && <h1 className="text-base font-semibold text-[var(--text-base)] truncate">{title}</h1>}
          </div>
          {action && <div className="flex items-center gap-2 shrink-0">{action}</div>}
        </header>

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
