import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Camera, MapPin, CalendarDays, Plus, CheckCircle2, Circle, Trash2, Upload, DollarSign, Users, Image, Shirt, Palette } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import Modal from '../../components/ui/Modal'
import EmptyState from '../../components/ui/EmptyState'
import { useShoot } from '../../hooks/useShoots'
import { useTable } from '../../hooks/useTable'
import { supabase, uploadFile } from '../../lib/supabase'

const TABS = ['Overview', 'Shot List', 'Outfits', 'Mood Board', 'Team', 'Budget', 'Raw Photos', 'Color Palette']

export default function ShootDetail() {
  const { id } = useParams()
  const { shoot, loading, refetch: refetchShoot } = useShoot(id)
  const [activeTab, setActiveTab] = useState('Overview')

  if (loading) return <div className="p-8" style={{ color: '#94a3b8' }}>Loading shoot...</div>
  if (!shoot) return <div className="p-8" style={{ color: '#94a3b8' }}>Shoot not found.</div>

  return (
    <div>
      {/* Header */}
      <div className="px-8 py-6" style={{ borderBottom: '1px solid #334155' }}>
        <Link to="/shoots" className="flex items-center gap-2 text-xs font-semibold mb-4 w-fit" style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <ArrowLeft size={12} /> Back to Shoots
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-bold text-white" style={{ fontSize: '1.5rem' }}>{shoot.name}</h1>
              <StatusBadge status={shoot.status} />
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: '#94a3b8' }}>
              {shoot.date && <span className="flex items-center gap-1"><CalendarDays size={11} /> {new Date(shoot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>}
              {shoot.location && <span className="flex items-center gap-1"><MapPin size={11} /> {shoot.location}</span>}
              {shoot.campaigns?.name && <span className="flex items-center gap-1">📁 {shoot.campaigns.name}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: '#334155', background: '#080d18' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`kro-tab flex-shrink-0 ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {activeTab === 'Overview' && <OverviewTab shoot={shoot} refetch={refetchShoot} />}
        {activeTab === 'Shot List' && <ShotListTab shootId={id} />}
        {activeTab === 'Outfits' && <OutfitsTab shootId={id} />}
        {activeTab === 'Mood Board' && <MoodBoardTab shootId={id} />}
        {activeTab === 'Team' && <TeamTab shootId={id} />}
        {activeTab === 'Budget' && <BudgetTab shootId={id} />}
        {activeTab === 'Raw Photos' && <RawPhotosTab shootId={id} />}
        {activeTab === 'Color Palette' && <ColorPaletteTab shootId={id} />}
      </div>
    </div>
  )
}

function OverviewTab({ shoot, refetch }) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: shoot.name, date: shoot.date || '', location: shoot.location || '', status: shoot.status, notes: shoot.notes || '', budget_total: shoot.budget_total || '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await supabase.from('shoots').update({ ...form, budget_total: parseFloat(form.budget_total) || 0 }).eq('id', shoot.id)
      await refetch()
      setEditing(false)
    } finally { setSaving(false) }
  }

  if (editing) return (
    <form onSubmit={handleSave} className="max-w-lg space-y-4">
      <div><label className="kro-label">Name</label><input className="kro-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="kro-label">Date</label><input type="date" className="kro-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
        <div><label className="kro-label">Status</label>
          <select className="kro-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            {['planned','in progress','done'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div><label className="kro-label">Location</label><input className="kro-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
      <div><label className="kro-label">Budget Total ($)</label><input type="number" className="kro-input" value={form.budget_total} onChange={(e) => setForm({ ...form, budget_total: e.target.value })} /></div>
      <div><label className="kro-label">Notes</label><textarea className="kro-input" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} /></div>
      <div className="flex gap-3">
        <button type="submit" className="kro-btn kro-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
        <button type="button" className="kro-btn kro-btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </form>
  )

  return (
    <div className="max-w-2xl">
      <div className="kro-card mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="font-bold text-white text-sm uppercase" style={{ letterSpacing: '0.08em' }}>Shoot Details</h2>
          <button className="kro-btn kro-btn-ghost" style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }} onClick={() => setEditing(true)}>Edit</button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[['Date', shoot.date ? new Date(shoot.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set'],
            ['Location', shoot.location || 'Not set'],
            ['Budget', shoot.budget_total ? `$${parseFloat(shoot.budget_total).toLocaleString()}` : 'Not set'],
            ['Status', <StatusBadge status={shoot.status} />]
          ].map(([label, value]) => (
            <div key={label}>
              <p className="kro-label">{label}</p>
              <p className="text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>
        {shoot.notes && (
          <div className="mt-4" style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
            <p className="kro-label mb-1">Notes</p>
            <p className="text-sm" style={{ color: '#94a3b8', whiteSpace: 'pre-wrap' }}>{shoot.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ShotListTab({ shootId }) {
  const { data: shots, insert, update, remove } = useTable('shot_list', { shoot_id: shootId })
  const [newItem, setNewItem] = useState('')
  const [adding, setAdding] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setAdding(true)
    try { await insert({ shoot_id: shootId, description: newItem.trim(), is_done: false }) ; setNewItem('') }
    finally { setAdding(false) }
  }

  const toggleDone = (shot) => update(shot.id, { is_done: !shot.is_done })

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input className="kro-input flex-1" placeholder="Add shot description..." value={newItem} onChange={(e) => setNewItem(e.target.value)} />
        <button type="submit" className="kro-btn kro-btn-primary" disabled={adding}><Plus size={14} /> Add Shot</button>
      </form>
      {shots.length === 0 ? (
        <EmptyState icon={Camera} title="No Shots Yet" description="Add shots to your shot list." />
      ) : (
        <div className="space-y-2">
          {shots.map((shot) => (
            <div key={shot.id} className="kro-card flex items-center gap-3" style={{ padding: '0.75rem 1rem' }}>
              <button onClick={() => toggleDone(shot)} style={{ color: shot.is_done ? '#22c55e' : '#475569', flexShrink: 0 }}>
                {shot.is_done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              <Link
                to={`/shots/shoot/${shot.id}`}
                style={{ flex: 1, color: shot.is_done ? '#64748b' : '#f8fafc', textDecoration: shot.is_done ? 'line-through' : 'none', fontSize: 15 }}
                onClick={(e) => e.stopPropagation()}
              >
                {shot.description}
              </Link>
              <button onClick={() => remove(shot.id)} style={{ color: '#ef4444', opacity: 0.6 }} className="hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <p className="text-xs mt-3" style={{ color: '#475569' }}>
            {shots.filter((s) => s.is_done).length} / {shots.length} completed
          </p>
        </div>
      )}
    </div>
  )
}

function OutfitsTab({ shootId }) {
  const { data: outfits, insert, remove } = useTable('outfits', { shoot_id: shootId })
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try { await insert({ shoot_id: shootId, ...form }) ; setModal(false) ; setForm({ name: '', description: '', notes: '' }) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={() => setModal(true)} className="kro-btn kro-btn-primary"><Plus size={14} /> Add Outfit</button>
      </div>
      {outfits.length === 0 ? <EmptyState icon={Shirt} title="No Outfits" description="Add outfits for this shoot." /> : (
        <div className="grid grid-cols-3 gap-4">
          {outfits.map((o) => (
            <div key={o.id} className="kro-card group">
              {o.image_url ? <img src={o.image_url} alt={o.name} className="w-full h-40 object-cover rounded-lg mb-3" /> : (
                <div className="w-full h-40 rounded-lg mb-3 flex items-center justify-center" style={{ background: '#0f172a', color: '#334155' }}><Shirt size={32} /></div>
              )}
              <p className="font-bold text-white text-sm">{o.name}</p>
              {o.description && <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{o.description}</p>}
              {o.notes && <p className="text-xs mt-1" style={{ color: '#475569' }}>{o.notes}</p>}
              <button onClick={() => remove(o.id)} className="mt-2 opacity-0 group-hover:opacity-100 text-xs flex items-center gap-1" style={{ color: '#ef4444' }}><Trash2 size={11} /> Remove</button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Outfit">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="kro-label">Name</label><input className="kro-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Look 1 — Red Dress" /></div>
          <div><label className="kro-label">Description</label><input className="kro-input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description" /></div>
          <div><label className="kro-label">Notes</label><textarea className="kro-input" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ resize: 'vertical' }} /></div>
          <div className="flex justify-end gap-3"><button type="button" className="kro-btn kro-btn-ghost" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="kro-btn kro-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Outfit'}</button></div>
        </form>
      </Modal>
    </div>
  )
}

function MoodBoardTab({ shootId }) {
  const { data: items, insert, remove } = useTable('mood_board', { shoot_id: shootId })
  const [uploading, setUploading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `${shootId}/${Date.now()}-${file.name}`
      const url = await uploadFile('mood-board', path, file)
      await insert({ shoot_id: shootId, image_url: url })
    } catch (err) { alert('Upload failed: ' + err.message) }
    finally { setUploading(false) ; e.target.value = '' }
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <label className="kro-btn kro-btn-primary cursor-pointer">
          <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      {items.length === 0 ? <EmptyState icon={Image} title="No Mood Board Images" description="Upload reference images for this shoot." /> : (
        <div className="grid grid-cols-4 gap-3">
          {items.map((item, index) => (
            <div key={item.id} className="group relative">
              <img
                src={item.image_url}
                alt=""
                className="w-full h-40 object-cover rounded-xl"
                style={{ border: '1px solid #334155', cursor: 'pointer' }}
                onClick={() => setLightboxIndex(index)}
              />
              <button
                onClick={() => remove(item.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#ef4444' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.93)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => Math.max(0, i - 1)) }}
            style={{ position: 'absolute', left: 20, background: 'none', border: 'none', color: '#fff', fontSize: 48, cursor: 'pointer', lineHeight: 1 }}
          >
            ‹
          </button>

          <img
            src={items[lightboxIndex]?.image_url}
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }}
          />

          <button
            onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => Math.min(items.length - 1, i + 1)) }}
            style={{ position: 'absolute', right: 20, background: 'none', border: 'none', color: '#fff', fontSize: 48, cursor: 'pointer', lineHeight: 1 }}
          >
            ›
          </button>

          <div style={{ position: 'absolute', bottom: 20, color: '#94a3b8', fontSize: 14 }}>
            {lightboxIndex + 1} of {items.length}
          </div>

          <button
            onClick={() => setLightboxIndex(null)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

function TeamTab({ shootId }) {
  const { data: shootTeam, insert, remove, saveError, deleteError, setSaveError, setDeleteError } = useTable('shoot_team', { shoot_id: shootId }, '*, team(name, role, phone, email)')
  const [allTeam, setAllTeam] = useState([])
  const [modal, setModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState('')

  const ErrorCard = ({ message }) => {
    if (!message) return null
    return (
      <div className="kro-card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
        <p className="text-xs" style={{ color: '#ef4444' }}>{message}</p>
      </div>
    )
  }


  React.useEffect(() => {
    supabase.from('team').select('*').then(({ data }) => setAllTeam(data || []))
  }, [])

  const handleAdd = async () => {
    if (!selectedMember) return
    await insert({ shoot_id: shootId, team_id: selectedMember })
    setModal(false) ; setSelectedMember('')
  }

  const assignedIds = shootTeam.map((st) => st.team_id)
  const available = allTeam.filter((m) => !assignedIds.includes(m.id))

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={() => setModal(true)} className="kro-btn kro-btn-primary"><Plus size={14} /> Add Team Member</button>
      </div>
      {shootTeam.length === 0 ? <EmptyState icon={Users} title="No Team Members" description="Add crew to this shoot." /> : (
        <div className="grid grid-cols-2 gap-3">
          {shootTeam.map((st) => (
            <div key={st.id} className="kro-card flex items-center gap-3">
              <div className="flex items-center justify-center font-bold text-sm" style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(239,68,68,0.12)', color: '#ef4444', flexShrink: 0 }}>
                {(st.team?.name || 'U')[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-sm">{st.team?.name}</p>
                <p className="text-xs" style={{ color: '#94a3b8' }}>{st.team?.role}</p>
                {st.team?.phone && <p className="text-xs" style={{ color: '#475569' }}>{st.team.phone}</p>}
              </div>
              <button onClick={() => remove(st.id)} style={{ color: '#ef4444', opacity: 0.6 }} className="hover:opacity-100"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Team Member to Shoot">
        <div className="space-y-4">
          {saveError && <ErrorCard message={saveError} />}
          {deleteError && <ErrorCard message={deleteError} />}

          <div className="flex justify-end">
            <button
              type="button"
              className="kro-btn"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
              onClick={() => {
                // Evidence: force a failed insert by sending an invalid team_id type
                // (this should trigger a Supabase 400)
                setSaveError(null)
                setDeleteError(null)
                insert({ shoot_id: shootId, team_id: { bad: true } })
              }}
            >
              Trigger Failed Save
            </button>
          </div>

          <div>
            <label className="kro-label">Select Team Member</label>
            <select className="kro-input" value={selectedMember} onChange={(e) => setSelectedMember(e.target.value)}>
              <option value="">Choose...</option>
              {available.map((m) => <option key={m.id} value={m.id}>{m.name} — {m.role}</option>)}
            </select>
          </div>
          {available.length === 0 && <p className="text-xs" style={{ color: '#94a3b8' }}>All team members are already assigned to this shoot.</p>}
          <div className="flex justify-end gap-3"><button className="kro-btn kro-btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="kro-btn kro-btn-primary" onClick={handleAdd} disabled={!selectedMember}>Add to Shoot</button></div>
        </div>
      </Modal>
    </div>
  )
}

function BudgetTab({ shootId }) {
  const { data: items, insert, update, remove, saveError, deleteError, setSaveError, setDeleteError } = useTable('budget_items', { shoot_id: shootId })
  const [form, setForm] = useState({ item: '', estimated_cost: '', actual_cost: '', paid: false })
  const [modal, setModal] = useState(false)
  const [saving, setSaving] = useState(false)

  const ErrorCard = ({ message }) => {
    if (!message) return null
    return (
      <div className="kro-card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
        <p className="text-xs" style={{ color: '#ef4444' }}>{message}</p>
      </div>
    )
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)

    setSaveError(null)
    setDeleteError(null)

    const payload = {
      shoot_id: shootId,
      item: form.item,
      estimated_cost: parseFloat(form.estimated_cost) || 0,
      actual_cost: parseFloat(form.actual_cost) || 0,
      paid: form.paid,
    }

    console.log('[ShootDetail:BudgetTab] insert payload:', payload)

    try {
      if (form.__TRIGGER_BAD_SAVE) {
        const badPayload = { ...payload, estimated_cost: 'not-a-number' }
        console.log('[ShootDetail:BudgetTab] BAD insert payload:', badPayload)
        await insert(badPayload)
      } else {
        await insert(payload)
      }

      setModal(false)
      setForm({ item: '', estimated_cost: '', actual_cost: '', paid: false })
    } catch (error) {
      setSaveError(error.message)
    } finally {
      setSaving(false)
    }
  }


  const totals = items.reduce((acc, i) => ({
    estimated: acc.estimated + (i.estimated_cost || 0),
    actual: acc.actual + (i.actual_cost || 0),
  }), { estimated: 0, actual: 0 })

  return (
    <div className="max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-6">
          <div><p className="kro-label">Estimated</p><p className="font-bold text-white">${totals.estimated.toLocaleString()}</p></div>
          <div><p className="kro-label">Actual</p><p className="font-bold text-white">${totals.actual.toLocaleString()}</p></div>
          <div><p className="kro-label">Variance</p><p className={`font-bold ${totals.actual > totals.estimated ? 'text-red-400' : 'text-green-400'}`}>${Math.abs(totals.actual - totals.estimated).toLocaleString()}</p></div>
        </div>
        <button onClick={() => setModal(true)} className="kro-btn kro-btn-primary"><Plus size={14} /> Add Item</button>
      </div>
      {items.length === 0 ? <EmptyState icon={DollarSign} title="No Budget Items" description="Track costs for this shoot." /> : (
        <div className="kro-card">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #334155' }}>
                {['Item', 'Estimated', 'Actual', 'Paid', ''].map((h) => (
                  <th key={h} className="text-left py-2 px-3" style={{ color: '#475569', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                  <td className="py-2.5 px-3 font-medium text-white">{item.item}</td>
                  <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>${(item.estimated_cost || 0).toLocaleString()}</td>
                  <td className="py-2.5 px-3" style={{ color: '#94a3b8' }}>${(item.actual_cost || 0).toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <button onClick={() => update(item.id, { paid: !item.paid })} className="kro-badge" style={{ background: item.paid ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.1)', color: item.paid ? '#22c55e' : '#94a3b8', cursor: 'pointer' }}>
                      {item.paid ? 'Paid' : 'Unpaid'}
                    </button>
                  </td>
                  <td className="py-2.5 px-3"><button onClick={() => remove(item.id)} style={{ color: '#ef4444', opacity: 0.6 }} className="hover:opacity-100"><Trash2 size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Add Budget Item">
        <form onSubmit={handleSave} className="space-y-4">
          {saveError && <ErrorCard message={saveError} />}
          {deleteError && <ErrorCard message={deleteError} />}

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

          <div><label className="kro-label">Item</label><input className="kro-input" required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="e.g. Studio Rental" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="kro-label">Estimated ($)</label><input type="number" className="kro-input" value={form.estimated_cost} onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })} /></div>
            <div><label className="kro-label">Actual ($)</label><input type="number" className="kro-input" value={form.actual_cost} onChange={(e) => setForm({ ...form, actual_cost: e.target.value })} /></div>
          </div>
          <div className="flex items-center gap-2"><input type="checkbox" id="paid" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} className="w-4 h-4" /><label htmlFor="paid" className="text-sm" style={{ color: '#94a3b8' }}>Already paid</label></div>
          <div className="flex justify-end gap-3"><button type="button" className="kro-btn kro-btn-ghost" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="kro-btn kro-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add Item'}</button></div>
        </form>
      </Modal>
    </div>
  )
}

function RawPhotosTab({ shootId }) {
  const { data: photos, insert, update, remove } = useTable('raw_photos', { shoot_id: shootId })
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      for (const file of files) {
        const path = `${shootId}/${Date.now()}-${file.name}`
        const url = await uploadFile('raw-photos', path, file)
        await insert({ shoot_id: shootId, image_url: url, is_select: false })
      }
    } catch (err) { alert('Upload failed: ' + err.message) }
    finally { setUploading(false) ; e.target.value = '' }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-xs" style={{ color: '#94a3b8' }}>{photos.filter((p) => p.is_select).length} selects of {photos.length} total</p>
        <label className="kro-btn kro-btn-primary cursor-pointer">
          <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Photos'}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
        </label>
      </div>
      {photos.length === 0 ? <EmptyState icon={Camera} title="No Raw Photos" description="Upload your raw selects for this shoot." /> : (
        <div className="grid grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative">
              <img src={photo.image_url} alt="" className="w-full h-40 object-cover rounded-xl cursor-pointer" style={{ border: `2px solid ${photo.is_select ? '#22c55e' : '#334155'}` }} onClick={() => setLightbox(photo.image_url)} />
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 flex items-end p-2 gap-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)' }}>
                <button onClick={() => update(photo.id, { is_select: !photo.is_select })} className="kro-badge" style={{ background: photo.is_select ? 'rgba(34,197,94,0.9)' : 'rgba(0,0,0,0.7)', color: '#fff', cursor: 'pointer' }}>
                  {photo.is_select ? '★ Select' : '☆ Mark'}
                </button>
                <button onClick={() => remove(photo.id)} className="p-1 rounded" style={{ background: 'rgba(239,68,68,0.8)', color: '#fff' }}><Trash2 size={11} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}

function ColorPaletteTab({ shootId }) {
  const { data: palettes, insert } = useTable('color_palettes', { shoot_id: shootId })
  const [newColor, setNewColor] = useState('#ef4444')
  const [colors, setColors] = useState([])

  const addColor = () => {
    if (!colors.includes(newColor)) setColors([...colors, newColor])
  }

  const savePalette = async () => {
    if (!colors.length) return
    await insert({ shoot_id: shootId, colors })
    setColors([])
  }

  const allColors = palettes.flatMap((p) => Array.isArray(p.colors) ? p.colors : [])

  return (
    <div className="max-w-2xl">
      <div className="kro-card mb-6">
        <p className="kro-label mb-3">Add Color</p>
        <div className="flex items-center gap-3">
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-12 h-10 rounded-lg cursor-pointer" style={{ background: 'none', border: '1px solid #334155' }} />
          <input className="kro-input" value={newColor} onChange={(e) => setNewColor(e.target.value)} placeholder="#ef4444" style={{ width: 120 }} />
          <button onClick={addColor} className="kro-btn kro-btn-ghost"><Plus size={14} /> Add</button>
        </div>
        {colors.length > 0 && (
          <div className="mt-4">
            <p className="kro-label mb-2">Current Palette</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {colors.map((c) => (
                <div key={c} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: '#0f172a', border: '1px solid #334155' }}>
                  <div className="w-5 h-5 rounded" style={{ background: c }} />
                  <span className="text-xs font-mono" style={{ color: '#94a3b8' }}>{c}</span>
                  <button onClick={() => setColors(colors.filter((x) => x !== c))} style={{ color: '#ef4444', fontSize: 10 }}>✕</button>
                </div>
              ))}
            </div>
            <button onClick={savePalette} className="kro-btn kro-btn-primary"><Palette size={14} /> Save Palette</button>
          </div>
        )}
      </div>

      {allColors.length > 0 && (
        <div className="kro-card">
          <p className="kro-label mb-3">Saved Colors</p>
          <div className="flex flex-wrap gap-2">
            {allColors.map((c, i) => (
              <div key={i} title={c} className="w-10 h-10 rounded-lg" style={{ background: c, border: '1px solid #334155' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
