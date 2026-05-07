'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  CalendarDays, CheckCircle2, Clock, FileText, Plus, Settings, XCircle,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Button, Card, PlatformChips, StatusBadge } from '@/components/ui'
import { usePosts } from '@/lib/hooks'
import { useAuthStore } from '@/lib/stores/auth.store'

export default function DashboardPage() {
  const { user } = useAuthStore()

  const { data: scheduled } = usePosts({ status: 'scheduled', per_page: 5 })
  const { data: drafts    } = usePosts({ status: 'draft',     per_page: 5 })
  const { data: published } = usePosts({ status: 'published', per_page: 5 })
  const { data: failed    } = usePosts({ status: 'failed',    per_page: 5 })

  const stats = [
    { label: 'Scheduled', value: scheduled?.total ?? 0, icon: Clock,        color: 'text-blue-500' },
    { label: 'Drafts',    value: drafts?.total    ?? 0, icon: FileText,     color: 'text-[var(--text-muted)]' },
    { label: 'Published', value: published?.total ?? 0, icon: CheckCircle2, color: 'text-emerald-500' },
    { label: 'Failed',    value: failed?.total    ?? 0, icon: XCircle,      color: 'text-red-500' },
  ]

  return (
    <AppLayout
      title={`Good ${getGreeting()}, ${user?.name.split(' ')[0] ?? ''}!`}
      action={
        <Link href="/dashboard/compose">
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> New post</Button>
        </Link>
      }
    >
      <div className="space-y-6 max-w-4xl">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-[var(--surface-card)] border border-[var(--line)] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--text-muted)]">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <p className="text-2xl font-bold text-[var(--text-base)]">{value}</p>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/dashboard/compose',    icon: Plus,         label: 'Compose post',  sub: 'Write and schedule new content' },
            { href: '/dashboard/calendar',   icon: CalendarDays, label: 'Calendar',      sub: 'View your publishing schedule' },
            { href: '/settings/connections', icon: Settings,     label: 'Connections',   sub: 'Connect your social platforms' },
          ].map(({ href, icon: Icon, label, sub }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 p-4 rounded-xl border border-[var(--line)] bg-[var(--surface-card)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--accent-subtle)] flex items-center justify-center group-hover:bg-[var(--accent)]">
                <Icon className="w-4 h-4 text-[var(--accent)] group-hover:text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--text-base)]">{label}</p>
                <p className="text-xs text-[var(--text-muted)]">{sub}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Upcoming scheduled posts */}
        <Card>
          <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
            <h2 className="font-semibold text-[var(--text-base)]">Upcoming scheduled posts</h2>
            <Link href="/dashboard/posts?status=scheduled" className="text-xs text-[var(--accent)] hover:underline">
              View all
            </Link>
          </div>

          {!scheduled?.data?.length ? (
            <div className="p-8 text-center text-[var(--text-muted)]">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No scheduled posts yet.</p>
              <Link href="/dashboard/compose" className="inline-block mt-3 text-xs text-[var(--accent)] hover:underline">
                Schedule your first post →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {scheduled.data.map((post) => (
                <div key={post.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-[var(--surface-subtle)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-base)] truncate">{post.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <PlatformChips platforms={post.platforms} />
                      <StatusBadge status={post.status} />
                    </div>
                  </div>
                  {post.scheduled_at && (
                    <span className="text-xs text-[var(--text-faint)] whitespace-nowrap mt-0.5">
                      {formatDistanceToNow(new Date(post.scheduled_at), { addSuffix: true })}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent failures */}
        {(failed?.total ?? 0) > 0 && (
          <Card>
            <div className="px-5 py-4 border-b border-[var(--line)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--text-base)] flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Failed posts
              </h2>
              <Link href="/dashboard/posts?status=failed" className="text-xs text-[var(--accent)] hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {failed?.data.map((post) => (
                <div key={post.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-[var(--surface-subtle)] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-base)] truncate">{post.title}</p>
                    <PlatformChips platforms={post.platforms} />
                  </div>
                  <Link href={`/dashboard/posts/${post.id}/edit`}>
                    <Button variant="ghost" size="sm">Retry</Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
