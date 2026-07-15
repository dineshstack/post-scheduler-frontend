'use client'

import { useState } from 'react'
import { AlertCircle, Plus, X } from 'lucide-react'
import type { PerPlatformOverride } from '@/lib/types'

// Medium's own website allows up to 5 Topics per story (the old 3-tag cap
// was the retired publishing API's limit, which no longer applies here).
const MAX_TAGS = 5
const SUBTITLE_MAX = 140

const labelCls = 'block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1'
const inputCls = 'w-full rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--text-base)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors'

interface Props {
  value:    PerPlatformOverride
  onChange: (v: PerPlatformOverride) => void
}

export default function MediumSettingsPanel({ value, onChange }: Props) {
  const [tagInput, setTagInput] = useState('')

  const set = (patch: Partial<PerPlatformOverride>) => onChange({ ...value, ...patch })

  // ── Tags ──────────────────────────────────────────────────────────────────

  const tags    = value.tags ?? []
  const atLimit = tags.length >= MAX_TAGS

  const addTag = (raw: string) => {
    const norm = raw.trim().toLowerCase()
    if (norm && !tags.includes(norm) && !atLimit) {
      set({ tags: [...tags, norm] })
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => set({ tags: tags.filter((t) => t !== tag) })

  return (
    <div className="space-y-4">

      {/* Manual-publishing notice */}
      <div className="flex gap-2 rounded-lg border border-amber-400/40 bg-amber-50/60 dark:bg-amber-900/20 px-3 py-2.5">
        <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
          Medium retired its publishing API, so this never auto-sends. Save the post, then open its{' '}
          <strong>Previews</strong> panel for AI-suggested topics and a subtitle to paste into Medium&rsquo;s own{' '}
          <strong>Import a story</strong> tool. Once imported, Medium posts can&rsquo;t be edited via API either way.
        </p>
      </div>

      {/* Subtitle — shown under the title on Medium's story preview */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>Subtitle</label>
          <span className="text-[10px] font-medium text-[var(--text-faint)]">
            {(value.subtitle ?? '').length}/{SUBTITLE_MAX}
          </span>
        </div>
        <textarea
          value={value.subtitle ?? ''}
          onChange={(e) => set({ subtitle: e.target.value })}
          placeholder="A one-line explanation of what the reader will learn (leave blank to let AI suggest one)"
          rows={2}
          maxLength={SUBTITLE_MAX}
          className={`${inputCls} resize-none`}
        />
      </div>

      {/* Topics — Medium's own website allows up to 5 */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className={labelCls}>Topics</label>
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
                {tag}
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
              placeholder="Add topic… (leave blank to let AI suggest 5)"
              className={inputCls}
            />
            <button type="button" onClick={() => addTag(tagInput)}
              disabled={!tagInput.trim()}
              className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {atLimit && (
          <p className="text-[10px] text-amber-500 mt-1">Maximum 5 topics reached (Medium limit).</p>
        )}
      </div>

      {/* Publish status */}
      <div>
        <label className={labelCls}>Publish status</label>
        <select
          value={value.publish_status ?? 'public'}
          onChange={(e) => set({ publish_status: e.target.value as 'public' | 'draft' | 'unlisted' })}
          className={inputCls}
        >
          <option value="public">Public</option>
          <option value="draft">Draft</option>
          <option value="unlisted">Unlisted</option>
        </select>
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
          Sets rel=canonical pointing back to the original post.
        </p>
      </div>

      {/* Publication ID */}
      <div>
        <label className={labelCls}>Publication ID (optional)</label>
        <input
          value={value.publication_id ?? ''}
          onChange={(e) => set({ publication_id: e.target.value || undefined })}
          placeholder="Leave blank to publish to your personal profile"
          className={inputCls}
        />
      </div>

      {/* Notify followers */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={value.notify_followers ?? true}
          onChange={(e) => set({ notify_followers: e.target.checked })}
          className="rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
        />
        <span className="text-xs text-[var(--text-muted)]">Notify followers on publish</span>
      </label>

    </div>
  )
}