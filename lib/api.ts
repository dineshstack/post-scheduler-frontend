import axios, { AxiosError, type AxiosInstance } from 'axios'
import Cookies from 'js-cookie'
import type {
  AnalyticsOverview,
  AnalyticsTimeSeries,
  BestTimesResponse,
  BlogMetaResponse,
  AuthResponse,
  CalendarPostsResponse,
  GalleryFolder,
  GalleryItem,
  LoginPayload,
  MediaLibrary,
  Paginated,
  PlatformAccount,
  Post,
  RegisterPayload,
  StorePostPayload,
  TrashContents,
  User,
} from '@/lib/types'

const http: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + '/api/v1',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // withCredentials: true,
})

http.interceptors.request.use((config) => {
  const token = Cookies.get('scheduler_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      Cookies.remove('scheduler_token')
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/login?expired=true'
      }
    }
    return Promise.reject(error)
  }
)

export const setAuthToken = (token: string) => {
  Cookies.set('scheduler_token', token, {
    expires: 30,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
  })
}

export const clearAuthToken = () => {
  Cookies.remove('scheduler_token')
}

export const getAuthToken = (): string | undefined => {
  return Cookies.get('scheduler_token')
}

// Auth

export const authApi = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await http.post<AuthResponse>('/auth/register', payload)
    return data
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await http.post<AuthResponse>('/auth/login', payload)
    return data
  },

  logout: async (): Promise<void> => {
    await http.post('/auth/logout')
  },

  me: async (): Promise<User> => {
    const { data } = await http.get<{ user: User }>('/auth/me')
    return data.user
  },

  updateProfile: async (payload: Partial<Pick<User, 'name' | 'timezone' | 'avatar'>>): Promise<User> => {
    const { data } = await http.put<{ user: User }>('/auth/me', payload)
    return data.user
  },

  changePassword: async (payload: {
    current_password: string
    password: string
    password_confirmation: string
  }): Promise<void> => {
    await http.put('/auth/me/password', payload)
  },
}

// Posts

export const postsApi = {
  list: async (params?: {
    status?: string
    platform?: string
    from?: string
    to?: string
    page?: number
    per_page?: number
  }): Promise<Paginated<Post>> => {
    const { data } = await http.get<Paginated<Post>>('/posts', { params })
    return data
  },

  get: async (id: number): Promise<Post> => {
    const { data } = await http.get<Post>(`/posts/${id}`)
    return data
  },

  create: async (payload: StorePostPayload): Promise<Post> => {
    const { data } = await http.post<{ post: Post }>('/posts', payload)
    return data.post
  },

  update: async (id: number, payload: Partial<StorePostPayload>): Promise<Post> => {
    const { data } = await http.put<{ post: Post }>(`/posts/${id}`, payload)
    return data.post
  },

  delete: async (id: number): Promise<void> => {
    await http.delete(`/posts/${id}`)
  },

  publishNow: async (id: number): Promise<Post> => {
    const { data } = await http.post<{ post: Post }>(`/posts/${id}/publish-now`)
    return data.post
  },

  calendar: async (from: string, to: string): Promise<CalendarPostsResponse> => {
    const { data } = await http.get<CalendarPostsResponse>('/calendar', {
      params: { from, to },
    })
    return data
  },
}

// Platform Accounts

export const platformAccountsApi = {
  list: async (): Promise<PlatformAccount[]> => {
    const { data } = await http.get<PlatformAccount[]>('/platform-accounts')
    return data
  },

  disconnect: async (id: number): Promise<void> => {
    await http.delete(`/platform-accounts/${id}`)
  },

  toggle: async (id: number): Promise<PlatformAccount> => {
    const { data } = await http.put<{ account: PlatformAccount }>(
      `/platform-accounts/${id}/toggle`
    )
    return data.account
  },

  getOAuthRedirectUrl: (platform: string): string => {
    return `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/${platform}/redirect`
  },

  connectBlog: async (email: string, password: string): Promise<PlatformAccount> => {
    const { data } = await http.post<{ account: PlatformAccount }>('/auth/blog/connect', {
      email,
      password,
    })
    return data.account
  },
}

// Gallery / Media Library

export const galleryApi = {
  browse: async (folderId?: number): Promise<MediaLibrary | GalleryFolder> => {
    const url = folderId ? `/media/${folderId}` : '/media'
    const { data } = await http.get(url)
    return data
  },

  upload: async (files: File[], folderId?: number): Promise<{ count: number; items: GalleryItem[] }> => {
    const form = new FormData()
    files.forEach((f) => form.append('images[]', f))
    if (folderId) form.append('folder_id', String(folderId))
    const { data } = await http.post('/gallery', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  updateItem: async (id: number, payload: { name?: string; alt?: string }): Promise<GalleryItem> => {
    const { data } = await http.post<{ item: GalleryItem }>(`/gallery/${id}`, payload)
    return data.item
  },

  deleteItem: async (id: number): Promise<void> => {
    await http.delete(`/gallery/${id}`)
  },

  createFolder: async (name: string, folderId?: number): Promise<GalleryFolder> => {
    const { data } = await http.post<{ folder: GalleryFolder }>('/folders', {
      name,
      folder_id: folderId ?? null,
    })
    return data.folder
  },

  deleteFolder: async (id: number): Promise<void> => {
    await http.delete(`/folders/${id}`)
  },

  trash: async (): Promise<TrashContents> => {
    const { data } = await http.get<TrashContents>('/gallery/trash')
    return data
  },

  restore: async (folderIds: number[], galleryIds: number[]): Promise<void> => {
    await http.post('/gallery/trash/restore', { folder_ids: folderIds, gallery_ids: galleryIds })
  },

  forceDelete: async (folderIds: number[], galleryIds: number[]): Promise<void> => {
    await http.delete('/gallery/trash/force', {
      data: { folder_ids: folderIds, gallery_ids: galleryIds },
    })
  },
}

// Analytics

export const analyticsApi = {
  overview: async (params?: { from?: string; to?: string }): Promise<AnalyticsOverview> => {
    const { data } = await http.get<AnalyticsOverview>('/analytics/overview', { params })
    return data
  },

  timeSeries: async (params?: { from?: string; to?: string }): Promise<AnalyticsTimeSeries> => {
    const { data } = await http.get<AnalyticsTimeSeries>('/analytics/time-series', { params })
    return data
  },

  bestTimes: async (): Promise<BestTimesResponse> => {
    const { data } = await http.get<BestTimesResponse>('/analytics/best-times')
    return data
  },
}

// Blog metadata proxy

export const blogMetaApi = {
  getMeta: async (): Promise<BlogMetaResponse> => {
    const { data } = await http.get<BlogMetaResponse>('/blog/meta')
    return data
  },
}

// AI

export const aiApi = {
  generateCaption: async (payload: {
    topic: string
    platform: string
    tone: string
    existing_content?: string
  }): Promise<{ caption: string; hashtags: string[] }> => {
    const { data } = await http.post<{ caption: string; hashtags: string[] }>('/ai/caption', payload)
    return data
  },
}

export default http
