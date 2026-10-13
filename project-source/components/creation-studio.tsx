'use client'

import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
  Code2,
  Copy,
  Download,
  Eye,
  FileCode2,
  Image as ImageIcon,
  LayoutDashboard,
  LoaderCircle,
  Monitor,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Smartphone,
  Tablet,
  Video,
  WandSparkles,
  X,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AdminPanel, type RecentRun } from './admin-panel'

type CreationType = 'website' | 'app' | 'software' | 'game' | 'video' | 'image' | 'poster' | 'thumbnail' | 'asset'
type Output =
  | { kind: 'code'; html: string }
  | { kind: 'image' | 'video'; data: string; mediaType: string }

type Viewport = 'desktop' | 'tablet' | 'mobile'

const starterHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Studio Lune — Objects for slower living</title>
  <link rel="preconnect" href="https://images.unsplash.com" />
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; color: #242522; background: #f5f3ee; font-family: 'Helvetica Neue', Arial, sans-serif; }
    nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 6vw; font-size: 12px; letter-spacing: .11em; text-transform: uppercase; }
    .brand { font-family: Georgia, serif; font-size: 21px; letter-spacing: -.04em; text-transform: none; }
    .links { display: flex; gap: 28px; }
    .hero { display: grid; grid-template-columns: .92fr 1.08fr; gap: 5vw; min-height: 610px; padding: 35px 6vw 65px; align-items: center; }
    .eyebrow { color: #8e6b52; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; }
    h1 { max-width: 520px; margin: 25px 0; font-family: Georgia, serif; font-size: clamp(50px, 7vw, 94px); font-weight: 400; line-height: .96; letter-spacing: -.065em; }
    .intro { max-width: 350px; color: #73736d; font-size: 14px; line-height: 1.8; }
    .cta { display: inline-flex; gap: 24px; align-items: center; margin-top: 27px; padding: 14px 0; border-bottom: 1px solid #34352f; color: inherit; text-decoration: none; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
    .image { min-height: 510px; background: #c5b5a0 url('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1500&q=85') center/cover; }
    .caption { display: flex; justify-content: space-between; margin-top: 12px; color: #78766f; font-size: 10px; letter-spacing: .08em; text-transform: uppercase; }
    .bottom { display: flex; justify-content: space-between; padding: 22px 6vw; border-top: 1px solid #dedbd4; color: #74736d; font-size: 11px; letter-spacing: .08em; text-transform: uppercase; }
    @media (max-width: 700px) { .links { display: none; } .hero { grid-template-columns: 1fr; gap: 35px; padding-top: 26px; } .image { min-height: 370px; } h1 { font-size: 64px; } }
  </style>
</head>
<body>
  <nav><span class="brand">Studio Lune</span><div class="links"><a>Objects</a><a>Our process</a><a>Journal</a></div><span>Bag (0)</span></nav>
  <main class="hero">
    <section><div class="eyebrow">Hand-thrown in the Pacific Northwest</div><h1>Objects for slower living.</h1><p class="intro">Small-batch ceramics shaped by the quiet beauty of everyday rituals. Made slowly, meant to stay.</p><a class="cta" href="#collection">Explore the collection <span>↗</span></a></section>
    <div><div class="image" role="img" aria-label="Handmade sculptural ceramic vase"></div><div class="caption"><span>Form study no. 04</span><span>Stoneware, 2025</span></div></div>
  </main>
  <footer class="bottom"><span>Made by hand, held for years</span><span>© Studio Lune</span></footer>
</body>
</html>`

const creationTypes: { id: CreationType; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'website', label: 'Website', icon: LayoutDashboard },
  { id: 'app', label: 'App', icon: WandSparkles },
  { id: 'software', label: 'Software', icon: Code2 },
  { id: 'game', label: 'Game', icon: Play },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'image', label: 'Image', icon: ImageIcon },
  { id: 'poster', label: 'Poster', icon: FileCode2 },
  { id: 'thumbnail', label: 'Thumbnail', icon: Eye },
  { id: 'asset', label: 'Asset', icon: Sparkles },
]

const typePrompts: Record<CreationType, string> = {
  website: 'Describe the website you want to create…',
  app: 'Describe the app experience and its key screens…',
  software: 'Describe the software tool or interface you need…',
  game: 'Describe the game, its rules, and visual style…',
  video: 'Describe the scene, motion, style, and mood…',
  image: 'Describe the image, composition, style, and details…',
  poster: 'Describe the poster and its intended audience…',
  thumbnail: 'Describe the thumbnail, subject, and visual hook…',
  asset: 'Describe the visual asset and where it will be used…',
}

const suggestions = [
  'A landing page for a boutique architecture studio',
  'A cozy pixel-art game about restoring a lighthouse',
  'A cinematic product launch video for a new fragrance',
]

function decodeSharedHtml() {
  if (typeof window === 'undefined' || !window.location.hash.startsWith('#preview=')) return null
  try {
    const value = window.location.hash.slice('#preview='.length).replace(/-/g, '+').replace(/_/g, '/')
    const binary = window.atob(value)
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return new TextDecoder().decode(bytes)
  } catch {
    return null
  }
}

function encodeSharedHtml(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function CreationStudio() {
  const [currentView, setCurrentView] = useState<'create' | 'admin'>('create')
  const [creationType, setCreationType] = useState<CreationType>('website')
  const [prompt, setPrompt] = useState('')
  const [html, setHtml] = useState(starterHtml)
  const [output, setOutput] = useState<Output>({ kind: 'code', html: starterHtml })
  const [isGenerating, setIsGenerating] = useState(false)
  const [aspectRatio, setAspectRatio] = useState('16:9')
  const [canvasWidth, setCanvasWidth] = useState('1536')
  const [canvasHeight, setCanvasHeight] = useState('1024')
  const [viewport, setViewport] = useState<Viewport>('desktop')
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview')
  const [notice, setNotice] = useState('')
  const [runs, setRuns] = useState<RecentRun[]>([])
  const [projectName, setProjectName] = useState('Studio Lune')
  const [shareReady, setShareReady] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const shared = decodeSharedHtml()
    if (shared) {
      setHtml(shared)
      setOutput({ kind: 'code', html: shared })
      setProjectName('Shared preview')
      setShareReady(true)
    }
  }, [])

  useEffect(() => {
    if (!notice) return
    const timer = window.setTimeout(() => setNotice(''), 2600)
    return () => window.clearTimeout(timer)
  }, [notice])

  const notify = useCallback((message: string) => setNotice(message), [])

  const generate = async () => {
    const cleanPrompt = prompt.trim()
    if (cleanPrompt.length < 8) {
      notify('Add a little more detail to your brief first.')
      textareaRef.current?.focus()
      return
    }

    const isImage = ['image', 'poster', 'thumbnail', 'asset'].includes(creationType)
    const width = Number(canvasWidth)
    const height = Number(canvasHeight)
    if (isImage && (!Number.isInteger(width) || !Number.isInteger(height) || width < 256 || height < 256 || width > 4096 || height > 4096 || width * height > 8_000_000)) {
      notify('Choose whole image dimensions from 256px to 4,096px, up to 8 megapixels total.')
      return
    }

    setIsGenerating(true)
    setShareReady(false)
    setCurrentView('create')

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: creationType, prompt: cleanPrompt, aspectRatio, width, height }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Generation failed. Please try again.')

      if (result.kind === 'code') {
        setHtml(result.html)
        setOutput({ kind: 'code', html: result.html })
        setActiveTab('preview')
        setProjectName(cleanPrompt.slice(0, 32).replace(/[.!?]$/, '') || 'New project')
      } else {
        setOutput({ kind: result.kind, data: `data:${result.mediaType};base64,${result.data}`, mediaType: result.mediaType })
        setActiveTab('preview')
        setProjectName(cleanPrompt.slice(0, 32).replace(/[.!?]$/, '') || 'New project')
      }

      setRuns((current) => [
        { id: crypto.randomUUID(), type: creationType, title: cleanPrompt.slice(0, 48), createdAt: new Date() },
        ...current,
      ].slice(0, 8))
      notify('Your new creation is ready to review.')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyText = async (value: string, message: string) => {
    try {
      await navigator.clipboard.writeText(value)
      notify(message)
    } catch {
      notify('Clipboard access is unavailable in this browser.')
    }
  }

  const sharePreview = async () => {
    if (output.kind !== 'code') return
    if (html.length > 350_000) {
      notify('This preview is too large to place in a share link. Download the HTML instead.')
      return
    }
    const url = new URL(window.location.href)
    url.hash = `preview=${encodeSharedHtml(html)}`
    await copyText(url.toString(), 'Share link copied. Anyone with the link can open this preview.')
    setShareReady(true)
  }

  const downloadOutput = () => {
    let blob: Blob
    let filename: string
    if (output.kind === 'code') {
      blob = new Blob([output.html], { type: 'text/html;charset=utf-8' })
      filename = 'index.html'
    } else {
      const content = output.data.split(',')[1]
      const bytes = Uint8Array.from(window.atob(content), (character) => character.charCodeAt(0))
      blob = new Blob([bytes], { type: output.mediaType })
      const extension = output.mediaType.split('/')[1]?.split(';')[0] || (output.kind === 'image' ? 'png' : 'mp4')
      filename = `generated-${output.kind}.${extension}`
    }
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    notify(`${filename} downloaded.`)
  }

  const setPromptAndFocus = (value: string) => {
    setPrompt(value)
    textareaRef.current?.focus()
  }

  const previewWidth = useMemo(() => ({ desktop: '100%', tablet: '768px', mobile: '390px' })[viewport], [viewport])

  return (
    <div className="studio-shell">
      <aside className="studio-sidebar">
        <div className="brand-lockup">
          <div className="brand-mark"><Sparkles aria-hidden="true" /></div>
          <span>form<span className="brand-dot">.</span></span>
        </div>
        <nav className="mobile-sidebar-nav" aria-label="Mobile navigation">
          <button type="button" className={currentView === 'create' ? 'active' : ''} onClick={() => setCurrentView('create')}><Plus aria-hidden="true" /><span>Create</span></button>
          <button type="button" className={currentView === 'admin' ? 'active' : ''} onClick={() => setCurrentView('admin')}><LayoutDashboard aria-hidden="true" /><span>Admin</span></button>
        </nav>
        <button className="workspace-switcher" type="button" aria-label="Current workspace">
          <span className="workspace-avatar">S</span>
          <span className="workspace-copy"><strong>Studio workspace</strong><small>Free workspace</small></span>
          <ChevronDown aria-hidden="true" />
        </button>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <button className={`nav-item ${currentView === 'create' ? 'active' : ''}`} type="button" onClick={() => setCurrentView('create')}>
            <Plus aria-hidden="true" /><span>Create new</span><kbd>⌘ K</kbd>
          </button>
          <button className="nav-item" type="button" onClick={() => setCurrentView('create')}><Search aria-hidden="true" /><span>Discover</span></button>
        </nav>
        <div className="sidebar-label projects-label">RECENT PROJECTS <button type="button" aria-label="Add project" onClick={() => { setCurrentView('create'); setPrompt('') }}><Plus aria-hidden="true" /></button></div>
        <div className="project-list">
          <button type="button" className={`project-item ${currentView === 'create' ? 'selected' : ''}`} onClick={() => setCurrentView('create')}><span className="project-color violet" />{projectName}</button>
          <button type="button" className="project-item" onClick={() => { setCurrentView('create'); setCreationType('app') }}><span className="project-color orange" />Habit tracker app</button>
          <button type="button" className="project-item" onClick={() => { setCurrentView('create'); setCreationType('game') }}><span className="project-color blue" />Little planet game</button>
        </div>
        <div className="sidebar-bottom">
          <button className={`nav-item ${currentView === 'admin' ? 'active' : ''}`} type="button" onClick={() => setCurrentView('admin')}><LayoutDashboard aria-hidden="true" /><span>Admin console</span></button>
          <button className="nav-item" type="button" onClick={() => notify('Settings are coming soon.')}><Settings2 aria-hidden="true" /><span>Settings</span></button>
          <div className="sidebar-divider" />
          <div className="user-profile"><div className="user-avatar">JD</div><div className="user-copy"><strong>Jordan Davis</strong><small>Personal workspace</small></div><MoreHorizontal aria-hidden="true" /></div>
        </div>
      </aside>

      <main className="studio-main">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{currentView === 'admin' ? 'Admin console' : projectName}</strong></div>
          <div className="topbar-actions"><span className="gateway-status"><span /> Gateway connected</span><a className="source-download-button" href="/downloads/creation-studio.zip" download aria-label="Download HTML, CSS, and JavaScript files"><ArrowDownToLine aria-hidden="true" /><span>Download files</span></a><a className="source-download-button" href="/downloads/json-files.zip" download aria-label="Download JSON files"><ArrowDownToLine aria-hidden="true" /><span>JSON files</span></a><a className="source-download-button" href="/downloads/project-source.zip" download aria-label="Download complete project source archive"><ArrowDownToLine aria-hidden="true" /><span>Project source</span></a><button type="button" className="avatar-button" aria-label="Account menu">JD</button></div>
        </header>

        {currentView === 'admin' ? (
          <AdminPanel runs={runs} onBack={() => setCurrentView('create')} />
        ) : (
          <div className="studio-content">
            <section className="welcome-row">
              <div><div className="eyebrow-label"><Sparkles aria-hidden="true" /> YOUR CREATIVE WORKSPACE</div><h1>What will you make today?</h1><p>One brief. A world of possibilities.</p></div>
              <button className="quiet-button" type="button" onClick={() => notify('Your recent work is saved in this session.')}><MoreHorizontal aria-hidden="true" /><span>More</span></button>
            </section>

            <section className="creation-card" aria-label="Create with AI">
              <div className="creation-types" role="tablist" aria-label="Creation type">
                {creationTypes.map(({ id, label, icon: Icon }) => (
                  <button key={id} className={`creation-type ${creationType === id ? 'active' : ''}`} type="button" role="tab" aria-selected={creationType === id} onClick={() => setCreationType(id)}>
                    <Icon aria-hidden="true" /><span>{label}</span>
                  </button>
                ))}
              </div>
              <label className="sr-only" htmlFor="creation-prompt">Describe what you want to create</label>
              <textarea
                id="creation-prompt"
                ref={textareaRef}
                className="prompt-input"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing && event.keyCode !== 229) {
                    event.preventDefault()
                    void generate()
                  }
                }}
                placeholder={typePrompts[creationType]}
                maxLength={8000}
              />
              <div className="prompt-footer">
                <div className="prompt-options">
                  <span className="language-indicator">文</span><span>Multilingual</span>
                  {creationType === 'video' && <><span className="prompt-divider" /><label className="ratio-control" htmlFor="aspect-ratio"><Video aria-hidden="true" /><span>{aspectRatio}</span><select id="aspect-ratio" value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)} aria-label="Video aspect ratio"><option value="16:9">16:9 landscape</option><option value="1:1">1:1 square</option><option value="9:16">9:16 portrait</option><option value="4:3">4:3 classic</option><option value="3:2">3:2 photo</option></select><ChevronDown aria-hidden="true" /></label></>}
                  {['image', 'poster', 'thumbnail', 'asset'].includes(creationType) && <div className="size-control"><span>Size</span><label className="sr-only" htmlFor="canvas-width">Canvas width in pixels</label><input id="canvas-width" type="number" min="256" max="4096" step="1" value={canvasWidth} onChange={(event) => setCanvasWidth(event.target.value)} /><span aria-hidden="true">×</span><label className="sr-only" htmlFor="canvas-height">Canvas height in pixels</label><input id="canvas-height" type="number" min="256" max="4096" step="1" value={canvasHeight} onChange={(event) => setCanvasHeight(event.target.value)} /><span>px</span></div>}
                </div>
                <div className="prompt-submit-wrap"><span className="prompt-hint">{prompt.length ? `${prompt.length}/8,000` : '⌘ ↵ to generate'}</span><button className="generate-button" type="button" disabled={isGenerating} onClick={() => void generate()}>{isGenerating ? <LoaderCircle className="spin" aria-hidden="true" /> : <Sparkles aria-hidden="true" />}<span>{isGenerating ? 'Creating…' : 'Generate'}</span><ArrowUpRight aria-hidden="true" /></button></div>
              </div>
            </section>

            {!prompt && !isGenerating && <div className="suggestion-row"><span>Try</span>{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => setPromptAndFocus(suggestion)}>{suggestion}<ArrowUpRight aria-hidden="true" /></button>)}</div>}

            <section className="workspace-heading"><div><span className="section-eyebrow">LIVE WORKSPACE</span><h2>{output.kind === 'code' ? projectName : 'Your generated ' + output.kind}</h2></div><div className="workspace-actions"><span className="ready-status"><span />{isGenerating ? 'Working…' : 'Ready to preview'}</span><button className="outline-action" type="button" onClick={downloadOutput}><Download aria-hidden="true" /><span>Download</span></button>{output.kind === 'code' && <button className="primary-action" type="button" onClick={() => void sharePreview()}><Copy aria-hidden="true" /><span>{shareReady ? 'Copy link again' : 'Share preview'}</span></button>}</div></section>

            <section className="workbench" aria-label="Generated output workspace">
              <div className="editor-panel">
                <div className="panel-toolbar"><div className="panel-heading"><FileCode2 aria-hidden="true" /><strong>{output.kind === 'code' ? 'Source code' : 'Generation brief'}</strong><span className="file-pill">{output.kind === 'code' ? 'index.html' : creationType}</span></div><div className="editor-actions"><button type="button" className="icon-action" aria-label="Copy source code" onClick={() => void copyText(output.kind === 'code' ? output.html : prompt, 'Copied to clipboard.')}><Copy aria-hidden="true" /></button><button type="button" className="icon-action" aria-label="More source options" onClick={() => notify('Download the generated source from the toolbar above.')}><MoreHorizontal aria-hidden="true" /></button></div></div>
                  <div className="code-surface">
                    {output.kind === 'code' ? <pre aria-label="Generated HTML source"><code>{output.html}</code></pre> : <div className="asset-brief"><span className="asset-icon">{output.kind === 'image' ? <ImageIcon aria-hidden="true" /> : <Video aria-hidden="true" />}</span><span className="section-eyebrow">CREATION BRIEF</span><p>{prompt || 'Your generated asset will appear in the preview panel.'}</p><span className="asset-metadata">{creationType} · {output.kind === 'image' ? `${canvasWidth} × ${canvasHeight}px` : aspectRatio}</span></div>}
                    {isGenerating && <div className="generation-overlay"><div className="generation-progress"><LoaderCircle className="spin" aria-hidden="true" /><strong>{creationType === 'video' ? 'Rendering your video' : 'Bringing your idea to life'}</strong><span>{creationType === 'video' ? 'Video creation can take a few minutes.' : 'Writing, checking, and assembling your output.'}</span><div className="progress-track"><span /></div></div></div>}
                  </div>
                  <div className="panel-footer"><span><span className="editor-dot" />{output.kind === 'code' ? 'HTML · CSS · JS' : 'Ready to download'}</span><span>{output.kind === 'code' ? `${html.split('\n').length} lines` : 'AI generated'}</span></div>
                </div>

                <div className="preview-panel">
                  <div className="preview-toolbar"><div className="view-tabs" role="tablist" aria-label="Output view"><button type="button" role="tab" aria-selected={activeTab === 'preview'} className={activeTab === 'preview' ? 'active' : ''} onClick={() => setActiveTab('preview')}><Eye aria-hidden="true" />Preview</button><button type="button" role="tab" aria-selected={activeTab === 'code'} className={activeTab === 'code' ? 'active' : ''} onClick={() => setActiveTab('code')}><Code2 aria-hidden="true" />Code</button></div><div className="viewport-switcher" role="group" aria-label="Preview size"><button type="button" aria-label="Desktop preview" aria-pressed={viewport === 'desktop'} className={viewport === 'desktop' ? 'active' : ''} onClick={() => setViewport('desktop')}><Monitor aria-hidden="true" /></button><button type="button" aria-label="Tablet preview" aria-pressed={viewport === 'tablet'} className={viewport === 'tablet' ? 'active' : ''} onClick={() => setViewport('tablet')}><Tablet aria-hidden="true" /></button><button type="button" aria-label="Mobile preview" aria-pressed={viewport === 'mobile'} className={viewport === 'mobile' ? 'active' : ''} onClick={() => setViewport('mobile')}><Smartphone aria-hidden="true" /></button></div></div>
                  <div className="preview-stage">
                    {output.kind === 'code' ? (
                      activeTab === 'preview' ? <div className="preview-device" style={{ width: previewWidth }}><div className="browser-bar"><div className="browser-dots"><i /><i /><i /></div><div className="browser-address"><span />{shareReady ? 'preview.form.studio' : 'your-project.preview'}</div><button type="button" aria-label="Open share options" onClick={() => void sharePreview()}><ArrowUpRight aria-hidden="true" /></button></div><iframe title="Live preview of generated website" sandbox="allow-scripts" srcDoc={html} /></div> : <pre className="preview-code"><code>{html}</code></pre>
                    ) : output.kind === 'image' ? <div className="media-preview"><img src={output.data} alt={`AI-generated ${creationType} based on your brief`} /></div> : <div className="media-preview"><video src={output.data} controls playsInline aria-label="AI-generated video preview" /></div>}
                    {isGenerating && <div className="preview-loading"><LoaderCircle className="spin" aria-hidden="true" /><span>Generating your {creationType}…</span></div>}
                  </div>
                  <div className="preview-footer"><span><span className="live-dot" />Live preview</span><button type="button" onClick={() => output.kind === 'code' ? void sharePreview() : downloadOutput()}>{output.kind === 'code' ? <><Copy aria-hidden="true" />Copy browser link</> : <><ArrowDownToLine aria-hidden="true" />Save asset</>}</button></div>
                </div>
              </section>
              <div className="bottom-note"><span><Check aria-hidden="true" />Your output is ready for review.</span><span>Preview code runs in an isolated sandbox.</span></div>
          </div>
        )}
      </main>

      {notice && <div className="toast-message" role="status"><Check aria-hidden="true" />{notice}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice('')}><X aria-hidden="true" /></button></div>}
    </div>
  )
}

export type { CreationType }
