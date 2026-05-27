import React, { useState, useEffect } from 'react'
import { Plus, Shirt, Trash2, Upload } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useTable } from '../../hooks/useTable'
import { supabase, uploadFile } from '../../lib/supabase'

export default function Outfits() {
  const [shoots, setShoots] = useState([])
  const [shootId, setShootId] = useState('')
  const { data: outfits, insert, remove } = useTable('outfits', shootId ? { shoot_id: shootId } : {})
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', notes: '' })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('shoots').select('id, name').order('date', { ascending: false }).then(({ data }) => setShoots(data || []))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let image_url = ''
      if (imageFile && shootId) {
        const path = `${shootId}/${Date.now()}-${imageFile.name}`
        image_url = await uploadFile('outfits', path, imageFile)
      }
      await insert({ shoot_id: shootId || null, ...form, image_url })
      setModal(false) ; setForm({ name: '', description: '', notes: '' }) ; setImageFile(null)
    } finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader title="Outfits" subtitle="Outfit cards by shoot"
        actions={
          <div className="flex items-center gap-3">
            <select className="kro-input" style={{ width: 200 }} value={shootId} onChange={(e) => setShootId(e.target.value)}>
              <option value="">All Shoots</option>
              {shoots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button onClick={() => setModal(true)} className="kro-btn kro-btn-primary"><Plus size={14} /> Add Outfit</button>
          </div>
        }
      />
      <div className="p-8">
        {outfits.length === 0 ? (
          <EmptyState icon={Shirt} title="No Outfits" description="Add outfit cards to track looks for each shoot." action={<button onClick={() => setModal(true)} className="kro-btn kro-btn-primary"><Plus size={14} /> Add Outfit</button>} />
        ) : (
          <div className="grid grid-cols-4 gap-4">
            {outfits.map((o) => (
              <div key={o.id} className="kro-card group">
                {o.image_url ? (
                  <img src={o.image_url} alt={o.name} className="w-full h-48 object-cover rounded-lg mb-3" />
                ) : (
                  <div className="w-full h-48 rounded-lg mb-3 flex items-center justify-center" style={{ background: '#0f172a' }}><Shirt size={36} style={{ color: '#334155' }} /></div>
                )}
                <h3 className="font-bold text-white text-sm mb-0.5">{o.name}</h3>
                {o.description && <p className="text-xs" style={{ color: '#94a3b8' }}>{o.description}</p>}
                {o.notes && <p className="text-xs mt-1" style={{ color: '#475569' }}>{o.notes}</p>}
                <button onClick={() => remove(o.id)} className="mt-2 text-xs flex items-center gap-1 opacity-0 group-hover:opacity-100" style={{ color: '#ef4444' }}><Trash2 size={11} /> Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
      <Modal open={modal} onClose={() => setModal(false)} title="Add Outfit">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="kro-label">Shoot</label>
            <select className="kro-input" value={shootId} onChange={(e) => setShootId(e.target.value)}>
              <option value="">No Shoot</option>
              {shoots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div><label className="kro-label">Name</label><input className="kro-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Look 1 — Red Dress" /></div>
          <div><label className="kro-label">Description</label><input className="kro-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className="kro-label">Notes</label><textarea className="kro-input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <div><label className="kro-label">Image</label><input type="file" accept="image/*" className="kro-input" onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></div>
          <div className="flex justify-end gap-3"><button type="button" className="kro-btn kro-btn-ghost" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="kro-btn kro-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Outfit'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
