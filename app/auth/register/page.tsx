'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Loader2, UserPlus } from 'lucide-react'
import { useAuthStore } from '@/lib/stores/auth.store'

const registerSchema = z
  .object({
    name:                  z.string().min(2, 'Name must be at least 2 characters'),
    email:                 z.string().email('Enter a valid email address'),
    password:              z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
    timezone:              z.string().optional(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type RegisterFormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const { register: registerUser, isLoading } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  })

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data)
      toast.success('Account created! Welcome to Post Scheduler.')
      router.push('/dashboard')
    } catch (err: unknown) {
      const apiErrors = (err as { response?: { data?: { errors?: Record<string, string[]> } } })
        ?.response?.data?.errors

      if (apiErrors) {
        const firstError = Object.values(apiErrors).flat()[0]
        toast.error(firstError)
      } else {
        toast.error('Registration failed. Please try again.')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--surface-bg)]">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[var(--accent)] mb-4 shadow-lg">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-base)]">Create account</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Set up your Post Scheduler</p>
        </div>

        <div className="bg-[var(--surface-card)] border border-[var(--line)] rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-[var(--text-base)] mb-1.5">Full name</label>
              <input
                {...register('name')}
                type="text"
                autoComplete="name"
                placeholder="Dinesh Wijethunga"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] text-[var(--text-base)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-base)] mb-1.5">Email address</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="dinesh@dineshstack.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] text-[var(--text-base)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-base)] mb-1.5">Password</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] text-[var(--text-base)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-base)] mb-1.5">Confirm password</label>
              <input
                {...register('password_confirmation')}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] text-[var(--text-base)] placeholder:text-[var(--text-faint)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
              />
              {errors.password_confirmation && (
                <p className="mt-1 text-xs text-red-500">{errors.password_confirmation.message}</p>
              )}
            </div>

            {/* Hidden timezone — auto-detected from browser */}
            <input type="hidden" {...register('timezone')} />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-semibold transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-[var(--text-muted)] mt-4">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-[var(--accent)] hover:text-[var(--accent-hover)] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
