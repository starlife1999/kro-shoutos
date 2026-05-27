import React, { useState } from 'react'
import { Plus, Lightbulb, Trash2, Search } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useTable } from '../../hooks/useTable'

const CATEGORIES = ['general', 'fashion', 'concept', 'location', 'lighting', 'styling', 'post-production']
const EMPTY_FORM = { title: '', description: '', category: 'general', shoot_id: '' }

export default function Ideas() {
  const { data: ideas, insert, remove } = useTable('ideas')
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [catFilter, setCatFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = ideas.filter((i) => {
    const matchCat = catFilter === 'all' || i.category === catFilter
    const matchSearch = !search || i.title.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try { await insert({ ...form, shoot_id: form.shoot_id || null }) ; setModal(false) ; setForm(EMPTY_FORM) }
    finally { setSaving(false) }
  }

  return (
    <div>
      <PageHeader
        title="Ideas"
        subtitle="Quick idea dump — capture inspiration fast"
        actions={<button onClick={() => setModal(true)} className="kro-btn kro-btn-primary"><Plus size={14} /> New Idea</button>}
      />
      <div className="p-8">
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
            <input className="kro-input" style={{ paddingLeft: '2.25rem' }} placeholder="Search ideas..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {['all', ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setCatFilter(c)} className="kro-btn" style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem', background: catFilter === c ? 'rgba(239,68,68,0.15)' : 'transparent', color: catFilter === c ? '#ef4444' : '#94a3b8', border: `1px solid ${catFilter === c ? 'rgba(239,68,68,0.3)' : '#334155'}` }}>{c}</button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={Lightbulb} title="No Ideas Yet" description="Capture your creative ideas, references, and concepts." action={<button onClick={() => setModal(true)} className="kro-btn kro-btn-primary"><Plus size={14} /> New Idea</button>} />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {filtered.map((idea) => (
              <div key={idea.id} className="kro-card group flex flex-col">
                <div className="flex items-start justify-between mb-2">
                  <StatusBadge status={idea.category} />
                  <button onClick={() => remove(idea.id)} className="opacity-0 group-hover:opacity-100" style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                </div>
                <h3 className="font-bold text-white mb-1" style={{ fontSize: '0.9rem' }}>{idea.title}</h3>
                {idea.description && <p className="text-sm flex-1" style={{ color: '#94a3b8' }}>{idea.description}</p>}
                <p className="text-xs mt-3" style={{ color: '#334155' }}>
                  {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="New Idea">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="kro-label">Title</label><input className="kro-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Idea title..." /></div>
          <div><label className="kro-label">Description</label><textarea className="kro-input" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe your idea..." style={{ resize: 'vertical' }} /></div>
          <div><label className="kro-label">Category</label>
            <select className="kro-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3"><button type="button" className="kro-btn kro-btn-ghost" onClick={() => setModal(false)}>Cancel</button><button type="submit" className="kro-btn kro-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Idea'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
