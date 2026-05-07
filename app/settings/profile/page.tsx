'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import AppLayout from '@/components/layout/AppLayout'
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui'
import { useMe } from '@/lib/hooks'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/stores/auth.store'

//  Timezones (common subset) 

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Amsterdam',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
]

//  Schemas 

const profileSchema = z.object({
  name:     z.string().min(2, 'Name must be at least 2 characters'),
  timezone: z.string().min(1, 'Timezone is required'),
})

const passwordSchema = z
  .object({
    current_password:       z.string().min(1, 'Current password is required'),
    password:               z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation:  z.string(),
  })
  .refine((v) => v.password === v.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  })

type ProfileValues  = z.infer<typeof profileSchema>
type PasswordValues = z.infer<typeof passwordSchema>

//  Page 

export default function ProfilePage() {
  const { data: user, isLoading } = useMe()
  const { setUser } = useAuthStore()
  const qc = useQueryClient()

  //  Profile form 

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: '', timezone: 'UTC' },
  })

  useEffect(() => {
    if (user) resetProfile({ name: user.name, timezone: user.timezone ?? 'UTC' })
  }, [user, resetProfile])

  const { mutate: saveProfile, isPending: savingProfile } = useMutation({
    mutationFn: (payload: ProfileValues) => authApi.updateProfile(payload),
    onSuccess: (updated) => {
      setUser(updated)
      qc.setQueryData(['me'], updated)
      toast.success('Profile updated.')
    },
    onError: () => toast.error('Failed to update profile.'),
  })

  //  Password form 

  const {
    register: regPwd,
    handleSubmit: handlePwd,
    reset: resetPwd,
    formState: { errors: pwdErrors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { current_password: '', password: '', password_confirmation: '' },
  })

  const { mutate: changePassword, isPending: changingPwd } = useMutation({
    mutationFn: (payload: PasswordValues) => authApi.changePassword(payload),
    onSuccess: () => {
      toast.success('Password changed.')
      resetPwd()
    },
    onError: () => toast.error('Current password is incorrect.'),
  })

  if (isLoading) {
    return (
      <AppLayout title="Profile">
        <div className="py-16 text-center text-sm text-[var(--text-muted)]">Loading</div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Profile">
      <div className="max-w-lg space-y-5">

        {/* Profile info */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleProfile((v) => saveProfile(v))}
              className="space-y-4"
            >
              {/* Avatar initial display */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold text-[var(--accent-text)]">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text-base)]">{user?.name}</p>
                  <p className="text-xs text-[var(--text-faint)]">{user?.email}</p>
                </div>
              </div>

              <Input
                label="Name"
                placeholder="Your name"
                error={profileErrors.name?.message}
                {...regProfile('name')}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[var(--text-base)]">Timezone</label>
                <select
                  className="h-9 w-full rounded-lg border border-[var(--line)] bg-[var(--surface-card)] px-3 text-sm text-[var(--text-base)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-colors appearance-none"
                  {...regProfile('timezone')}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
                {profileErrors.timezone && (
                  <p className="text-xs text-red-500">{profileErrors.timezone.message}</p>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" disabled={!profileDirty} loading={savingProfile}>
                  Save changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Change password */}
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handlePwd((v) => changePassword(v))}
              className="space-y-4"
            >
              <Input
                label="Current password"
                type="password"
                placeholder=""
                error={pwdErrors.current_password?.message}
                {...regPwd('current_password')}
              />
              <Input
                label="New password"
                type="password"
                placeholder=""
                hint="Minimum 8 characters"
                error={pwdErrors.password?.message}
                {...regPwd('password')}
              />
              <Input
                label="Confirm new password"
                type="password"
                placeholder=""
                error={pwdErrors.password_confirmation?.message}
                {...regPwd('password_confirmation')}
              />
              <div className="flex justify-end pt-1">
                <Button type="submit" size="sm" loading={changingPwd}>
                  Change password
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Danger zone */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-base)]">Member since</p>
                <p className="text-xs text-[var(--text-faint)]">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
