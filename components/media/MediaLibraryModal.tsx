'use client'

import { useRef, useState } from 'react'
import { ChevronRight, Folder, FolderPlus, Image, Loader2, Trash2, Upload, X } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useCreateFolder, useDeleteGalleryItem, useGalleryBrowse, useGalleryUpload } from '@/lib/hooks'
import type { GalleryFolder, GalleryItem, MediaLibrary } from '@/lib/types'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (items: GalleryItem[]) => void
  multiple?: boolean
}

function FolderTree({
  folders,
  active,
  onNavigate,
}: {
  folders: GalleryFolder[]
  active: number | undefined
  onNavigate: (id: number) => void
}) {
  if (!folders.length) return null
  return (
    <ul className="space-y-0.5">
      {folders.map((f) => (
        <li key={f.id}>
          <button
            onClick={() => onNavigate(f.id)}
            className={`flex w-full items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-colors text-left ${
              active === f.id
                ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] font-medium'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]'
            }`}
          >
            <Folder className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{f.name}</span>
            {f.children?.length ? <ChevronRight className="h-3 w-3 ml-auto" /> : null}
          </button>
          {f.children?.length ? (
            <div className="ml-3 border-l border-[var(--line)] pl-1">
              <FolderTree folders={f.children} active={active} onNavigate={onNavigate} />
            </div>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

export default function MediaLibraryModal({ open, onClose, onSelect, multiple = true }: Props) {
  const [folderId, setFolderId] = useState<number | undefined>(undefined)
  const [selected, setSelected] = useState<GalleryItem[]>([])
  const [newFolderName, setNewFolderName] = useState('')
  const [showNewFolder, setShowNewFolder] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useGalleryBrowse(folderId)
  const { mutate: upload, isPending: uploading } = useGalleryUpload()
  const { mutate: createFolder, isPending: creatingFolder } = useCreateFolder()
  const { mutate: deleteItem } = useDeleteGalleryItem()

  const library = folderId === undefined ? (data as MediaLibrary) : null
  const folder  = folderId !== undefined ? (data as GalleryFolder) : null
  const folders = library?.folders ?? folder?.children ?? []
  const items   = library?.galleries ?? folder?.galleries ?? []

  const toggleSelect = (item: GalleryItem) => {
    if (multiple) {
      setSelected((prev) =>
        prev.find((i) => i.id === item.id) ? prev.filter((i) => i.id !== item.id) : [...prev, item]
      )
    } else {
      setSelected([item])
    }
  }

  const isSelected = (item: GalleryItem) => selected.some((i) => i.id === item.id)

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    upload({ files, folderId })
    e.target.value = ''
  }

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    createFolder(
      { name: newFolderName.trim(), folderId },
      { onSuccess: () => { setNewFolderName(''); setShowNewFolder(false) } }
    )
  }

  const handleConfirm = () => {
    onSelect(selected)
    setSelected([])
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Media Library" size="lg">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 h-[70vh] sm:h-[420px]">
        {/* Sidebar — folder tree (stacks above the grid on narrow screens) */}
        <div className="max-h-28 sm:max-h-none sm:w-44 shrink-0 overflow-y-auto border-b sm:border-b-0 sm:border-r border-[var(--line)] pb-3 sm:pb-0 sm:pr-3">
          <button
            onClick={() => setFolderId(undefined)}
            className={`flex w-full items-center gap-1.5 px-2 py-1.5 rounded text-xs mb-2 transition-colors ${
              folderId === undefined
                ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] font-medium'
                : 'text-[var(--text-muted)] hover:bg-[var(--surface-subtle)]'
            }`}
          >
            <Image className="h-3.5 w-3.5 shrink-0" /> All Media
          </button>
          {isLoading && !data ? null : (
            <FolderTree
              folders={(data as MediaLibrary)?.folders ?? []}
              active={folderId}
              onNavigate={setFolderId}
            />
          )}
        </div>

        {/* Main area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Button
              variant="secondary" size="sm"
              onClick={() => fileRef.current?.click()}
              loading={uploading}
            >
              <Upload className="h-3.5 w-3.5" /> Upload
            </Button>
            <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />

            <Button variant="ghost" size="sm" onClick={() => setShowNewFolder((v) => !v)}>
              <FolderPlus className="h-3.5 w-3.5" />
            </Button>

            {showNewFolder && (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  className="h-7 px-2 text-xs border border-[var(--line)] rounded bg-[var(--surface-bg)] text-[var(--text-base)] focus:outline-none focus:border-[var(--accent)] w-32"
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCreateFolder() }}
                />
                <Button size="sm" onClick={handleCreateFolder} loading={creatingFolder}>
                  Create
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowNewFolder(false)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {selected.length > 0 && (
              <span className="ml-auto text-xs text-[var(--text-muted)]">
                {selected.length} selected
              </span>
            )}
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
              </div>
            ) : !items.length && !folders.length ? (
              <div className="flex flex-col items-center justify-center h-full gap-2">
                <Image className="h-8 w-8 text-[var(--text-faint)]" />
                <p className="text-sm text-[var(--text-muted)]">No media yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFolderId(f.id)}
                    className="aspect-square rounded-lg border border-[var(--line)] bg-[var(--surface-subtle)] flex flex-col items-center justify-center gap-1 hover:border-[var(--accent)] transition-colors p-2"
                  >
                    <Folder className="h-6 w-6 text-[var(--accent)]" />
                    <span className="text-[10px] text-[var(--text-muted)] truncate w-full text-center">{f.name}</span>
                  </button>
                ))}
                {items.map((item) => (
                  <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden border-2 transition-colors cursor-pointer"
                    style={{ borderColor: isSelected(item) ? 'var(--accent)' : 'var(--line)' }}
                    onClick={() => toggleSelect(item)}
                  >
                    <img
                      src={item.full_url}
                      alt={item.alt ?? item.name ?? ''}
                      className="w-full h-full object-cover"
                    />
                    {isSelected(item) && (
                      <div className="absolute inset-0 bg-[var(--accent)]/20 flex items-center justify-center">
                        <div className="h-5 w-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                          <span className="text-white text-[10px] font-bold">✓</span>
                        </div>
                      </div>
                    )}
                    <button
                      className="absolute top-1 right-1 h-5 w-5 rounded bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => { e.stopPropagation(); deleteItem(item.id) }}
                    >
                      <Trash2 className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--line)] mt-3">
            <Button variant="secondary" size="sm" onClick={onClose}>Cancel</Button>
            <Button size="sm" disabled={!selected.length} onClick={handleConfirm}>
              Insert {selected.length > 0 ? `(${selected.length})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
