import React, { useState } from 'react'
import { Wand2, Copy, Check, AlertCircle, RefreshCw } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import { generateShootName } from '../../lib/anthropic'

export default function AIShootNames() {
  const [form, setForm] = useState({ concept: '', mood: '', location: '', season: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!form.concept || !form.mood) { setError('Please fill in concept and mood.') ; return }
    setError('') ; setLoading(true) ; setResult('')
    try {
      const text = await generateShootName(form)
      setResult(text)
    } catch (err) { setError('API error: ' + err.message) }
    finally { setLoading(false) }
  }

  const names = result
    .split('\n')
    .map((l) => l.replace(/^\d+\.\s*/, '').trim())
    .filter(Boolean)

  const copyName = (name, i) => {
    navigator.clipboard.writeText(name)
    setCopied(i) ; setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div>
      <PageHeader title="AI Shoot Name Generator" subtitle="Get creative shoot name suggestions with Claude AI" />
      <div className="p-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Input */}
          <div className="kro-card">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}><Wand2 size={18} /></div>
              <h2 className="font-bold text-white text-sm uppercase" style={{ letterSpacing: '0.08em' }}>Shoot Details</h2>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="kro-label">Shoot Concept *</label>
                <textarea className="kro-input" rows={4} required value={form.concept} onChange={(e) => setForm({ ...form, concept: e.target.value })} placeholder="Describe the concept — fashion editorial, portrait, product, documentary..." style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="kro-label">Mood / Vibe *</label>
                <input className="kro-input" required value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} placeholder="e.g. Dark romantic, minimal luxury, urban grit..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="kro-label">Location (Optional)</label>
                  <input className="kro-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Desert, Rooftop, Studio" />
                </div>
                <div>
                  <label className="kro-label">Season (Optional)</label>
                  <input className="kro-input" value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} placeholder="e.g. Summer, Winter" />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  <AlertCircle size={14} /><p className="text-xs">{error}</p>
                </div>
              )}
              <button type="submit" className="kro-btn kro-btn-primary w-full justify-center" disabled={loading}>
                <Wand2 size={14} /> {loading ? 'Generating...' : 'Generate Names'}
              </button>
            </form>
          </div>

          {/* Output */}
          <div className="kro-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white text-sm uppercase" style={{ letterSpacing: '0.08em' }}>Suggested Names</h2>
              {result && <button onClick={handleGenerate} className="kro-btn kro-btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}><RefreshCw size={12} /> Regenerate</button>}
            </div>
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2" style={{ borderColor: '#334155', borderTopColor: '#f59e0b', animation: 'spin 0.8s linear infinite' }} />
                <p className="text-sm" style={{ color: '#94a3b8' }}>Claude is brainstorming names...</p>
              </div>
            )}
            {!loading && !result && (
              <div className="flex flex-col items-center justify-center py-16">
                <Wand2 size={32} style={{ color: '#334155', marginBottom: 12 }} />
                <p className="text-sm" style={{ color: '#475569' }}>Fill in the details to generate shoot names</p>
              </div>
            )}
            {!loading && names.length > 0 && (
              <div className="space-y-2">
                {names.map((name, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl group" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                    <p className="font-bold text-white text-base">{name}</p>
                    <button onClick={() => copyName(name, i)} className="kro-btn kro-btn-ghost opacity-0 group-hover:opacity-100" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
                      {copied === i ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
