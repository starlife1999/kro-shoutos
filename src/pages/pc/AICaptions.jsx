import React, { useState, useEffect } from 'react'
import { Sparkles, Copy, Check, AlertCircle } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import { generateCaption } from '../../lib/anthropic'
import { supabase } from '../../lib/supabase'

export default function AICaptions() {
  const [shoots, setShoots] = useState([])
  const [form, setForm] = useState({ photoDescription: '', shootConcept: '', mood: '', shootId: '' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.from('shoots').select('id, name, notes').order('date', { ascending: false }).then(({ data }) => setShoots(data || []))
  }, [])

  const handleShootSelect = (id) => {
    const shoot = shoots.find((s) => s.id === id)
    setForm({ ...form, shootId: id, shootConcept: shoot?.notes || form.shootConcept })
  }

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!form.photoDescription || !form.shootConcept) { setError('Please fill in photo description and shoot concept.') ; return }
    setError('') ; setLoading(true) ; setResult('')
    try {
      const text = await generateCaption(form)
      setResult(text)
    } catch (err) { setError('API error: ' + err.message) }
    finally { setLoading(false) }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result)
    setCopied(true) ; setTimeout(() => setCopied(false), 2000)
  }

  const captions = result.split('---').map((c) => c.trim()).filter(Boolean)

  return (
    <div>
      <PageHeader title="AI Caption Generator" subtitle="Generate Instagram captions with Claude AI" />
      <div className="p-8">
        <div className="grid grid-cols-2 gap-6">
          {/* Input */}
          <div className="kro-card">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex items-center justify-center" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}><Sparkles size={18} /></div>
              <h2 className="font-bold text-white text-sm uppercase" style={{ letterSpacing: '0.08em' }}>Caption Details</h2>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="kro-label">Shoot (Optional)</label>
                <select className="kro-input" value={form.shootId} onChange={(e) => handleShootSelect(e.target.value)}>
                  <option value="">No shoot selected</option>
                  {shoots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="kro-label">Photo Description *</label>
                <textarea className="kro-input" rows={4} required value={form.photoDescription} onChange={(e) => setForm({ ...form, photoDescription: e.target.value })} placeholder="Describe what's in the photo — subject, pose, lighting, setting, colors..." style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="kro-label">Shoot Concept / Brief *</label>
                <textarea className="kro-input" rows={3} required value={form.shootConcept} onChange={(e) => setForm({ ...form, shootConcept: e.target.value })} placeholder="The overall concept or theme of the shoot..." style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label className="kro-label">Mood / Vibe (Optional)</label>
                <input className="kro-input" value={form.mood} onChange={(e) => setForm({ ...form, mood: e.target.value })} placeholder="e.g. Bold, editorial, intimate, raw..." />
              </div>
              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  <AlertCircle size={14} /> <p className="text-xs">{error}</p>
                </div>
              )}
              <button type="submit" className="kro-btn kro-btn-primary w-full justify-center" disabled={loading}>
                <Sparkles size={14} /> {loading ? 'Generating...' : 'Generate Captions'}
              </button>
            </form>
          </div>

          {/* Output */}
          <div className="kro-card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-white text-sm uppercase" style={{ letterSpacing: '0.08em' }}>Generated Captions</h2>
              {result && (
                <button onClick={handleCopy} className="kro-btn kro-btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}>
                  {copied ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy All</>}
                </button>
              )}
            </div>
            {loading && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-red-500" style={{ borderColor: '#334155', borderTopColor: '#ef4444', animation: 'spin 0.8s linear infinite' }} />
                <p className="text-sm" style={{ color: '#94a3b8' }}>Claude is writing your captions...</p>
              </div>
            )}
            {!loading && !result && (
              <div className="flex flex-col items-center justify-center py-16">
                <Sparkles size={32} style={{ color: '#334155', marginBottom: 12 }} />
                <p className="text-sm" style={{ color: '#475569' }}>Fill in the form and generate captions</p>
              </div>
            )}
            {!loading && captions.length > 0 && (
              <div className="space-y-4">
                {captions.map((caption, i) => (
                  <div key={i} className="p-4 rounded-xl" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="kro-badge" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>Option {i + 1}</span>
                      <button onClick={() => { navigator.clipboard.writeText(caption) }} className="text-xs" style={{ color: '#94a3b8' }}>Copy</button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap" style={{ color: '#f8fafc', lineHeight: 1.6 }}>{caption}</p>
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
