'use client'

import { Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useBlogMeta } from '@/lib/hooks'
import type { Post } from '@/lib/types'

const TYPE_LABEL: Record<string, string> = {
  article:    'Article',
  tutorial:   'Tutorial',
  case_study: 'Case Study',
  tip:        'Quick Tip',
}

// Best-effort client-side mirror of the blog's Str::slug() — for display
// only; the real slug is assigned server-side at publish time.
function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function BlogPreviewCard({ post }: { post: Post }) {
  if (!post.platforms.includes('blog')) return null

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
    <Card>
      <CardHeader>
        <CardTitle>Blog preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Browser-chrome strip — reinforces this is the live-site URL, not just a mock */}
        <div className="flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] px-3 py-1.5">
          <Globe className="h-3.5 w-3.5 text-[var(--text-faint)] shrink-0" />
          <span className="text-xs text-[var(--text-faint)] truncate">{url}</span>
        </div>

        <article className="max-w-2xl mx-auto">
          {cover ? (
            <img
              src={cover}
              alt={post.title}
              className="w-full aspect-video object-cover rounded-xl mb-5 border border-[var(--line)]"
            />
          ) : (
            <div className="w-full aspect-video rounded-xl mb-5 border border-[var(--line)] bg-gradient-to-br from-[var(--accent-subtle)] to-[var(--surface-subtle)] flex items-center justify-center">
              <span className="text-4xl opacity-40 select-none">📝</span>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-[var(--accent-subtle)] text-[var(--accent-text)]">
              {TYPE_LABEL[post.blog_post_type ?? 'article']}
            </span>
            {category && (
              <span className="text-xs font-medium text-[var(--text-faint)]">{category.name}</span>
            )}
            <span className="text-xs text-[var(--text-faint)]">· {readTime}m read</span>
          </div>

          <h1 className="text-2xl font-bold text-[var(--text-base)] leading-snug mb-2">
            {post.title || 'Untitled post'}
          </h1>

          {excerpt && (
            <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">{excerpt}</p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {tags.map((t) => (
                <span key={t} className="rounded-full bg-[var(--surface-overlay)] px-2.5 py-0.5 text-xs text-[var(--text-muted)]">
                  #{t}
                </span>
              ))}
            </div>
          )}

          {post.body ? (
            <div
              className="ck-content"
              dangerouslySetInnerHTML={{ __html: override.body ?? post.body }}
            />
          ) : (
            <p className="text-sm text-[var(--text-faint)] italic">No content yet.</p>
          )}
        </article>

        <p className="text-[11px] text-[var(--text-faint)] text-center">
          Approximate — actual typography and layout are set by the live blog theme.
        </p>
      </CardContent>
    </Card>
  )
}
