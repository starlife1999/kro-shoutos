import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Lightbulb, Plus, CheckCircle2, Circle, Trash2, Upload, Camera, Shirt, Image, Save } from 'lucide-react'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import { supabase, uploadFile } from '../../lib/supabase'

const TABS = ['Overview', 'Shot List', 'Outfits', 'Mood Board']

export default function IdeaDetail() {
  const { id } = useParams()
  const [idea, setIdea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('Overview')

  const fetchIdea = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single()
      if (err) throw err
      setIdea(data)
    } catch (e) {
      console.error('Fetch idea failed:', e)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchIdea() }, [fetchIdea])

  if (loading) return <div className="p-8" style={{ color: '#94a3b8' }}>Loading idea...</div>
  if (!idea) return <div className="p-8" style={{ color: '#94a3b8' }}>Idea not found.</div>

  return (
    <div>
      {/* Header */}
      <div className="px-8 py-6" style={{ borderBottom: '1px solid #334155' }}>
        <Link to="/ideas" className="flex items-center gap-2 text-xs font-semibold mb-4 w-fit" style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          <ArrowLeft size={12} /> Back to Ideas
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-bold text-white" style={{ fontSize: '1.5rem' }}>{idea.title}</h1>
              {idea.category && <StatusBadge status={idea.category} />}
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: '#94a3b8' }}>
              <span className="flex items-center gap-1">
                <Lightbulb size={11} /> Created {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
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
        {activeTab === 'Overview' && <OverviewTab idea={idea} refetch={fetchIdea} />}
        {activeTab === 'Shot List' && <ShotListTab ideaId={id} />}
        {activeTab === 'Outfits' && <OutfitsTab ideaId={id} />}
        {activeTab === 'Mood Board' && <MoodBoardTab ideaId={id} />}
      </div>
    </div>
  )
}

function OverviewTab({ idea, refetch }) {
  const [notes, setNotes] = useState(idea.notes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaveNotes = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const { error: err } = await supabase
        .from('ideas')
        .update({ notes })
        .eq('id', idea.id)
      if (err) throw err
      await refetch()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      alert('Failed to save notes: ' + e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="kro-card">
        <h2 className="font-bold text-white text-sm uppercase mb-4" style={{ letterSpacing: '0.08em' }}>Idea Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="kro-label">Title</p>
            <p className="text-sm font-medium text-white">{idea.title}</p>
          </div>
          <div>
            <p className="kro-label">Category</p>
            <p className="text-sm font-medium text-white capitalize">{idea.category || 'Uncategorized'}</p>
          </div>
          {idea.description && (
            <div className="col-span-2">
              <p className="kro-label">Description</p>
              <p className="text-sm" style={{ color: '#94a3b8', whiteSpace: 'pre-wrap' }}>{idea.description}</p>
            </div>
          )}
        </div>
      </div>

      <div className="kro-card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white text-sm uppercase" style={{ letterSpacing: '0.08em' }}>Notes</h2>
          {saved && <span className="text-xs" style={{ color: '#22c55e' }}>Saved ✓</span>}
        </div>
        <textarea
          className="kro-input"
          rows={6}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Write your notes for this idea..."
          style={{ resize: 'vertical' }}
        />
        <div className="flex justify-end mt-3">
          <button onClick={handleSaveNotes} className="kro-btn kro-btn-primary" disabled={saving}>
            <Save size={14} /> {saving ? 'Saving...' : 'Save Notes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function ShotListTab({ ideaId }) {
  const [shots, setShots] = useState([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchShots = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('idea_shots')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setShots(data || [])
    } catch (e) {
      console.error('Fetch shots failed:', e)
    } finally {
      setLoading(false)
    }
  }, [ideaId])

  useEffect(() => { fetchShots() }, [fetchShots])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newItem.trim()) return
    setAdding(true)
    try {
      const { error: err } = await supabase
        .from('idea_shots')
        .insert({ idea_id: ideaId, description: newItem.trim(), is_done: false })
      if (err) throw err
      setNewItem('')
      await fetchShots()
    } catch (e) {
      alert('Failed to add shot: ' + e.message)
    } finally {
      setAdding(false)
    }
  }

  const toggleDone = async (shot) => {
    try {
      const { error: err } = await supabase
        .from('idea_shots')
        .update({ is_done: !shot.is_done })
        .eq('id', shot.id)
      if (err) throw err
      await fetchShots()
    } catch (e) {
      alert('Failed to update shot: ' + e.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this shot?')) return
    try {
      const { error: err } = await supabase
        .from('idea_shots')
        .delete()
        .eq('id', id)
      if (err) throw err
      await fetchShots()
    } catch (e) {
      alert('Failed to delete shot: ' + e.message)
    }
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleAdd} className="flex gap-3 mb-6">
        <input
          className="kro-input flex-1"
          placeholder="Add shot description..."
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
        />
        <button type="submit" className="kro-btn kro-btn-primary" disabled={adding}>
          <Plus size={14} /> Add Shot
        </button>
      </form>

      {loading ? (
        <p className="text-sm" style={{ color: '#94a3b8' }}>Loading shots...</p>
      ) : shots.length === 0 ? (
        <EmptyState icon={Camera} title="No Shots Yet" description="Add shots to bring this idea to life." />
      ) : (
        <div className="space-y-2">
          {shots.map((shot) => (
            <div key={shot.id} className="kro-card flex items-center gap-3" style={{ padding: '0.75rem 1rem' }}>
              <button
                onClick={() => toggleDone(shot)}
                style={{ color: shot.is_done ? '#22c55e' : '#475569', flexShrink: 0 }}
              >
                {shot.is_done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
              </button>
              <Link
                to={`/shots/idea/${shot.id}`}
                className="flex-1 text-sm no-underline"
                style={{
                  color: shot.is_done ? '#475569' : '#f8fafc',
                  textDecoration: shot.is_done ? 'line-through' : 'none',
                }}
              >
                {shot.description}
              </Link>
              <button
                onClick={() => handleDelete(shot.id)}
                style={{ color: '#ef4444', opacity: 0.6 }}
                className="hover:opacity-100"
              >
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

function OutfitsTab({ ideaId }) {
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', description: '', notes: '' })
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)

  const fetchOutfits = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('idea_outfits')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setOutfits(data || [])
    } catch (e) {
      console.error('Fetch outfits failed:', e)
    } finally {
      setLoading(false)
    }
  }, [ideaId])

  useEffect(() => { fetchOutfits() }, [fetchOutfits])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    try {
      let image_url = null
      if (imageFile) {
        const path = `${ideaId}/${Date.now()}-${imageFile.name}`
        image_url = await uploadFile('idea-outfits', path, imageFile)
      }
      const { error: err } = await supabase
        .from('idea_outfits')
        .insert({
          idea_id: ideaId,
          name: form.name.trim(),
          description: form.description.trim() || null,
          notes: form.notes.trim() || null,
          image_url,
        })
      if (err) throw err
      setForm({ name: '', description: '', notes: '' })
      setImageFile(null)
      if (e.target) e.target.reset()
      await fetchOutfits()
    } catch (ex) {
      alert('Failed to add outfit: ' + ex.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this outfit?')) return
    try {
      const { error: err } = await supabase
        .from('idea_outfits')
        .delete()
        .eq('id', id)
      if (err) throw err
      await fetchOutfits()
    } catch (e) {
      alert('Failed to delete outfit: ' + e.message)
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Add Outfit Form */}
      <form onSubmit={handleSubmit} className="kro-card mb-6 space-y-4">
        <h2 className="font-bold text-white text-sm uppercase" style={{ letterSpacing: '0.08em' }}>Add Outfit</h2>
        <div>
          <label className="kro-label">Name *</label>
          <input
            className="kro-input"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Look 1 — Red Dress"
          />
        </div>
        <div>
          <label className="kro-label">Description</label>
          <input
            className="kro-input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Brief description"
          />
        </div>
        <div>
          <label className="kro-label">Notes</label>
          <textarea
            className="kro-input"
            rows={2}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Styling notes..."
            style={{ resize: 'vertical' }}
          />
        </div>
        <div>
          <label className="kro-label">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="kro-input"
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="kro-btn kro-btn-primary" disabled={saving}>
            <Plus size={14} /> {saving ? 'Saving...' : 'Add Outfit'}
          </button>
        </div>
      </form>

      {/* Outfits Grid */}
      {loading ? (
        <p className="text-sm" style={{ color: '#94a3b8' }}>Loading outfits...</p>
      ) : outfits.length === 0 ? (
        <EmptyState icon={Shirt} title="No Outfits" description="Add outfits that bring this idea to life." />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {outfits.map((o) => (
            <div key={o.id} className="kro-card group">
              {o.image_url ? (
                <img src={o.image_url} alt={o.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              ) : (
                <div
                  className="w-full h-40 rounded-lg mb-3 flex items-center justify-center"
                  style={{ background: '#0f172a', color: '#334155' }}
                >
                  <Shirt size={32} />
                </div>
              )}
              <p className="font-bold text-white text-sm">{o.name}</p>
              {o.description && <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{o.description}</p>}
              {o.notes && <p className="text-xs mt-1" style={{ color: '#475569' }}>{o.notes}</p>}
              <button
                onClick={() => handleDelete(o.id)}
                className="mt-2 opacity-0 group-hover:opacity-100 text-xs flex items-center gap-1"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={11} /> Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function MoodBoardTab({ ideaId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('idea_mood_board')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: false })
      if (err) throw err
      setItems(data || [])
    } catch (e) {
      console.error('Fetch mood board failed:', e)
    } finally {
      setLoading(false)
    }
  }, [ideaId])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      await Promise.all(files.map(async (file) => {
        const path = `${ideaId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`
        const url = await uploadFile('idea-mood-board', path, file)
        const { error: err } = await supabase
          .from('idea_mood_board')
          .insert({ idea_id: ideaId, image_url: url })
        if (err) throw err
      }))
      await fetchItems()
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleRemove = async (id) => {
    if (!confirm('Remove this image?')) return
    try {
      const { error: err } = await supabase
        .from('idea_mood_board')
        .delete()
        .eq('id', id)
      if (err) throw err
      await fetchItems()
    } catch (e) {
      alert('Failed to remove image: ' + e.message)
    }
  }

  return (
    <div>
      <div className="flex justify-end mb-6">
        <label className="kro-btn kro-btn-primary cursor-pointer">
          <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Images'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>
      {loading ? (
        <p className="text-sm" style={{ color: '#94a3b8' }}>Loading mood board...</p>
      ) : items.length === 0 ? (
        <EmptyState icon={Image} title="No Mood Board Images" description="Upload reference images for this idea." />
      ) : (
        <div className="grid grid-cols-4 gap-3">
          {items.map((item) => (
            <div key={item.id} className="group relative">
              <img src={item.image_url} alt="" className="w-full h-40 object-cover rounded-xl" style={{ border: '1px solid #334155' }} />
              <button
                onClick={() => handleRemove(item.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#ef4444' }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}