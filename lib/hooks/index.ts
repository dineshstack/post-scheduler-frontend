// 
// React Query hooks  auth, posts, platform accounts
// 

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { analyticsApi, analyticsInsightsApi, authApi, blogMetaApi, galleryApi, platformAccountsApi, postIdeasApi, postsApi, seoApi } from '@/lib/api'
import { useAuthStore } from '@/lib/stores/auth.store'
import type { StorePostIdeaPayload, StorePostPayload } from '@/lib/types'

//  Query keys 

export const queryKeys = {
  me:               ['me']                       as const,
  posts:            (params?: object) => ['posts', params] as const,
  post:             (id: number)      => ['posts', id]     as const,
  postPreviews:     (id: number)      => ['posts', id, 'previews'] as const,
  calendar:         (from: string, to: string) => ['calendar', from, to] as const,
  platformAccounts: ['platform-accounts']        as const,
  analyticsOverview:   (from: string, to: string) => ['analytics', 'overview', from, to] as const,
  analyticsTimeSeries: (from: string, to: string) => ['analytics', 'time-series', from, to] as const,
  analyticsBestTimes:  ['analytics', 'best-times'] as const,
  analyticsInsights:   ['analytics', 'insights']  as const,
  postIdeas:  (params?: object) => ['post-ideas', params] as const,
  postIdea:   (id: number)      => ['post-ideas', id]     as const,
}

//  Auth hooks 

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn:  authApi.me,
    retry:    false,
    staleTime: 5 * 60 * 1000,
  })
}

export function useLogout() {
  const qc      = useQueryClient()
  const { logout } = useAuthStore()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.clear()
      window.location.href = '/auth/login'
    },
  })
}

//  Post hooks 

export function usePosts(params?: Parameters<typeof postsApi.list>[0]) {
  return useQuery({
    queryKey: queryKeys.posts(params),
    queryFn:  () => postsApi.list(params),
    staleTime: 30 * 1000,
  })
}

export function usePost(id: number) {
  return useQuery({
    queryKey: queryKeys.post(id),
    queryFn:  () => postsApi.get(id),
    enabled:  !!id,
  })
}

export function useCreatePost() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: StorePostPayload) => postsApi.create(payload),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success(
        post.status === 'scheduled'
          ? '📅 Post scheduled successfully!'
          : '📝 Draft saved.'
      )
    },
    onError: () => toast.error('Failed to save post. Please try again.'),
  })
}

export function usePostPreviews(id: number) {
  return useQuery({
    queryKey: queryKeys.postPreviews(id),
    queryFn:  () => postsApi.previews(id),
    enabled:  !!id,
  })
}

export function useGeneratePreviews(id: number) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: () => postsApi.generatePreviews(id),
    onSuccess: (data) => {
      qc.setQueryData(queryKeys.postPreviews(id), data)
      toast.success('✨ Previews generated — this is exactly what each platform will receive.')
    },
    onError: () => toast.error('Failed to generate previews.'),
  })
}

export function useUpdatePost(id: number) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: Partial<StorePostPayload>) => postsApi.update(id, payload),
    onSuccess: (post) => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      qc.setQueryData(queryKeys.post(id), post)
      toast.success('Post updated.')
    },
    onError: () => toast.error('Failed to update post.'),
  })
}

export function useDeletePost() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => postsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success('Post deleted.')
    },
    onError: () => toast.error('Failed to delete post.'),
  })
}

export function usePublishNow() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => postsApi.publishNow(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success(' Publishing job dispatched!')
    },
    onError: () => toast.error('Failed to dispatch publish job.'),
  })
}

export function useCalendar(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.calendar(from, to),
    queryFn:  () => postsApi.calendar(from, to),
    enabled:  !!(from && to),
    staleTime: 60 * 1000,
  })
}

//  Platform account hooks 

export function usePlatformAccounts() {
  return useQuery({
    queryKey: queryKeys.platformAccounts,
    queryFn:  platformAccountsApi.list,
    staleTime: 5 * 60 * 1000,
  })
}

export function useDisconnectPlatform() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => platformAccountsApi.disconnect(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.platformAccounts })
      toast.success('Platform disconnected.')
    },
    onError: () => toast.error('Failed to disconnect platform.'),
  })
}

export function useTogglePlatform() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => platformAccountsApi.toggle(id),
    onSuccess: (account) => {
      qc.invalidateQueries({ queryKey: queryKeys.platformAccounts })
      toast.success(account.is_active ? 'Account enabled.' : 'Account disabled.')
    },
  })
}

//  Gallery hooks 

export const galleryKeys = {
  browse: (folderId?: number) => ['gallery', 'browse', folderId ?? 'root'] as const,
  trash:  ['gallery', 'trash'] as const,
}

export function useGalleryBrowse(folderId?: number) {
  return useQuery({
    queryKey: galleryKeys.browse(folderId),
    queryFn:  () => galleryApi.browse(folderId),
    staleTime: 30 * 1000,
  })
}

export function useGalleryUpload() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ files, folderId }: { files: File[]; folderId?: number }) =>
      galleryApi.upload(files, folderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery'] })
      toast.success('Uploaded successfully.')
    },
    onError: () => toast.error('Upload failed. Please try again.'),
  })
}

export function useCreateFolder() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ name, folderId }: { name: string; folderId?: number }) =>
      galleryApi.createFolder(name, folderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery'] })
    },
    onError: () => toast.error('Could not create folder.'),
  })
}

export function useDeleteGalleryItem() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => galleryApi.deleteItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['gallery'] })
      toast.success('Moved to trash.')
    },
    onError: () => toast.error('Could not delete item.'),
  })
}

// Analytics hooks

export function useAnalyticsOverview(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.analyticsOverview(from, to),
    queryFn:  () => analyticsApi.overview({ from, to }),
    enabled:  !!(from && to),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAnalyticsTimeSeries(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.analyticsTimeSeries(from, to),
    queryFn:  () => analyticsApi.timeSeries({ from, to }),
    enabled:  !!(from && to),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAnalyticsBestTimes() {
  return useQuery({
    queryKey: queryKeys.analyticsBestTimes,
    queryFn:  analyticsApi.bestTimes,
    staleTime: 30 * 60 * 1000,
  })
}

// Blog metadata hook (categories + tags)

export function useBlogMeta(enabled: boolean) {
  return useQuery({
    queryKey: ['blog', 'meta'],
    queryFn:  blogMetaApi.getMeta,
    enabled,
    staleTime: 10 * 60 * 1000,
  })
}

// SEO hooks

export function useSeoGuidelines(contentType?: string) {
  return useQuery({
    queryKey: ['seo', 'guidelines', contentType ?? 'all'],
    queryFn:  () => seoApi.guidelines(contentType),
    staleTime: 60 * 60 * 1000, // 1 hour — static content
  })
}

// Analytics insights

export function useAnalyticsInsights() {
  return useQuery({
    queryKey: queryKeys.analyticsInsights,
    queryFn:  analyticsInsightsApi.insights,
    staleTime: 10 * 60 * 1000,
  })
}

// Post Ideas hooks

export function usePostIdeas(params?: Parameters<typeof postIdeasApi.list>[0]) {
  return useQuery({
    queryKey: queryKeys.postIdeas(params),
    queryFn:  () => postIdeasApi.list(params),
    staleTime: 30 * 1000,
  })
}

export function usePostIdea(id: number) {
  return useQuery({
    queryKey: queryKeys.postIdea(id),
    queryFn:  () => postIdeasApi.get(id),
    enabled:  !!id,
  })
}

export function useCreatePostIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: StorePostIdeaPayload) => postIdeasApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post-ideas'] })
      toast.success('Idea saved.')
    },
    onError: () => toast.error('Failed to save idea.'),
  })
}

export function useUpdatePostIdea(id: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Partial<StorePostIdeaPayload> & { status?: string }) =>
      postIdeasApi.update(id, payload),
    onSuccess: (idea) => {
      qc.invalidateQueries({ queryKey: ['post-ideas'] })
      qc.setQueryData(queryKeys.postIdea(id), idea)
      toast.success('Idea updated.')
    },
    onError: () => toast.error('Failed to update idea.'),
  })
}

export function useDeletePostIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => postIdeasApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['post-ideas'] })
      toast.success('Idea deleted.')
    },
    onError: () => toast.error('Failed to delete idea.'),
  })
}

export function useConvertPostIdea() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => postIdeasApi.convert(id),
    onSuccess: ({ post }) => {
      qc.invalidateQueries({ queryKey: ['post-ideas'] })
      qc.invalidateQueries({ queryKey: ['posts'] })
      toast.success(`Draft post created: "${post.title}"`)
    },
    onError: () => toast.error('Failed to convert idea to post.'),
  })
}
