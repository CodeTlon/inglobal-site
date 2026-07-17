'use client'

// Editor de contenido rico para trabajos — TipTap con imágenes (via uploadMediaAction)
// y embeds de YouTube. Mismo patrón validado en gc2/src/app/dashboard/(panel)/blog/PostForm.tsx.

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TipTapImage from '@tiptap/extension-image'
import TipTapLink from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Youtube from '@tiptap/extension-youtube'
import { Video } from './tiptap-video-extension'
import { uploadMediaAction } from '@/app/actions/settings'
import { parseYoutubeId } from '@/lib/youtube'
import {
  Upload,
  Loader2,
  Video as YoutubeIcon,
  Film,
  X,
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
} from 'lucide-react'

function ToolbarBtn({
  onClick,
  active,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active ? 'bg-igb-yellow/15 text-igb-yellow-dark' : 'text-zinc-400 hover:text-zinc-700'
      }`}
    >
      {children}
    </button>
  )
}

export default function ContentEditor({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [busy, setBusy] = useState(false)
  const [videoBusy, setVideoBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [showYt, setShowYt] = useState(false)
  const [ytInput, setYtInput] = useState('')

  const editor = useEditor({
    extensions: [
      StarterKit,
      TipTapImage,
      TipTapLink.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: 'Escribí el contenido del trabajo acá…' }),
      // loading="lazy" viaja al HTML exportado (getHTML()) y de ahí al público
      // vía dangerouslySetInnerHTML — el navegador difiere la carga del iframe
      // hasta que esté cerca del viewport, en vez de traerlo siempre de entrada.
      Youtube.configure({ controls: true, nocookie: false, HTMLAttributes: { loading: 'lazy' } }),
      Video,
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    onContentError: ({ error }) => console.error('Contenido inválido para el editor:', error),
  })

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'trabajos/content')
    const res = await uploadMediaAction(fd)
    setBusy(false)
    if (res.error) {
      setErr(res.error)
      return
    }
    if (res.url) {
      editor?.chain().focus().setImage({ src: res.url, alt: '' }).run()
      editor?.commands.createParagraphNear()
    }
    e.target.value = ''
  }

  async function pickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setVideoBusy(true)
    setErr(null)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'trabajos/content')
    const res = await uploadMediaAction(fd)
    setVideoBusy(false)
    if (res.error) {
      setErr(res.error)
      return
    }
    if (res.url) {
      editor?.chain().focus().setVideo({ src: res.url }).run()
      editor?.commands.createParagraphNear()
    }
    e.target.value = ''
  }

  function insertYoutube() {
    const src = ytInput.trim()
    if (!parseYoutubeId(src)) {
      setErr('Link de YouTube no válido.')
      return
    }
    editor?.commands.setYoutubeVideo({ src })
    setYtInput('')
    setShowYt(false)
    setErr(null)
  }

  function addLink() {
    const url = window.prompt('URL del link:')
    if (!url) return
    if (editor?.state.selection.empty) {
      editor.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run()
    } else {
      editor?.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 flex-wrap px-2 py-1.5 rounded-t-md border border-zinc-200 border-b-0 bg-zinc-50">
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')} title="Negrita">
          <Bold size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')} title="Cursiva">
          <Italic size={15} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-zinc-200 mx-1" />

        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })} title="Título H2">
          <Heading2 size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')} title="Cita">
          <Quote size={15} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-zinc-200 mx-1" />

        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')} title="Lista con viñetas">
          <List size={15} />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')} title="Lista numerada">
          <ListOrdered size={15} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-zinc-200 mx-1" />

        <ToolbarBtn onClick={addLink} active={editor?.isActive('link')} title="Insertar link">
          <LinkIcon size={15} />
        </ToolbarBtn>

        <div className="w-px h-4 bg-zinc-200 mx-1" />

        <label
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors ml-1 bg-igb-yellow/10 text-igb-yellow-dark"
          title="Subir e insertar imagen"
        >
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {busy ? 'Subiendo…' : 'Imagen'}
          <input type="file" accept="image/*" onChange={pickImage} disabled={busy} className="hidden" />
        </label>

        <button
          type="button"
          onClick={() => { setShowYt(!showYt); setErr(null) }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-colors text-red-600 bg-red-50"
          title="Insertar video de YouTube"
        >
          <YoutubeIcon size={13} />
          YouTube
        </button>

        <label
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold cursor-pointer transition-colors bg-igb-yellow/10 text-igb-yellow-dark"
          title="Subir e insertar video propio (MP4, hasta 20 MB)"
        >
          {videoBusy ? <Loader2 size={13} className="animate-spin" /> : <Film size={13} />}
          {videoBusy ? 'Subiendo…' : 'Video propio'}
          <input type="file" accept="video/mp4" onChange={pickVideo} disabled={videoBusy} className="hidden" />
        </label>

        {err && <span className="text-xs text-red-500 ml-2">{err}</span>}
      </div>

      {/* YouTube input */}
      {showYt && (
        <div className="flex gap-2 px-2 py-2 border border-zinc-200 border-b-0 bg-zinc-50">
          <input
            type="text"
            value={ytInput}
            onChange={(e) => setYtInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), insertYoutube())}
            placeholder="Pegá el link de YouTube o Short…"
            className="flex-1 bg-white border border-zinc-200 rounded px-2.5 py-1.5 text-sm"
            autoFocus
          />
          <button type="button" onClick={insertYoutube} className="px-3 py-1.5 rounded text-xs font-bold flex-shrink-0 bg-igb-yellow text-igb-on-yellow">
            Insertar
          </button>
          <button
            type="button"
            onClick={() => { setShowYt(false); setYtInput(''); setErr(null) }}
            className="px-2 py-1.5 rounded text-zinc-400 hover:text-zinc-700 border border-zinc-200 flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="tiptap-editor border border-zinc-200 rounded-b-md px-3 py-2.5 min-h-[240px] text-sm text-zinc-900 overflow-hidden [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[220px] [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-zinc-400 [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
      />
    </div>
  )
}
