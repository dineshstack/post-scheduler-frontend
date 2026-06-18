'use client'

import { useState } from 'react'
import { AlertCircle, Plus, X } from 'lucide-react'
import type { PerPlatformOverride } from '@/lib/types'

// dev.to enforces: max 4 tags, no hyphens, lowercase alphanumeric only
const MAX_TAGS    = 4
const normaliseTag = (t: string) => t.trim().toLowerCase().replace(/[^a-z0-9]/g, '')

const labelCls = 'block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1'
const inputCls = 'w-full rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--text-base)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors'

interface Props {
  value:    PerPlatformOverride
  onChange: (v: PerPlatformOverride) => void
}

export default function DevToSettingsPanel({ value, onChange }: Props) {
  const [tagInput, setTagInput] = useState('')

  const set = (patch: Partial<PerPlatformOverride>) => onChange({ ...value, ...patch })

  // ── Tags ──────────────────────────────────────────────────────────────────

  const tags     = value.tags ?? []
  const atLimit  = tags.length >= MAX_TAGS
  const hasHyphen = tagInput.includes('-')

  const addTag = (raw: string) => {
    const norm = normaliseTag(raw)
    if (norm && !tags.includes(norm) && !atLimit) {
      set({ tags: [...tags, norm] })
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => set({ tags: tags.filter((t) => t !== tag) })

  return (
    <div className="space-y-4">

      {/* Description (shown in dev.to feed cards) */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={value.description ?? ''}
          onChange={(e) => set({ description: e.target.value })}
          placeholder="Short summary shown in dev.to feed cards"
          rows={2}
          maxLength={500}
          className={`${inputCls} resize-none`}
        />
        <p className="text-[10px] text-[var(--text-faint)] mt-1 text-right">
          {(value.description ?? '').length}/500
        </p>
      </div>

      {/* Tags — max 4, no hyphens */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>Tags</label>
          <span className={`text-[10px] font-medium ${atLimit ? 'text-amber-500' : 'text-[var(--text-faint)]'}`}>
            {tags.length}/{MAX_TAGS}
          </span>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {tags.map((tag) => (
              <span key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--accent-subtle)] text-[var(--accent-text)] border border-[var(--accent)]/30"
              >
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {!atLimit && (
          <div className="flex gap-2">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
              placeholder="Add tag…"
              className={inputCls}
              disabled={atLimit}
            />
            <button type="button" onClick={() => addTag(tagInput)}
              disabled={!tagInput.trim() || atLimit}
              className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {hasHyphen && (
          <p className="flex items-center gap-1 text-[10px] text-amber-500 mt-1">
            <AlertCircle className="h-3 w-3" />
            dev.to does not allow hyphens in tags — they will be removed automatically.
          </p>
        )}
        {atLimit && (
          <p className="text-[10px] text-amber-500 mt-1">Maximum 4 tags reached (dev.to limit).</p>
        )}
      </div>

      {/* Series */}
      <div>
        <label className={labelCls}>Series name</label>
        <input
          value={value.series ?? ''}
          onChange={(e) => set({ series: e.target.value })}
          placeholder="Group this post into a named series (optional)"
          className={inputCls}
        />
      </div>

      {/* Canonical URL */}
      <div>
        <label className={labelCls}>Canonical URL</label>
        <input
          type="url"
          value={value.canonical_url ?? ''}
          onChange={(e) => set({ canonical_url: e.target.value })}
          placeholder="https://dineshstack.com/en/my-post"
          className={inputCls}
        />
        <p className="text-[10px] text-[var(--text-faint)] mt-1">
          Sets rel=canonical on dev.to pointing back to the original post.
        </p>
      </div>

      {/* Publish immediately vs draft */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value.published ?? true}
          onChange={(e) => set({ published: e.target.checked })}
          className="rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
        />
        <span className="text-xs text-[var(--text-muted)]">Publish immediately on dev.to (uncheck to save as draft)</span>
      </label>

    </div>
  )
}