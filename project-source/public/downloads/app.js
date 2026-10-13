(() => {
  const $ = (selector) => document.querySelector(selector)
  const $$ = (selector) => [...document.querySelectorAll(selector)]
  const descriptions = { website: 'Describe the website you want to create…', app: 'Describe the app experience and its key screens…', software: 'Describe the software tool or interface you need…', game: 'Describe the game, its rules, and visual style…', video: 'Describe the scene, motion, style, and mood…', image: 'Describe the image, composition, style, and details…', poster: 'Describe the poster and its intended audience…', thumbnail: 'Describe the thumbnail, subject, and visual hook…', asset: 'Describe the visual asset and where it will be used…' }
  const imageTypes = ['image', 'poster', 'thumbnail', 'asset']
  const runs = []
  let currentType = 'website'
  let activePanel = 'preview'
  let generated
  let projectName = 'Untitled website'
  let toastTimer

  const defaultHtml = `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>Studio Lune — Objects for slower living</title>\n  <style>\n    *{box-sizing:border-box}body{margin:0;background:#f5f3ee;color:#292923;font:14px Arial,sans-serif}nav{display:flex;justify-content:space-between;padding:24px 6vw;font-size:12px;letter-spacing:.12em;text-transform:uppercase}.brand{font:22px Georgia,serif;text-transform:none}.hero{display:grid;grid-template-columns:1fr 1fr;gap:6vw;align-items:center;min-height:70vh;padding:30px 8vw}.eyebrow{color:#917255;letter-spacing:.16em;text-transform:uppercase;font-size:10px}h1{max-width:500px;font:400 clamp(54px,8vw,100px)/.95 Georgia,serif;letter-spacing:-.06em}.copy{max-width:350px;color:#777;line-height:1.8}.photo{min-height:470px;background:#cabca8 url('https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1400&q=80') center/cover}footer{padding:20px 6vw;border-top:1px solid #ddd8cd;color:#777;font-size:11px}@media(max-width:700px){.hero{grid-template-columns:1fr}.photo{min-height:340px}h1{font-size:62px}}</style>\n</head>\n<body><nav><span class="brand">Studio Lune</span><span>Objects　 Process　 Journal</span><span>Bag (0)</span></nav><main class="hero"><section><p class="eyebrow">Hand-thrown in the Pacific Northwest</p><h1>Objects for slower living.</h1><p class="copy">Small-batch ceramics shaped by the quiet beauty of everyday rituals. Made slowly, meant to stay.</p><p>Explore the collection　↗</p></section><div class="photo" role="img" aria-label="Handmade ceramic vase"></div></main><footer>Made by hand, held for years　　© Studio Lune</footer></body></html>`
  generated = { kind: 'code', html: defaultHtml }

  $('#codeOutput').textContent = generated.html
  $('#previewFrame').srcdoc = generated.html
  $('#toolbarProject').textContent = 'Studio Lune — Objects for slower living'
  $('#projectName').textContent = projectName
  $('#breadcrumb').textContent = projectName
  $('#prompt').addEventListener('input', (event) => { $('#promptCount').textContent = event.target.value ? `${event.target.value.length}/8,000` : '⌘ ↵ to generate' })
  $('#prompt').addEventListener('keydown', (event) => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.isComposing && event.keyCode !== 229) { event.preventDefault(); generate() } })

  $$('.tab').forEach((tab) => tab.addEventListener('click', () => {
    currentType = tab.dataset.type
    $$('.tab').forEach((item) => { const selected = item === tab; item.classList.toggle('active', selected); item.setAttribute('aria-selected', String(selected)) })
    $('#prompt').placeholder = descriptions[currentType]
    $('#sizeField').hidden = !imageTypes.includes(currentType)
    $('#ratioField').hidden = currentType !== 'video'
  }))
  $$('.suggestion').forEach((button) => button.addEventListener('click', () => { $('#prompt').value = button.textContent.replace('↗', '').trim(); $('#prompt').dispatchEvent(new Event('input')); $('#prompt').focus() }))

  async function generate() {
    const prompt = $('#prompt').value.trim()
    if (prompt.length < 8) return notify('Add a little more detail to your brief first.')
    const width = Number($('#imageWidth').value)
    const height = Number($('#imageHeight').value)
    if (imageTypes.includes(currentType) && (!Number.isInteger(width) || !Number.isInteger(height) || width < 256 || height < 256 || width > 4096 || height > 4096 || width * height > 8000000)) return notify('Use whole image dimensions from 256 to 4,096 pixels, up to 8 megapixels total.')
    const button = $('#generateButton')
    button.disabled = true
    button.innerHTML = '<span class="spinner">✳</span> Creating…'
    setView('create')
    try {
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: currentType, prompt, aspectRatio: $('#aspectRatio').value, width, height }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Generation failed. Try again.')
      generated = result
      if (result.kind === 'code') {
        $('#codeOutput').textContent = result.html
        $('#previewFrame').srcdoc = result.html
        $('#previewFrame').hidden = false
        $('#mediaOutput').hidden = true
        $('#mediaOutput').replaceChildren()
      } else {
        $('#previewFrame').hidden = true
        $('#mediaOutput').hidden = false
        $('#mediaOutput').replaceChildren()
        const element = result.kind === 'image' ? document.createElement('img') : document.createElement('video')
        element.src = `data:${result.mediaType};base64,${result.data}`
        if (result.kind === 'image') element.alt = prompt.slice(0, 180)
        else { element.controls = true; element.playsInline = true }
        $('#mediaOutput').append(element)
        $('#codeOutput').textContent = `${result.kind.toUpperCase()} OUTPUT\n\n${currentType}\n${width} × ${height}px\n\nUse the download button to save this generated file.`
      }
      projectName = titleFromPrompt(prompt)
      $('#projectName').textContent = projectName
      $('#breadcrumb').textContent = projectName
      $('#toolbarProject').textContent = result.kind === 'code' ? projectName : `${currentType[0].toUpperCase()}${currentType.slice(1)} — ${projectName}`
      runs.unshift({ type: currentType, name: projectName, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) })
      renderRuns()
      notify('Your new creation is ready to review.')
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Could not connect to the generation API. Serve this page from the project to enable AI generation.')
    } finally {
      button.disabled = false
      button.innerHTML = '<span>✳</span> Generate <b>↗</b>'
    }
  }
  $('#generateButton').addEventListener('click', generate)

  function renderRuns() {
    $('#statRuns').textContent = String(runs.length)
    $('#statSuccess').textContent = String(runs.length)
    $('#activityRows').classList.toggle('activity-empty', runs.length === 0)
    $('#activityRows').innerHTML = runs.length ? runs.map((run) => `<div class="activity-row"><span>${escapeHtml(run.name)} <small>· ${escapeHtml(run.type)}</small></span><span>${escapeHtml(run.time)}</span></div>`).join('') : 'Your generation history will appear here.'
  }
  function escapeHtml(value) { const node = document.createElement('span'); node.textContent = value; return node.innerHTML }
  function titleFromPrompt(prompt) { const words = prompt.replace(/[.!?].*$/, '').trim().split(/\s+/).slice(0, 5).join(' '); return words.length > 35 ? `${words.slice(0, 32)}…` : words || 'Untitled project' }
  function setView(view) { $('#createView').hidden = view === 'admin'; $('#adminView').hidden = view !== 'admin'; $$('.side-link[data-view]').forEach((button) => button.classList.toggle('active', button.dataset.view === view)); $('#breadcrumb').textContent = view === 'admin' ? 'Admin console' : projectName }
  $$('.side-link[data-view], [data-view="create"]').forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)))
  $$('.toolbar-tab').forEach((button) => button.addEventListener('click', () => {
    activePanel = button.dataset.panel
    $$('.toolbar-tab').forEach((tab) => tab.classList.toggle('active', tab === button))
    $('.output-grid').style.gridTemplateColumns = activePanel === 'code' ? '1fr' : ''
    $('.code-pane').hidden = activePanel === 'preview'
    $('.render-pane').hidden = activePanel === 'code'
  }))
  $$('.device').forEach((button) => button.addEventListener('click', () => {
    $$('.device').forEach((device) => device.classList.toggle('active', device === button))
    $('#previewFrame').style.width = button.dataset.width
  }))
  $('#copyCode').addEventListener('click', () => copyText(generated.kind === 'code' ? generated.html : $('#codeOutput').textContent, 'Code copied.'))
  $('#downloadCode').addEventListener('click', downloadGenerated)
  $('#copyLink').addEventListener('click', async () => {
    if (generated.kind !== 'code') return notify('Share links are available for website and code previews.')
    const bytes = new TextEncoder().encode(generated.html)
    let binary = ''
    for (let index = 0; index < bytes.length; index += 32768) binary += String.fromCharCode(...bytes.subarray(index, index + 32768))
    const encoded = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
    const url = `${location.href.split('#')[0]}#preview=${encoded}`
    try { await navigator.clipboard.writeText(url); notify('Share link copied.') } catch { prompt('Copy this share link:', url) }
  })
  $('#openPreview').addEventListener('click', () => {
    if (generated.kind !== 'code') return notify('Open in browser is available for website previews.')
    const blob = new Blob([generated.html], { type: 'text/html' })
    window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer')
  })
  async function copyText(value, message) { try { await navigator.clipboard.writeText(value); notify(message) } catch { notify('Clipboard access is not available in this browser.') } }
  function downloadGenerated() {
    if (generated.kind === 'code') saveFile(new Blob([generated.html], { type: 'text/html' }), 'index.html')
    else { const raw = atob(generated.data); const bytes = Uint8Array.from(raw, (character) => character.charCodeAt(0)); const extension = generated.mediaType.split('/')[1]?.split(';')[0] || (generated.kind === 'image' ? 'png' : 'mp4'); saveFile(new Blob([bytes], { type: generated.mediaType }), `generated-${generated.kind}.${extension}`) }
  }
  function saveFile(blob, name) { const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = name; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify(`${name} downloaded.`) }
  function notify(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3200) }
  $$('[data-toast]').forEach((button) => button.addEventListener('click', () => notify(button.dataset.toast)))

  const sharedValue = location.hash.startsWith('#preview=') ? location.hash.slice(9) : ''
  if (sharedValue) {
    try { const normalized = sharedValue.replace(/-/g, '+').replace(/_/g, '/'); const binary = atob(normalized); const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0)); $('#studioShell').hidden = true; $('#sharedScreen').hidden = false; $('#sharedFrame').srcdoc = new TextDecoder().decode(bytes) } catch { notify('This shared preview link is invalid.') }
  }
  if (location.protocol === 'file:') setTimeout(() => notify('To use AI generation, serve these files from your project so the /api/generate route is available.'), 350)
})()
