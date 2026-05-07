'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, LogIn } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth.store'
import { getAuthToken } from '@/lib/api'

const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormData = z.infer<typeof loginSchema>

function LoginForm() {
  const router       = useRouter()
  const params       = useSearchParams()
  const { login, isLoading } = useAuthStore()

  const redirectTo = params.get('redirect') ?? '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  useEffect(() => {
    if (getAuthToken()) router.replace('/dashboard')
  }, [router])

  useEffect(() => {
    if (params.get('expired')) {
      toast.error('Your session expired. Please sign in again.')
    }
  }, [params])

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data)
      toast.success('Welcome back!')
      router.push(redirectTo)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Invalid credentials. Please try again.'
      toast.error(message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-[var(--text-base)] mb-1.5">
          Email address
        </label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="dinesh@dineshstack.com"
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] text-[var(--text-base)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
        />
        {errors.email && (
          <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-[var(--text-base)]">Password</label>
        </div>
        <input
          {...register('password')}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] text-[var(--text-base)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
        />
        {errors.password && (
          <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
      >
        {isLoading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
        ) : (
          'Sign in'
        )}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--surface-bg)]">
      <div className="w-full max-w-sm">

        {/* Logo / brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--accent)] mb-4 shadow-lg">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-base)]">Post Scheduler</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Sign in to manage your scheduled posts</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl p-6 shadow-sm">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
