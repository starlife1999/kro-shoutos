import React, { useState } from 'react'
import { MapPin, Plus, Trash2, Upload } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useTable } from '../../hooks/useTable'

const EMPTY_FORM = { name: '', address: '', notes: '' }

function ErrorNotice({ message }) {
  if (!message) return null
  return (
    <div className="kro-card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
      <p className="text-xs" style={{ color: '#ef4444' }}>{message}</p>
    </div>
  )
}


export default function Locations() {
  const { data: locations, loading, insert, remove, saveError, deleteError, setSaveError, setDeleteError } = useTable('locations')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      name: form.name,
      address: form.address,
      notes: form.notes,
    }

    console.log('[Locations] insert payload:', payload)

    try {
      if (form.__TRIGGER_BAD_SAVE) {
        const badPayload = { ...payload, address: null }
        console.log('[Locations] BAD insert payload:', badPayload)
        await insert(badPayload)
      } else {
        await insert(payload)
      }

      setForm(EMPTY_FORM)
      setModal(false)
    } catch (error) {
      setSaveError(error.message)
    } finally {
      setSaving(false)
    }
  }


  const handleDelete = async (id) => {
    try {
      await remove(id)
    } catch (error) {
      setDeleteError(error.message)
    }
  }

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Studio, street, and set archive for future shoots"
        actions={<button className="kro-btn kro-btn-primary" onClick={() => { setSaveError(null); setModal(true) }}><Plus size={14} /> Add Location</button>}
      />
      <div className="p-8">
        <div className="mb-4"><ErrorNotice message={deleteError} /></div>
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
                  <button onClick={() => handleDelete(location.id)} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: '#ef4444' }} aria-label="Delete location">
                    <Trash2 size={15} />
                  </button>
                </div>
                {location.notes && <p className="mt-3 text-sm leading-6" style={{ color: '#94a3b8' }}>{location.notes}</p>}
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Location">
        <form onSubmit={handleSave} className="space-y-4">
          <ErrorNotice message={saveError} />
          <div className="flex justify-end">
            <button
              type="button"
              className="kro-btn"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
              onClick={() => setForm({ ...form, __TRIGGER_BAD_SAVE: true })}
            >
              Trigger Failed Save
            </button>
          </div>
          <div><label className="kro-label">Name</label><input className="kro-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rooftop Studio" /></div>

          <div><label className="kro-label">Address</label><input className="kro-input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, city" /></div>
          <div><label className="kro-label">Notes</label><textarea className="kro-input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <div className="flex justify-end gap-3"><button type="button" className="kro-btn kro-btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="kro-btn kro-btn-primary" disabled={saving}><Upload size={14} /> {saving ? 'Saving...' : 'Save Location'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
