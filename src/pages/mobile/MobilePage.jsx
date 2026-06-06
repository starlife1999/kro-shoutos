import React, { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Camera,
  Plus,
  Sparkles,
  Lightbulb,
  ListChecks,
  Users,
  Home as HomeIcon,
  Trash2,
  Check,
  ChevronRight,
  CalendarDays,
  MapPin,
  Mail,
  Phone,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const IDEA_CATEGORIES = ['fashion', 'portrait', 'product', 'editorial']

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatDateLong(d) {
  return new Date(d).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function todayIso() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function ErrorBanner({ message }) {
  if (!message) return null
  return (
    <div
      className="kro-mobile-card"
      style={{
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.35)',
      }}
    >
      <p style={{ color: '#ef4444', fontSize: 16, fontWeight: 700, margin: 0 }}>
        {message}
      </p>
    </div>
  )
}

/* ============== HOME ============== */
function HomeView() {
  const [shoots, setShoots] = useState([])
  const [ideas, setIdeas] = useState([])
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const [shootsRes, ideasRes, teamRes] = await Promise.all([
          supabase
            .from('shoots')
            .select('id, name, date, location, status')
            .order('date', { ascending: true }),
          supabase
            .from('ideas')
            .select('id, title, category, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('team')
            .select('id, name, role')
            .order('name', { ascending: true })
            .limit(5),
        ])
        if (cancelled) return
        if (shootsRes.error) throw shootsRes.error
        if (ideasRes.error) throw ideasRes.error
        if (teamRes.error) throw teamRes.error
        setShoots(shootsRes.data || [])
        setIdeas(ideasRes.data || [])
        setTeam(teamRes.data || [])
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const today = todayIso()
  const upcoming = useMemo(
    () => (shoots || []).filter((s) => s.date && s.date >= today).slice(0, 6),
    [shoots, today]
  )

  return (
    <div className="kro-mobile-page">
      <div className="kro-mobile-hero">
        <div className="min-w-0">
          <p className="kro-mobile-eyebrow">Today</p>
          <h1>{formatDateLong(new Date().toISOString())}</h1>
          <p>Your on-set companion for KRO ShootOS.</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      <section className="kro-mobile-card">
        <div className="kro-mobile-card-header">
          <div className="kro-mobile-card-icon">
            <Camera size={24} />
          </div>
          <div className="min-w-0">
            <h2>Upcoming Shoots</h2>
            <p>{loading ? 'Loading…' : `${upcoming.length} scheduled`}</p>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading shoots…</p>
        ) : upcoming.length === 0 ? (
          <p style={{ color: '#94a3b8', fontSize: 16 }}>No upcoming shoots.</p>
        ) : (
          <div className="kro-mobile-list">
            {upcoming.map((s) => (
              <div className="kro-mobile-list-item" key={s.id}>
                <CalendarDays size={24} color="#ef4444" />
                <div className="min-w-0 flex-1">
                  <span style={{ display: 'block' }}>{s.name}</span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 14,
                      color: '#94a3b8',
                      fontWeight: 600,
                    }}
                  >
                    {formatDate(s.date)}
                    {s.location ? ` · ${s.location}` : ''}
                  </span>
                </div>
                <span
                  className="kro-badge"
                  style={{
                    background:
                      s.status === 'done'
                        ? 'rgba(34,197,94,0.15)'
                        : 'rgba(239,68,68,0.15)',
                    color: s.status === 'done' ? '#22c55e' : '#ef4444',
                  }}
                >
                  {s.status || 'planned'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="kro-mobile-card">
        <div className="kro-mobile-card-header">
          <div
            className="kro-mobile-card-icon"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
          >
            <Sparkles size={24} />
          </div>
          <div className="min-w-0">
            <h2>Quick Stats</h2>
            <p>At a glance</p>
          </div>
        </div>
        <div className="kro-mobile-stats">
          <div className="kro-mobile-stat">
            <p>Total shoots</p>
            <strong style={{ color: '#ef4444' }}>{shoots.length}</strong>
          </div>
          <div className="kro-mobile-stat">
            <p>Recent ideas</p>
            <strong style={{ color: '#3b82f6' }}>{ideas.length}</strong>
          </div>
          <div className="kro-mobile-stat">
            <p>Team contacts</p>
            <strong style={{ color: '#22c55e' }}>{team.length}</strong>
          </div>
        </div>
      </section>

      {team.length > 0 && (
        <section className="kro-mobile-card">
          <div className="kro-mobile-card-header">
            <div
              className="kro-mobile-card-icon"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
            >
              <Users size={24} />
            </div>
            <div className="min-w-0">
              <h2>Team</h2>
              <p>Crew & contacts</p>
            </div>
          </div>
          <div className="kro-mobile-list">
            {team.map((m) => (
              <div className="kro-mobile-list-item" key={m.id}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: '#ef4444',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: 18,
                    flex: '0 0 44px',
                  }}
                >
                  {(m.name || 'K').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <span style={{ display: 'block' }}>{m.name}</span>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 14,
                      color: '#94a3b8',
                      fontWeight: 600,
                    }}
                  >
                    {m.role || 'Crew'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/* ============== SHOOTS ============== */
function ShootsView() {
  const [shoots, setShoots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const { data, error: err } = await supabase
          .from('shoots')
          .select('id, name, date, location, status, notes')
          .order('date', { ascending: true })
        if (cancelled) return
        if (err) throw err
        setShoots(data || [])
      } catch (e) {
        if (!cancelled) setError(e.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (selected) {
    return <ShootDetailView shoot={selected} onBack={() => setSelected(null)} />
  }

  return (
    <div className="kro-mobile-page">
      <div className="kro-mobile-hero">
        <div className="min-w-0">
          <p className="kro-mobile-eyebrow">Shoots</p>
          <h1>All Shoots</h1>
          <p>Tap a shoot for details.</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading shoots…</p>
      ) : shoots.length === 0 ? (
        <div className="kro-mobile-card">
          <p style={{ color: '#94a3b8', fontSize: 16 }}>No shoots yet.</p>
        </div>
      ) : (
        <div className="kro-mobile-list">
          {shoots.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSelected(s)}
              className="kro-mobile-list-item"
              style={{
                width: '100%',
                textAlign: 'left',
                background: '#1e293b',
                border: '1px solid #334155',
                cursor: 'pointer',
                color: '#f8fafc',
                fontFamily: 'inherit',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.12)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 52px',
                }}
              >
                <Camera size={24} />
              </div>
              <div className="min-w-0 flex-1">
                <span style={{ display: 'block' }}>{s.name}</span>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    color: '#94a3b8',
                    fontWeight: 600,
                    marginTop: 4,
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <CalendarDays size={14} /> {formatDate(s.date)}
                  </span>
                  {s.location && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <MapPin size={14} /> {s.location}
                    </span>
                  )}
                </span>
              </div>
              <ChevronRight size={22} color="#94a3b8" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ShootDetailView({ shoot, onBack }) {
  return (
    <div className="kro-mobile-page">
      <div className="kro-mobile-hero">
        <div className="min-w-0">
          <p className="kro-mobile-eyebrow">Shoot Detail</p>
          <h1>{shoot.name}</h1>
          <p>Details for this shoot.</p>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="kro-mobile-icon-button"
          aria-label="Back to shoots"
        >
          <ChevronRight size={24} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      <section className="kro-mobile-card">
        <div className="kro-mobile-card-header">
          <div className="kro-mobile-card-icon">
            <Camera size={24} />
          </div>
          <div className="min-w-0">
            <h2>{shoot.name}</h2>
            <p>Status: {shoot.status || 'planned'}</p>
          </div>
        </div>
        <div className="kro-mobile-stats">
          <div className="kro-mobile-stat">
            <p>Date</p>
            <strong style={{ color: '#ef4444' }}>{formatDate(shoot.date)}</strong>
          </div>
          <div className="kro-mobile-stat">
            <p>Location</p>
            <strong style={{ color: '#3b82f6' }}>{shoot.location || '—'}</strong>
          </div>
          <div className="kro-mobile-stat">
            <p>Status</p>
            <strong style={{ color: '#22c55e' }}>{shoot.status || 'planned'}</strong>
          </div>
        </div>
      </section>

      {shoot.notes && (
        <section className="kro-mobile-card">
          <div className="kro-mobile-card-header">
            <div
              className="kro-mobile-card-icon"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
            >
              <Sparkles size={24} />
            </div>
            <div className="min-w-0">
              <h2>Notes</h2>
              <p>Concept & mood</p>
            </div>
          </div>
          <p
            style={{
              color: '#f8fafc',
              fontSize: 16,
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {shoot.notes}
          </p>
        </section>
      )}

      <button
        type="button"
        onClick={onBack}
        className="kro-btn kro-btn-primary"
        style={{ minHeight: 56, justifyContent: 'center' }}
      >
        Back to all shoots
      </button>
    </div>
  )
}

/* ============== SHOT LIST ============== */
function ShotListView() {
  const [shoots, setShoots] = useState([])
  const [shootId, setShootId] = useState('')
  const [shots, setShots] = useState([])
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('shoots')
      .select('id, name, date')
      .order('date', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(err.message)
          return
        }
        setShoots(data || [])
      })
    return () => {
      cancelled = true
    }
  }, [])

  const refetchShots = async (id) => {
    const target = id || shootId
    if (!target) return
    const { data, error: err } = await supabase
      .from('shot_list')
      .select('id, shoot_id, description, is_done, created_at')
      .eq('shoot_id', target)
      .order('created_at', { ascending: true })
    if (err) {
      setError(err.message)
      return
    }
    setShots(data || [])
  }

  useEffect(() => {
    if (!shootId) {
      setShots([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('shot_list')
      .select('id, shoot_id, description, is_done, created_at')
      .eq('shoot_id', shootId)
      .order('created_at', { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return
        setLoading(false)
        if (err) {
          setError(err.message)
          return
        }
        setShots(data || [])
      })
    return () => {
      cancelled = true
    }
  }, [shootId])

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!shootId) {
      setError('Pick a shoot first')
      return
    }
    const trimmed = description.trim()
    if (!trimmed) {
      setError('Please enter a shot description')
      return
    }
    setSaving(true)
    setError(null)
    const { error: err } = await supabase
      .from('shot_list')
      .insert({ shoot_id: shootId, description: trimmed, is_done: false })
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setDescription('')
    await refetchShots()
  }

  const handleToggle = async (shot) => {
    setError(null)
    const { error: err } = await supabase
      .from('shot_list')
      .update({ is_done: !shot.is_done })
      .eq('id', shot.id)
    if (err) {
      setError(err.message)
      return
    }
    await refetchShots()
  }

  const handleDelete = async (id) => {
    setError(null)
    const { error: err } = await supabase.from('shot_list').delete().eq('id', id)
    if (err) {
      setError(err.message)
      return
    }
    await refetchShots()
  }

  const doneCount = shots.filter((s) => s.is_done).length

  return (
    <div className="kro-mobile-page">
      <div className="kro-mobile-hero">
        <div className="min-w-0">
          <p className="kro-mobile-eyebrow">Shot List</p>
          <h1>Plan Your Shots</h1>
          <p>
            {shootId
              ? `${doneCount} of ${shots.length} complete`
              : 'Pick a shoot to start.'}
          </p>
        </div>
      </div>

      <ErrorBanner message={error} />

      <section className="kro-mobile-card">
        <div className="kro-mobile-card-header">
          <div className="kro-mobile-card-icon">
            <ListChecks size={24} />
          </div>
          <div className="min-w-0">
            <h2>Select Shoot</h2>
            <p>Choose from your shoots</p>
          </div>
        </div>
        <select
          className="kro-input"
          value={shootId}
          onChange={(e) => setShootId(e.target.value)}
        >
          <option value="">Select Shoot…</option>
          {shoots.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </section>

      {shootId && (
        <>
          <form
            onSubmit={handleAdd}
            className="kro-mobile-card"
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <label className="kro-label" style={{ margin: 0 }}>
              Add a shot
            </label>
            <input
              className="kro-input"
              placeholder="Describe the next shot…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
            />
            <button
              type="submit"
              className="kro-btn kro-btn-primary"
              style={{ minHeight: 56, justifyContent: 'center' }}
              disabled={saving || !description.trim()}
            >
              <Plus size={18} /> {saving ? 'Adding…' : 'Add Shot'}
            </button>
          </form>

          {loading ? (
            <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading shots…</p>
          ) : shots.length === 0 ? (
            <div className="kro-mobile-card">
              <p style={{ color: '#94a3b8', fontSize: 16 }}>
                No shots yet — add your first above.
              </p>
            </div>
          ) : (
            <div className="kro-mobile-list">
              {shots.map((shot) => (
                <div
                  key={shot.id}
                  className="kro-mobile-list-item"
                  style={{
                    opacity: shot.is_done ? 0.6 : 1,
                    textDecoration: shot.is_done ? 'line-through' : 'none',
                    paddingRight: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleToggle(shot)}
                    aria-label={shot.is_done ? 'Mark as not done' : 'Mark as done'}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: shot.is_done
                        ? 'rgba(34,197,94,0.18)'
                        : 'rgba(148,163,184,0.12)',
                      border: `1px solid ${
                        shot.is_done ? 'rgba(34,197,94,0.5)' : '#334155'
                      }`,
                      color: shot.is_done ? '#22c55e' : '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: '0 0 44px',
                      cursor: 'pointer',
                    }}
                  >
                    {shot.is_done ? <Check size={20} /> : <span style={{ fontSize: 18 }}>○</span>}
                  </button>
                  <span
                    style={{
                      flex: 1,
                      color: '#f8fafc',
                      fontSize: 17,
                      fontWeight: 600,
                      lineHeight: 1.35,
                    }}
                  >
                    {shot.description}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(shot.id)}
                    aria-label="Delete shot"
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: '0 0 44px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ============== IDEAS ============== */
function IdeasView() {
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', category: 'fashion' })
  const [saving, setSaving] = useState(false)
  const [catFilter, setCatFilter] = useState('all')

  const fetchIdeas = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('ideas')
        .select('id, title, description, category, created_at')
        .order('created_at', { ascending: false })
      if (err) throw err
      setIdeas(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIdeas()
  }, [])

  const filtered = ideas.filter(
    (i) => catFilter === 'all' || i.category === catFilter
  )

  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      setError('Title is required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const { error: err } = await supabase.from('ideas').insert({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
      })
      if (err) throw err
      setForm({ title: '', description: '', category: 'fashion' })
      setShowForm(false)
      await fetchIdeas()
    } catch (e2) {
      setError(e2.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    setError(null)
    const { error: err } = await supabase.from('ideas').delete().eq('id', id)
    if (err) {
      setError(err.message)
      return
    }
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }

  return (
    <div className="kro-mobile-page">
      <div className="kro-mobile-hero">
        <div className="min-w-0">
          <p className="kro-mobile-eyebrow">Ideas</p>
          <h1>Creative Ideas</h1>
          <p>{loading ? 'Loading…' : `${ideas.length} total`}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((s) => !s)}
          className="kro-mobile-icon-button"
          aria-label="Add idea"
        >
          <Plus size={24} />
        </button>
      </div>

      <ErrorBanner message={error} />

      {showForm && (
        <form
          onSubmit={handleSave}
          className="kro-mobile-card"
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div className="kro-mobile-card-header" style={{ marginBottom: 0 }}>
            <div className="kro-mobile-card-icon">
              <Lightbulb size={24} />
            </div>
            <div className="min-w-0">
              <h2>New Idea</h2>
              <p>Capture inspiration fast</p>
            </div>
          </div>
          <label className="kro-label" style={{ margin: 0 }}>
            Title
          </label>
          <input
            className="kro-input"
            required
            placeholder="Idea title…"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <label className="kro-label" style={{ margin: 0 }}>
            Description
          </label>
          <textarea
            className="kro-input"
            rows={3}
            placeholder="Describe your idea…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ resize: 'vertical' }}
          />
          <label className="kro-label" style={{ margin: 0 }}>
            Category
          </label>
          <select
            className="kro-input"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {IDEA_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="kro-btn kro-btn-ghost"
              style={{ minHeight: 56, flex: 1, justifyContent: 'center' }}
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="kro-btn kro-btn-primary"
              style={{ minHeight: 56, flex: 1, justifyContent: 'center' }}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save Idea'}
            </button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {['all', ...IDEA_CATEGORIES].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCatFilter(c)}
            style={{
              minHeight: 48,
              padding: '0 18px',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              background:
                catFilter === c ? 'rgba(239,68,68,0.15)' : 'transparent',
              color: catFilter === c ? '#ef4444' : '#94a3b8',
              border: `1px solid ${
                catFilter === c ? 'rgba(239,68,68,0.3)' : '#334155'
              }`,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading ideas…</p>
      ) : filtered.length === 0 ? (
        <div className="kro-mobile-card">
          <p style={{ color: '#94a3b8', fontSize: 16 }}>
            {ideas.length === 0
              ? 'No ideas yet — tap + to add one.'
              : 'No ideas in this category.'}
          </p>
        </div>
      ) : (
        <div className="kro-mobile-list">
          {filtered.map((idea) => (
            <div
              className="kro-mobile-list-item"
              key={idea.id}
              style={{ alignItems: 'flex-start' }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: 'rgba(245,158,11,0.12)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 52px',
                }}
              >
                <Lightbulb size={24} />
              </div>
              <div
                className="min-w-0 flex-1"
                style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
              >
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: '#f8fafc',
                    lineHeight: 1.2,
                  }}
                >
                  {idea.title}
                </span>
                {idea.description && (
                  <span
                    style={{
                      fontSize: 15,
                      color: '#94a3b8',
                      fontWeight: 600,
                      lineHeight: 1.4,
                    }}
                  >
                    {idea.description}
                  </span>
                )}
                <span
                  className="kro-badge"
                  style={{
                    alignSelf: 'flex-start',
                    background: 'rgba(245,158,11,0.12)',
                    color: '#f59e0b',
                    marginTop: 4,
                  }}
                >
                  {idea.category}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(idea.id)}
                aria-label="Delete idea"
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 44px',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============== TEAM ============== */
function TeamView() {
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('team')
      .select('id, name, role, phone, email, notes')
      .order('name', { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return
        setLoading(false)
        if (err) {
          setError(err.message)
          return
        }
        setTeam(data || [])
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="kro-mobile-page">
      <div className="kro-mobile-hero">
        <div className="min-w-0">
          <p className="kro-mobile-eyebrow">Team</p>
          <h1>Crew & Contacts</h1>
          <p>{loading ? 'Loading…' : `${team.length} contact${team.length !== 1 ? 's' : ''}`}</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading team…</p>
      ) : team.length === 0 ? (
        <div className="kro-mobile-card">
          <p style={{ color: '#94a3b8', fontSize: 16 }}>No team contacts yet.</p>
        </div>
      ) : (
        <div className="kro-mobile-list">
          {team.map((m) => (
            <div className="kro-mobile-list-item" key={m.id} style={{ alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: '#ef4444',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 20,
                  flex: '0 0 52px',
                }}
              >
                {(m.name || 'K').slice(0, 1).toUpperCase()}
              </div>
              <div
                className="min-w-0 flex-1"
                style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
              >
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 800,
                    color: '#f8fafc',
                    lineHeight: 1.2,
                  }}
                >
                  {m.name}
                </span>
                {m.role && (
                  <span
                    style={{
                      fontSize: 15,
                      color: '#94a3b8',
                      fontWeight: 600,
                      lineHeight: 1.3,
                    }}
                  >
                    {m.role}
                  </span>
                )}
                {m.phone && (
                  <a
                    href={`tel:${m.phone}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 15,
                      color: '#3b82f6',
                      fontWeight: 700,
                      textDecoration: 'none',
                      minHeight: 32,
                    }}
                  >
                    <Phone size={14} /> {m.phone}
                  </a>
                )}
                {m.email && (
                  <a
                    href={`mailto:${m.email}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 15,
                      color: '#3b82f6',
                      fontWeight: 700,
                      textDecoration: 'none',
                      minHeight: 32,
                    }}
                  >
                    <Mail size={14} /> {m.email}
                  </a>
                )}
                {m.notes && (
                  <span
                    style={{
                      fontSize: 14,
                      color: '#64748b',
                      fontWeight: 600,
                      lineHeight: 1.4,
                      marginTop: 4,
                    }}
                  >
                    {m.notes}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ============== MOBILE PAGE (router-aware dispatcher) ============== */
export default function MobilePage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(() => tabFromPath(location.pathname))

  // Keep active tab in sync with the current URL
  useEffect(() => {
    setActiveTab(tabFromPath(location.pathname))
  }, [location.pathname])

  let view = null
  if (activeTab === 'home') view = <HomeView />
  else if (activeTab === 'shoots') view = <ShootsView />
  else if (activeTab === 'shot-list') view = <ShotListView />
  else if (activeTab === 'ideas') view = <IdeasView />
  else if (activeTab === 'team') view = <TeamView />

  return <div className="kro-mobile-page-wrap">{view}</div>
}

function tabFromPath(pathname) {
  const p = (pathname || '').replace(/\/+$/, '') // strip trailing slash
  if (p === '' || p === '/m') return 'home'
  if (p.endsWith('/shoots')) return 'shoots'
  if (p.endsWith('/shot-list')) return 'shot-list'
  if (p.endsWith('/ideas')) return 'ideas'
  if (p.endsWith('/team')) return 'team'
  return 'home'
}
     