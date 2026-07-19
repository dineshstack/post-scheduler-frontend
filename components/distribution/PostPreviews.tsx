'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  AlertTriangle, CheckCircle2, ChevronDown, ChevronUp,
  ExternalLink, Globe, Loader2, RefreshCw, Sparkles, XCircle,
} from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useBlogMeta, useGeneratePreviews, usePostPreviews } from '@/lib/hooks'
import type { DistributionPreview, Platform, Post } from '@/lib/types'

// Social/dev.to/tiktok/medium platforms with AI-composed outgoing copy (matches backend ComposesPreview)
const PREVIEWABLE: Platform[] = ['twitter', 'linkedin', 'facebook', 'devto', 'tiktok', 'medium']

// Platforms that actually auto-publish. Medium's API is retired, so its
// preview is manual-copy only — no "Sent"/live-link tracking applies to it.
const AUTO_PUBLISHED: Platform[] = ['twitter', 'linkedin', 'facebook', 'devto', 'tiktok']

const PLATFORM_META: Record<string, { label: string; icon: string }> = {
  blog:     { label: 'Blog',        icon: '📝' },
  twitter:  { label: 'Twitter / X', icon: '𝕏' },
  linkedin: { label: 'LinkedIn',    icon: '💼' },
  facebook: { label: 'Facebook',    icon: '📘' },
  devto:    { label: 'Dev.to',      icon: '👩‍💻' },
  tiktok:   { label: 'TikTok',      icon: '🎵' },
  medium:   { label: 'Medium',      icon: '✍️' },
}

const TYPE_LABEL: Record<string, string> = {
  article:    'Article',
  tutorial:   'Tutorial',
  case_study: 'Case Study',
  tip:        'Quick Tip',
}

function slugify(title: string): string {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

// ── Small badges ─────────────────────────────────────────────────────────────

function StaleBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
      <AlertTriangle className="h-3 w-3" /> Edited since — regenerate
    </span>
  )
}

function SentBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="h-3 w-3" /> Sent
    </span>
  )
}

function SourceBadge({ aiGenerated }: { aiGenerated: boolean }) {
  return aiGenerated ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)]">
      <Sparkles className="h-3 w-3" /> AI-written hook + CTA
    </span>
  ) : (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--surface-overlay)] text-[var(--text-muted)]">
      Your custom text
    </span>
  )
}

function LinkLine({ url, label }: { url: string; label: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] break-all transition-colors"
    >
      {label}: {url} <ExternalLink className="h-3 w-3 shrink-0" />
    </a>
  )
}

// ── Accordion shell ──────────────────────────────────────────────────────────

function AccordionSection({
  icon, label, badges, defaultOpen, children,
}: {
  icon: string; label: string; badges?: React.ReactNode; defaultOpen: boolean; children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-xl border border-[var(--line)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--surface-subtle)] transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[var(--text-base)] shrink-0">
          <span>{icon}</span> {label}
        </span>
        <span className="flex items-center gap-2 flex-wrap justify-end">
          {badges}
          {open ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)] shrink-0" /> : <ChevronDown className="h-4 w-4 text-[var(--text-muted)] shrink-0" />}
        </span>
      </button>
      {open && <div className="px-4 pb-4 pt-4 border-t border-[var(--line)]">{children}</div>}
    </div>
  )
}

// ── Blog section body — full-width live-article approximation ────────────────

function BlogPreviewBody({ post }: { post: Post }) {
  const { data: meta } = useBlogMeta(true)
  const override = post.per_platform_overrides?.blog ?? {}

  const locale   = post.blog_locale ?? 'en'
  const slug     = post.blog_slug || slugify(post.title) || 'untitled'
  const url      = `https://dineshstack.com/${locale}/${slug}`
  const cover    = override.og_image || post.media_urls?.[0] || null
  const category = meta?.categories.find((c) => c.id === override.category_id)
  const tags     = override.tags ?? post.tags ?? []
  const excerpt  = override.meta_description || override.excerpt

  const wordCount = (post.body ?? '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length
  const readTime  = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-1.5">
        <Globe className="h-3.5 w-3.5 text-[var(--text-faint)] shrink-0" />
        <span className="text-xs text-[var(--text-faint)] truncate">{url}</span>
      </div>

      <article>
        {cover ? (
          <img src={cover} alt={post.title} className="w-full aspect-video object-cover rounded-xl mb-5 border border-[var(--line)]" />
        ) : (
          <div className="w-full aspect-video rounded-xl mb-5 border border-[var(--line)] bg-gradient-to-br from-[var(--accent-subtle)] to-[var(--surface-subtle)] flex items-center justify-center">
            <span className="text-4xl opacity-40 select-none">📝</span>
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent-text)]">
            {TYPE_LABEL[post.blog_post_type ?? 'article']}
          </span>
          {category && <span className="text-xs font-medium text-[var(--text-faint)]">{category.name}</span>}
          <span className="text-xs text-[var(--text-faint)]">· {readTime}m read</span>
        </div>

        <h1 className="text-2xl font-bold text-[var(--text-base)] leading-snug mb-2">
          {post.title || 'Untitled post'}
        </h1>

        {excerpt && <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">{excerpt}</p>}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tags.map((t) => (
              <span key={t} className="rounded-full bg-[var(--surface-overlay)] px-2.5 py-0.5 text-xs text-[var(--text-muted)]">#{t}</span>
            ))}
          </div>
        )}

        {post.body ? (
          <div className="ck-content" dangerouslySetInnerHTML={{ __html: override.body ?? post.body }} />
        ) : (
          <p className="text-sm text-[var(--text-faint)] italic">No content yet.</p>
        )}
      </article>

      <p className="text-[11px] text-[var(--text-faint)] text-center">
        Approximate — actual typography and layout are set by the live blog theme.
      </p>
    </div>
  )
}

// ── Social/dev.to/tiktok section body ─────────────────────────────────────────

function SocialPreviewBody({ platform, preview }: { platform: string; preview: DistributionPreview }) {
  if (platform === 'twitter') {
    const over = (preview.char_count ?? 0) > (preview.limit ?? 280)
    return (
      <div className="space-y-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] p-4">
          <p className="text-sm text-[var(--text-base)] whitespace-pre-wrap break-words">{preview.text}</p>
        </div>
        <p className={`text-xs text-right font-medium ${over ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
          {preview.char_count}/{preview.limit} chars (links count as 23)
        </p>
      </div>
    )
  }

  if (platform === 'linkedin') {
    return (
      <div className="space-y-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] p-4">
          <p className="text-sm text-[var(--text-base)] whitespace-pre-wrap break-words">{preview.text}</p>
        </div>
        {preview.article_url && (
          <div className="rounded-xl border border-dashed border-[var(--line)] p-3 space-y-1">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Article card</p>
            <p className="text-[11px] text-[var(--text-faint)]">LinkedIn renders the title + OG image from the live blog page.</p>
            <LinkLine url={preview.article_url} label="Links to" />
          </div>
        )}
      </div>
    )
  }

  if (platform === 'facebook') {
    return (
      <div className="space-y-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] p-4">
          <p className="text-sm text-[var(--text-base)] whitespace-pre-wrap break-words">{preview.message}</p>
        </div>
        {preview.link && <LinkLine url={preview.link} label="Preview card links to" />}
      </div>
    )
  }

  if (platform === 'tiktok') {
    const over = (preview.title?.length ?? 0) > 150
    return (
      <div className="space-y-2">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] p-4">
          <p className="text-sm text-[var(--text-base)] whitespace-pre-wrap break-words">{preview.title}</p>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-[var(--text-faint)]">
            {preview.media_type === 'PHOTO'
              ? `Photo post · ${preview.photo_count} image${preview.photo_count === 1 ? '' : 's'}`
              : 'Video post — needs a video attached, or it publishes as a photo post'}
          </span>
          <span className={over ? 'text-red-500 font-medium' : 'text-emerald-600 dark:text-emerald-400 font-medium'}>
            {preview.title?.length ?? 0}/150 chars
          </span>
        </div>
      </div>
    )
  }

  if (platform === 'medium') {
    const topics = preview.topics ?? []
    return (
      <div className="space-y-3">
        <div className="flex gap-2 rounded-lg border border-amber-400/40 bg-amber-50/60 dark:bg-amber-900/20 px-3 py-2.5">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
            Medium retired its publishing API — this never auto-sends. Copy these into Medium&rsquo;s own{' '}
            <a href="https://medium.com/p/import" target="_blank" rel="noopener noreferrer" className="underline">
              Import a story
            </a>{' '}
            tool: Topics go in the &ldquo;Add a topic&rdquo; box, the subtitle under the title.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">
            Suggested topics (up to 5, most relevant first)
          </p>
          {topics.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {topics.map((t) => (
                <span key={t} className="rounded-full bg-[var(--accent-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--accent-text)]">
                  {t}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--text-faint)]">No topics yet.</p>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Suggested subtitle</p>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] p-4">
            <p className="text-sm text-[var(--text-base)] whitespace-pre-wrap break-words">{preview.subtitle}</p>
          </div>
          <p className="text-xs text-right text-[var(--text-faint)] mt-1">{preview.subtitle?.length ?? 0}/140 chars</p>
        </div>
      </div>
    )
  }

  // devto — full article markdown with the CTA footer visible
  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] p-4 max-h-72 overflow-y-auto">
        <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap break-words font-mono">{preview.body_markdown}</pre>
      </div>
      {preview.canonical_url && (
        <p className="text-xs text-[var(--text-faint)] break-all">
          Canonical (clean, tells Google the blog is the original): <span className="text-[var(--text-muted)]">{preview.canonical_url}</span>
        </p>
      )}
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export default function PostPreviews({ post }: { post: Post }) {
  const hasBlog       = post.platforms.includes('blog')
  const socialTargets = post.platforms.filter((p) => PREVIEWABLE.includes(p))
  const isPublished   = post.status === 'published'

  const { data, isLoading } = usePostPreviews(post.id)
  const { mutate: generate, isPending: generating } = useGeneratePreviews(post.id)

  if (!hasBlog && !socialTargets.length) return null

  const previews = data?.previews ?? {}
  const lint     = data?.lint
  const hasAny   = Object.keys(previews).length > 0

  // A platform that already sent is frozen — the backend never lets a
  // regenerate touch it. Only platforms with nothing sent yet (never
  // generated, or added to the post after it published) are worth a
  // "Generate/Regenerate" action; if every target already sent, the button
  // would just be a no-op round trip.
  const pendingTargets = socialTargets.filter((p) => !previews[p]?.sent_at)
  const canGenerate    = pendingTargets.length > 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Previews</CardTitle>
        {canGenerate && (
          <Button type="button" size="sm" variant={hasAny ? 'outline' : 'primary'} onClick={() => generate()} disabled={generating}>
            {generating
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : hasAny ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            {hasAny ? 'Regenerate' : 'Generate previews'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">

        {lint && (lint.blockers.length > 0 || lint.warnings.length > 0) && (
          <div className="space-y-1.5 mb-1">
            {lint.blockers.map((b) => (
              <p key={b} className="flex items-start gap-1.5 text-xs text-red-500">
                <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span><span className="font-semibold">Blocks publishing:</span> {b}</span>
              </p>
            ))}
            {lint.warnings.map((w) => (
              <p key={w} className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{w}</span>
              </p>
            ))}
          </div>
        )}

        {hasBlog && (
          <AccordionSection icon={PLATFORM_META.blog.icon} label={PLATFORM_META.blog.label} defaultOpen>
            <BlogPreviewBody post={post} />
          </AccordionSection>
        )}

        {socialTargets.map((platform) => {
          const preview = previews[platform]
          const log     = post.platform_logs?.find((l) => l.platform === platform)
          const isSent  = !!preview?.sent_at
          const meta    = PLATFORM_META[platform]

          return (
            <AccordionSection
              key={platform}
              icon={meta.icon}
              label={meta.label}
              defaultOpen={false}
              badges={
                <>
                  {isSent && <SentBadge />}
                  {preview?.stale && !isSent && <StaleBadge />}
                </>
              }
            >
              {isLoading ? (
                <p className="text-sm text-[var(--text-faint)] py-4 text-center">Loading…</p>
              ) : !preview ? (
                <p className="text-sm text-[var(--text-faint)] py-4 text-center">
                  {canGenerate
                    ? 'Click Generate previews above to see the AI-written copy for this platform.'
                    : 'This was published before per-platform send records were kept — no copy on file.'}
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {preview.ai_generated !== undefined && <SourceBadge aiGenerated={preview.ai_generated} />}
                    {(isSent ? preview.sent_at : preview.generated_at) && (
                      <span className="text-[11px] text-[var(--text-faint)]">
                        {isSent ? 'Sent' : 'Generated'}{' '}
                        {formatDistanceToNow(new Date((isSent ? preview.sent_at : preview.generated_at)!), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                  {log?.external_post_url && <LinkLine url={log.external_post_url} label="View live" />}
                  <SocialPreviewBody platform={platform} preview={preview} />
                </div>
              )}
            </AccordionSection>
          )
        })}

        {!isPublished && hasAny && (
          <p className="text-[11px] text-[var(--text-faint)]">
            This exact copy ships at publish time. Editing the post marks previews stale and they'll be
            recomposed. Want different wording? Regenerate, or write your own in the platform override.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
