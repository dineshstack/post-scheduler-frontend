'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronDown, ChevronUp, Circle } from 'lucide-react'
import { useSeoGuidelines } from '@/lib/hooks'

const CATEGORY_LABELS: Record<string, string> = {
  title:          'Title & H1',
  url_slug:       'URL / Slug',
  content:        'Content',
  meta:           'Meta tags',
  internal_links: 'Internal links',
  tags:           'Tags',
  images:         'Images',
  publishing:     'Publishing',
}

const CATEGORY_ICONS: Record<string, string> = {
  title:          '✍️',
  url_slug:       '🔗',
  content:        '📄',
  meta:           '🏷️',
  internal_links: '🔀',
  tags:           '🏷️',
  images:         '🖼️',
  publishing:     '🚀',
}

export default function BlogSeoChecklist() {
  const { data, isLoading } = useSeoGuidelines()
  const [checked, setChecked]   = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['title', 'url_slug', 'meta']))
  const [collapsed, setCollapsed] = useState(false)

  if (isLoading || !data?.seo_checklist) return null

  const checklist = data.seo_checklist as Record<string, string[]>
  const categories = Object.entries(checklist)

  const totalItems   = categories.reduce((sum, [, items]) => sum + items.length, 0)
  const checkedCount = checked.size
  const pct          = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0
  const allDone      = pct === 100

  const toggleItem = (key: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  }

  const toggleCategory = (cat: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const categoryProgress = (cat: string, items: string[]) =>
    items.filter((_, i) => checked.has(`${cat}:${i}`)).length

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 hover:bg-[var(--surface-subtle)] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-[var(--text-base)]">SEO Checklist</span>
          {allDone ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="h-3 w-3" /> Ready!
            </span>
          ) : (
            <span className="text-[10px] font-medium text-[var(--text-faint)] bg-[var(--surface-subtle)] px-2 py-0.5 rounded-full">
              {checkedCount}/{totalItems}
            </span>
          )}
        </div>
        {collapsed ? <ChevronDown className="h-4 w-4 text-[var(--text-faint)]" /> : <ChevronUp className="h-4 w-4 text-[var(--text-faint)]" />}
      </button>

      {!collapsed && (
        <>
          {/* Progress bar */}
          <div className="px-4 pb-3">
            <div className="w-full h-1.5 rounded-full bg-[var(--surface-subtle)] overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${allDone ? 'bg-emerald-500' : 'bg-[var(--accent)]'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-[var(--text-faint)] mt-1">{pct}% complete</p>
          </div>

          {/* Categories */}
          <div className="border-t border-[var(--line)] divide-y divide-[var(--line)]">
            {categories.map(([cat, items]) => {
              const done = categoryProgress(cat, items)
              const catDone = done === items.length
              const isOpen = expanded.has(cat)

              return (
                <div key={cat}>
                  <button
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{CATEGORY_ICONS[cat] ?? '•'}</span>
                      <span className={`text-xs font-medium ${catDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-base)]'}`}>
                        {CATEGORY_LABELS[cat] ?? cat}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-[var(--text-faint)]">{done}/{items.length}</span>
                      {isOpen ? <ChevronUp className="h-3 w-3 text-[var(--text-faint)]" /> : <ChevronDown className="h-3 w-3 text-[var(--text-faint)]" />}
                    </div>
                  </button>

                  {isOpen && (
                    <ul className="px-4 pb-3 space-y-2">
                      {items.map((item, i) => {
                        const key = `${cat}:${i}`
                        const isChecked = checked.has(key)
                        return (
                          <li key={key}>
                            <label className="flex items-start gap-2.5 cursor-pointer group">
                              <button
                                type="button"
                                onClick={() => toggleItem(key)}
                                className="mt-0.5 shrink-0 text-[var(--text-faint)] group-hover:text-[var(--accent)] transition-colors"
                              >
                                {isChecked
                                  ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                  : <Circle className="h-3.5 w-3.5" />}
                              </button>
                              <span
                                onClick={() => toggleItem(key)}
                                className={`text-xs leading-relaxed cursor-pointer ${isChecked ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-muted)]'}`}
                              >
                                {item}
                              </span>
                            </label>
                          </li>
                        )
                      })}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>

          {/* Footer reset */}
          {checkedCount > 0 && (
            <div className="px-4 py-2.5 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={() => setChecked(new Set())}
                className="text-[10px] text-[var(--text-faint)] hover:text-[var(--text-muted)] transition-colors"
              >
                Reset checklist
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
