'use client'

import type { ReactNode } from 'react'
import Sidebar from './Sidebar'

interface AppLayoutProps {
  children: ReactNode
  title?: string
  action?: ReactNode
}

export default function AppLayout({ children, title, action }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-[var(--surface-bg)]">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {(title || action) && (
          <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 border-b border-[var(--line)] bg-[var(--surface-bg)]/90 backdrop-blur-md shrink-0">
            {title && <h1 className="text-base font-semibold text-[var(--text-base)]">{title}</h1>}
            {action && <div className="flex items-center gap-2">{action}</div>}
          </header>
        )}

        <main className="flex-1 px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
