'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'
import { ChevronDown, ChevronUp, Clock, Image, Loader2, Plus, Save, Send, Sparkles, X } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Button, Input, Textarea, DateTimePicker } from '@/components/ui'
import MediaLibraryModal from '@/components/media/MediaLibraryModal'
import CaptionGenerator from '@/components/ai/CaptionGenerator'
import SeoTitleGenerator from '@/components/ai/SeoTitleGenerator'
import BlogSettingsPanel from '@/components/blog/BlogSettingsPanel'
import BlogSeoChecklist from '@/components/blog/BlogSeoChecklist'
import DevToSettingsPanel from '@/components/devto/DevToSettingsPanel'
import MediumSettingsPanel from '@/components/medium/MediumSettingsPanel'
import { useAnalyticsBestTimes, useCreatePost, usePlatformAccounts } from '@/lib/hooks'
import type { Platform, GalleryItem } from '@/lib/types'

const CKEditorField = dynamic(() => import('@/components/editor/CKEditorField'), {
  ssr: false,
  loading: () => (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] h-80 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-[var(--accent)]" />
    </div>
  ),
})

//  Constants

// Platforms with dedicated settings panels — excluded from the generic overrides accordion
const PANEL_PLATFORMS = new Set<Platform>(['blog', 'devto', 'medium'])

const PLATFORM_META: Record<Platform, { label: string; icon: string; charLimit: number }> = {
  twitter:   { label: 'Twitter / X',  icon: '𝕏',  charLimit: 280 },
  linkedin:  { label: 'LinkedIn',      icon: '💼', charLimit: 3000 },
  instagram: { label: 'Instagram',     icon: '📸', charLimit: 2200 },
  facebook:  { label: 'Facebook',      icon: '📘', charLimit: 63206 },
  tiktok:    { label: 'TikTok',        icon: '🎵', charLimit: 2200 },
  blog:      { label: 'Blog',          icon: '📝', charLimit: 0 },
  devto:     { label: 'Dev.to',        icon: '👩‍💻', charLimit: 0 },
  medium:    { label: 'Medium',        icon: '✍️',  charLimit: 0 },
}

const labelCls = 'block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5'

//  Schema

const schema = z.object({
  title:          z.string().min(1, 'Title is required'),
  body:           z.string().min(1, 'Body is required'),
  platforms:      z.array(z.string()).min(1, 'Select at least one platform'),
  scheduled_at:   z.string().nullable().optional(),
  blog_slug:      z.string().optional(),
  blog_post_type: z.enum(['article', 'tutorial', 'case_study', 'tip']).optional(),
  blog_locale:    z.enum(['en', 'si', 'ar']).optional(),
  notes:          z.string().optional(),
  first_comment:  z.string().max(2200).optional(),
  overrides: z.record(z.object({
    body:             z.string().optional(),
    excerpt:          z.string().max(500).optional(),
    category_id:      z.number().optional(),
    tags:             z.array(z.string()).optional(),
    meta_title:       z.string().max(70).optional(),
    meta_description: z.string().max(160).optional(),
    canonical_url:    z.string().optional(),
    is_featured:      z.boolean().optional(),
    allow_comments:   z.boolean().optional(),
    og_image:         z.string().optional(),
    is_premium:       z.boolean().optional(),
    free_preview_paragraphs: z.number().min(1).max(20).optional(),
    video_url:        z.string().optional(),
    github_repo_url:  z.string().optional(),
    llm_snippet:      z.string().max(1000).optional(),
    faq: z.array(z.object({ question: z.string(), answer: z.string() })).optional(),
    last_reviewed_at: z.string().optional(),
    pillar_post_id:   z.number().optional(),
    related_post_ids: z.array(z.number()).optional(),
    case_study: z.object({
      client: z.string().optional(), industry: z.string().optional(),
      challenge: z.string().optional(), solution: z.string().optional(),
      results: z.string().optional(), technologies: z.array(z.string()).optional(),
      project_url: z.string().optional(), duration: z.string().optional(),
    }).optional(),
    // Dev.to-specific (max 4 tags, no hyphens)
    series:          z.string().optional(),
    description:     z.string().max(500).optional(),
    main_image:      z.string().optional(),
    published:       z.boolean().optional(),
    // Medium-specific (max 3 tags, posts are immutable after publish)
    publish_status:  z.enum(['public', 'draft', 'unlisted']).optional(),
    notify_followers: z.boolean().optional(),
    publication_id:  z.string().optional(),
  })).optional(),
})

type FormValues = z.infer<typeof schema>

//  Platform selector

function PlatformSelector({
  connected, selected, onChange,
}: {
  connected: Platform[]; selected: Platform[]; onChange: (p: Platform[]) => void
}) {
  const toggle = (p: Platform) =>
    onChange(selected.includes(p) ? selected.filter((x) => x !== p) : [...selected, p])

  if (!connected.length) {
    return (
      <p className="text-xs text-[var(--text-faint)]">
        No active accounts.{' '}
        <a href="/settings/connections" className="text-[var(--accent)] hover:underline">Connect one </a>
      </p>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {connected.map((p) => {
        const meta   = PLATFORM_META[p]
        const active = selected.includes(p)
        return (
          <button key={p} type="button" onClick={() => toggle(p)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              active
                ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent-text)]'
                : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--accent)]/60'
            }`}
          >
            <span>{meta.icon}</span> {meta.label}
          </button>
        )
      })}
    </div>
  )
}

//  Per-platform overrides accordion (generic platforms only)

function OverridesAccordion({
  platforms, values, onChange,
}: {
  platforms: Platform[]
  values: Record<string, { body?: string }>
  onChange: (platform: string, body: string) => void
}) {
  const [open, setOpen] = useState(false)
  if (!platforms.length) return null

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-[var(--text-base)] hover:bg-[var(--surface-subtle)] transition-colors"
      >
        Per-platform overrides
        {open ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />}
      </button>

      {open && (
        <div className="divide-y divide-[var(--line)] border-t border-[var(--line)]">
          {platforms.map((p) => {
            const meta = PLATFORM_META[p]
            const body = values[p]?.body ?? ''
            return (
              <div key={p} className="px-5 py-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <span>{meta.icon}</span>
                  <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{meta.label}</span>
                  {body && (
                    <button type="button" onClick={() => onChange(p, '')}
                      className="ml-auto text-xs text-[var(--text-faint)] hover:text-red-500"
                    >Clear</button>
                  )}
                </div>
                <Textarea
                  placeholder={`Custom content for ${meta.label}  leave blank to use main body`}
                  value={body}
                  onChange={(e) => onChange(p, e.target.value)}
                  rows={3}
                  charLimit={meta.charLimit || undefined}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

//  Page

export default function ComposePage() {
  const router = useRouter()
  const { data: accounts } = usePlatformAccounts()
  const { mutate: createPost, isPending } = useCreatePost()
  const { data: bestTimes } = useAnalyticsBestTimes()

  const [mediaOpen, setMediaOpen]       = useState(false)
  const [mediaItems, setMediaItems]     = useState<GalleryItem[]>([])
  const [scheduleMode, setScheduleMode] = useState<'now' | 'schedule'>('now')
  const [coverPreview, setCoverPreview] = useState('')
  const [aiOpen,       setAiOpen]       = useState(false)
  const [seoTitleOpen, setSeoTitleOpen] = useState(false)

  const connectedPlatforms = (accounts ?? [])
    .filter((a) => a.is_active)
    .map((a) => a.platform)

  const {
    register, handleSubmit, control, watch, setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', body: '', platforms: [], scheduled_at: null, blog_slug: '', blog_post_type: 'article', blog_locale: 'en', notes: '', overrides: {} },
  })

  const watchedPlatforms = watch('platforms') as Platform[]
  const watchedOverrides = watch('overrides') ?? {}
  const hasBlog          = watchedPlatforms.includes('blog')
  const hasDevTo         = watchedPlatforms.includes('devto')
  const hasMedium        = watchedPlatforms.includes('medium')

  const bodyHtml  = watch('body') as string
  const wordCount = bodyHtml.replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const readTime  = Math.max(1, Math.ceil(wordCount / 200))

  const submit = (values: FormValues, action: 'draft' | 'schedule' | 'publish') => {
    const perOverrides: Record<string, object> = {}
    Object.entries(values.overrides ?? {}).forEach(([p, v]) => {
      if (PANEL_PLATFORMS.has(p as Platform)) {
        perOverrides[p] = v  // pass full settings for platforms with dedicated panels
      } else if (v.body?.trim()) {
        perOverrides[p] = { body: v.body }
      }
    })

    createPost(
      {
        title:                   values.title,
        body:                    values.body,
        platforms:               values.platforms as Platform[],
        media_urls:              mediaItems.map((i) => i.full_url),
        per_platform_overrides:  Object.keys(perOverrides).length ? perOverrides : undefined,
        scheduled_at:            action === 'schedule' ? values.scheduled_at ?? null : null,
        status:                  action === 'draft' ? 'draft' : 'scheduled',
        blog_slug:               hasBlog ? values.blog_slug : undefined,
        blog_post_type:          hasBlog ? (values.blog_post_type ?? 'article') : undefined,
        blog_locale:             hasBlog ? (values.blog_locale ?? 'en') : undefined,
        notes:                   values.notes,
        first_comment:           values.first_comment || undefined,
      },
      { onSuccess: () => router.push('/dashboard/posts') }
    )
  }

  return (
    <AppLayout title="New Post">
      <form className="grid lg:grid-cols-[1fr_300px] gap-6 max-w-6xl">

        {/*  Main column  */}
        <div className="space-y-5">

          {/* Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className={labelCls}>Title *</label>
              <div className="flex items-center gap-3">
                {wordCount > 0 && (
                  <span className="text-xs text-[var(--text-faint)]">
                    {wordCount.toLocaleString()} words · ~{readTime}m read
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => setSeoTitleOpen(true)}
                  className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-text)] transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" /> SEO title
                </button>
              </div>
            </div>
            <input
              {...register('title')}
              placeholder="Enter post title"
              className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-card)] px-4 py-3 text-xl font-bold text-[var(--text-base)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
          </div>

          {/* Rich body editor */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls} style={{ marginBottom: 0 }}>Content *</label>
              <button
                type="button"
                onClick={() => setAiOpen(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:text-[var(--accent-text)] transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5" /> Generate with AI
              </button>
            </div>
            <Controller
              name="body"
              control={control}
              render={({ field }) => (
                <CKEditorField value={field.value} onChange={field.onChange} />
              )}
            />
            {errors.body && <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>}
          </div>

          {/* Generic per-platform overrides (excludes platforms with dedicated panels) */}
          {watchedPlatforms.filter((p) => !PANEL_PLATFORMS.has(p)).length > 0 && (
            <OverridesAccordion
              platforms={watchedPlatforms.filter((p) => !PANEL_PLATFORMS.has(p))}
              values={watchedOverrides}
              onChange={(p, body) => setValue(`overrides.${p}`, { ...watchedOverrides[p], body }, { shouldDirty: true })}
            />
          )}
        </div>

        {/*  Sidebar  */}
        <div className="space-y-4">

          {/* Action buttons */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-4 space-y-3">
            <h3 className="font-semibold text-sm text-[var(--text-base)]">Publish</h3>

            {/* Schedule toggle */}
            <div className="flex gap-2">
              {(['now', 'schedule'] as const).map((mode) => (
                <button key={mode} type="button" onClick={() => setScheduleMode(mode)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    scheduleMode === mode
                      ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent-text)]'
                      : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  {mode === 'now' ? 'Publish now' : 'Schedule'}
                </button>
              ))}
            </div>

            {scheduleMode === 'schedule' && (
              <>
                <Controller
                  name="scheduled_at"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      value={field.value ?? ''}
                      onChange={field.onChange}
                    />
                  )}
                />
                {/* Best-time hints */}
                {watchedPlatforms.length > 0 && bestTimes?.best_times && (
                  <div className="space-y-1.5">
                    {watchedPlatforms.map((p) => {
                      const top = bestTimes.best_times![p]?.[0]
                      if (!top) return null
                      return (
                        <div key={p} className="flex items-center gap-1.5 text-[11px] text-[var(--text-faint)]">
                          <Clock className="h-3 w-3 shrink-0" />
                          <span>
                            Best for {p}: <span className="text-[var(--text-muted)] font-medium">{top.day_name} {top.hour_label}</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <Button
                type="button" size="sm" variant="secondary"
                loading={isPending}
                onClick={handleSubmit((v) => submit(v, 'draft'))}
              >
                <Save className="h-3.5 w-3.5" /> Save draft
              </Button>
              <Button
                type="button" size="sm"
                loading={isPending}
                onClick={handleSubmit((v) => submit(v, scheduleMode === 'schedule' ? 'schedule' : 'publish'))}
              >
                <Send className="h-3.5 w-3.5" />
                {scheduleMode === 'schedule' ? 'Schedule post' : 'Publish now'}
              </Button>
            </div>
          </div>

          {/* Platforms */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-4 space-y-3">
            <h3 className="font-semibold text-sm text-[var(--text-base)]">Platforms</h3>
            <Controller
              name="platforms"
              control={control}
              render={({ field }) => (
                <PlatformSelector
                  connected={connectedPlatforms}
                  selected={field.value as Platform[]}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.platforms && (
              <p className="text-xs text-red-500">{errors.platforms.message}</p>
            )}
          </div>

          {/* Cover / media */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-4 space-y-3">
            <h3 className="font-semibold text-sm text-[var(--text-base)]">Media</h3>

            {/* Cover image */}
            {coverPreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-[var(--surface-subtle)]">
                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setCoverPreview('')}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--line)] aspect-video cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-colors">
                <Image className="h-7 w-7 text-[var(--text-faint)]" />
                <span className="text-xs text-[var(--text-faint)]">Cover image</span>
                <input type="file" accept="image/*" className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) setCoverPreview(URL.createObjectURL(f))
                  }}
                />
              </label>
            )}

            {/* Gallery media chips */}
            {mediaItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {mediaItems.map((item) => (
                  <div key={item.id} className="relative h-14 w-14 rounded-lg overflow-hidden border border-[var(--line)]">
                    <img src={item.full_url} alt={item.alt ?? ''} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setMediaItems((prev) => prev.filter((i) => i.id !== item.id))}
                      className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-black/60 flex items-center justify-center"
                    >
                      <X className="h-2.5 w-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <Button type="button" variant="secondary" size="sm" className="w-full" onClick={() => setMediaOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Add from gallery
            </Button>
          </div>

          {/* Blog-specific */}
          {hasBlog && (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-4 space-y-4">
              <h3 className="font-semibold text-sm text-[var(--text-base)]">Blog settings</h3>

              {/* Post type */}
              <div>
                <label className={labelCls}>Post type *</label>
                <select
                  {...register('blog_post_type')}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-2.5 text-sm text-[var(--text-base)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                >
                  <option value="article">Article</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="case_study">Case Study</option>
                  <option value="tip">Quick Tip</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className={labelCls}>Language</label>
                <select
                  {...register('blog_locale')}
                  className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] px-4 py-2.5 text-sm text-[var(--text-base)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] transition-colors"
                >
                  <option value="en">🇬🇧 English</option>
                  <option value="si">🇱🇰 Sinhala</option>
                  <option value="ar">🇦🇪 Arabic</option>
                </select>
              </div>

              {/* Slug */}
              <Input
                label="Slug (optional)"
                placeholder="my-awesome-post"
                hint="Leave blank to auto-generate from title"
                {...register('blog_slug')}
              />

              {/* All blog metadata */}
              <BlogSettingsPanel
                value={watchedOverrides['blog'] ?? {}}
                onChange={(v) => setValue('overrides.blog', v, { shouldDirty: true })}
                postType={watch('blog_post_type') as 'article' | 'tutorial' | 'case_study' | 'tip' | undefined}
              />
            </div>
          )}

          {/* SEO checklist — shown whenever blog is a selected platform */}
          {hasBlog && <BlogSeoChecklist />}

          {/* Dev.to-specific */}
          {hasDevTo && (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-4 space-y-4">
              <h3 className="font-semibold text-sm text-[var(--text-base)]">Dev.to settings</h3>
              <DevToSettingsPanel
                value={watchedOverrides['devto'] ?? {}}
                onChange={(v) => setValue('overrides.devto', v, { shouldDirty: true })}
              />
            </div>
          )}

          {/* Medium-specific */}
          {hasMedium && (
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-4 space-y-4">
              <h3 className="font-semibold text-sm text-[var(--text-base)]">Medium settings</h3>
              <MediumSettingsPanel
                value={watchedOverrides['medium'] ?? {}}
                onChange={(v) => setValue('overrides.medium', v, { shouldDirty: true })}
              />
            </div>
          )}

          {/* Notes */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-4">
            <Textarea
              label="Private notes"
              placeholder="Internal notes  not published"
              rows={3}
              {...register('notes')}
            />
          </div>

          {/* First comment */}
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface-card)] p-4">
            <Textarea
              label="First comment"
              placeholder="Auto-posted as a comment seconds after publishing (e.g. hashtags, CTA)"
              rows={3}
              charLimit={2200}
              {...register('first_comment')}
            />
          </div>
        </div>
      </form>

      <CaptionGenerator
        open={aiOpen}
        onClose={() => setAiOpen(false)}
        defaultPlatform={watchedPlatforms[0]}
        onInsert={(caption, hashtags) => {
          const text = hashtags.length ? `${caption}\n\n${hashtags.join(' ')}` : caption
          setValue('body', `<p>${text.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>`)
        }}
      />

      <SeoTitleGenerator
        open={seoTitleOpen}
        onClose={() => setSeoTitleOpen(false)}
        onInsert={(title, slug) => {
          setValue('title', title, { shouldDirty: true })
          if (slug && !watch('blog_slug')) {
            setValue('blog_slug', slug, { shouldDirty: true })
          }
        }}
      />

      <MediaLibraryModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={(items) =>
          setMediaItems((prev) => {
            const existing = new Set(prev.map((i) => i.id))
            return [...prev, ...items.filter((i) => !existing.has(i.id))]
          })
        }
        multiple
      />
    </AppLayout>
  )
}