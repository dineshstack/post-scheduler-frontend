'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ArrowRight, ChevronDown, ChevronUp, Edit2, Lightbulb,
  Loader2, Plus, RefreshCw, Sparkles, Tag, Trash2, X,
} from 'lucide-react'
import { toast } from 'sonner'
import AppLayout from '@/components/layout/AppLayout'
import { Button, Card, ConfirmModal, Select } from '@/components/ui'
import {
  useConvertPostIdea, useCreatePostIdea, useDeletePostIdea,
  usePostIdeas, useUpdatePostIdea,
} from '@/lib/hooks'
import type { PostIdea, PostIdeaContentType, PostIdeaSeoFormula, StorePostIdeaPayload } from '@/lib/types'

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: '',           label: 'All statuses' },
  { value: 'idea',       label: 'Idea' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'converted', label: 'Converted' },
  { value: 'rejected',  label: 'Rejected' },
]

const PRIORITY_OPTIONS = [
  { value: '',       label: 'All priorities' },
  { value: 'high',   label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low',    label: 'Low' },
]

const CONTENT_TYPE_OPTIONS = [
  { value: '',           label: 'All types' },
  { value: 'tutorial',   label: 'Tutorial' },
  { value: 'tips',       label: 'Quick Tips' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'mistakes',   label: 'Mistakes / Bad Practices' },
  { value: 'guide',      label: 'Complete Guide' },
  { value: 'release',    label: 'Version Release' },
  { value: 'project',    label: 'Project Build' },
  { value: 'benchmark',  label: 'Benchmark' },
]

const SEO_FORMULA_OPTIONS = [
  { value: '',                label: 'No formula' },
  { value: 'step_by_step',    label: 'Step by Step Tutorial' },
  { value: 'bad_practices',   label: 'Bad Practices' },
  { value: 'all_you_need',    label: 'All You Need to Know' },
  { value: 'vs_comparison',   label: 'X vs Y Comparison' },
  { value: 'n_ways',          label: 'N Ways to...' },
  { value: 'release_update',  label: 'Version Release' },
  { value: 'beginners_guide', label: "Beginner's Guide" },
  { value: 'benchmark',       label: 'Performance Benchmark' },
  { value: 'first_impression','label': 'First Impression Review' },
  { value: 'top_mistakes',    label: 'Top Mistakes' },
]

const STATUS_STYLES: Record<string, string> = {
  idea:        'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  in_progress: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  converted:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
  rejected:    'bg-[var(--surface-overlay)] text-[var(--text-faint)]',
}

const PRIORITY_STYLES: Record<string, string> = {
  high:   'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  low:    'bg-[var(--surface-overlay)] text-[var(--text-muted)]',
}

const labelCls = 'block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1'
const inputCls = 'w-full rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2 text-sm text-[var(--text-base)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors'

// ── Form types ────────────────────────────────────────────────────────────────

interface IdeaFormData {
  title: string
  keyword_target: string
  content_type: PostIdeaContentType
  seo_formula: PostIdeaSeoFormula | ''
  priority: 'low' | 'medium' | 'high'
  notes: string
  target_publish_date: string
  tags: string
}

const BLANK_FORM: IdeaFormData = {
  title:               '',
  keyword_target:      '',
  content_type:        'tutorial',
  seo_formula:         '',
  priority:            'medium',
  notes:               '',
  target_publish_date: '',
  tags:                '',
}

// ── Idea form modal ───────────────────────────────────────────────────────────

function IdeaFormModal({
  open, onClose, editing,
}: {
  open: boolean
  onClose: () => void
  editing: PostIdea | null
}) {
  const [form,    setForm]    = useState<IdeaFormData>(BLANK_FORM)
  const [isOpen,  setIsOpen]  = useState(false)
  const [advOpen, setAdvOpen] = useState(false)

  const { mutate: create, isPending: creating } = useCreatePostIdea()
  const { mutate: update, isPending: updating } = useUpdatePostIdea(editing?.id ?? 0)

  const pending = creating || updating

  // Sync form when modal opens
  if (open && !isOpen) {
    setIsOpen(true)
    setForm(editing ? {
      title:               editing.title,
      keyword_target:      editing.keyword_target ?? '',
      content_type:        editing.content_type,
      seo_formula:         editing.seo_formula ?? '',
      priority:            editing.priority,
      notes:               editing.notes ?? '',
      target_publish_date: editing.target_publish_date ?? '',
      tags:                (editing.tags ?? []).join(', '),
    } : BLANK_FORM)
  }
  if (!open && isOpen) setIsOpen(false)

  if (!open) return null

  const set = (patch: Partial<IdeaFormData>) => setForm((f) => ({ ...f, ...patch }))

  const buildPayload = (): StorePostIdeaPayload => ({
    title:               form.title.trim(),
    keyword_target:      form.keyword_target.trim() || undefined,
    content_type:        form.content_type,
    seo_formula:         (form.seo_formula || undefined) as PostIdeaSeoFormula | undefined,
    priority:            form.priority,
    notes:               form.notes.trim() || undefined,
    target_publish_date: form.target_publish_date || undefined,
    tags:                form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : undefined,
  })

  const handleSubmit = () => {
    if (!form.title.trim()) { toast.error('Title is required.'); return }
    const payload = buildPayload()
    if (editing) {
      update(payload, { onSuccess: onClose })
    } else {
      create(payload, { onSuccess: onClose })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--line)]">
          <h2 className="text-base font-semibold text-[var(--text-base)]">
            {editing ? 'Edit idea' : 'New post idea'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg text-[var(--text-faint)] hover:bg-[var(--surface-subtle)] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className={labelCls}>Post title *</label>
            <input
              value={form.title}
              onChange={(e) => set({ title: e.target.value })}
              placeholder="How to Create User Roles in Laravel 12?"
              className={inputCls}
            />
          </div>

          {/* Keyword */}
          <div>
            <label className={labelCls}>Target keyword</label>
            <input
              value={form.keyword_target}
              onChange={(e) => set({ keyword_target: e.target.value })}
              placeholder="laravel user roles permissions tutorial"
              className={inputCls}
            />
          </div>

          {/* Type + priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Content type</label>
              <select
                value={form.content_type}
                onChange={(e) => set({ content_type: e.target.value as PostIdeaContentType })}
                className={inputCls}
              >
                {CONTENT_TYPE_OPTIONS.filter(o => o.value).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Priority</label>
              <select
                value={form.priority}
                onChange={(e) => set({ priority: e.target.value as 'low' | 'medium' | 'high' })}
                className={inputCls}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Advanced accordion */}
          <div className="rounded-xl border border-[var(--line)] overflow-hidden">
            <button
              type="button"
              onClick={() => setAdvOpen((v) => !v)}
              className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide hover:bg-[var(--surface-subtle)] transition-colors"
            >
              Advanced SEO options
              {advOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {advOpen && (
              <div className="px-4 pb-4 space-y-3 border-t border-[var(--line)]">
                <div className="mt-3">
                  <label className={labelCls}>SEO formula</label>
                  <select
                    value={form.seo_formula}
                    onChange={(e) => set({ seo_formula: e.target.value as PostIdeaSeoFormula | '' })}
                    className={inputCls}
                  >
                    {SEO_FORMULA_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Tags (comma separated)</label>
                  <input
                    value={form.tags}
                    onChange={(e) => set({ tags: e.target.value })}
                    placeholder="laravel, tutorial, authentication"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Target publish date</label>
                  <input
                    type="date"
                    value={form.target_publish_date}
                    onChange={(e) => set({ target_publish_date: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => set({ notes: e.target.value })}
                    placeholder="Key points, reference links, outline ideas..."
                    rows={3}
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[var(--line)] flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit} loading={pending}>
            {editing ? 'Save changes' : 'Add idea'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Idea row ──────────────────────────────────────────────────────────────────

function IdeaRow({
  idea, onEdit, onDelete, onConvert,
}: {
  idea: PostIdea
  onEdit: (idea: PostIdea) => void
  onDelete: (idea: PostIdea) => void
  onConvert: (idea: PostIdea) => void
}) {
  const { mutate: updateStatus, isPending: updatingStatus } = useUpdatePostIdea(idea.id)
  const converting = idea.status === 'converted'

  return (
    <div className="flex items-start gap-4 px-5 py-4 hover:bg-[var(--surface-subtle)] transition-colors">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-base)] truncate">{idea.title}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[idea.status]}`}>
            {idea.status.replace('_', ' ')}
          </span>
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[idea.priority]}`}>
            {idea.priority}
          </span>
          {idea.content_type && (
            <span className="text-[10px] text-[var(--text-faint)]">{idea.content_type}</span>
          )}
          {idea.keyword_target && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--text-faint)]">
              <Tag className="h-2.5 w-2.5" /> {idea.keyword_target}
            </span>
          )}
          {idea.target_publish_date && (
            <span className="text-[10px] text-[var(--text-faint)]">
              Target: {format(new Date(idea.target_publish_date), 'MMM d, yyyy')}
            </span>
          )}
        </div>
        {idea.tags && idea.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {idea.tags.map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)]">
                #{tag}
              </span>
            ))}
          </div>
        )}
        {idea.converted_post && (
          <Link
            href={`/dashboard/posts/${idea.converted_post.id}`}
            className="inline-flex items-center gap-1 mt-1.5 text-[11px] text-[var(--accent)] hover:underline"
          >
            View draft post <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="flex items-center gap-1 shrink-0 flex-wrap justify-end">
        {idea.status === 'idea' && (
          <Button
            variant="ghost" size="sm"
            onClick={() => updateStatus({ status: 'in_progress' })}
            loading={updatingStatus}
            title="Mark in progress"
          >
            <Sparkles className="h-3.5 w-3.5" /> Start
          </Button>
        )}
        {!converting && (
          <Button variant="ghost" size="sm" onClick={() => onConvert(idea)} title="Convert to draft post">
            <RefreshCw className="h-3.5 w-3.5" /> Convert
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={() => onEdit(idea)} title="Edit">
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost" size="icon"
          onClick={() => onDelete(idea)}
          className="text-[var(--text-faint)] hover:text-red-500"
          title="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function IdeasPage() {
  const [statusFilter,  setStatusFilter]  = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [typeFilter,    setTypeFilter]    = useState('')
  const [page,          setPage]          = useState(1)
  const [formOpen,      setFormOpen]      = useState(false)
  const [editing,       setEditing]       = useState<PostIdea | null>(null)
  const [deleteTarget,  setDeleteTarget]  = useState<PostIdea | null>(null)
  const [convertTarget, setConvertTarget] = useState<PostIdea | null>(null)

  const { data, isLoading, refetch } = usePostIdeas({
    status:       statusFilter  || undefined,
    priority:     priorityFilter || undefined,
    content_type: typeFilter    || undefined,
    page,
    per_page: 20,
  })

  const { mutate: deleteIdea,  isPending: deleting   } = useDeletePostIdea()
  const { mutate: convertIdea, isPending: converting } = useConvertPostIdea()

  const handleEdit = (idea: PostIdea) => {
    setEditing(idea)
    setFormOpen(true)
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteIdea(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  const handleConvert = () => {
    if (!convertTarget) return
    convertIdea(convertTarget.id, {
      onSuccess: () => setConvertTarget(null),
    })
  }

  return (
    <AppLayout
      title="Post Ideas"
      action={
        <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true) }}>
          <Plus className="h-3.5 w-3.5" /> New idea
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Select options={STATUS_OPTIONS}       value={statusFilter}   onChange={(e) => { setStatusFilter(e.target.value);   setPage(1) }} className="w-40" />
        <Select options={PRIORITY_OPTIONS}     value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setPage(1) }} className="w-36" />
        <Select options={CONTENT_TYPE_OPTIONS} value={typeFilter}     onChange={(e) => { setTypeFilter(e.target.value);     setPage(1) }} className="w-48" />
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
        {data && (
          <span className="ml-auto text-xs text-[var(--text-faint)]">
            {data.total} idea{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <Card>
        {isLoading ? (
          <div className="py-16 flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : !data?.data?.length ? (
          <div className="py-16 text-center">
            <Lightbulb className="h-10 w-10 text-[var(--text-faint)] mx-auto mb-3" />
            <p className="text-sm font-medium text-[var(--text-muted)]">No ideas yet.</p>
            <p className="text-xs text-[var(--text-faint)] mt-1 mb-4">Capture a post idea before it slips away.</p>
            <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true) }}>
              <Plus className="h-3.5 w-3.5" /> Add first idea
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {data.data.map((idea) => (
              <IdeaRow
                key={idea.id}
                idea={idea}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
                onConvert={setConvertTarget}
              />
            ))}
          </div>
        )}

        {data && data.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--line)]">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <span className="text-xs text-[var(--text-muted)]">Page {data.current_page} of {data.last_page}</span>
            <Button variant="secondary" size="sm" disabled={page >= data.last_page} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </Card>

      {/* Form modal */}
      <IdeaFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null) }}
        editing={editing}
      />

      {/* Delete confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete idea"
        description={`"${deleteTarget?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />

      {/* Convert confirm */}
      <ConfirmModal
        open={!!convertTarget}
        onClose={() => setConvertTarget(null)}
        onConfirm={handleConvert}
        title="Convert to draft post"
        description={`This will create a draft post from "${convertTarget?.title}" with an SEO writing plan pre-filled in the notes.`}
        confirmLabel="Convert"
        loading={converting}
      />
    </AppLayout>
  )
}
