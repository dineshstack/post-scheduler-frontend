'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { format, formatDistanceToNow, subDays } from 'date-fns'
import {
  BarChart2, CalendarDays, CheckCircle2, Clock,
  ExternalLink, FileText, Link2,
  Plus, Sparkles, TrendingUp, XCircle, Zap,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Button, Card, CardContent, CardHeader, CardTitle, PlatformChips, StatusBadge } from '@/components/ui'
import CoverageChip from '@/components/distribution/CoverageChip'
import {
  useAnalyticsBestTimes,
  useAnalyticsOverview,
  usePlatformAccounts,
  usePosts,
} from '@/lib/hooks'
import { useAuthStore } from '@/lib/stores/auth.store'

// ── Helpers ───────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '-'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

const PLATFORM_COLOR: Record<string, string> = {
  twitter:   'bg-sky-400',
  linkedin:  'bg-blue-600',
  facebook:  'bg-indigo-500',
  tiktok:    'bg-slate-700',
  instagram: 'bg-pink-500',
  blog:      'bg-violet-500',
}

const PLATFORM_LABEL: Record<string, string> = {
  twitter: 'Twitter / X', linkedin: 'LinkedIn', facebook: 'Facebook',
  tiktok: 'TikTok', instagram: 'Instagram', blog: 'Blog',
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, iconBg, href,
}: {
  label:   string
  value:   string | number
  sub?:    string
  icon:    React.ElementType
  iconBg?: string
  href?:   string
}) {
  const inner = (
    <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl p-5 flex flex-col gap-4 h-full transition-colors hover:border-[var(--accent)]/40 hover:bg-[var(--surface-subtle)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-widest">{label}</span>
        <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${iconBg ?? 'bg-[var(--accent-subtle)]'}`}>
          <Icon className="h-4 w-4 text-[var(--accent-text)]" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-[var(--text-base)] leading-none tabular-nums">{value}</p>
        {sub && <p className="text-xs text-[var(--text-faint)] mt-1.5">{sub}</p>}
      </div>
    </div>
  )

  return href ? <Link href={href} className="block h-full">{inner}</Link> : inner
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuthStore()

  const to   = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const from = useMemo(() => format(subDays(new Date(), 29), 'yyyy-MM-dd'), [])

  const { data: scheduled } = usePosts({ status: 'scheduled', per_page: 6 })
  const { data: drafts    } = usePosts({ status: 'draft',     per_page: 3 })
  const { data: published } = usePosts({ status: 'published', per_page: 5 })
  const { data: failed    } = usePosts({ status: 'failed',    per_page: 5 })
  const { data: accounts  } = usePlatformAccounts()
  const { data: overview  } = useAnalyticsOverview(from, to)
  const { data: bestTimes } = useAnalyticsBestTimes()

  const nextPost           = scheduled?.data?.[0]
  const connectedPlatforms = (accounts ?? []).filter((a) =>  a.is_active)
  const inactivePlatforms  = (accounts ?? []).filter((a) => !a.is_active)

  const bestSlots = useMemo(() => {
    if (!bestTimes?.best_times) return []
    return Object.entries(bestTimes.best_times)
      .map(([platform, slots]) => ({ platform, slot: slots?.[0] }))
      .filter((x): x is { platform: string; slot: NonNullable<typeof x.slot> } => !!x.slot)
  }, [bestTimes])

  return (
    <AppLayout
      title={`Good ${getGreeting()}, ${user?.name.split(' ')[0] ?? ''}!`}
      action={
        <Link href="/dashboard/compose">
          <Button size="sm"><Plus className="h-3.5 w-3.5" /> New post</Button>
        </Link>
      }
    >
      <div className="space-y-5 max-w-6xl">

        {/* ── KPI bar ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Scheduled"
            value={scheduled?.total ?? 0}
            sub={nextPost?.scheduled_at
              ? `Next ${formatDistanceToNow(new Date(nextPost.scheduled_at), { addSuffix: true })}`
              : 'Queue is empty'}
            icon={Clock}
            href="/dashboard/posts?status=scheduled"
          />
          <StatCard
            label="Published (30d)"
            value={overview?.posts.published ?? published?.total ?? 0}
            sub={overview ? `${overview.logs.success_rate}% success rate` : undefined}
            icon={CheckCircle2}
            iconBg="bg-emerald-100 dark:bg-emerald-950/40"
            href="/dashboard/analytics"
          />
          <StatCard
            label="Impressions (30d)"
            value={fmt(overview?.metrics.total_impressions)}
            sub={overview?.metrics.avg_engagement_rate != null
              ? `${overview.metrics.avg_engagement_rate}% avg engagement`
              : 'Metrics pulled 24h post-publish'}
            icon={Zap}
            iconBg="bg-violet-100 dark:bg-violet-950/40"
            href="/dashboard/analytics"
          />
          <StatCard
            label="Drafts"
            value={drafts?.total ?? 0}
            sub={drafts?.total ? 'Waiting to be published' : 'All caught up'}
            icon={FileText}
            href="/dashboard/posts?status=draft"
          />
        </div>

        {/* ── Main grid: Queue (2/3) + Right rail (1/3) ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Upcoming queue */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Upcoming queue</CardTitle>
              <Link href="/dashboard/posts?status=scheduled"
                className="text-xs text-[var(--accent)] hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {!scheduled?.data?.length ? (
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <div className="h-14 w-14 rounded-2xl bg-[var(--surface-subtle)] flex items-center justify-center">
                    <CalendarDays className="h-6 w-6 text-[var(--text-faint)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-muted)]">Nothing scheduled yet</p>
                    <p className="text-xs text-[var(--text-faint)] mt-1">Create a post and set a publish time.</p>
                  </div>
                  <Link href="/dashboard/compose">
                    <Button size="sm" variant="secondary">Schedule a post</Button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {scheduled.data.map((post) => (
                    <Link
                      key={post.id}
                      href={`/dashboard/posts/${post.id}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--surface-subtle)] transition-colors group"
                    >
                      {/* Platform dots */}
                      <div className="flex flex-col gap-1 shrink-0">
                        {post.platforms.slice(0, 3).map((p) => (
                          <div key={p} className={`h-1.5 w-1.5 rounded-full ${PLATFORM_COLOR[p] ?? 'bg-[var(--text-faint)]'}`} />
                        ))}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--text-base)] truncate group-hover:text-[var(--accent)] transition-colors">
                          {post.title}
                        </p>
                        <PlatformChips platforms={post.platforms} className="mt-1.5" />
                      </div>

                      {post.scheduled_at && (
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-[var(--text-muted)]">
                            {format(new Date(post.scheduled_at), 'MMM d')}
                          </p>
                          <p className="text-[10px] text-[var(--text-faint)]">
                            {format(new Date(post.scheduled_at), 'h:mm a')}
                          </p>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right rail */}
          <div className="space-y-4">

            {/* Platform connections */}
            <Card>
              <CardHeader>
                <CardTitle>Platforms</CardTitle>
                <Link href="/settings/connections" className="text-xs text-[var(--accent)] hover:underline">
                  Manage
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                {connectedPlatforms.length === 0 ? (
                  <div className="px-5 py-6 text-center">
                    <Link2 className="h-5 w-5 text-[var(--text-faint)] mx-auto mb-2" />
                    <p className="text-xs text-[var(--text-muted)]">No platforms connected</p>
                    <Link href="/settings/connections"
                      className="inline-block mt-2 text-xs text-[var(--accent)] hover:underline">
                      Connect now →
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--line)]">
                    {connectedPlatforms.map((a) => (
                      <div key={a.id} className="flex items-center gap-3 px-4 py-2.5">
                        <div className={`h-2 w-2 rounded-full shrink-0 ${PLATFORM_COLOR[a.platform] ?? 'bg-[var(--text-faint)]'}`} />
                        <span className="text-sm text-[var(--text-base)] flex-1 truncate">
                          {PLATFORM_LABEL[a.platform] ?? a.platform}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-500">Live</span>
                      </div>
                    ))}
                    {inactivePlatforms.length > 0 && (
                      <div className="px-4 py-2.5 flex items-center gap-2">
                        <span className="text-[10px] text-[var(--text-faint)]">
                          +{inactivePlatforms.length} inactive
                        </span>
                        <Link href="/settings/connections"
                          className="text-[10px] text-[var(--accent)] hover:underline">
                          Reactivate
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 grid grid-cols-2 gap-2">
                {[
                  { href: '/dashboard/compose',   icon: Plus,         label: 'Compose'   },
                  { href: '/dashboard/analytics', icon: BarChart2,    label: 'Analytics' },
                  { href: '/dashboard/calendar',  icon: CalendarDays, label: 'Calendar'  },
                  { href: '/dashboard/posts',     icon: FileText,     label: 'All posts' },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="flex flex-col items-center gap-1.5 py-3.5 rounded-xl border border-[var(--line)] hover:border-[var(--accent)] hover:bg-[var(--accent-subtle)] transition-all group"
                  >
                    <Icon className="h-4 w-4 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                    <span className="text-[11px] font-medium text-[var(--text-muted)] group-hover:text-[var(--accent-text)] transition-colors">
                      {label}
                    </span>
                  </Link>
                ))}
              </CardContent>
            </Card>

          </div>
        </div>

        {/* ── Second row: Recent published + Best times ──────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Recent published */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div>
                <CardTitle>Recently published</CardTitle>
                {(overview?.metrics.posts_with_metrics ?? 0) > 0 && (
                  <p className="text-[11px] text-[var(--text-faint)] mt-0.5">
                    Engagement metrics pulled 24h after publish
                  </p>
                )}
              </div>
              <Link href="/dashboard/posts?status=published"
                className="text-xs text-[var(--accent)] hover:underline shrink-0">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {!published?.data?.length ? (
                <div className="px-5 py-10 text-center text-sm text-[var(--text-faint)]">
                  No published posts yet — your activity will appear here.
                </div>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {published.data.map((post) => {
                    const liveLog = post.platform_logs?.find((l) => l.status === 'success' && l.external_post_url)
                    return (
                      <div key={post.id}
                        className="flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--surface-subtle)] transition-colors">
                        <div className="flex-1 min-w-0">
                          <Link href={`/dashboard/posts/${post.id}`}
                            className="text-sm font-medium text-[var(--text-base)] hover:text-[var(--accent)] transition-colors truncate block">
                            {post.title}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <PlatformChips platforms={post.platforms} />
                            {post.published_at && (
                              <span className="text-[10px] text-[var(--text-faint)]">
                                {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <CoverageChip post={post} connectedPlatforms={connectedPlatforms.map((a) => a.platform)} />
                          <StatusBadge status={post.status} />
                          {liveLog?.external_post_url && (
                            <a href={liveLog.external_post_url} target="_blank" rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[var(--text-faint)] hover:text-[var(--accent)] transition-colors">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Best posting windows */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Best posting windows</CardTitle>
                <p className="text-[11px] text-[var(--text-faint)] mt-0.5">Top slot per platform</p>
              </div>
              <Link href="/dashboard/analytics"
                className="text-xs text-[var(--accent)] hover:underline shrink-0">
                Full report
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {bestSlots.length === 0 ? (
                <div className="px-5 py-10 flex flex-col items-center gap-3 text-center">
                  <TrendingUp className="h-7 w-7 text-[var(--text-faint)]" />
                  <div>
                    <p className="text-xs font-medium text-[var(--text-muted)]">Not enough data yet</p>
                    <p className="text-[10px] text-[var(--text-faint)] mt-1">
                      Publish more posts to unlock timing insights.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[var(--line)]">
                  {bestSlots.map(({ platform, slot }) => (
                    <div key={platform} className="flex items-center gap-3 px-4 py-3">
                      <div className={`h-2 w-2 rounded-full shrink-0 ${PLATFORM_COLOR[platform] ?? 'bg-[var(--text-faint)]'}`} />
                      <span className="text-xs text-[var(--text-muted)] flex-1 truncate">
                        {PLATFORM_LABEL[platform] ?? platform}
                      </span>
                      <span className="text-xs font-semibold text-[var(--text-base)] tabular-nums shrink-0">
                        {slot.day_name.slice(0, 3)} · {slot.hour_label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── AI spotlight banner ────────────────────────────────────────── */}
        <div className="rounded-2xl border border-[var(--accent)]/20 bg-gradient-to-r from-[var(--accent-subtle)] via-[var(--accent-subtle)]/60 to-transparent p-5 flex items-center gap-5">
          <div className="h-11 w-11 rounded-2xl bg-[var(--accent)] flex items-center justify-center shrink-0 shadow-lg shadow-[var(--accent)]/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-base)]">AI Caption Generator</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Generate platform-optimised captions with tone controls — Twitter threads, LinkedIn articles, TikTok hooks, Blog intros and more.
            </p>
          </div>
          <Link href="/dashboard/compose" className="shrink-0">
            <Button size="sm" variant="secondary">
              <Sparkles className="h-3.5 w-3.5" /> Try it
            </Button>
          </Link>
        </div>

        {/* ── Failed posts alert ────────────────────────────────────────── */}
        {(failed?.total ?? 0) > 0 && (
          <Card className="border-red-200 dark:border-red-900/40">
            <CardHeader className="border-red-100 dark:border-red-900/30">
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="h-4 w-4" />
                {failed!.total} post{failed!.total > 1 ? 's' : ''} failed to publish
              </CardTitle>
              <Link href="/dashboard/posts?status=failed"
                className="text-xs text-[var(--accent)] hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-red-100 dark:divide-red-900/30">
                {failed!.data.map((post) => (
                  <div key={post.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-base)] truncate">{post.title}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <PlatformChips platforms={post.platforms} />
                        <CoverageChip post={post} connectedPlatforms={connectedPlatforms.map((a) => a.platform)} />
                      </div>
                    </div>
                    <Link href={`/dashboard/posts/${post.id}/edit`}>
                      <Button variant="ghost" size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                        Retry
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

      </div>
    </AppLayout>
  )
}
