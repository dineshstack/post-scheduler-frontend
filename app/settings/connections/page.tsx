'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import {
  CheckCircle2, ExternalLink, Info, Link2Off, Power, RefreshCw
} from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Button, Card, CardContent, CardHeader, CardTitle, ConfirmModal, Input, Modal, StatusBadge } from '@/components/ui'
import { usePlatformAccounts, useDisconnectPlatform, useTogglePlatform } from '@/lib/hooks'
import { platformAccountsApi } from '@/lib/api'
import type { Platform, PlatformAccount } from '@/lib/types'

//  Platform metadata 

const OAUTH_PLATFORMS: { platform: Platform; label: string; icon: string; description: string }[] = [
  { platform: 'twitter',   label: 'Twitter / X',  icon: '',  description: 'Post tweets and threads' },
  { platform: 'linkedin',  label: 'LinkedIn',      icon: '💼', description: 'Share posts and articles' },
  { platform: 'facebook',  label: 'Facebook',      icon: '📘', description: 'Publish to your page' },
  { platform: 'tiktok',    label: 'TikTok',        icon: '🎵', description: 'Publish video content' },
]

//  OAuth platform card 

function OAuthPlatformCard({ platform, label, icon, description, account }: {
  platform: Platform; label: string; icon: string; description: string
  account?: PlatformAccount
}) {
  const [disconnectTarget, setDisconnectTarget] = useState<PlatformAccount | null>(null)
  const { mutate: disconnect, isPending: disconnecting } = useDisconnectPlatform()
  const { mutate: toggle,     isPending: toggling }      = useTogglePlatform()

  const connect = () => {
    window.location.href = platformAccountsApi.getOAuthRedirectUrl(platform)
  }

  return (
    <>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl leading-none">{icon}</span>
          <div>
            <p className="text-sm font-medium text-[var(--text-base)]">{label}</p>
            {account ? (
              <p className="text-xs text-[var(--text-muted)]">
                @{account.account_name}
                {account.token_expires_at && (
                  <span className="ml-2 text-[var(--text-faint)]">
                    · expires {new Date(account.token_expires_at).toLocaleDateString()}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs text-[var(--text-faint)]">{description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {account ? (
            <>
              <Button
                variant="ghost" size="icon"
                onClick={() => toggle(account.id)}
                loading={toggling}
                title={account.is_active ? 'Disable' : 'Enable'}
              >
                <Power className={`h-3.5 w-3.5 ${account.is_active ? 'text-emerald-500' : 'text-[var(--text-faint)]'}`} />
              </Button>
              <Button
                variant="ghost" size="icon"
                onClick={() => setDisconnectTarget(account)}
                className="text-[var(--text-faint)] hover:text-red-500"
                title="Disconnect"
              >
                <Link2Off className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={connect}>
              <ExternalLink className="h-3.5 w-3.5" /> Connect
            </Button>
          )}
        </div>
      </div>

      <ConfirmModal
        open={!!disconnectTarget}
        onClose={() => setDisconnectTarget(null)}
        onConfirm={() => disconnect(disconnectTarget!.id, { onSuccess: () => setDisconnectTarget(null) })}
        title={`Disconnect ${label}`}
        description="Scheduled posts to this platform will fail. You can reconnect at any time."
        confirmLabel="Disconnect"
        danger
        loading={disconnecting}
      />
    </>
  )
}

//  Blog connect modal 

function BlogConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleConnect = async () => {
    if (!email || !password) return
    setLoading(true)
    try {
      await platformAccountsApi.connectBlog(email, password)
      toast.success('Blog connected successfully.')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid blog credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Connect DineshStack Blog" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">
          Enter your blog admin credentials. Your token will be stored securely and used to publish posts automatically.
        </p>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@dineshstack.com"
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder=""
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={handleConnect} loading={loading}>Connect</Button>
        </div>
      </div>
    </Modal>
  )
}

//  Dev.to connect modal

function DevToConnectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [apiKey,  setApiKey]  = useState('')
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!apiKey) return
    setLoading(true)
    try {
      await platformAccountsApi.connectDevTo(apiKey)
      toast.success('dev.to connected successfully.')
      setApiKey('')
      onClose()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid dev.to API key.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Connect dev.to" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)]">
          dev.to uses a personal API key instead of OAuth. Generate one under{' '}
          <a
            href="https://dev.to/settings/extensions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent)] hover:underline"
          >
            Settings → Extensions → DEV Community API Keys
          </a>
          , then paste it below.
        </p>
        <Input
          label="API key"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Paste your dev.to API key"
        />
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={handleConnect} loading={loading}>Connect</Button>
        </div>
      </div>
    </Modal>
  )
}

//  Page

function ConnectionsContent() {
  const searchParams = useSearchParams()
  const { data: accounts, isLoading, refetch } = usePlatformAccounts()
  const [blogModalOpen, setBlogModalOpen]   = useState(false)
  const [devtoModalOpen, setDevToModalOpen] = useState(false)

  // Handle OAuth callback query params (?success=twitter or ?error=...)
  useEffect(() => {
    const success = searchParams.get('success')
    const error   = searchParams.get('error')
    const p       = searchParams.get('platform')

    if (success) {
      toast.success(`${success.charAt(0).toUpperCase() + success.slice(1)} connected successfully!`)
      refetch()
    }
    if (error === 'session_expired') toast.error('Session expired. Please try again.')
    if (error === 'oauth_failed')    toast.error(`Failed to connect ${p ?? 'platform'}. Please try again.`)
  }, [searchParams, refetch])

  const getAccount = (platform: Platform) =>
    accounts?.find((a) => a.platform === platform)

  const blogAccount  = accounts?.find((a) => a.platform === 'blog')
  const devtoAccount = accounts?.find((a) => a.platform === 'devto')

  return (
    <div className="max-w-2xl space-y-5">

      {/* OAuth platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Social Platforms</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        {isLoading ? (
          <div className="py-8 text-center text-sm text-[var(--text-muted)]">Loading</div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {OAUTH_PLATFORMS.map(({ platform, label, icon, description }) => (
              <OAuthPlatformCard
                key={platform}
                platform={platform}
                label={label}
                icon={icon}
                description={description}
                account={getAccount(platform)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Blog platform */}
      <Card>
        <CardHeader>
          <CardTitle>Blog (DineshStack)</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">📝</span>
            <div>
              <p className="text-sm font-medium text-[var(--text-base)]">DineshStack Blog</p>
              {blogAccount ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <p className="text-xs text-[var(--text-muted)]">Connected as {blogAccount.account_name}</p>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-faint)]">Auto-publish to your Laravel blog</p>
              )}
            </div>
          </div>
          {blogAccount ? (
            <Button variant="secondary" size="sm" onClick={() => setBlogModalOpen(true)}>
              Reconnect
            </Button>
          ) : (
            <Button size="sm" onClick={() => setBlogModalOpen(true)}>
              <ExternalLink className="h-3.5 w-3.5" /> Connect
            </Button>
          )}
        </div>
      </Card>

      {/* Dev.to */}
      <Card>
        <CardHeader>
          <CardTitle>Dev.to</CardTitle>
        </CardHeader>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl leading-none">👩‍💻</span>
            <div>
              <p className="text-sm font-medium text-[var(--text-base)]">dev.to</p>
              {devtoAccount ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <p className="text-xs text-[var(--text-muted)]">Connected as @{devtoAccount.account_name}</p>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-faint)]">Cross-post articles with an AI teaser and a canonical link back to your blog</p>
              )}
            </div>
          </div>
          {devtoAccount ? (
            <Button variant="secondary" size="sm" onClick={() => setDevToModalOpen(true)}>
              Reconnect
            </Button>
          ) : (
            <Button size="sm" onClick={() => setDevToModalOpen(true)}>
              <ExternalLink className="h-3.5 w-3.5" /> Connect
            </Button>
          )}
        </div>
      </Card>

      {/* Medium — write API discontinued; explain rather than offer a broken connect flow */}
      <Card>
        <CardHeader>
          <CardTitle>Medium</CardTitle>
        </CardHeader>
        <div className="flex items-start gap-3 p-4">
          <span className="text-2xl leading-none">✍️</span>
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--text-base)]">Medium</p>
            <p className="text-xs text-[var(--text-faint)] mt-0.5 flex items-start gap-1.5">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Medium retired its publishing API, so auto-connect isn't possible here. Use Medium's own{' '}
              <a
                href="https://medium.com/p/import"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:underline"
              >
                Import a story
              </a>{' '}
              tool instead — pasting your blog URL there sets the canonical link for you automatically.
            </p>
          </div>
        </div>
      </Card>

      <BlogConnectModal
        open={blogModalOpen}
        onClose={() => { setBlogModalOpen(false); refetch() }}
      />
      <DevToConnectModal
        open={devtoModalOpen}
        onClose={() => { setDevToModalOpen(false); refetch() }}
      />
    </div>
  )
}

export default function ConnectionsPage() {
  return (
    <AppLayout title="Connections">
      <Suspense>
        <ConnectionsContent />
      </Suspense>
    </AppLayout>
  )
}
