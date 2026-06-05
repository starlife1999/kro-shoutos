import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Camera, MapPin, CalendarDays, Trash2, Search } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useShoots } from '../../hooks/useShoots'
import { useCampaigns } from '../../hooks/useCampaigns'
import { supabase } from '../../lib/supabase'

const EMPTY_FORM = { name: '', date: '', location: '', status: 'planning', notes: '', budget_total: '', campaign_id: '' }
const STATUS_FILTERS = ['all', 'planning', 'confirmed', 'in-progress', 'completed', 'cancelled']

export default function Shoots() {
  const { shoots, loading, refetch } = useShoots()
  const { campaigns } = useCampaigns()
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [saveError, setSaveError] = useState(null)


  const filtered = shoots.filter((s) => {
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.location || '').toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)
    try {
      const payload = {
        name: form.name,
        date: form.date,
        location: form.location,
        status: form.status,
        notes: form.notes,
        budget_total: parseFloat(form.budget_total) || 0,
        campaign_id: form.campaign_id || null,
      }
      const { error } = await supabase.from('shoots').insert(payload)
      if (error) throw error
      await refetch()
      setModalOpen(false)
      setForm(EMPTY_FORM)
    } catch (err) {
      setSaveError(err?.message || 'Failed to save shoot')
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this shoot?')) return
    await supabase.from('shoots').delete().eq('id', id)
    await refetch()
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—'

  return (
    <div>
      <PageHeader
        title="Shoots"
        subtitle={`${shoots.length} total shoot${shoots.length !== 1 ? 's' : ''}`}
        actions={
          <button onClick={() => setModalOpen(true)} className="kro-btn kro-btn-primary">
            <Plus size={14} /> New Shoot
          </button>
        }
      />

      <div className="p-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
            <input
              className="kro-input"
              style={{ paddingLeft: '2.25rem' }}
              placeholder="Search shoots..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="kro-btn"
                style={{
                  padding: '0.35rem 0.8rem',
                  background: statusFilter === s ? 'rgba(239,68,68,0.15)' : 'transparent',
                  color: statusFilter === s ? '#ef4444' : '#94a3b8',
                  border: `1px solid ${statusFilter === s ? 'rgba(239,68,68,0.3)' : '#334155'}`,
                  fontSize: '0.7rem',
                }}
              >
                {s === 'all' ? 'All' : s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading shoots...</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Camera}
            title="No Shoots Found"
            description={shoots.length === 0 ? "Create your first shoot to get started." : "No shoots match your current filters."}
            action={shoots.length === 0 && <button onClick={() => setModalOpen(true)} className="kro-btn kro-btn-primary"><Plus size={14} /> New Shoot</button>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map((s) => (
              <Link
                key={s.id}
                to={`/shoots/${s.id}`}
                className="kro-card flex items-center gap-4 group transition-colors"
                style={{ textDecoration: 'none' }}
              >
                <div
                  className="flex-shrink-0 flex items-center justify-center font-bold text-xs"
                  style={{ width: 48, height: 48, borderRadius: 10, background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
                >
                  <Camera size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-0.5">
                    <h3 className="font-bold text-white text-sm">{s.name}</h3>
                    <StatusBadge status={s.status} />
                    {s.campaigns?.name && (
                      <span className="kro-badge" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
                        {s.campaigns.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs" style={{ color: '#94a3b8' }}>
                    <span className="flex items-center gap-1"><CalendarDays size={11} /> {formatDate(s.date)}</span>
                    {s.location && <span className="flex items-center gap-1"><MapPin size={11} /> {s.location}</span>}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDelete(s.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg transition-all"
                  style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                >
                  <Trash2 size={14} />
                </button>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Shoot">
        {saveError && (
          <div className="kro-card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
            <p className="text-xs" style={{ color: '#ef4444' }}>{saveError}</p>
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-4">

          <div>
            <label className="kro-label">Shoot Name</label>
            <input className="kro-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Golden Hour Portrait Series" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="kro-label">Date</label>
              <input type="date" className="kro-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div>
              <label className="kro-label">Status</label>
              <select className="kro-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="planning">Planning</option>
                <option value="confirmed">Confirmed</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
          <div>
            <label className="kro-label">Location</label>
            <input className="kro-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Rooftop Studio, Downtown" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="kro-label">Budget Total ($)</label>
              <input type="number" className="kro-input" value={form.budget_total} onChange={(e) => setForm({ ...form, budget_total: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label className="kro-label">Campaign</label>
              <select className="kro-input" value={form.campaign_id} onChange={(e) => setForm({ ...form, campaign_id: e.target.value })}>
                <option value="">No Campaign</option>
                {campaigns.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="kro-label">Notes</label>
            <textarea className="kro-input" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Shoot notes, mood, concept..." style={{ resize: 'vertical' }} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="kro-btn kro-btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="kro-btn kro-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Create Shoot'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
