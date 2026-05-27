import React, { useState } from 'react'
import { AlertCircle, Check, Copy, Sparkles, Wand2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import { generateCaption, generateShootName } from '../../lib/anthropic'

export default function AITools() {
  const [tab, setTab] = useState('captions')

  return (
    <div>
      <PageHeader title="AI Tools" subtitle="Claude caption and shoot-name generators" />
      <div className="px-8 pt-6">
        <div className="flex gap-2 border-b" style={{ borderColor: '#334155' }}>
          <button className={`kro-tab ${tab === 'captions' ? 'active' : ''}`} onClick={() => setTab('captions')}>Caption Generator</button>
          <button className={`kro-tab ${tab === 'names' ? 'active' : ''}`} onClick={() => setTab('names')}>Shoot Name Generator</button>
        </div>
      </div>
      {tab === 'captions' ? <CaptionTool /> : <NameTool />}
    </div>
  )
}

function CaptionTool() {
  const [form, setForm] = useState({ photoDescription: '', shootConcept: '', mood: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (event) => {
    event.preventDefault()
    setError('')
    setResult('')
    setLoading(true)
    try {
      setResult(await generateCaption(form))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="grid gap-6 p-8 lg:grid-cols-2">
      <form className="kro-card space-y-4" onSubmit={handleGenerate}>
        <div className="flex items-center gap-3"><Sparkles color="#ef4444" /><h2 className="text-sm font-bold uppercase tracking-[0.12em] text-white">Caption Details</h2></div>
        <div><label className="kro-label">Photo Description</label><textarea className="kro-input" required rows={4} value={form.photoDescription} onChange={(e) => setForm({ ...form, photoDescription: e.target.value })} /></div>
        <div><label className="kro-label">Shoot Concept</label><textarea className="kro-input" required rows={4} value={form.shootConcept} onChange={(e) => setForm({ ...form, shootConcept: e.target.value })} /></div>
        <div><label className="kro-label">Mood</label><input className="kro-input" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} placeholder="Bold, editorial, intimate" /></div>
        {error && <ErrorBox message={error} />}
        <button className="kro-btn kro-btn-primary w-full justify-center" disabled={loading}><Sparkles size={14} /> {loading ? 'Generating...' : 'Generate Captions'}</button>
      </form>
      <OutputCard title="Generated Captions" result={result} onCopy={handleCopy} copied={copied} loading={loading} />
    </div>
  )
}

function NameTool() {
  const [form, setForm] = useState({ concept: '', mood: '', location: '', season: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (event) => {
    event.preventDefault()
    setError('')
    setResult('')
    setLoading(true)
    try {
      setResult(await generateShootName(form))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="grid gap-6 p-8 lg:grid-cols-2">
      <form className="kro-card space-y-4" onSubmit={handleGenerate}>
        <div className="flex items-center gap-3"><Wand2 color="#f59e0b" /><h2 className="text-sm font-bold uppercase tracking-[0.12em] text-white">Shoot Details</h2></div>
        <div><label className="kro-label">Concept</label><textarea className="kro-input" required rows={4} value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} /></div>
        <div><label className="kro-label">Mood</label><input className="kro-input" required value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className="kro-label">Location</label><input className="kro-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
          <div><label className="kro-label">Season</label><input className="kro-input" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} /></div>
        </div>
        {error && <ErrorBox message={error} />}
        <button className="kro-btn kro-btn-primary w-full justify-center" disabled={loading}><Wand2 size={14} /> {loading ? 'Generating...' : 'Generate Names'}</button>
      </form>
      <OutputCard title="Suggested Names" result={result} onCopy={handleCopy} copied={copied} loading={loading} />
    </div>
  )
}

function ErrorBox({ message }) {
  return <div className="flex items-center gap-2 rounded-md p-3 text-sm" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><AlertCircle size={15} /> {message}</div>
}

function OutputCard({ title, result, onCopy, copied, loading }) {
  return (
    <div className="kro-card">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-white">{title}</h2>
        {result && <button className="kro-btn kro-btn-ghost" onClick={onCopy}>{copied ? <Check size={14} /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}</button>}
      </div>
      {loading ? (
        <p style={{ color: '#94a3b8' }}>Claude is generating...</p>
      ) : result ? (
        <pre className="whitespace-pre-wrap rounded-md p-4 text-sm leading-6" style={{ background: '#0f172a', border: '1px solid #334155', color: '#f8fafc', fontFamily: 'Space Grotesk, sans-serif' }}>{result}</pre>
      ) : (
        <p className="py-16 text-center text-sm" style={{ color: '#475569' }}>Fill in the form to generate results.</p>
      )}
    </div>
  )
}
