import React, { useState } from 'react'
import { MapPin, Plus, Trash2, Upload } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useTable } from '../../hooks/useTable'
import { uploadFile } from '../../lib/supabase'

const EMPTY_FORM = { name: '', address: '', notes: '', last_used: '' }

export default function Locations() {
  const { data: locations, loading, insert, remove } = useTable('locations')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      let image_url = ''
      if (imageFile) {
        image_url = await uploadFile('locations', `${Date.now()}-${imageFile.name}`, imageFile)
      }
      await insert({ ...form, image_url, last_used: form.last_used || null })
      setForm(EMPTY_FORM)
      setImageFile(null)
      setModal(false)
    } catch (error) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Studio, street, and set archive for future shoots"
        actions={<button className="kro-btn kro-btn-primary" onClick={() => setModal(true)}><Plus size={14} /> Add Location</button>}
      />
      <div className="p-8">
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading locations...</p>
        ) : locations.length === 0 ? (
          <EmptyState icon={MapPin} title="No Locations" description="Save shoot locations with address and scouting notes." action={<button className="kro-btn kro-btn-primary" onClick={() => setModal(true)}><Plus size={14} /> Add Location</button>} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {locations.map((location) => (
              <article className="kro-card group" key={location.id}>
                {location.image_url ? (
                  <img src={location.image_url} alt={location.name} className="mb-4 h-40 w-full rounded-md object-cover" />
                ) : (
                  <div className="mb-4 flex h-40 items-center justify-center rounded-md" style={{ background: '#0f172a', color: '#334155' }}>
                    <MapPin size={34} />
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-bold text-white">{location.name}</h2>
                    {location.address && <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>{location.address}</p>}
                  </div>
                  <button onClick={() => remove(location.id)} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: '#ef4444' }} aria-label="Delete location">
                    <Trash2 size={15} />
                  </button>
                </div>
                {location.notes && <p className="mt-3 text-sm leading-6" style={{ color: '#94a3b8' }}>{location.notes}</p>}
                {location.last_used && <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em]" style={{ color: '#475569' }}>Last used {new Date(location.last_used).toLocaleDateString()}</p>}
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Location">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="kro-label">Name</label><input className="kro-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rooftop Studio" /></div>
          <div><label className="kro-label">Address</label><input className="kro-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, city" /></div>
          <div><label className="kro-label">Last Used</label><input type="date" className="kro-input" value={form.last_used} onChange={(e) => setForm({ ...form, last_used: e.target.value })} /></div>
          <div><label className="kro-label">Notes</label><textarea className="kro-input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <div><label className="kro-label">Image</label><input className="kro-input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} /></div>
          <div className="flex justify-end gap-3"><button type="button" className="kro-btn kro-btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="kro-btn kro-btn-primary" disabled={saving}><Upload size={14} /> {saving ? 'Saving...' : 'Save Location'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
