'use client'

import { useState } from 'react'
import {
  BookOpen, CheckSquare, ChevronDown, ChevronRight,
  Copy, Check, Keyboard, Layers, Lightbulb, ListChecks,
  Loader2, Monitor, Target, TrendingUp, Zap,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useSeoGuidelines } from '@/lib/hooks'

// ── Helpers ───────────────────────────────────────────────────────────────────

function useCopy() {
  const [copied, setCopied] = useState<string | null>(null)
  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 1800)
  }
  return { copied, copy }
}

function CopyButton({ text, id, copied, copy }: { text: string; id: string; copied: string | null; copy: (t: string, k: string) => void }) {
  const active = copied === id
  return (
    <button
      onClick={() => copy(text, id)}
      className="flex items-center gap-1 text-[10px] text-[var(--text-faint)] hover:text-[var(--accent)] transition-colors px-1.5 py-0.5 rounded"
    >
      {active ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
      {active ? 'Copied' : 'Copy'}
    </button>
  )
}

// ── Tab definitions ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'formulas',    label: 'Title Formulas',   icon: Keyboard },
  { id: 'intro',       label: 'Intro Formula',    icon: BookOpen },
  { id: 'structure',   label: 'Post Structure',   icon: Layers },
  { id: 'checklist',   label: 'SEO Checklist',    icon: ListChecks },
  { id: 'keywords',    label: 'Keywords',         icon: Target },
  { id: 'technical',   label: 'Technical Signals',icon: Monitor },
  { id: 'publishing',  label: 'Publishing Tips',  icon: TrendingUp },
] as const

type TabId = typeof TABS[number]['id']

// ── Section components ────────────────────────────────────────────────────────

const CONTENT_TYPE_COLORS: Record<string, string> = {
  tutorial:   'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  guide:      'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300',
  comparison: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  mistakes:   'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
  tips:       'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  release:    'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  project:    'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300',
  benchmark:  'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300',
}

function FormulasTab({ formulas, copied, copy }: {
  formulas: { pattern: string; example: string; content_types: string[] }[]
  copied: string | null
  copy: (t: string, k: string) => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-faint)]">
        These are the proven title patterns from high-traffic technical blogs. Use them as templates — replace the bracketed parts with your topic.
      </p>
      {formulas.map((f, i) => (
        <div key={i} className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--line)] flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <code className="text-sm font-mono text-[var(--accent)]">{f.pattern}</code>
            </div>
            <CopyButton text={f.pattern} id={`formula-${i}`} copied={copied} copy={copy} />
          </div>
          <div className="px-4 py-2.5 flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-[var(--text-faint)] mb-1">Example</p>
              <p className="text-xs text-[var(--text-muted)] font-medium italic">"{f.example}"</p>
            </div>
            <div className="flex flex-wrap gap-1 shrink-0">
              {f.content_types.map((ct) => (
                <span key={ct} className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CONTENT_TYPE_COLORS[ct] ?? 'bg-[var(--surface-overlay)] text-[var(--text-faint)]'}`}>
                  {ct}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function IntroTab({ intro, copied, copy }: {
  intro: { template: string; variants: string[]; seo_anchor_phrase: string }
  copied: string | null
  copy: (t: string, k: string) => void
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-subtle)] p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <p className="text-xs font-semibold text-[var(--accent-text)] uppercase tracking-wide">Primary Template</p>
          <CopyButton text={intro.template} id="intro-template" copied={copied} copy={copy} />
        </div>
        <p className="text-sm font-medium text-[var(--text-base)] leading-relaxed">"{intro.template}"</p>
      </div>

      <div>
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">SEO Anchor Phrase</p>
        <div className="rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-base)]">{intro.seo_anchor_phrase}</p>
          <CopyButton text={intro.seo_anchor_phrase} id="anchor" copied={copied} copy={copy} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Variants by Content Type</p>
        <div className="space-y-2">
          {intro.variants.map((v, i) => (
            <div key={i} className="rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-3 flex items-start justify-between gap-3">
              <p className="text-xs text-[var(--text-muted)] italic leading-relaxed">"{v}"</p>
              <CopyButton text={v} id={`variant-${i}`} copied={copied} copy={copy} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StructureTab({ structure }: { structure: Record<string, string[]> }) {
  const [open, setOpen] = useState<string | null>(Object.keys(structure)[0] ?? null)

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-faint)] mb-3">
        Use the matching structure for your content type. Each section should have real code blocks.
      </p>
      {Object.entries(structure).map(([type, steps]) => (
        <div key={type} className="rounded-xl border border-[var(--line)] overflow-hidden">
          <button
            onClick={() => setOpen(open === type ? null : type)}
            className="flex w-full items-center justify-between px-4 py-3 hover:bg-[var(--surface-subtle)] transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CONTENT_TYPE_COLORS[type] ?? 'bg-[var(--surface-overlay)] text-[var(--text-faint)]'}`}>
                {type}
              </span>
              <span className="text-sm font-medium text-[var(--text-base)] capitalize">{type.replace('_', ' ')}</span>
            </div>
            {open === type
              ? <ChevronDown className="h-4 w-4 text-[var(--text-faint)]" />
              : <ChevronRight className="h-4 w-4 text-[var(--text-faint)]" />}
          </button>
          {open === type && (
            <div className="border-t border-[var(--line)] px-4 py-3 bg-[var(--surface-subtle)]">
              <ol className="space-y-1.5">
                {steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[var(--text-muted)]">
                    <span className="text-[var(--accent)] font-bold shrink-0 mt-0.5">{i + 1}.</span>
                    <span className={step.startsWith('  →') ? 'pl-3 text-[var(--text-faint)]' : ''}>{step.replace('  → ', '')}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

const CHECKLIST_ICONS: Record<string, React.ElementType> = {
  title:          CheckSquare,
  url_slug:       CheckSquare,
  content:        CheckSquare,
  meta:           CheckSquare,
  internal_links: CheckSquare,
  tags:           CheckSquare,
  images:         CheckSquare,
  publishing:     CheckSquare,
}

const CHECKLIST_LABELS: Record<string, string> = {
  title:          'Title',
  url_slug:       'URL Slug',
  content:        'Content',
  meta:           'Meta / OG Tags',
  internal_links: 'Internal Links',
  tags:           'Tags',
  images:         'Images',
  publishing:     'Publishing',
}

function ChecklistTab({ checklist }: { checklist: Record<string, string[]> }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  const total    = Object.values(checklist).flat().length
  const done     = Object.values(checked).filter(Boolean).length
  const pct      = total > 0 ? Math.round((done / total) * 100) : 0

  const toggle = (key: string) => setChecked((p) => ({ ...p, [key]: !p[key] }))

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[var(--text-muted)]">Post SEO Score</p>
          <p className="text-xs font-bold text-[var(--accent)]">{done}/{total} · {pct}%</p>
        </div>
        <div className="h-2 rounded-full bg-[var(--line)] overflow-hidden">
          <div
            className="h-full rounded-full bg-[var(--accent)] transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        {pct === 100 && (
          <p className="text-xs text-emerald-500 font-medium mt-2 flex items-center gap-1">
            <Check className="h-3.5 w-3.5" /> Post is SEO-ready!
          </p>
        )}
      </div>

      {/* Category checklists */}
      {Object.entries(checklist).map(([category, items]) => (
        <div key={category}>
          <p className="text-[10px] font-bold text-[var(--text-faint)] uppercase tracking-widest mb-2">
            {CHECKLIST_LABELS[category] ?? category}
          </p>
          <div className="space-y-1.5">
            {items.map((item, i) => {
              const key = `${category}-${i}`
              const isChecked = !!checked[key]
              return (
                <label
                  key={key}
                  className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-[var(--surface-subtle)] cursor-pointer group transition-colors"
                >
                  <div className={`mt-0.5 h-4 w-4 shrink-0 rounded border transition-colors ${
                    isChecked
                      ? 'bg-[var(--accent)] border-[var(--accent)]'
                      : 'border-[var(--line)] group-hover:border-[var(--accent)]/60'
                  }`}>
                    {isChecked && <Check className="h-3 w-3 text-white mx-auto mt-0.5" />}
                  </div>
                  <input type="checkbox" className="sr-only" checked={isChecked} onChange={() => toggle(key)} />
                  <span className={`text-xs leading-relaxed transition-colors ${
                    isChecked ? 'line-through text-[var(--text-faint)]' : 'text-[var(--text-muted)]'
                  }`}>
                    {item}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      ))}

      <p className="text-[11px] text-[var(--text-faint)] pt-2">
        Checkboxes reset on page refresh — use them while writing each post.
      </p>
    </div>
  )
}

function KeywordsTab({ strategy }: { strategy: {
  high_volume_categories: Record<string, string>
  high_intent_topics: Record<string, string>
  your_unique_niche: { gap: string; opportunity: string; examples: string[] }
  quick_wins: Record<string, string>
}}) {
  return (
    <div className="space-y-5">
      {/* Unique niche callout */}
      <div className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-subtle)] p-4">
        <div className="flex items-start gap-3">
          <Zap className="h-4 w-4 text-[var(--accent-text)] shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-[var(--accent-text)] mb-1">Your Unfair Advantage</p>
            <p className="text-xs text-[var(--text-muted)] mb-2">{strategy.your_unique_niche.gap}</p>
            <p className="text-xs text-[var(--text-base)] font-medium mb-3">{strategy.your_unique_niche.opportunity}</p>
            <div className="flex flex-wrap gap-1.5">
              {strategy.your_unique_niche.examples.map((ex) => (
                <code key={ex} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-card)] border border-[var(--accent)]/30 text-[var(--accent-text)]">
                  {ex}
                </code>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick wins */}
      <div>
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-2">Quick Wins — Low Competition</p>
        <div className="rounded-xl border border-[var(--line)] overflow-hidden divide-y divide-[var(--line)]">
          {Object.entries(strategy.quick_wins).map(([topic, reason]) => (
            <div key={topic} className="flex items-start gap-3 px-4 py-3">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--text-base)]">{topic}</p>
                <p className="text-[11px] text-[var(--text-faint)] mt-0.5">{reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High volume categories */}
      <div>
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-2">High-Volume Categories</p>
        <div className="rounded-xl border border-[var(--line)] overflow-hidden divide-y divide-[var(--line)]">
          {Object.entries(strategy.high_volume_categories).map(([cat, note]) => (
            <div key={cat} className="flex items-start gap-3 px-4 py-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--surface-subtle)] text-[var(--text-muted)] shrink-0 mt-0.5">
                {cat}
              </span>
              <p className="text-xs text-[var(--text-faint)]">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* High intent topics */}
      <div>
        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-2">High Search-Intent Topics</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(strategy.high_intent_topics).map(([topic, note]) => (
            <div key={topic} className="rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2.5">
              <p className="text-xs font-semibold text-[var(--text-base)]">{topic}</p>
              <p className="text-[11px] text-[var(--text-faint)] mt-0.5">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function TechnicalTab({ signals }: { signals: { signal: string; rule: string }[] }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-faint)]">
        Technical SEO signals that affect crawlability, indexing, and rich results. Implement once and they apply to every post.
      </p>
      <div className="rounded-xl border border-[var(--line)] overflow-hidden divide-y divide-[var(--line)]">
        {signals.map(({ signal, rule }, i) => (
          <div key={i} className="grid grid-cols-[140px_1fr] gap-4 px-4 py-3 items-start">
            <p className="text-xs font-semibold text-[var(--text-base)]">{signal}</p>
            <p className="text-xs text-[var(--text-faint)]">{rule}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function PublishingTab({ tips }: { tips: Record<string, string> }) {
  const ICONS: Record<string, string> = {
    cadence:          '📅',
    series_format:    '🔢',
    version_timing:   '⚡',
    dogfooding:       '🐕',
    free_content:     '🎁',
    internal_linking: '🔗',
    social_sharing:   '📣',
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-[var(--text-faint)]">
        These habits compound over time. Consistency matters more than volume.
      </p>
      {Object.entries(tips).map(([key, tip]) => (
        <div key={key} className="flex items-start gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-3">
          <span className="text-base shrink-0 mt-0.5">{ICONS[key] ?? '💡'}</span>
          <div>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">
              {key.replace(/_/g, ' ')}
            </p>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{tip}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SeoPage() {
  const [activeTab, setActiveTab] = useState<TabId>('formulas')
  const { data, isLoading, isError } = useSeoGuidelines()

  return (
    <AppLayout title="SEO Playbook">
      {/* Tab bar */}
      <div className="flex items-center gap-1 flex-wrap mb-6 border-b border-[var(--line)] pb-0">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors -mb-px ${
              activeTab === id
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-base)]'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-24 text-sm text-[var(--text-faint)]">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading SEO playbook…
        </div>
      )}

      {isError && (
        <div className="py-24 text-center text-sm text-[var(--text-muted)]">
          Could not load SEO guidelines. Make sure the backend is running.
        </div>
      )}

      {data && (
        <div className="max-w-3xl">
          {(() => {
            const { copied, copy } = { copied: null as string | null, copy: (_t: string, _k: string) => {} }
            void copied; void copy
            return null
          })()}

          {/* Each tab renders its own section */}
          {activeTab === 'formulas' && (
            <FormulasSection formulas={data.title_formulas} />
          )}
          {activeTab === 'intro' && (
            <Card>
              <CardHeader><CardTitle>Post Intro Formula</CardTitle></CardHeader>
              <CardContent><IntroSection intro={data.intro_formula} /></CardContent>
            </Card>
          )}
          {activeTab === 'structure' && (
            <Card>
              <CardHeader><CardTitle>Post Structure by Content Type</CardTitle></CardHeader>
              <CardContent><StructureTab structure={data.post_structure} /></CardContent>
            </Card>
          )}
          {activeTab === 'checklist' && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>SEO Checklist</CardTitle>
                  <p className="text-xs text-[var(--text-faint)] mt-0.5">Check each item as you write. Resets on page refresh.</p>
                </div>
              </CardHeader>
              <CardContent><ChecklistTab checklist={data.seo_checklist} /></CardContent>
            </Card>
          )}
          {activeTab === 'keywords' && (
            <Card>
              <CardHeader><CardTitle>Keyword Strategy</CardTitle></CardHeader>
              <CardContent><KeywordsTab strategy={data.keyword_strategy} /></CardContent>
            </Card>
          )}
          {activeTab === 'technical' && (
            <Card>
              <CardHeader><CardTitle>Technical SEO Signals</CardTitle></CardHeader>
              <CardContent><TechnicalTab signals={data.technical_signals} /></CardContent>
            </Card>
          )}
          {activeTab === 'publishing' && (
            <Card>
              <CardHeader><CardTitle>Publishing Tips</CardTitle></CardHeader>
              <CardContent><PublishingTab tips={data.publishing_tips} /></CardContent>
            </Card>
          )}
        </div>
      )}
    </AppLayout>
  )
}

// ── Stateful wrappers that own their own copy state ───────────────────────────

function FormulasSection({ formulas }: { formulas: { pattern: string; example: string; content_types: string[] }[] }) {
  const { copied, copy } = useCopy()
  return (
    <Card>
      <CardHeader><CardTitle>Title Formulas</CardTitle></CardHeader>
      <CardContent><FormulasTab formulas={formulas} copied={copied} copy={copy} /></CardContent>
    </Card>
  )
}

function IntroSection({ intro }: { intro: { template: string; variants: string[]; seo_anchor_phrase: string } }) {
  const { copied, copy } = useCopy()
  return <IntroTab intro={intro} copied={copied} copy={copy} />
}
