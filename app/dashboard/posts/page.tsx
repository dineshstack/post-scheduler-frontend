'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Edit2, Plus, RefreshCw, Trash2 } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Button, Card, ConfirmModal, Select, StatusBadge, PlatformChips } from '@/components/ui'
import { usePosts, useDeletePost, usePublishNow } from '@/lib/hooks'
import { formatScheduledAt } from '@/lib/utils'
import type { Post } from '@/lib/types'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft',     label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
  { value: 'failed',    label: 'Failed' },
]

const PLATFORM_OPTIONS = [
  { value: '',          label: 'All platforms' },
  { value: 'twitter',   label: '𝕏 Twitter' },
  { value: 'linkedin',  label: '💼 LinkedIn' },
  { value: 'instagram', label: '📸 Instagram' },
  { value: 'facebook',  label: '📘 Facebook' },
  { value: 'tiktok',    label: '🎵 TikTok' },
  { value: 'blog',      label: '📝 Blog' },
]

export default function PostsQueuePage() {
  const [status,   setStatus]   = useState('')
  const [platform, setPlatform] = useState('')
  const [page,     setPage]     = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null)

  const { data, isLoading, refetch } = usePosts({
    status:   status   || undefined,
    platform: platform || undefined,
    page,
    per_page: 20,
  })

  const { mutate: deletePost,  isPending: deleting  } = useDeletePost()
  const { mutate: publishNow,  isPending: publishing } = usePublishNow()

  const handleDelete = () => {
    if (!deleteTarget) return
    deletePost(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  return (
    <AppLayout
      title="Queue"
      action={
        <Link href="/dashboard/compose">
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> New post</Button>
        </Link>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <Select
          options={STATUS_OPTIONS}
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          className="w-40"
        />
        <Select
          options={PLATFORM_OPTIONS}
          value={platform}
          onChange={(e) => { setPlatform(e.target.value); setPage(1) }}
          className="w-44"
        />
        <Button variant="ghost" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
        {data && (
          <span className="ml-auto text-xs text-[var(--text-faint)]">
            {data.total} post{data.total !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      <Card>
        {isLoading ? (
          <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading…</div>
        ) : !data?.data?.length ? (
          <div className="py-16 text-center">
            <p className="text-sm text-[var(--text-muted)]">No posts found.</p>
            <Link href="/dashboard/compose" className="inline-block mt-3 text-xs text-[var(--accent)] hover:underline">
              Create your first post →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {data.data.map((post) => (
              <div key={post.id} className="flex items-start gap-4 px-5 py-4 hover:bg-[var(--surface-subtle)] transition-colors">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/posts/${post.id}`} className="text-sm font-medium text-[var(--text-base)] truncate hover:text-[var(--accent)] transition-colors block">
                    {post.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <PlatformChips platforms={post.platforms} />
                    <StatusBadge status={post.status} />
                    {post.scheduled_at && (
                      <span className="text-xs text-[var(--text-faint)]">
                        {formatScheduledAt(post.scheduled_at)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {(post.status === 'draft' || post.status === 'scheduled' || post.status === 'failed') && (
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => publishNow(post.id)}
                      loading={publishing}
                      title="Publish now"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Publish now
                    </Button>
                  )}
                  {(post.status === 'draft' || post.status === 'scheduled' || post.status === 'published') && (
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Button variant="ghost" size="icon" title="Edit">
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => setDeleteTarget(post)}
                    className="text-[var(--text-faint)] hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.last_page > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--line)]">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              Previous
            </Button>
            <span className="text-xs text-[var(--text-muted)]">Page {data.current_page} of {data.last_page}</span>
            <Button variant="secondary" size="sm" disabled={page >= data.last_page} onClick={() => setPage(p => p + 1)}>
              Next
            </Button>
          </div>
        )}
      </Card>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete post"
        description={`"${deleteTarget?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
      />
    </AppLayout>
  )
}
