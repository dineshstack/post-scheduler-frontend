'use client'

import { use } from 'react'
import Link from 'next/link'
import { formatDistanceToNow, format } from 'date-fns'
import {
  AlertCircle, ArrowLeft, CheckCircle2, Clock,
  Edit2, ExternalLink, RefreshCw, XCircle,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Button, Card, CardContent, CardHeader, CardTitle, PlatformChips, StatusBadge } from '@/components/ui'
import { usePost, usePublishNow } from '@/lib/hooks'
import type { PostPlatformLog } from '@/lib/types'

const PLATFORM_LABELS: Record<string, string> = {
  twitter:   '𝕏 Twitter',
  linkedin:  '💼 LinkedIn',
  instagram: '📸 Instagram',
  facebook:  '📘 Facebook',
  tiktok:    '🎵 TikTok',
  blog:      '📝 Blog',
}

function LogStatusIcon({ status }: { status: PostPlatformLog['status'] }) {
  if (status === 'success')  return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
  if (status === 'failed')   return <XCircle      className="h-4 w-4 text-red-500" />
  if (status === 'retrying') return <RefreshCw    className="h-4 w-4 text-amber-500 animate-spin" />
  return <Clock className="h-4 w-4 text-[var(--text-faint)]" />
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const postId  = Number(id)

  const { data: post, isLoading, isError } = usePost(postId)
  const { mutate: publishNow, isPending: publishing } = usePublishNow()

  if (isLoading) {
    return (
      <AppLayout title="Post detail">
        <div className="flex items-center justify-center py-24 text-[var(--text-faint)] text-sm">
          Loading…
        </div>
      </AppLayout>
    )
  }

  if (isError || !post) {
    return (
      <AppLayout title="Post not found">
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-[var(--text-muted)]">Post not found or you don't have access.</p>
          <Link href="/dashboard/posts">
            <Button variant="ghost" size="sm">Back to queue</Button>
          </Link>
        </div>
      </AppLayout>
    )
  }

  const logs = post.platform_logs ?? []
  const bodyText = post.body.replace(/<[^>]+>/g, '').trim()

  return (
    <AppLayout
      title={post.title || 'Untitled post'}
      action={
        <div className="flex items-center gap-2">
          {post.status === 'failed' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => publishNow(post.id)}
              disabled={publishing}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${publishing ? 'animate-spin' : ''}`} />
              Retry
            </Button>
          )}
          {(post.status === 'draft' || post.status === 'scheduled') && (
            <Link href={`/dashboard/posts/${post.id}/edit`}>
              <Button size="sm" variant="outline">
                <Edit2 className="h-3.5 w-3.5" /> Edit
              </Button>
            </Link>
          )}
          <Link href="/dashboard/posts">
            <Button size="sm" variant="ghost">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </Button>
          </Link>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Meta row */}
        <Card>
          <CardContent className="pt-5 pb-4">
            <div className="flex flex-wrap gap-4 items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-faint)]">Status</span>
                <StatusBadge status={post.status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-faint)]">Platforms</span>
                <PlatformChips platforms={post.platforms} />
              </div>
              {post.scheduled_at && (
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    Scheduled {format(new Date(post.scheduled_at), "MMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>
              )}
              {post.published_at && (
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span>
                    Published {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Body preview */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent>
            {post.body ? (
              <div
                className="ck-content prose prose-sm max-w-none text-[var(--text-muted)]"
                dangerouslySetInnerHTML={{ __html: post.body }}
              />
            ) : (
              <p className="text-sm text-[var(--text-faint)] italic">No content.</p>
            )}
          </CardContent>
        </Card>

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {post.media_urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Media ${i + 1}`}
                    className="rounded-lg object-cover aspect-video w-full border border-[var(--line)]"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Platform logs */}
        <Card>
          <CardHeader>
            <CardTitle>Platform results</CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-[var(--text-faint)] italic">
                No publish attempts recorded yet.
              </p>
            ) : (
              <div className="divide-y divide-[var(--line)]">
                {logs.map((log) => (
                  <div key={log.id} className="py-3 flex items-start gap-3">
                    <LogStatusIcon status={log.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[var(--text-base)]">
                          {PLATFORM_LABELS[log.platform] ?? log.platform}
                        </span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                          log.status === 'success'  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : log.status === 'failed' ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                          : log.status === 'retrying' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                          : 'bg-[var(--surface-subtle)] text-[var(--text-faint)]'
                        }`}>
                          {log.status}
                        </span>
                        {log.attempted_at && (
                          <span className="text-xs text-[var(--text-faint)]">
                            {formatDistanceToNow(new Date(log.attempted_at), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      {log.external_post_url && (
                        <a
                          href={log.external_post_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                        >
                          View post <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {log.external_post_id && !log.external_post_url && (
                        <p className="mt-1 text-xs text-[var(--text-faint)]">
                          ID: {log.external_post_id}
                        </p>
                      )}
                      {log.error_message && (
                        <p className="mt-1 text-xs text-red-500 font-mono break-all">
                          {log.error_message}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags / notes */}
        {(post.tags?.length || post.notes) && (
          <Card>
            <CardContent className="pt-5 space-y-3">
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {post.notes && (
                <p className="text-xs text-[var(--text-faint)] italic whitespace-pre-wrap">
                  {post.notes}
                </p>
              )}
            </CardContent>
          </Card>
        )}

      </div>
    </AppLayout>
  )
}
