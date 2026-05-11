'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react'
import { useBlogMeta } from '@/lib/hooks'
import type { BlogCaseStudy, PerPlatformOverride } from '@/lib/types'

const labelCls = 'block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1'
const inputCls = 'w-full rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--text-base)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors'
const textareaCls = `${inputCls} resize-none`

interface Props {
  value:      PerPlatformOverride
  onChange:   (v: PerPlatformOverride) => void
  postType?:  'article' | 'tutorial' | 'case_study'
}

export default function BlogSettingsPanel({ value, onChange, postType }: Props) {
  const { data: meta } = useBlogMeta(true)
  const [tagInput,  setTagInput]  = useState('')
  const [seoOpen,   setSeoOpen]   = useState(false)
  const [csOpen,    setCsOpen]    = useState(false)
  const [techInput, setTechInput] = useState('')

  const set = (patch: Partial<PerPlatformOverride>) => onChange({ ...value, ...patch })

  // ── Tags ──────────────────────────────────────────────────────────────────────

  const blogTags   = value.tags ?? []
  const suggestions = (meta?.tags ?? [])
    .map((t) => t.name)
    .filter((n) => n.toLowerCase().includes(tagInput.toLowerCase()) && !blogTags.includes(n))
    .slice(0, 6)

  const addTag = (tag: string) => {
    const norm = tag.trim().toLowerCase().replace(/\s+/g, '-')
    if (norm && !blogTags.includes(norm)) {
      set({ tags: [...blogTags, norm] })
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => set({ tags: blogTags.filter((t) => t !== tag) })

  // ── Case study ────────────────────────────────────────────────────────────────

  const cs = value.case_study ?? {}
  const setCs = (patch: Partial<BlogCaseStudy>) => set({ case_study: { ...cs, ...patch } })

  const technologies = cs.technologies ?? []
  const addTech = (tech: string) => {
    const norm = tech.trim()
    if (norm && !technologies.includes(norm)) {
      setCs({ technologies: [...technologies, norm] })
    }
    setTechInput('')
  }

  return (
    <div className="space-y-4">

      {/* Excerpt */}
      <div>
        <label className={labelCls}>Excerpt</label>
        <textarea
          value={value.excerpt ?? ''}
          onChange={(e) => set({ excerpt: e.target.value })}
          placeholder="Short summary shown in blog listing and SEO descriptions"
          rows={3}
          maxLength={500}
          className={textareaCls}
        />
        <p className="text-[10px] text-[var(--text-faint)] mt-1 text-right">
          {(value.excerpt ?? '').length}/500
        </p>
      </div>

      {/* Category */}
      <div>
        <label className={labelCls}>Category</label>
        <select
          value={value.category_id ?? ''}
          onChange={(e) => set({ category_id: e.target.value ? Number(e.target.value) : undefined })}
          className={inputCls}
        >
          <option value="">No category</option>
          {(meta?.categories ?? []).map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Blog tags (separate from post-scheduler tags) */}
      <div>
        <label className={labelCls}>Blog tags</label>
        {blogTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {blogTags.map((tag) => (
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
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) } }}
              placeholder="Add tag…"
              className={inputCls}
            />
            {tagInput && suggestions.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg border border-[var(--line)] bg-[var(--surface-card)] shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button key={s} type="button"
                    onMouseDown={(e) => { e.preventDefault(); addTag(s) }}
                    className="w-full text-left px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] transition-colors"
                  >
                    #{s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => addTag(tagInput)}
            disabled={!tagInput.trim()}
            className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Options row */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={value.allow_comments ?? true}
            onChange={(e) => set({ allow_comments: e.target.checked })}
            className="rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span className="text-xs text-[var(--text-muted)]">Allow comments</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={value.is_featured ?? false}
            onChange={(e) => set({ is_featured: e.target.checked })}
            className="rounded border-[var(--line)] text-[var(--accent)] focus:ring-[var(--accent)]"
          />
          <span className="text-xs text-[var(--text-muted)]">Featured post</span>
        </label>
      </div>

      {/* SEO accordion */}
      <div className="rounded-xl border border-[var(--line)] overflow-hidden">
        <button type="button"
          onClick={() => setSeoOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide hover:bg-[var(--surface-subtle)] transition-colors"
        >
          SEO settings
          {seoOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {seoOpen && (
          <div className="px-4 pb-4 space-y-3 border-t border-[var(--line)]">
            <div className="mt-3">
              <label className={labelCls}>
                Meta title <span className="normal-case font-normal">({(value.meta_title ?? '').length}/70)</span>
              </label>
              <input
                value={value.meta_title ?? ''}
                onChange={(e) => set({ meta_title: e.target.value })}
                placeholder="SEO title (defaults to post title)"
                maxLength={70}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>
                Meta description <span className="normal-case font-normal">({(value.meta_description ?? '').length}/160)</span>
              </label>
              <textarea
                value={value.meta_description ?? ''}
                onChange={(e) => set({ meta_description: e.target.value })}
                placeholder="SEO description (defaults to excerpt)"
                rows={2}
                maxLength={160}
                className={textareaCls}
              />
            </div>

            <div>
              <label className={labelCls}>Canonical URL</label>
              <input
                type="url"
                value={value.canonical_url ?? ''}
                onChange={(e) => set({ canonical_url: e.target.value })}
                placeholder="https://original-source.com/article (if republishing)"
                className={inputCls}
              />
            </div>
          </div>
        )}
      </div>

      {/* Case study accordion */}
      {postType === 'case_study' && (
        <div className="rounded-xl border border-[var(--accent)]/30 overflow-hidden">
          <button type="button"
            onClick={() => setCsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-[var(--accent-text)] uppercase tracking-wide bg-[var(--accent-subtle)] hover:bg-[var(--accent-subtle)]/80 transition-colors"
          >
            Case study details
            {csOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {csOpen && (
            <div className="px-4 pb-4 space-y-3 border-t border-[var(--accent)]/20">
              {[
                { key: 'client',   label: 'Client / Company',  placeholder: 'Acme Corp' },
                { key: 'industry', label: 'Industry',          placeholder: 'SaaS / E-commerce / Healthcare…' },
                { key: 'duration', label: 'Project duration',  placeholder: '3 months' },
                { key: 'project_url', label: 'Live project URL', placeholder: 'https://…', type: 'url' },
              ].map(({ key, label, placeholder, type }) => (
                <div key={key} className="mt-3">
                  <label className={labelCls}>{label}</label>
                  <input
                    type={type ?? 'text'}
                    value={(cs as Record<string, string>)[key] ?? ''}
                    onChange={(e) => setCs({ [key]: e.target.value } as Partial<BlogCaseStudy>)}
                    placeholder={placeholder}
                    className={inputCls}
                  />
                </div>
              ))}

              {[
                { key: 'challenge', label: 'Challenge / Problem',   placeholder: 'What problem needed solving?' },
                { key: 'solution',  label: 'Solution / Approach',   placeholder: 'How was it solved?' },
                { key: 'results',   label: 'Results / Outcomes',    placeholder: 'What were the measurable results?' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className={labelCls}>{label}</label>
                  <textarea
                    value={(cs as Record<string, string>)[key] ?? ''}
                    onChange={(e) => setCs({ [key]: e.target.value } as Partial<BlogCaseStudy>)}
                    placeholder={placeholder}
                    rows={3}
                    className={textareaCls}
                  />
                </div>
              ))}

              {/* Technologies */}
              <div>
                <label className={labelCls}>Technologies used</label>
                {technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {technologies.map((t) => (
                      <span key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--surface-subtle)] border border-[var(--line)] text-[var(--text-muted)]"
                      >
                        {t}
                        <button type="button"
                          onClick={() => setCs({ technologies: technologies.filter((x) => x !== t) })}
                          className="hover:text-red-500"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(techInput) } }}
                    placeholder="Next.js, Laravel, PostgreSQL…"
                    className={`${inputCls} flex-1`}
                  />
                  <button type="button" onClick={() => addTech(techInput)} disabled={!techInput.trim()}
                    className="px-3 py-2 rounded-lg border border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--accent)] transition-colors disabled:opacity-40"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
