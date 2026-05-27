import React, { useState, useEffect } from 'react'
import { Plus, Palette, Trash2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import { useTable } from '../../hooks/useTable'
import { supabase } from '../../lib/supabase'

export default function ColorPalette() {
  const [shoots, setShoots] = useState([])
  const [shootId, setShootId] = useState('')
  const { data: palettes, insert, remove } = useTable('color_palettes', shootId ? { shoot_id: shootId } : {})
  const [newColor, setNewColor] = useState('#ef4444')
  const [draft, setDraft] = useState([])
  const [paletteName, setPaletteName] = useState('')

  useEffect(() => {
    supabase.from('shoots').select('id, name').order('date', { ascending: false }).then(({ data }) => setShoots(data || []))
  }, [])

  const addToDraft = () => { if (!draft.includes(newColor)) setDraft([...draft, newColor]) }
  const removeFromDraft = (c) => setDraft(draft.filter((x) => x !== c))

  const savePalette = async () => {
    if (!draft.length) return
    await insert({ shoot_id: shootId || null, colors: draft })
    setDraft([]) ; setPaletteName('')
  }

  return (
    <div>
      <PageHeader title="Color Palette" subtitle="Pick and save hex color palettes per shoot"
        actions={
          <select className="kro-input" style={{ width: 220 }} value={shootId} onChange={(e) => setShootId(e.target.value)}>
            <option value="">All Shoots</option>
            {shoots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        }
      />
      <div className="p-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Color Picker */}
          <div className="kro-card">
            <h3 className="font-bold text-white text-sm uppercase mb-4" style={{ letterSpacing: '0.08em' }}>Build Palette</h3>
            <div className="flex flex-col items-center gap-4 mb-4">
              <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-full h-32 rounded-xl cursor-pointer" style={{ border: '1px solid #334155', background: 'none' }} />
              <div className="flex gap-2 w-full">
                <input className="kro-input flex-1 font-mono" value={newColor} onChange={(e) => setNewColor(e.target.value)} />
                <button onClick={addToDraft} className="kro-btn kro-btn-primary"><Plus size={14} /></button>
              </div>
            </div>
            {draft.length > 0 && (
              <div>
                <p className="kro-label mb-2">Draft Palette</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {draft.map((c) => (
                    <div key={c} className="group flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: '#0f172a' }}>
                      <div className="w-5 h-5 rounded" style={{ background: c }} />
                      <span className="font-mono text-xs" style={{ color: '#94a3b8' }}>{c}</span>
                      <button onClick={() => removeFromDraft(c)} className="opacity-0 group-hover:opacity-100 text-xs" style={{ color: '#ef4444' }}>✕</button>
                    </div>
                  ))}
                </div>
                <button onClick={savePalette} className="kro-btn kro-btn-primary w-full justify-center"><Palette size={14} /> Save Palette</button>
              </div>
            )}
          </div>

          {/* Saved Palettes */}
          <div className="col-span-2">
            {palettes.length === 0 ? (
              <EmptyState icon={Palette} title="No Palettes Saved" description="Build and save color palettes for your shoots." />
            ) : (
              <div className="space-y-4">
                {palettes.map((p) => (
                  <div key={p.id} className="kro-card group">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs" style={{ color: '#475569' }}>{new Date(p.created_at).toLocaleDateString()}</p>
                      <button onClick={() => remove(p.id)} className="opacity-0 group-hover:opacity-100" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      {(Array.isArray(p.colors) ? p.colors : []).map((c, i) => (
                        <div key={i} className="flex flex-col items-center gap-1">
                          <div className="w-12 h-12 rounded-xl" style={{ background: c, border: '1px solid #334155' }} />
                          <span className="font-mono text-xs" style={{ color: '#475569' }}>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
