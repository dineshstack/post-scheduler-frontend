'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, subDays } from 'date-fns'
import {
  AreaChart, Area, BarChart, Bar, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts'
import { useTheme } from 'next-themes'
import {
  AlertCircle, ArrowDown, ArrowUp, BarChart2, CheckCircle2,
  ExternalLink, Lightbulb, Minus, TrendingUp, Zap,
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle, PlatformChips, StatusBadge } from '@/components/ui'
import { useAnalyticsBestTimes, useAnalyticsInsights, useAnalyticsOverview, useAnalyticsTimeSeries } from '@/lib/hooks'
import type { Platform } from '@/lib/types'

// Date range presets
const RANGES = [
  { label: '7d',  days: 6  },
  { label: '30d', days: 29 },
  { label: '90d', days: 89 },
] as const

const PLATFORM_COLORS: Record<string, string> = {
  twitter:   '#1d9bf0',
  linkedin:  '#0a66c2',
  facebook:  '#1877f2',
  tiktok:    '#fe2c55',
  blog:      '#6366f1',
  instagram: '#e1306c',
}

const PLATFORM_LABELS: Record<string, string> = {
  twitter:   'Twitter / X',
  linkedin:  'LinkedIn',
  facebook:  'Facebook',
  tiktok:    'TikTok',
  blog:      'Blog',
  instagram: 'Instagram',
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '-'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

function StatCard({
  label, value, sub, icon: Icon, accent,
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: boolean
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-[var(--text-faint)] uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-2xl font-bold truncate ${accent ? 'text-[var(--accent)]' : 'text-[var(--text-base)]'}`}>
              {value}
            </p>
            {sub && <p className="text-xs text-[var(--text-faint)] mt-0.5">{sub}</p>}
          </div>
          <div className="h-9 w-9 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-[var(--accent-text)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AnalyticsPage() {
  const [rangeIdx, setRangeIdx] = useState(1)
  const [mounted,  setMounted]  = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => setMounted(true), [])

  const { days } = RANGES[rangeIdx]
  const to   = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const from = useMemo(() => format(subDays(new Date(), days), 'yyyy-MM-dd'), [days])

  const { data: overview,   isLoading: loadingOverview } = useAnalyticsOverview(from, to)
  const { data: ts,         isLoading: loadingTs }       = useAnalyticsTimeSeries(from, to)
  const { data: bestTimes }                              = useAnalyticsBestTimes()
  const { data: insights }                               = useAnalyticsInsights()

  const isDark    = resolvedTheme === 'dark'
  const gridColor = isDark ? '#2a3547' : '#dde3ed'
  const textColor = isDark ? '#526070' : '#8796ae'

  // Format time-series x-axis labels to short date
  const seriesData = useMemo(() =>
    (ts?.series ?? []).map((p) => ({
      ...p,
      label: format(new Date(p.date + 'T00:00:00'), 'MMM d'),
    })),
  [ts])

  // Platform bar chart data
  const platformData = useMemo(() =>
    (overview?.platform_breakdown ?? []).map((p) => ({
      name:    PLATFORM_LABELS[p.platform] ?? p.platform,
      success: p.success,
      failed:  p.failed,
      color:   PLATFORM_COLORS[p.platform] ?? '#6366f1',
    })),
  [overview])

  const loading = loadingOverview || loadingTs

  return (
    <AppLayout title="Analytics">
      {/* Range tabs */}
      <div className="flex items-center gap-1 mb-6">
        {RANGES.map(({ label }, i) => (
          <button
            key={label}
            onClick={() => setRangeIdx(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              rangeIdx === i
                ? 'bg-[var(--accent)] text-white'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]'
            }`}
          >
            {label}
          </button>
        ))}
        <span className="ml-auto text-xs text-[var(--text-faint)]">
          {from} — {to}
        </span>
      </div>

      {loading ? (
        <div className="py-24 text-center text-sm text-[var(--text-faint)]">Loading analytics…</div>
      ) : !overview ? (
        <div className="py-24 flex flex-col items-center gap-3">
          <AlertCircle className="h-8 w-8 text-[var(--text-faint)]" />
          <p className="text-sm text-[var(--text-muted)]">Could not load analytics.</p>
        </div>
      ) : (
        <div className="space-y-6">

          {/* Monthly insights */}
          {insights && (
            <Card>
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-8 w-8 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                    <Lightbulb className="h-4 w-4 text-[var(--accent-text)]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-0.5">Monthly Insights</p>
                    <p className="text-sm text-[var(--text-base)]">{insights.summary}</p>
                  </div>
                </div>

                {insights.highlights.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {insights.highlights.map((h, i) => (
                      <div key={i} className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-2.5">
                        <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wide mb-0.5">{h.title}</p>
                        <p className="text-base font-bold text-[var(--text-base)]">{h.value}</p>
                        {h.change != null && (
                          <p className={`text-[11px] flex items-center gap-0.5 mt-0.5 ${
                            h.trend === 'up'   ? 'text-emerald-500'
                            : h.trend === 'down' ? 'text-red-500'
                            : 'text-[var(--text-faint)]'
                          }`}>
                            {h.trend === 'up'   ? <ArrowUp   className="h-3 w-3" />
                            : h.trend === 'down' ? <ArrowDown className="h-3 w-3" />
                            : <Minus className="h-3 w-3" />}
                            {Math.abs(h.change)}% vs last month
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {insights.recommendations.length > 0 && (
                  <div className="rounded-xl border border-[var(--accent)]/20 bg-[var(--accent-subtle)] px-4 py-3 space-y-1.5">
                    <p className="text-[10px] font-semibold text-[var(--accent-text)] uppercase tracking-wide mb-2">Recommendations</p>
                    {insights.recommendations.map((r, i) => (
                      <p key={i} className="text-xs text-[var(--text-muted)] flex gap-2">
                        <span className="text-[var(--accent-text)] font-bold shrink-0">{i + 1}.</span>
                        {r}
                      </p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Published"
              value={overview.posts.published}
              sub={`${overview.logs.success} platform publishes`}
              icon={CheckCircle2}
              accent
            />
            <StatCard
              label="Success rate"
              value={`${overview.logs.success_rate}%`}
              sub={`${overview.logs.failed} failed`}
              icon={TrendingUp}
            />
            <StatCard
              label="Total impressions"
              value={fmt(overview.metrics.total_impressions)}
              sub={overview.metrics.posts_with_metrics > 0
                ? `${overview.metrics.posts_with_metrics} posts tracked`
                : 'Fetched 24h after publish'}
              icon={Zap}
            />
            <StatCard
              label="Avg engagement"
              value={overview.metrics.avg_engagement_rate != null
                ? `${overview.metrics.avg_engagement_rate}%`
                : '-'}
              sub={overview.metrics.total_likes > 0
                ? `${fmt(overview.metrics.total_likes)} likes · ${fmt(overview.metrics.total_shares)} shares`
                : 'No metrics yet'}
              icon={BarChart2}
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

            {/* Area chart — posts over time */}
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Posts published over time</CardTitle>
              </CardHeader>
              <CardContent>
                {mounted && seriesData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={seriesData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradPublished" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#f87171" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: textColor }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: textColor }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: isDark ? '#161b22' : '#ffffff',
                          border: `1px solid ${gridColor}`,
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                        labelStyle={{ color: isDark ? '#e6edf3' : '#0f172a' }}
                      />
                      <Area type="monotone" dataKey="published" name="Published"
                        stroke="#6366f1" strokeWidth={2} fill="url(#gradPublished)" dot={false} />
                      <Area type="monotone" dataKey="failed" name="Failed"
                        stroke="#f87171" strokeWidth={2} fill="url(#gradFailed)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-sm text-[var(--text-faint)]">
                    No publish activity in this period
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bar chart — platform breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>By platform</CardTitle>
              </CardHeader>
              <CardContent>
                {mounted && platformData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={platformData}
                      layout="vertical"
                      margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11, fill: textColor }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={72}
                        tick={{ fontSize: 11, fill: textColor }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: isDark ? '#161b22' : '#ffffff',
                          border: `1px solid ${gridColor}`,
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="success" name="Success" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                      <Bar dataKey="failed"  name="Failed"  stackId="a" fill="#f87171" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-sm text-[var(--text-faint)]">
                    No data
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top / recent posts */}
          <Card>
            <CardHeader>
              <CardTitle>
                {overview.metrics.posts_with_metrics > 0 ? 'Top posts by impressions' : 'Recently published'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {overview.top_posts.length === 0 ? (
                <p className="text-sm text-[var(--text-faint)] italic py-4 text-center">
                  No published posts in this period.
                </p>
              ) : (
                // Six fixed-width columns don't fit a phone viewport — scroll
                // horizontally within the card instead of squeezing/breaking.
                <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                  <div className="min-w-[560px] divide-y divide-[var(--line)]">
                    {/* Header row */}
                    <div className="grid grid-cols-[1fr_100px_80px_80px_80px_32px] gap-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-faint)]">
                      <span>Post</span>
                      <span>Platform</span>
                      <span className="text-right">Impressions</span>
                      <span className="text-right">Likes</span>
                      <span className="text-right">Engagement</span>
                      <span />
                    </div>

                    {overview.top_posts.map((post, i) => (
                      <div key={`${post.id}-${post.platform}-${i}`}
                        className="grid grid-cols-[1fr_100px_80px_80px_80px_32px] gap-3 py-2.5 items-center">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--text-base)] truncate">{post.title || 'Untitled'}</p>
                          {post.published_at && (
                            <p className="text-xs text-[var(--text-faint)]">
                              {format(new Date(post.published_at), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <div>
                          <PlatformChips platforms={[post.platform as Platform]} />
                        </div>
                        <p className="text-sm text-right text-[var(--text-muted)]">{fmt(post.impressions)}</p>
                        <p className="text-sm text-right text-[var(--text-muted)]">{fmt(post.likes)}</p>
                        <p className="text-sm text-right text-[var(--text-muted)]">
                          {post.engagement_rate != null ? `${post.engagement_rate}%` : '-'}
                        </p>
                        <div className="flex justify-end">
                          {post.external_post_url && (
                            <a
                              href={post.external_post_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--text-faint)] hover:text-[var(--accent)] transition-colors"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Engagement breakdown (only shown when metrics exist) */}
          {overview.metrics.posts_with_metrics > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total likes',    value: overview.metrics.total_likes },
                { label: 'Total comments', value: overview.metrics.total_comments },
                { label: 'Total shares',   value: overview.metrics.total_shares },
                { label: 'Total clicks',   value: overview.metrics.total_clicks },
              ].map(({ label, value }) => (
                <Card key={label}>
                  <CardContent className="pt-4 pb-3">
                    <p className="text-xs text-[var(--text-faint)] mb-1">{label}</p>
                    <p className="text-xl font-bold text-[var(--text-base)]">{fmt(value)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Best times to post */}
          {bestTimes && bestTimes.best_times && Object.keys(bestTimes.best_times).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Best times to post</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(bestTimes.best_times).map(([platform, slots]) => (
                    <div key={platform}>
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: PLATFORM_COLORS[platform] ?? '#6366f1' }}
                        />
                        <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                          {PLATFORM_LABELS[platform] ?? platform}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {slots?.slice(0, 5).map((slot, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--surface-subtle)] border border-[var(--line)] text-[var(--text-muted)]"
                          >
                            {slot.day_name} {slot.hour_label}
                            {i === 0 && (
                              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)] text-[10px]">
                                Best
                              </span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[var(--text-faint)] mt-4">
                  Based on your historical publish success rate. Times are in your local timezone.
                </p>
              </CardContent>
            </Card>
          )}

        </div>
      )}
    </AppLayout>
  )
}
