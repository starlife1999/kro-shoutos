import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Megaphone, Camera, Trash2, Edit2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useCampaigns } from '../../hooks/useCampaigns'
import { supabase } from '../../lib/supabase'

const EMPTY_FORM = { name: '', description: '', start_date: '', end_date: '', status: 'planning' }

export default function Campaigns() {
  const { campaigns, loading, refetch } = useCampaigns()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, description: c.description || '', start_date: c.start_date || '', end_date: c.end_date || '', status: c.status }); setModalOpen(true) }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (editing) {
        await supabase.from('campaigns').update(form).eq('id', editing.id)
      } else {
        await supabase.from('campaigns').insert(form)
      }
      await refetch()
      setModalOpen(false)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this campaign?')) return
    await supabase.from('campaigns').delete().eq('id', id)
    await refetch()
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  return (
    <div>
      <PageHeader
        title="Campaigns"
        subtitle="Manage your photography campaigns"
        actions={
          <button onClick={openCreate} className="kro-btn kro-btn-primary">
            <Plus size={14} /> New Campaign
          </button>
        }
      />

      <div className="p-8">
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No Campaigns Yet"
            description="Create your first campaign to group related shoots together."
            action={<button onClick={openCreate} className="kro-btn kro-btn-primary"><Plus size={14} /> New Campaign</button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {campaigns.map((c) => (
              <div key={c.id} className="kro-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-white" style={{ fontSize: '1rem' }}>{c.name}</h3>
                      <StatusBadge status={c.status} />
                    </div>
                    {c.description && <p className="text-sm mb-2" style={{ color: '#94a3b8' }}>{c.description}</p>}
                    <p className="text-xs" style={{ color: '#475569' }}>
                      {formatDate(c.start_date)} — {formatDate(c.end_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button onClick={() => openEdit(c)} className="kro-btn kro-btn-ghost" style={{ padding: '0.35rem 0.6rem' }}>
                      <Edit2 size={13} />
                    </button>
                    <button onClick={() => handleDelete(c.id)} className="kro-btn" style={{ padding: '0.35rem 0.6rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Shoots in this campaign */}
                {c.shoots && c.shoots.length > 0 && (
                  <div style={{ borderTop: '1px solid #334155', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                    <p className="kro-label mb-2">Shoots ({c.shoots.length})</p>
                    <div className="flex flex-wrap gap-2">
                      {c.shoots.map((s) => (
                        <Link
                          key={s.id}
                          to={`/shoots/${s.id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                          style={{ background: '#0f172a', color: '#f8fafc', border: '1px solid #334155' }}
                        >
                          <Camera size={11} />
                          {s.name}
                          <StatusBadge status={s.status} />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Campaign' : 'New Campaign'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="kro-label">Campaign Name</label>
            <input className="kro-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Summer Collection 2024" />
          </div>
          <div>
            <label className="kro-label">Description</label>
            <textarea className="kro-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Campaign overview..." style={{ resize: 'vertical' }} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="kro-label">Start Date</label>
              <input type="date" className="kro-input" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            </div>
            <div>
              <label className="kro-label">End Date</label>
              <input type="date" className="kro-input" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="kro-label">Status</label>
            <select className="kro-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="planning">Planning</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="kro-btn kro-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="kro-btn kro-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Campaign'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
