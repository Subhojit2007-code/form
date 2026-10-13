'use client'

import { Activity, ArrowLeft, ArrowUpRight, BarChart3, CircleCheck, Clock3, Cpu, Image as ImageIcon, Layers3, Sparkles, Video } from 'lucide-react'

export type RecentRun = {
  id: string
  type: string
  title: string
  createdAt: Date
}

const formatTime = (date: Date) => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date)

export function AdminPanel({ runs, onBack }: { runs: RecentRun[]; onBack: () => void }) {
  const websites = runs.filter((run) => ['website', 'app', 'software', 'game'].includes(run.type)).length
  const images = runs.filter((run) => ['image', 'poster', 'thumbnail', 'asset'].includes(run.type)).length
  const videos = runs.filter((run) => run.type === 'video').length

  return (
    <div className="admin-content">
      <div className="admin-intro"><div><div className="eyebrow-label"><Layers3 aria-hidden="true" /> WORKSPACE OPERATIONS</div><h1>Admin console</h1><p>Monitor activity and the generation services for this workspace.</p></div><button className="outline-action" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" />Back to studio</button></div>
      <div className="admin-context"><Activity aria-hidden="true" /><span>Showing generation activity from this browser session.</span><span className="session-pill">SESSION VIEW</span></div>
      <section className="admin-metrics" aria-label="Generation metrics">
        <article className="metric-card"><div className="metric-label"><span>Generations</span><Sparkles aria-hidden="true" /></div><strong>{runs.length}</strong><small>Completed this session</small></article>
        <article className="metric-card"><div className="metric-label"><span>Web experiences</span><Layers3 aria-hidden="true" /></div><strong>{websites}</strong><small>Sites, apps, and games</small></article>
        <article className="metric-card"><div className="metric-label"><span>Images & assets</span><ImageIcon aria-hidden="true" /></div><strong>{images}</strong><small>Creative assets produced</small></article>
        <article className="metric-card"><div className="metric-label"><span>Videos</span><Video aria-hidden="true" /></div><strong>{videos}</strong><small>Video requests completed</small></article>
      </section>
      <section className="admin-grid">
        <article className="admin-card activity-card"><div className="admin-card-heading"><div><span className="section-eyebrow">LATEST ACTIVITY</span><h2>Recent generations</h2></div><button type="button" className="subtle-link">This session <ArrowUpRight aria-hidden="true" /></button></div>
          {runs.length ? <div className="activity-list">{runs.map((run) => <div className="activity-row" key={run.id}><div className={`activity-icon activity-${run.type}`}><Activity aria-hidden="true" /></div><div className="activity-copy"><strong>{run.title}</strong><span>{run.type.charAt(0).toUpperCase() + run.type.slice(1)} · {formatTime(run.createdAt)}</span></div><span className="run-complete"><CircleCheck aria-hidden="true" />Ready</span></div>)}</div> : <div className="admin-empty"><div className="admin-empty-icon"><BarChart3 aria-hidden="true" /></div><strong>No generations yet</strong><span>Start a creation in the studio and its activity will appear here.</span></div>}
        </article>
        <article className="admin-card services-card"><div className="admin-card-heading"><div><span className="section-eyebrow">SERVICE HEALTH</span><h2>Connected services</h2></div></div><div className="service-row"><div className="service-icon ai-service"><Sparkles aria-hidden="true" /></div><div className="service-copy"><strong>Vercel AI Gateway</strong><span>Text and code generation</span></div><span className="service-status"><i />Connected</span></div><div className="service-row"><div className="service-icon image-service"><ImageIcon aria-hidden="true" /></div><div className="service-copy"><strong>Image generation</strong><span>Creative assets and thumbnails</span></div><span className="service-status"><i />Available</span></div><div className="service-row"><div className="service-icon video-service"><Video aria-hidden="true" /></div><div className="service-copy"><strong>Video generation</strong><span>Asynchronous model rendering</span></div><span className="service-status"><i />Available</span></div><div className="service-footnote"><Cpu aria-hidden="true" /><span>Provider access and usage limits depend on your AI Gateway account.</span></div></article>
      </section>
      <section className="admin-limits"><Clock3 aria-hidden="true" /><div><strong>Production note</strong><span>This starter admin view is session-scoped and not access-controlled. Add a real admin identity provider and persistent database before using it to manage a team or customer data.</span></div></section>
    </div>
  )
}
