'use client'

import { CKEditor } from '@ckeditor/ckeditor5-react'
import {
  ClassicEditor,
  Essentials, Autoformat,
  Bold, Italic, Underline, Strikethrough,
  BlockQuote, Code, CodeBlock,
  Heading,
  Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, ImageResize, ImageInsertViaUrl,
  Indent, IndentBlock,
  Link, List,
  MediaEmbed, Paragraph, PasteFromOffice,
  Table, TableToolbar, TableCellProperties, TableProperties,
  TextTransformation,
  FileRepository,
  FontSize, FontColor, FontBackgroundColor, FontFamily,
  Alignment,
  FindAndReplace,
  RemoveFormat,
  SourceEditing,
  HtmlEmbed,
  GeneralHtmlSupport,
  HorizontalLine,
  Highlight,
  Fullscreen,
} from 'ckeditor5'
import 'ckeditor5/ckeditor5.css'
import Cookies from 'js-cookie'

interface Props {
  value:      string
  onChange:   (value: string) => void
  minHeight?: number
  disabled?:  boolean
}

// Upload adapter — sends to post-scheduler gallery API using Bearer token from cookie

class GalleryUploadAdapter {
  private loader: { file: Promise<File> }
  constructor(loader: { file: Promise<File> }) { this.loader = loader }

  async upload() {
    const file  = await this.loader.file
    const token = Cookies.get('scheduler_token')
    const form  = new FormData()
    form.append('images[]', file)

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gallery`,
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function GalleryUploadPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: { file: Promise<File> }) =>
    new GalleryUploadAdapter(loader)
}

export default function CKEditorField({ value, onChange, minHeight = 480, disabled = false }: Props) {
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
          flex-wrap: wrap !important;
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
        .ck-editor-wrapper .ck.ck-editor__editable h3,
        .ck-editor-wrapper .ck.ck-editor__editable h4,
        .ck-editor-wrapper .ck.ck-editor__editable h5,
        .ck-editor-wrapper .ck.ck-editor__editable h6 { color: var(--text-base); }
        .ck-editor-wrapper .ck.ck-editor__editable a { color: var(--accent); }
        .ck-editor-wrapper .ck.ck-editor__editable blockquote {
          border-left: 3px solid var(--accent);
          padding-left: 1rem;
          color: var(--text-muted);
        }
        .ck-editor-wrapper .ck.ck-editor__editable hr {
          border-color: var(--line);
          margin: 1.5rem 0;
        }
        .ck-editor-wrapper .ck.ck-balloon-panel {
          border-color: var(--line) !important;
          background: var(--surface-card) !important;
        }
        .ck-fullscreen__editor .ck.ck-editor__editable {
          border-radius: 0 !important;
          min-height: 100vh !important;
        }
        .ck-editor-wrapper .ck.ck-source-editing-area textarea {
          background: var(--surface-card) !important;
          color: var(--text-base) !important;
          border-color: var(--line) !important;
          font-family: monospace !important;
          font-size: 0.875rem !important;
          min-height: ${minHeight}px !important;
        }
      `}</style>

      <CKEditor
        editor={ClassicEditor}
        data={value}
        disabled={disabled}
        config={{
          licenseKey: 'GPL',
          plugins: [
            Essentials, Autoformat,
            Bold, Italic, Underline, Strikethrough,
            BlockQuote, Code, CodeBlock,
            Heading,
            Image, ImageCaption, ImageStyle, ImageToolbar, ImageUpload, ImageResize, ImageInsertViaUrl,
            Indent, IndentBlock,
            Link, List,
            MediaEmbed, Paragraph, PasteFromOffice,
            Table, TableToolbar, TableCellProperties, TableProperties,
            TextTransformation,
            FileRepository,
            FontSize, FontColor, FontBackgroundColor, FontFamily,
            Alignment,
            HorizontalLine,
            Highlight,
            RemoveFormat,
            FindAndReplace,
            SourceEditing,
            HtmlEmbed,
            GeneralHtmlSupport,
            Fullscreen,
          ],
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          extraPlugins: [GalleryUploadPlugin as any],

          toolbar: {
            items: [
              'fullscreen',
              '|',
              'undo', 'redo',
              '|',
              'heading',
              '|',
              'fontFamily', 'fontSize',
              '|',
              'bold', 'italic', 'underline', 'strikethrough',
              'fontColor', 'fontBackgroundColor', 'highlight',
              '|',
              'alignment',
              '|',
              'link', 'uploadImage', 'insertImageViaUrl',
              'insertTable', 'blockQuote', 'horizontalLine', 'mediaEmbed',
              '|',
              'bulletedList', 'numberedList', 'outdent', 'indent',
              '|',
              'codeBlock', 'code', 'htmlEmbed',
              '|',
              'findAndReplace', 'removeFormat', 'sourceEditing',
            ],
            shouldNotGroupWhenFull: true,
          },

          heading: {
            options: [
              { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
              { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
              { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
              { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
              { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
              { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' },
            ],
          },

          fontSize: {
            options: [10, 11, 12, 13, 'default', 15, 16, 18, 20, 24, 28, 32],
          },

          fontFamily: {
            options: [
              'default',
              'Arial, Helvetica, sans-serif',
              'Georgia, serif',
              '"Times New Roman", Times, serif',
              '"Courier New", Courier, monospace',
              'Verdana, Geneva, sans-serif',
            ],
            supportAllValues: false,
          },

          highlight: {
            options: [
              { model: 'yellowMarker', class: 'marker-yellow', title: 'Yellow marker', color: 'var(--ck-highlight-marker-yellow)', type: 'marker' },
              { model: 'greenMarker',  class: 'marker-green',  title: 'Green marker',  color: 'var(--ck-highlight-marker-green)',  type: 'marker' },
              { model: 'pinkMarker',   class: 'marker-pink',   title: 'Pink marker',   color: 'var(--ck-highlight-marker-pink)',   type: 'marker' },
              { model: 'blueMarker',   class: 'marker-blue',   title: 'Blue marker',   color: 'var(--ck-highlight-marker-blue)',   type: 'marker' },
              { model: 'redPen',       class: 'pen-red',       title: 'Red pen',       color: 'var(--ck-highlight-pen-red)',       type: 'pen' },
              { model: 'greenPen',     class: 'pen-green',     title: 'Green pen',     color: 'var(--ck-highlight-pen-green)',     type: 'pen' },
            ],
          },

          alignment: {
            options: ['left', 'center', 'right', 'justify'],
          },

          codeBlock: {
            languages: [
              { language: 'plaintext',  label: 'Plain text' },
              { language: 'php',        label: 'PHP' },
              { language: 'javascript', label: 'JavaScript' },
              { language: 'typescript', label: 'TypeScript' },
              { language: 'bash',       label: 'Bash / Shell' },
              { language: 'sql',        label: 'SQL' },
              { language: 'html',       label: 'HTML' },
              { language: 'css',        label: 'CSS' },
              { language: 'json',       label: 'JSON' },
              { language: 'yaml',       label: 'YAML' },
              { language: 'python',     label: 'Python' },
              { language: 'java',       label: 'Java' },
              { language: 'c',          label: 'C' },
              { language: 'cpp',        label: 'C++' },
              { language: 'cs',         label: 'C#' },
              { language: 'go',         label: 'Go' },
              { language: 'rust',       label: 'Rust' },
              { language: 'ruby',       label: 'Ruby' },
              { language: 'dart',       label: 'Dart' },
              { language: 'dockerfile', label: 'Dockerfile' },
              { language: 'xml',        label: 'XML' },
            ],
          },

          image: {
            toolbar: [
              'imageTextAlternative', 'toggleImageCaption',
              '|',
              'imageStyle:inline', 'imageStyle:block', 'imageStyle:side',
              'imageStyle:wrapText', 'imageStyle:breakText',
              '|',
              'resizeImage',
            ],
            upload: {
              types: ['jpeg', 'png', 'gif', 'bmp', 'webp', 'svg+xml'],
            },
          },

          table: {
            contentToolbar: [
              'tableColumn', 'tableRow', 'mergeTableCells',
              '|',
              'tableProperties', 'tableCellProperties',
            ],
          },

          link: {
            defaultProtocol: 'https://',
            decorators: {
              openInNewTab: {
                mode: 'manual' as const,
                label: 'Open in a new tab',
                attributes: {
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
              },
            },
          },

          mediaEmbed: {
            extraProviders: [
              {
                name: 'tiktok',
                url: /^.*https?:\/\/(?:m|www|vm)?\.?tiktok\.com\/((?:.*\b(?:(?:usr|v|embed|user|video)\/|\?shareId=|&item_id=)(\d+))|\w+)/,
                html: (match: RegExpMatchArray) =>
                  `<div style="position:relative;padding-bottom:177%;height:0;overflow:hidden;">` +
                  `<iframe src="https://www.tiktok.com/embed/v2/${match[1]}" ` +
                  `style="position:absolute;top:0;left:0;width:100%;height:100%;" ` +
                  `frameborder="0" allowfullscreen></iframe></div>`,
              },
            ],
          },

          htmlSupport: {
            allow: [
              {
                name: /.*/,
                attributes: true,
                classes: true,
                styles: true,
              },
            ],
          },
        }}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onChange={(_event: unknown, editor: any) => onChange(editor.getData())}
      />
    </div>
  )
}
