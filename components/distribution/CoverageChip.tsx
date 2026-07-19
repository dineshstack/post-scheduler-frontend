'use client'

import type { Platform, Post } from '@/lib/types'

// Medium's API is retired — it can never be auto-sent, so it's always a
// manual channel regardless of connection state.
const ALWAYS_MANUAL: Platform[] = ['medium']

function isAutomated(platform: Platform, connected: Platform[]): boolean {
  if (ALWAYS_MANUAL.includes(platform)) return false
  // LinkedIn auto-publishes only once an account is connected — otherwise
  // it's selected purely for its manual-copy AI preview.
  if (platform === 'linkedin') return connected.includes('linkedin')
  return true
}

/**
 * At-a-glance distribution health for a published/failed post: how many of
 * its automated channels actually confirmed live, plus a callout for any
 * channel that requires manual copy/paste (which never shows a send log).
 * Renders nothing for draft/scheduled posts — nothing's been attempted yet.
 */
export default function CoverageChip({
  post, connectedPlatforms,
}: {
  post: Post
  connectedPlatforms: Platform[]
}) {
  if (post.status !== 'published' && post.status !== 'failed') return null

  const automatedTargets = post.platforms.filter((p) => isAutomated(p, connectedPlatforms))
  const manualTargets    = post.platforms.filter((p) => !isAutomated(p, connectedPlatforms))

  if (!automatedTargets.length && !manualTargets.length) return null

  const sentCount = automatedTargets.filter((p) =>
    post.platform_logs?.some((l) => l.platform === p && l.status === 'success')
  ).length

  const allSent  = automatedTargets.length > 0 && sentCount === automatedTargets.length
  const noneSent = automatedTargets.length > 0 && sentCount === 0

  const color = automatedTargets.length === 0
    ? 'bg-[var(--surface-overlay)] text-[var(--text-muted)]'
    : allSent
      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
      : noneSent
        ? 'bg-red-500/10 text-red-500'
        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'

  const title = [
    automatedTargets.length > 0 ? `${sentCount}/${automatedTargets.length} channels confirmed live.` : null,
    manualTargets.length > 0 ? `Needs manual posting: ${manualTargets.join(', ')}.` : null,
  ].filter(Boolean).join(' ')

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${color}`}
      title={title}
    >
      {automatedTargets.length > 0 && `${sentCount}/${automatedTargets.length} live`}
      {automatedTargets.length > 0 && manualTargets.length > 0 && ' · '}
      {manualTargets.length > 0 && `${manualTargets.length} manual`}
    </span>
  )
}
