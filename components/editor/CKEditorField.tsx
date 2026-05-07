'use client'

import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Essentials, Autoformat,
  Bold, Italic, Underline, Strikethrough,
  BlockQuote, Code, CodeBlock,
  Heading,
  Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, ImageResize,
  Indent, IndentBlock,
  Link, List,
  MediaEmbed, Paragraph, PasteFromOffice,
  Table, TableToolbar,
  TextTransformation,
  FileRepository,
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'
import Cookies from 'js-cookie'

interface Props {
  value:    string
  onChange: (value: string) => void
  minHeight?: number
}

//  Image upload adapter  sends to our gallery API 

class GalleryUploadAdapter {
  private loader: { file: Promise<File> }

  constructor(loader: { file: Promise<File> }) {
    this.loader = loader
  }

  async upload() {
    const file  = await this.loader.file
    const token = Cookies.get('scheduler_token')
    const form  = new FormData()
    form.append('images[]', file)

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/gallery`,
      {
        method:  'POST',
        headers: { Authorization: `Bearer ${token ?? ''}`, Accept: 'application/json' },
        body:    form,
      }
    )
    if (!res.ok) throw new Error('Image upload failed')
    const { items } = await res.json() as { count: number; items: Array<{ full_url: string }> }
    return { default: items[0].full_url }
  }

  abort() {}
}

function GalleryUploadPlugin(editor: Parameters<typeof ClassicEditor.create>[1] extends { plugins?: Array<infer P> } ? P : never) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(editor as any).plugins.get('FileRepository').createUploadAdapter = (loader: { file: Promise<File> }) =>
    new GalleryUploadAdapter(loader)
}

//  Component 

export default function CKEditorField({ value, onChange, minHeight = 420 }: Props) {
  return (
    <div className="ck-editor-wrapper">
      <style>{`
        .ck-editor-wrapper .ck.ck-editor__editable {
          min-height: ${minHeight}px !important;
          background-color: var(--surface-card) !important;
          color: var(--text-base) !important;
          border: 1px solid var(--line) !important;
          border-top: none !important;
          border-radius: 0 0 0.75rem 0.75rem !important;
          padding: 1.25rem 1.5rem !important;
          font-size: 0.9375rem;
          line-height: 1.75;
        }
        .ck-editor-wrapper .ck.ck-editor__editable:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 25%, transparent) !important;
        }
        .ck-editor-wrapper .ck.ck-toolbar {
          background-color: var(--surface-subtle) !important;
          border: 1px solid var(--line) !important;
          border-radius: 0.75rem 0.75rem 0 0 !important;
          padding: 0.25rem !important;
        }
        .ck-editor-wrapper .ck.ck-toolbar .ck-button {
          border-radius: 0.375rem !important;
          color: var(--text-muted) !important;
        }
        .ck-editor-wrapper .ck.ck-toolbar .ck-button:hover,
        .ck-editor-wrapper .ck.ck-toolbar .ck-button.ck-on {
          background-color: var(--surface-overlay) !important;
          color: var(--text-base) !important;
        }
        .ck-editor-wrapper .ck.ck-dropdown__panel {
          background: var(--surface-card) !important;
          border-color: var(--line) !important;
          border-radius: 0.5rem !important;
        }
        .ck-editor-wrapper .ck.ck-list__item .ck-button { color: var(--text-base) !important; }
        .ck-editor-wrapper .ck.ck-list__item .ck-button:hover { background: var(--surface-subtle) !important; }
        .ck-editor-wrapper .ck.ck-editor__editable pre {
          background: #0d1117 !important;
          border: 1px solid #2a3547 !important;
          border-radius: 0.5rem;
          padding: 0; margin: 1rem 0; overflow: hidden;
        }
        .ck-editor-wrapper .ck.ck-editor__editable pre code {
          display: block !important;
          padding: 1rem 1.25rem !important;
          color: #e6edf3 !important;
          font-family: monospace !important;
          font-size: 0.875em !important;
          line-height: 1.7 !important;
          white-space: pre !important;
        }
        .ck-editor-wrapper .ck.ck-editor__editable .ck-code-block-label {
          display: block !important;
          background: #161b22; color: #8b949e;
          font-size: 0.7rem; font-family: monospace;
          padding: 0.3rem 1rem;
          border-bottom: 1px solid #2a3547;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .ck-editor-wrapper .ck.ck-editor__editable code:not(pre code) {
          background: var(--accent-subtle) !important;
          color: var(--accent-text) !important;
          padding: 0.15em 0.4em;
          border-radius: 0.3rem;
          font-size: 0.875em; font-family: monospace;
        }
        .ck-editor-wrapper .ck.ck-editor__editable h2,
        .ck-editor-wrapper .ck.ck-editor__editable h3 { color: var(--text-base); }
        .ck-editor-wrapper .ck.ck-editor__editable a   { color: var(--accent); }
        .ck-editor-wrapper .ck.ck-balloon-panel {
          border-color: var(--line) !important;
          background: var(--surface-card) !important;
        }
      `}</style>

      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          licenseKey: 'GPL',
          plugins: [
            Essentials, Autoformat,
            Bold, Italic, Underline, Strikethrough,
            BlockQuote, Code, CodeBlock,
            Heading,
            Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, ImageResize,
            Indent, IndentBlock,
            Link, List,
            MediaEmbed, Paragraph, PasteFromOffice,
            Table, TableToolbar,
            TextTransformation,
            FileRepository,
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          extraPlugins: [GalleryUploadPlugin as any],
          toolbar: {
            items: [
              'undo', 'redo',
              '|', 'heading',
              '|', 'bold', 'italic', 'underline', 'strikethrough',
              '|', 'link', 'uploadImage', 'insertTable', 'blockQuote', 'mediaEmbed',
              '|', 'codeBlock', 'code',
              '|', 'bulletedList', 'numberedList', 'outdent', 'indent',
            ],
            shouldNotGroupWhenFull: true,
          },
          codeBlock: {
            languages: [
              { language: 'plaintext',   label: 'Plain text' },
              { language: 'php',         label: 'PHP' },
              { language: 'javascript',  label: 'JavaScript' },
              { language: 'typescript',  label: 'TypeScript' },
              { language: 'bash',        label: 'Bash / Shell' },
              { language: 'sql',         label: 'SQL' },
              { language: 'html',        label: 'HTML' },
              { language: 'css',         label: 'CSS' },
              { language: 'json',        label: 'JSON' },
              { language: 'yaml',        label: 'YAML' },
              { language: 'python',      label: 'Python' },
              { language: 'dockerfile',  label: 'Dockerfile' },
            ],
          },
          image: {
            toolbar: [
              'imageTextAlternative', 'toggleImageCaption',
              '|',
              'imageStyle:inline', 'imageStyle:block', 'imageStyle:side',
            ],
          },
          table: {
            contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
          },
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(_event: unknown, editor: any) => onChange(editor.getData())}
      />
    </div>
  )
}
