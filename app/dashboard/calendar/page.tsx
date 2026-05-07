'use client'

import { useCallback, useState } from 'react'
import dynamic from 'next/dynamic'
import type { EventClickArg, DatesSetArg } from '@fullcalendar/core'
import { formatDistanceToNow } from 'date-fns'
import AppLayout from '@/components/layout/AppLayout'
import { Modal, StatusBadge, PlatformChips, Button } from '@/components/ui'
import { useCalendar } from '@/lib/hooks'
import type { CalendarPost } from '@/lib/types'

import DayGridPlugin     from '@fullcalendar/daygrid'
import InteractionPlugin from '@fullcalendar/interaction'

// FullCalendar must be dynamically imported to avoid SSR issues
const FullCalendar = dynamic(
  () => import('@fullcalendar/react').then((m) => m.default),
  { ssr: false, loading: () => <div className="h-96 animate-pulse bg-[var(--surface-subtle)] rounded-lg" /> }
)

//  Status  colour mapping 

const STATUS_COLORS: Record<string, string> = {
  draft:      '#94a3b8',
  scheduled:  '#3b82f6',
  publishing: '#f59e0b',
  published:  '#10b981',
  failed:     '#ef4444',
}

//  Post detail modal 

function PostDetailModal({ post, onClose }: { post: CalendarPost | null; onClose: () => void }) {
  return (
    <Modal open={!!post} onClose={onClose} title={post?.title ?? ''} size="sm">
      {post && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={post.status} />
            <PlatformChips platforms={post.platforms} />
          </div>
          {post.scheduled_at && (
            <p className="text-xs text-[var(--text-muted)]">
              Scheduled {formatDistanceToNow(new Date(post.scheduled_at), { addSuffix: true })}
            </p>
          )}
          {post.published_at && (
            <p className="text-xs text-[var(--text-muted)]">
              Published {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            {(post.status === 'draft' || post.status === 'scheduled') && (
              <a href={`/dashboard/posts/${post.id}/edit`}>
                <Button size="sm" variant="secondary">Edit post</Button>
              </a>
            )}
            <Button size="sm" variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

//  Page 

export default function CalendarPage() {
  const [range, setRange] = useState<{ from: string; to: string }>({
    from: firstDayOfMonth(),
    to:   lastDayOfMonth(),
  })
  const [selectedPost, setSelectedPost] = useState<CalendarPost | null>(null)

  const { data: calendarData, isLoading } = useCalendar(range.from, range.to)

  const events = Object.entries(calendarData ?? {}).flatMap(([, posts]) =>
    posts.map((post) => ({
      id:              String(post.id),
      title:           post.title,
      start:           post.scheduled_at ?? post.published_at ?? undefined,
      backgroundColor: STATUS_COLORS[post.status] ?? '#94a3b8',
      borderColor:     STATUS_COLORS[post.status] ?? '#94a3b8',
      extendedProps:   post,
    }))
  )

  const handleEventClick = useCallback((info: EventClickArg) => {
    setSelectedPost(info.event.extendedProps as CalendarPost)
  }, [])

  const handleDatesSet = useCallback((info: DatesSetArg) => {
    setRange({
      from: toDateString(info.start),
      to:   toDateString(new Date(info.end.getTime() - 1)),
    })
  }, [])

  return (
    <AppLayout
      title="Calendar"
      action={isLoading ? <span className="text-xs text-[var(--text-faint)]">Loading</span> : undefined}
    >
      <div className="space-y-4 max-w-5xl">
        {/* Calendar */}
        <div className="calendar-wrap rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--surface-card)]">
          <FullCalendar
            plugins={[DayGridPlugin, InteractionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left:   'prev,next today',
              center: 'title',
              right:  '',
            }}
            events={events}
            eventClick={handleEventClick}
            datesSet={handleDatesSet}
            height="auto"
            eventDisplay="block"
            dayMaxEvents={3}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 px-1">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
              <span className="text-xs text-[var(--text-muted)] capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
    </AppLayout>
  )
}

//  Helpers 

function toDateString(d: Date) {
  return d.toISOString().split('T')[0]
}

function firstDayOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}

function lastDayOfMonth() {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
}
