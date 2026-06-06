import React, { useState } from 'react'
import { Mail, Phone, Plus, Trash2, Users } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useTable } from '../../hooks/useTable'

const EMPTY_FORM = { name: '', role: '', phone: '', email: '', notes: '' }

function ErrorCard({ message }) {
  if (!message) return null
  return (
    <div className="kro-card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
      <p className="text-xs" style={{ color: '#ef4444' }}>{message}</p>
    </div>
  )
}


function ErrorNotice({ message }) {
  if (!message) return null
  return (
    <div className="kro-card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
      <p className="text-xs" style={{ color: '#ef4444' }}>{message}</p>
    </div>
  )
}


export default function Team() {
  const { data: team, loading, insert, remove, saveError, deleteError, setSaveError, setDeleteError } = useTable('team')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      name: form.name,
      role: form.role,
      phone: form.phone,
      email: form.email,
      notes: form.notes,
    }

    // Evidence: show exact payload being sent
    console.log('[Team] insert payload:', payload)

    try {
      // Optional verification mode: intentionally invalid email to trigger save failure
      // (Used when the UI sets form.__TRIGGER_BAD_SAVE)
      if (form.__TRIGGER_BAD_SAVE) {
        const badPayload = { ...payload, email: '' }
        console.log('[Team] BAD insert payload:', badPayload)
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
      <PageHeader title="Team" subtitle="Crew, talent, and production contacts" actions={<button className="kro-btn kro-btn-primary" onClick={() => { setSaveError(null); setModal(true) }}><Plus size={14} /> Add Member</button>} />
      <div className="p-8">
        <div className="mb-4"><ErrorNotice message={deleteError} /></div>
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading team...</p>
        ) : team.length === 0 ? (
          <EmptyState icon={Users} title="No Team Members" description="Add contacts for production crews, talent, and vendors." action={<button className="kro-btn kro-btn-primary" onClick={() => setModal(true)}><Plus size={14} /> Add Member</button>} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {team.map((member) => (
              <article className="kro-card group" key={member.id}>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md text-sm font-bold text-white" style={{ background: '#ef4444' }}>
                      {member.name?.slice(0, 1) || 'K'}
                    </div>
                    <div>
                      <h2 className="font-bold text-white">{member.name}</h2>
                      <p className="text-sm" style={{ color: '#94a3b8' }}>{member.role || 'Crew'}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(member.id)} className="opacity-0 transition-opacity group-hover:opacity-100" style={{ color: '#ef4444' }} aria-label="Delete team member"><Trash2 size={15} /></button>
                </div>
                <div className="space-y-2 text-sm" style={{ color: '#94a3b8' }}>
                  {member.phone && <p className="flex items-center gap-2"><Phone size={14} /> {member.phone}</p>}
                  {member.email && <p className="flex items-center gap-2"><Mail size={14} /> {member.email}</p>}
                </div>
                {member.notes && <p className="mt-4 text-sm leading-6" style={{ color: '#94a3b8' }}>{member.notes}</p>}
              </article>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Team Member">
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
          <div><label className="kro-label">Name</label><input className="kro-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>

          <div><label className="kro-label">Role</label><input className="kro-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Photographer, stylist, model" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="kro-label">Phone</label><input className="kro-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div><label className="kro-label">Email</label><input type="email" className="kro-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div><label className="kro-label">Notes</label><textarea className="kro-input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <div className="flex justify-end gap-3"><button type="button" className="kro-btn kro-btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="kro-btn kro-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Member'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
