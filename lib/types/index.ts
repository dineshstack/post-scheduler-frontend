// 
// Shared TypeScript types  mirrors the Laravel API response shapes
// 

//  Auth 

export interface User {
  id: number
  name: string
  email: string
  timezone: string
  avatar: string | null
  created_at: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirmation: string
  timezone?: string
}

//  Platform Accounts 

export type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'blog' | 'devto' | 'medium'

export interface PlatformAccount {
  id: number
  platform: Platform
  account_name: string
  account_id: string | null
  is_active: boolean
  token_expired: boolean
  token_expires_at: string | null
  connected_at: string
  meta: Record<string, string> | null
}

//  Posts 

export type PostStatus = 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed'

export interface BlogCaseStudy {
  client?: string
  industry?: string
  challenge?: string
  solution?: string
  results?: string
  technologies?: string[]
  project_url?: string
  duration?: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface PerPlatformOverride {
  body?: string
  title?: string
  media_urls?: string[]
  // Shared across multiple platform panels
  tags?: string[]
  canonical_url?: string
  // Blog-specific metadata (stored in per_platform_overrides.blog)
  excerpt?: string
  category_id?: number
  meta_title?: string
  meta_description?: string
  is_featured?: boolean
  allow_comments?: boolean
  case_study?: BlogCaseStudy
  // Blog new fields (2026)
  og_image?: string
  video_url?: string
  github_repo_url?: string
  is_premium?: boolean
  free_preview_paragraphs?: number
  llm_snippet?: string
  faq?: FaqItem[]
  last_reviewed_at?: string
  pillar_post_id?: number
  related_post_ids?: number[]
  // Dev.to-specific (max 4 tags, no hyphens)
  series?: string
  description?: string  // shown in dev.to feed cards
  main_image?: string   // cover image URL
  published?: boolean   // false = save as draft on dev.to
  // Medium-specific — publishing is manual (Medium retired its API); the
  // AI-suggested topics/subtitle here are meant to be copied into Medium's
  // own Import tool. Posts are immutable there after publish.
  publish_status?: 'public' | 'draft' | 'unlisted'
  notify_followers?: boolean
  publication_id?: string
  subtitle?: string // shown under the title on Medium's story preview, <=140 chars
}

export interface BlogCategory {
  id: number
  name: string
  slug: string
  color?: string
}

export interface BlogTag {
  name: string
  slug: string
}

export interface BlogMetaResponse {
  categories: BlogCategory[]
  tags: BlogTag[]
}

export interface Post {
  id: number
  user_id: number
  title: string
  body: string
  media_urls: string[] | null
  platforms: Platform[]
  per_platform_overrides: Record<Platform, PerPlatformOverride> | null
  tags: string[] | null
  scheduled_at: string | null
  published_at: string | null
  status: PostStatus
  blog_slug: string | null
  blog_post_type: 'article' | 'tutorial' | 'case_study' | 'tip' | null
  blog_locale: 'en' | 'si' | 'ar' | null
  blog_post_id: number | null
  notes: string | null
  first_comment: string | null
  sentiment: 'positive' | 'negative' | 'neutral' | null
  topics: string[] | null
  created_at: string
  updated_at: string
  platform_logs?: PostPlatformLog[]
}

export interface PostPlatformLog {
  id: number
  post_id: number
  platform: Platform
  status: 'pending' | 'success' | 'failed' | 'retrying'
  external_post_id: string | null
  external_post_url: string | null
  error_message: string | null
  attempted_at: string | null
}

export interface StorePostPayload {
  title: string
  body: string
  platforms: Platform[]
  media_urls?: string[]
  per_platform_overrides?: Record<string, PerPlatformOverride>
  tags?: string[]
  scheduled_at?: string | null
  status?: 'draft' | 'scheduled'
  notes?: string
  first_comment?: string
  blog_slug?: string
  blog_post_type?: 'article' | 'tutorial' | 'case_study' | 'tip'
  blog_locale?: 'en' | 'si' | 'ar'
  // Required to change title/body/media/blog settings on a post that has
  // already published — see PostController::update's content lock.
  force_content_edit?: boolean
}

// Best times to post

export interface BestTimeSlot {
  day: number
  day_name: string
  hour: number
  hour_label: string
  score: number
}

export interface BestTimesResponse {
  best_times: Partial<Record<Platform, BestTimeSlot[]>>
}

//  Calendar 

export type CalendarPostsResponse = Record<string, CalendarPost[]>

export interface CalendarPost {
  id: number
  title: string
  platforms: Platform[]
  status: PostStatus
  scheduled_at: string | null
  published_at: string | null
}

//  API pagination wrapper 

export interface Paginated<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
  next_page_url: string | null
  prev_page_url: string | null
}

//  API error 

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

//  Gallery / Media Library 

export interface GalleryItem {
  id: number
  name: string | null
  alt: string | null
  full_url: string
  folder_id: number | null
  media_id: number
}

export interface GalleryFolder {
  id: number
  name: string
  folder_id: number | null
  media_id: number
  children?: GalleryFolder[]
  galleries?: GalleryItem[]
}

export interface MediaLibrary {
  id: number
  name: string
  folders: GalleryFolder[]
  galleries: GalleryItem[]
}

export interface TrashContents {
  folders: GalleryFolder[]
  gallery: GalleryItem[]
}

// Analytics

export interface AnalyticsPlatformBreakdown {
  platform: Platform
  total: number
  success: number
  failed: number
  impressions: number
  likes: number
  comments: number
  shares: number
  engagement_rate: number | null
}

export interface AnalyticsTopPost {
  id: number
  title: string
  platform: Platform
  published_at: string | null
  impressions: number | null
  likes: number | null
  engagement_rate: number | null
  external_post_url: string | null
}

export interface AnalyticsOverview {
  period: { from: string; to: string }
  posts: {
    total: number
    published: number
    scheduled: number
    draft: number
    failed: number
    publishing: number
  }
  logs: {
    total: number
    success: number
    failed: number
    success_rate: number
  }
  metrics: {
    total_impressions: number
    total_reach: number
    total_likes: number
    total_comments: number
    total_shares: number
    total_video_views: number
    total_clicks: number
    avg_engagement_rate: number | null
    posts_with_metrics: number
  }
  platform_breakdown: AnalyticsPlatformBreakdown[]
  top_posts: AnalyticsTopPost[]
}

export interface AnalyticsTimeSeriesPoint {
  date: string
  published: number
  failed: number
}

export interface AnalyticsTimeSeries {
  series: AnalyticsTimeSeriesPoint[]
}

export interface AnalyticsInsightHighlight {
  type: string
  title: string
  value: string
  change: number | null
  trend: 'up' | 'down' | 'flat'
}

export interface AnalyticsInsights {
  summary: string
  highlights: AnalyticsInsightHighlight[]
  recommendations: string[]
}

// Post Ideas

export type PostIdeaStatus      = 'idea' | 'in_progress' | 'converted' | 'rejected'
export type PostIdeaContentType = 'tutorial' | 'tips' | 'comparison' | 'mistakes' | 'guide' | 'release' | 'project' | 'benchmark'
export type PostIdeaSeoFormula  = 'step_by_step' | 'bad_practices' | 'all_you_need' | 'vs_comparison' | 'n_ways' | 'release_update' | 'beginners_guide' | 'benchmark' | 'first_impression' | 'top_mistakes'

export interface PostIdea {
  id: number
  user_id: number
  title: string
  keyword_target: string | null
  notes: string | null
  target_publish_date: string | null
  content_type: PostIdeaContentType
  seo_formula: PostIdeaSeoFormula | null
  priority: 'low' | 'medium' | 'high'
  status: PostIdeaStatus
  tags: string[] | null
  converted_post_id: number | null
  converted_post?: { id: number; title: string; status: string } | null
  created_at: string
  updated_at: string
}

export interface StorePostIdeaPayload {
  title: string
  keyword_target?: string
  notes?: string
  target_publish_date?: string | null
  content_type?: PostIdeaContentType
  seo_formula?: PostIdeaSeoFormula | null
  priority?: 'low' | 'medium' | 'high'
  tags?: string[]
}

// SEO

export interface SeoFormula {
  key: string
  label: string
  pattern: string
  example: string
  best_for: string[]
  search_intent: string
  difficulty: string
  tip?: string
}

export interface SeoTitle {
  title: string
  formula: string
  estimated_length: number
  search_intent: string
}

export interface SeoTitlesResponse {
  titles: SeoTitle[]
  primary_keyword: string
  suggested_slug: string
}

export interface SeoTitleFormula {
  pattern: string
  example: string
  content_types: string[]
}

export interface SeoIntroFormula {
  template: string
  variants: string[]
  seo_anchor_phrase: string
}

export interface SeoTechnicalSignal {
  signal: string
  rule: string
}

export interface SeoKeywordStrategy {
  high_volume_categories: Record<string, string>
  high_intent_topics: Record<string, string>
  your_unique_niche: {
    gap: string
    opportunity: string
    examples: string[]
  }
  quick_wins: Record<string, string>
}

export interface SeoGuidelines {
  title_formulas: SeoTitleFormula[]
  intro_formula: SeoIntroFormula
  post_structure: Record<string, string[]>
  seo_checklist: Record<string, string[]>
  technical_signals: SeoTechnicalSignal[]
  keyword_strategy: SeoKeywordStrategy
  publishing_tips: Record<string, string>
}

// ── Distribution previews ────────────────────────────────────────────────────
// Composed per-platform payloads returned by /posts/{id}/previews — exactly
// what the publisher would send. Shape varies by platform.

export interface DistributionPreview {
  // twitter — an AI-composed thread (1..max_thread_length tweets); `text`/
  // `char_count` (singular) are legacy fields still present on previews
  // stored before threads existed and never regenerated since.
  tweets?: string[]
  char_counts?: number[]
  text?: string
  char_count?: number
  limit?: number
  // linkedin
  article_url?: string | null
  // facebook
  message?: string
  link?: string | null
  // devto
  body_markdown?: string
  canonical_url?: string | null
  // tiktok
  title?: string
  media_type?: 'PHOTO' | 'VIDEO'
  photo_count?: number
  // medium — suggestions to paste into Medium's own manual Import tool
  topics?: string[]
  subtitle?: string
  // common
  generated_at?: string
  sent_at?: string
  ai_generated?: boolean
  stale?: boolean
}

export interface LintReport {
  blockers: string[]
  warnings: string[]
}

export interface DistributionPreviewsResponse {
  previews: Record<string, DistributionPreview>
  lint: LintReport | null
}
