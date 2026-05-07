'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Copy, Check } from 'lucide-react'
import { toast } from 'sonner'
import { analyticsApi } from '@/lib/api'
import { Button, Modal, Select, Textarea } from '@/components/ui'
import type { Platform } from '@/lib/types'
import { analyticsApi as _unused } from '@/lib/api'
import { aiApi } from '@/lib/api'

const PLATFORMS = [
  { value: 'twitter',   label: 'Twitter / X' },
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'facebook',  label: 'Facebook' },
  { value: 'tiktok',    label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'blog',      label: 'Blog' },
]

const TONES = [
  { value: 'professional',   label: 'Professional' },
  { value: 'casual',         label: 'Casual' },
  { value: 'witty',          label: 'Witty' },
  { value: 'motivational',   label: 'Motivational' },
  { value: 'educational',    label: 'Educational' },
  { value: 'conversational', label: 'Conversational' },
]

interface Props {
  open:            boolean
  onClose:         () => void
  onInsert:        (caption: string, hashtags: string[]) => void
  defaultPlatform?: Platform
}

export default function CaptionGenerator({ open, onClose, onInsert, defaultPlatform }: Props) {
  const [topic,    setTopic]    = useState('')
  const [platform, setPlatform] = useState<string>(defaultPlatform ?? 'twitter')
  const [tone,     setTone]     = useState('casual')
  const [result,   setResult]   = useState<{ caption: string; hashtags: string[] } | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [copied,   setCopied]   = useState(false)

  const generate = async () => {
    if (!topic.trim()) { toast.error('Enter a topic first.'); return }
    setLoading(true)
    setResult(null)
    try {
      const data = await aiApi.generateCaption({ topic, platform, tone })
      setResult(data)
    } catch {
      toast.error('Generation failed. Check ANTHROPIC_API_KEY is configured.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return
    const text = result.hashtags.length
      ? `${result.caption}\n\n${result.hashtags.join(' ')}`
      : result.caption
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleInsert = () => {
    if (!result) return
    onInsert(result.caption, result.hashtags)
    onClose()
  }

  const handleClose = () => {
    setResult(null)
    setTopic('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="AI Caption Generator" size="md">
      <div className="space-y-4">

        {/* Topic */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
            Topic or prompt
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Launching our new product feature, tips for remote work productivity..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] text-sm text-[var(--text-base)] placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
          />
        </div>

        {/* Platform + Tone row */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Platform"
            options={PLATFORMS}
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          />
          <Select
            label="Tone"
            options={TONES}
            value={tone}
            onChange={(e) => setTone(e.target.value)}
          />
        </div>

        {/* Generate button */}
        <Button
          onClick={generate}
          disabled={loading || !topic.trim()}
          className="w-full"
        >
          {loading
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating…</>
            : <><Sparkles className="h-4 w-4" /> Generate caption</>}
        </Button>

        {/* Result */}
        {result && (
          <div className="rounded-xl border border-[var(--line)] bg-[var(--surface-subtle)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--line)] flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--text-muted)]">Generated caption</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs text-[var(--text-faint)] hover:text-[var(--accent)] transition-colors"
              >
                {copied
                  ? <><Check className="h-3 w-3" /> Copied</>
                  : <><Copy className="h-3 w-3" /> Copy</>}
              </button>
            </div>
            <div className="px-4 py-3">
              <p className="text-sm text-[var(--text-base)] whitespace-pre-wrap leading-relaxed">
                {result.caption}
              </p>
              {result.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {result.hashtags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-subtle)] text-[var(--accent-text)]"
                    >
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="px-4 py-3 border-t border-[var(--line)] flex gap-2">
              <Button size="sm" onClick={handleInsert} className="flex-1">
                Use this caption
              </Button>
              <Button size="sm" variant="ghost" onClick={generate} disabled={loading}>
                Regenerate
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
