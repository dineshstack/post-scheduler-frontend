'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, RefreshCw, Sparkles, XCircle } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useGeneratePreviews, usePostPreviews } from '@/lib/hooks'
import type { DistributionPreview, Platform, Post } from '@/lib/types'

// Platforms with previewable outgoing copy (matches backend ComposesPreview)
const PREVIEWABLE: Platform[] = ['twitter', 'linkedin', 'facebook', 'devto']

const PLATFORM_META: Record<string, { label: string; icon: string }> = {
  twitter:  { label: 'Twitter / X', icon: '𝕏' },
  linkedin: { label: 'LinkedIn',    icon: '💼' },
  facebook: { label: 'Facebook',    icon: '📘' },
  devto:    { label: 'Dev.to',      icon: '👩‍💻' },
}

function StaleBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
      <AlertTriangle className="h-3 w-3" />
      Post edited since — regenerate
    </span>
  )
}

function SentBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      <CheckCircle2 className="h-3 w-3" />
      Sent
    </span>
  )
}

function SourceBadge({ aiGenerated }: { aiGenerated: boolean }) {
  return aiGenerated ? (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)]">
      <Sparkles className="h-3 w-3" />
      AI-generated
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

function PreviewBody({ platform, preview }: { platform: string; preview: DistributionPreview }) {
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
            <p className="text-[11px] text-[var(--text-faint)]">
              LinkedIn renders the title + OG image from the live blog page.
            </p>
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

  // devto — full article markdown with the CTA footer visible
  return (
    <div className="space-y-2">
      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] p-4 max-h-72 overflow-y-auto">
        <pre className="text-xs text-[var(--text-muted)] whitespace-pre-wrap break-words font-mono">
          {preview.body_markdown}
        </pre>
      </div>
      {preview.canonical_url && (
        <p className="text-xs text-[var(--text-faint)] break-all">
          Canonical (clean, tells Google the blog is the original): <span className="text-[var(--text-muted)]">{preview.canonical_url}</span>
        </p>
      )}
    </div>
  )
}

export default function DistributionPreviewPanel({ post }: { post: Post }) {
  const targets = post.platforms.filter((p) => PREVIEWABLE.includes(p))

  const { data, isLoading } = usePostPreviews(post.id)
  const { mutate: generate, isPending: generating } = useGeneratePreviews(post.id)
  const [active, setActive] = useState<string | null>(null)

  if (!targets.length) return null

  const previews   = data?.previews ?? {}
  const lint       = data?.lint
  const hasAny     = Object.keys(previews).length > 0
  const tabs       = targets.filter((p) => previews[p] || targets.includes(p))
  const current    = active && previews[active] ? active : tabs.find((p) => previews[p]) ?? tabs[0]
  const preview    = previews[current]
  const isSent     = !!preview?.sent_at
  const log        = post.platform_logs?.find((l) => l.platform === current)
  const isPublished = post.status === 'published'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isPublished ? 'What was sent' : 'Distribution preview'}</CardTitle>
        {/* Regenerating a published post would only describe a hypothetical
            re-send — nothing more will actually go out, so hide the button. */}
        {!isPublished && (
          <Button
            type="button"
            size="sm"
            variant={hasAny ? 'outline' : 'primary'}
            onClick={() => generate()}
            disabled={generating}
          >
            {generating
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : hasAny ? <RefreshCw className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            {hasAny ? 'Regenerate' : 'Generate previews'}
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Lint report */}
        {lint && (lint.blockers.length > 0 || lint.warnings.length > 0) && (
          <div className="space-y-1.5">
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

        {isLoading ? (
          <p className="text-sm text-[var(--text-faint)] py-6 text-center">Loading…</p>
        ) : !hasAny ? (
          <p className="text-sm text-[var(--text-faint)] py-6 text-center">
            {isPublished
              ? 'This was published before per-platform send records were kept — no copy on file.'
              : <>See exactly what will be posted to {targets.map((p) => PLATFORM_META[p]?.label ?? p).join(', ')} —
                 AI teaser, blog link and all — before it goes out.</>}
          </p>
        ) : (
          <>
            {/* Platform tabs */}
            <div className="flex flex-wrap gap-2">
              {tabs.map((p) => {
                const meta     = PLATFORM_META[p]
                const isActive = p === current
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setActive(p)}
                    disabled={!previews[p]}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-40 ${
                      isActive
                        ? 'bg-[var(--accent-subtle)] border-[var(--accent)] text-[var(--accent-text)]'
                        : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--accent)]/60'
                    }`}
                  >
                    <span>{meta?.icon}</span> {meta?.label ?? p}
                  </button>
                )
              })}
            </div>

            {preview && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {isSent && <SentBadge />}
                  {preview.stale && !isSent && <StaleBadge />}
                  {preview.ai_generated !== undefined && <SourceBadge aiGenerated={preview.ai_generated} />}
                  {(isSent ? preview.sent_at : preview.generated_at) && (
                    <span className="text-[11px] text-[var(--text-faint)]">
                      {isSent ? 'Sent' : 'Generated'}{' '}
                      {formatDistanceToNow(new Date((isSent ? preview.sent_at : preview.generated_at)!), { addSuffix: true })}
                    </span>
                  )}
                </div>

                {log?.external_post_url && (
                  <LinkLine url={log.external_post_url} label="View live" />
                )}

                <PreviewBody platform={current} preview={preview} />
              </div>
            )}

            {!isPublished && (
              <p className="text-[11px] text-[var(--text-faint)]">
                This exact copy ships at publish time. Editing the post marks previews stale and they'll be
                recomposed. Want different wording? Regenerate, or write your own in the platform override.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
