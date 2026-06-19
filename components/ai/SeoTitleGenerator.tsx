'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { aiApi, seoApi } from '@/lib/api'
import { Button, Modal, Select } from '@/components/ui'
import type { SeoFormula, SeoTitle } from '@/lib/types'

const CONTENT_TYPES = [
  { value: 'tutorial',   label: 'Tutorial' },
  { value: 'tips',       label: 'Quick Tips' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'mistakes',   label: 'Mistakes / Bad Practices' },
  { value: 'guide',      label: 'Complete Guide' },
  { value: 'release',    label: 'Version Release' },
  { value: 'project',    label: 'Project Build' },
  { value: 'benchmark',  label: 'Benchmark' },
]

interface Props {
  open:     boolean
  onClose:  () => void
  onInsert: (title: string, slug: string) => void
}

export default function SeoTitleGenerator({ open, onClose, onInsert }: Props) {
  const [keyword,     setKeyword]     = useState('')
  const [framework,   setFramework]   = useState('')
  const [contentType, setContentType] = useState('tutorial')
  const [formula,     setFormula]     = useState('')
  const [formulas,    setFormulas]    = useState<SeoFormula[]>([])
  const [results,     setResults]     = useState<SeoTitle[]>([])
  const [slug,        setSlug]        = useState('')
  const [loading,     setLoading]     = useState(false)
  const [copied,      setCopied]      = useState<number | null>(null)
  const [formulasLoaded, setFormulasLoaded] = useState(false)

  useEffect(() => {
    if (!open || formulasLoaded) return
    seoApi.formulas()
      .then((data) => { setFormulas(data.formulas); setFormulasLoaded(true) })
      .catch(() => {})
  }, [open, formulasLoaded])

  const generate = async () => {
    if (!keyword.trim()) { toast.error('Enter a keyword first.'); return }
    setLoading(true)
    setResults([])
    try {
      const data = await aiApi.generateSeoTitles({
        keyword: keyword.trim(),
        content_type: contentType || undefined,
        framework:    framework.trim() || undefined,
        formula:      formula || undefined,
      })
      setResults(data.titles)
      setSlug(data.suggested_slug)
    } catch {
      toast.error('Generation failed. Check AI service is configured.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (title: string, i: number) => {
    await navigator.clipboard.writeText(title)
    setCopied(i)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleInsert = (title: string) => {
    onInsert(title, slug)
    onClose()
    setResults([])
    setKeyword('')
  }

  const handleClose = () => {
    setResults([])
    onClose()
  }

  const formulaOptions = [
    { value: '', label: 'Any formula (variety)' },
    ...formulas.map((f) => ({ value: f.key, label: f.label })),
  ]

  const INTENT_COLORS: Record<string, string> = {
    'how-to':      'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    'informational': 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
    'decision-making': 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    'performance / technical research': 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="SEO Title Generator"
      size="lg"
    >
      <div className="space-y-4">

        {/* Keyword */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
            Target keyword *
          </label>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
            placeholder="e.g. laravel cors next.js, next-auth laravel sanctum..."
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] text-sm text-[var(--text-base)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        {/* Framework + content type row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
              Framework / Tech
            </label>
            <input
              value={framework}
              onChange={(e) => setFramework(e.target.value)}
              placeholder="Laravel 12, Next.js 15..."
              className="w-full px-3 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] text-sm text-[var(--text-base)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            />
          </div>
          <Select
            label="Content type"
            options={CONTENT_TYPES}
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
          />
        </div>

        {/* Formula selector */}
        <Select
          label="SEO Formula (optional)"
          options={formulaOptions}
          value={formula}
          onChange={(e) => setFormula(e.target.value)}
        />

        <Button onClick={generate} disabled={loading || !keyword.trim()} className="w-full">
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating titles…</>
            : <><Sparkles className="h-4 w-4" /> Generate 5 SEO titles</>}
        </Button>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-[var(--text-faint)] font-medium uppercase tracking-wide">
              {results.length} title suggestions
            </p>
            {results.map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] p-3 hover:border-[var(--accent)]/50 transition-colors"
              >
                <p className="text-sm font-medium text-[var(--text-base)] leading-snug mb-2">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                    INTENT_COLORS[item.search_intent] ?? 'bg-[var(--surface-overlay)] text-[var(--text-muted)]'
                  }`}>
                    {item.search_intent}
                  </span>
                  <span className="text-[10px] text-[var(--text-faint)]">
                    {item.estimated_length} chars · {item.formula?.replace(/_/g, ' ')}
                  </span>
                  <div className="ml-auto flex gap-1.5">
                    <button
                      onClick={() => handleCopy(item.title, i)}
                      className="flex items-center gap-1 text-[11px] text-[var(--text-faint)] hover:text-[var(--accent)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--surface-card)]"
                    >
                      {copied === i
                        ? <><Check className="h-3 w-3" /> Copied</>
                        : <><Copy className="h-3 w-3" /> Copy</>}
                    </button>
                    <Button size="sm" onClick={() => handleInsert(item.title)}>
                      Use this
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {slug && (
              <p className="text-[11px] text-[var(--text-faint)] mt-1">
                Suggested slug: <code className="bg-[var(--surface-overlay)] px-1 rounded">{slug}</code>
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
