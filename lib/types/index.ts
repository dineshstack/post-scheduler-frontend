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

export type Platform = 'twitter' | 'instagram' | 'linkedin' | 'facebook' | 'tiktok' | 'blog'

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

export interface PerPlatformOverride {
  body?: string
  title?: string
  media_urls?: string[]
  // Blog-specific metadata (stored in per_platform_overrides.blog)
  excerpt?: string
  category_id?: number
  tags?: string[]
  meta_title?: string
  meta_description?: string
  canonical_url?: string
  is_featured?: boolean
  allow_comments?: boolean
  case_study?: BlogCaseStudy
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
  blog_post_type: 'article' | 'tutorial' | 'case_study' | null
  blog_post_id: number | null
  notes: string | null
  first_comment: string | null
  sentiment: 'positive' | 'negative' | 'neutral' | null
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
  blog_post_type?: 'article' | 'tutorial' | 'case_study'
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
