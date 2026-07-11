import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  Camera as CameraIcon,
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

let Camera = null
let CameraResultType = null
let CameraSource = null
let LocalNotifications = null

if (typeof window !== 'undefined') {
  try {
    const camModule = require('@capacitor/camera')
    Camera = camModule.Camera
    CameraResultType = camModule.CameraResultType
    CameraSource = camModule.CameraSource
  } catch (e) {
    console.warn('Camera plugin not available:', e.message)
  }
  
  try {
    const notifModule = require('@capacitor/local-notifications')
    LocalNotifications = notifModule.LocalNotifications
  } catch (e) {
    console.warn('LocalNotifications plugin not available:', e.message)
  }
}

const IDEA_CATEGORIES = ['fashion', 'portrait', 'product', 'editorial']
const NOTIF_PERMISSION_KEY = 'kro_shootos_notif_permission'
const CACHED_SHOOTS_KEY = 'kro_cached_shoots'

async function scheduleLocalNotifications() {
  if (!LocalNotifications) {
    console.warn('LocalNotifications not available, skipping schedule')
    return
  }
  const { data: shoots } = await supabase
    .from('shoots')
    .select('id, name, date')
    .order('date', { ascending: true })

  if (!shoots) return

  const notifications = []
  let id = 1
  const now = Date.now()

  shoots.forEach((s) => {
    if (!s.date) return
    const shootTs = new Date(s.date + 'T08:00:00').getTime()

    const reminders = [
      { days: -7, label: 'is in 7 days' },
      { days: -2, label: 'is in 2 days' },
      { days: -1, label: 'is tomorrow' },
      { days: 0, label: 'is today!' },
    ]

    reminders.forEach(({ days, label }) => {
      const fireAt = shootTs + days * 86400000
      if (fireAt > now) {
        notifications.push({
          id: id++,
          title: 'KRO ShootOS',
          body: `${s.name} ${label}`,
          schedule: { at: new Date(fireAt) },
          sound: null,
          actionTypeId: '',
          extra: null,
        })
      }
    })
  })

  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications })
  }
}

function getStoredNotifPermission() {
  if (typeof window === 'undefined') return 'default'
  try {
    return (
      window.localStorage.getItem(NOTIF_PERMISSION_KEY) ||
      (typeof Notification !== 'undefined' ? Notification.permission : 'default')
    )
  } catch (e) {
    return typeof Notification !== 'undefined' ? Notification.permission : 'default'
  }
}

function storeNotifPermission(value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(NOTIF_PERMISSION_KEY, value)
  } catch (e) {
    /* ignore */
  }
}

function fireNotification(title, body, url) {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return
  try {
    if ('serviceWorker' in navigator && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          data: { url: url || '/m/calendar' },
        })
      })
    } else {
      // eslint-disable-next-line no-new
      new Notification(title, { body, icon: '/icon-192.png' })
    }
  } catch (e) {
    /* ignore */
  }
}

function scheduleShootReminders(shoots) {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return []
  if (Notification.permission !== 'granted') return []
  const now = Date.now()
  const timeouts = []
  shoots.forEach((s) => {
    if (!s.date) return
    const shootTs = new Date(s.date + 'T08:00:00').getTime()
    if (Number.isNaN(shootTs)) return
    const offsets = [
      { days: -7, label: 'is in 7 days' },
      { days: -2, label: 'is in 2 days' },
      { days: -1, label: 'is tomorrow' },
    ]
    offsets.forEach(({ days, label }) => {
      const fireAt = shootTs + days * 86400000
      const diff = fireAt - now
      if (diff > 0 && diff < 1000 * 60 * 60 * 24 * 30) {
        const id = setTimeout(() => {
          fireNotification('KRO ShootOS', `${s.name} ${label}`, '/m/calendar')
        }, diff)
        timeouts.push(id)
      }
    })
    const dayDiff = shootTs - now
    if (dayDiff > 0 && dayDiff < 1000 * 60 * 60 * 24 * 30) {
      const id = setTimeout(() => {
        fireNotification('KRO ShootOS', `Today is shoot day: ${s.name}`, '/m/calendar')
      }, dayDiff)
      timeouts.push(id)
    }
  })
  return timeouts
}

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
  const [shoots, setShoots] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHED_SHOOTS_KEY)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })
  const [ideas, setIdeas] = useState([])
  const [team, setTeam] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [notifStatus, setNotifStatus] = useState(() => getStoredNotifPermission())

  const handleRequestNotifications = async () => {
    if (!LocalNotifications) {
      setNotifStatus('unsupported')
      return
    }
    try {
      const { display } = await LocalNotifications.requestPermissions()
      const value = display === 'granted' ? 'granted' : 'denied'
      setNotifStatus(value)
      storeNotifPermission(value)
      if (display === 'granted') {
        await scheduleLocalNotifications()
      }
    } catch (e) {
      setNotifStatus('denied')
    }
  }

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
        const shootsList = shootsRes.data || []
        setShoots(shootsList)
        localStorage.setItem(CACHED_SHOOTS_KEY, JSON.stringify(shootsList))
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

      <div
        style={{
          background: '#1e293b',
          border: '1px solid #334155',
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <p style={{ color: '#94a3b8', fontSize: 14, marginBottom: 12 }}>
          Get reminders before your shoots
        </p>
        <button
          onClick={handleRequestNotifications}
          style={{
            width: '100%',
            minHeight: 56,
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {notifStatus === 'granted' ? 'Reminders Enabled ✓' :
           notifStatus === 'denied' ? 'Notifications Blocked — Enable in Settings' :
           'Enable Shoot Reminders'}
        </button>
      </div>

      <section className="kro-mobile-card">
        <div className="kro-mobile-card-header">
          <div className="kro-mobile-card-icon">
            <CameraIcon size={24} />
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
  const [shoots, setShoots] = useState(() => {
    try {
      const cached = localStorage.getItem(CACHED_SHOOTS_KEY)
      return cached ? JSON.parse(cached) : []
    } catch {
      return []
    }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [showNewShoot, setShowNewShoot] = useState(false)
  const [newShootForm, setNewShootForm] = useState({
    name: '',
    date: '',
    location: '',
    status: 'planned',
    notes: '',
  })
  const [savingShoot, setSavingShoot] = useState(false)

  const fetchShoots = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('shoots')
        .select('id, name, date, location, status, notes')
        .order('date', { ascending: true })
      if (err) throw err
      const list = data || []
      setShoots(list)
      localStorage.setItem(CACHED_SHOOTS_KEY, JSON.stringify(list))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShoots()
  }, [])

  const handleCreateShoot = async (e) => {
    e.preventDefault()
    if (!newShootForm.name.trim()) {
      setError('Shoot name is required')
      return
    }
    setSavingShoot(true)
    setError(null)
    try {
      const { error: err } = await supabase.from('shoots').insert({
        name: newShootForm.name.trim(),
        date: newShootForm.date || null,
        location: newShootForm.location.trim() || null,
        status: newShootForm.status,
        notes: newShootForm.notes.trim() || null,
      })
      if (err) throw err
      setNewShootForm({ name: '', date: '', location: '', status: 'planned', notes: '' })
      setShowNewShoot(false)
      await fetchShoots()
    } catch (e2) {
      setError(e2.message)
    } finally {
      setSavingShoot(false)
    }
  }

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
        <button
          type="button"
          onClick={() => setShowNewShoot(true)}
          className="kro-mobile-icon-button"
          aria-label="New shoot"
        >
          <Plus size={24} />
        </button>
      </div>

      <ErrorBanner message={error} />

      {showNewShoot && (
        <form
          onSubmit={handleCreateShoot}
          className="kro-mobile-card"
          style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div className="kro-mobile-card-header" style={{ marginBottom: 0 }}>
            <div className="kro-mobile-card-icon">
              <CameraIcon size={24} />
            </div>
            <div className="min-w-0">
              <h2>New Shoot</h2>
              <p>Add a shoot from mobile</p>
            </div>
          </div>
          <label className="kro-label" style={{ margin: 0 }}>
            Shoot name *
          </label>
          <input
            className="kro-input"
            required
            placeholder="Shoot name…"
            value={newShootForm.name}
            onChange={(e) => setNewShootForm({ ...newShootForm, name: e.target.value })}
          />
          <label className="kro-label" style={{ margin: 0 }}>
            Date
          </label>
          <input
            type="date"
            className="kro-input"
            value={newShootForm.date}
            onChange={(e) => setNewShootForm({ ...newShootForm, date: e.target.value })}
          />
          <label className="kro-label" style={{ margin: 0 }}>
            Location
          </label>
          <input
            className="kro-input"
            placeholder="Location…"
            value={newShootForm.location}
            onChange={(e) => setNewShootForm({ ...newShootForm, location: e.target.value })}
          />
          <label className="kro-label" style={{ margin: 0 }}>
            Status
          </label>
          <select
            className="kro-input"
            value={newShootForm.status}
            onChange={(e) => setNewShootForm({ ...newShootForm, status: e.target.value })}
          >
            <option value="planned">planned</option>
            <option value="in progress">in progress</option>
            <option value="done">done</option>
          </select>
          <label className="kro-label" style={{ margin: 0 }}>
            Notes
          </label>
          <textarea
            className="kro-input"
            rows={3}
            placeholder="Notes…"
            value={newShootForm.notes}
            onChange={(e) => setNewShootForm({ ...newShootForm, notes: e.target.value })}
            style={{ resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="kro-btn kro-btn-ghost"
              style={{ minHeight: 56, flex: 1, justifyContent: 'center' }}
              onClick={() => setShowNewShoot(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="kro-btn kro-btn-primary"
              style={{ minHeight: 56, flex: 1, justifyContent: 'center' }}
              disabled={savingShoot}
            >
              {savingShoot ? 'Saving…' : 'Create Shoot'}
            </button>
          </div>
        </form>
      )}

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
                <CameraIcon size={24} />
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
  const [activeTab, setActiveTab] = useState('I')

  const tabs = useMemo(
    () => [
      { key: 'I', label: 'I', view: 'info' },
      { key: 'S', label: 'S', view: 'shot-list' },
      { key: 'O', label: 'O', view: 'outfits' },
      { key: 'M', label: 'M', view: 'mood-board' },
      { key: 'T', label: 'T', view: 'team' },
    ],
    []
  )

  return (
    <div className="kro-mobile-page">
      <div className="kro-mobile-hero">
        <div className="min-w-0">
          <p className="kro-mobile-eyebrow">Shoot Detail</p>
          <h1>{shoot?.name || 'Shoot'}</h1>
          <p>Tap a tab to explore everything.</p>
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

      <section
        className="kro-mobile-card"
        style={{ padding: 12, borderRadius: 12 }}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'nowrap', overflowX: 'auto' }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              style={{
                minHeight: 48,
                padding: '0 14px',
                borderRadius: 999,
                fontSize: 16,
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                background:
                  activeTab === t.key ? 'rgba(239,68,68,0.15)' : 'transparent',
                color: activeTab === t.key ? '#ef4444' : '#94a3b8',
                border: `1px solid ${
                  activeTab === t.key ? 'rgba(239,68,68,0.35)' : '#334155'
                }`,
                cursor: 'pointer',
                fontFamily: 'inherit',
                whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <ErrorBanner message={null} />

      {activeTab === 'I' && <ShootInfoTab shoot={shoot} />}
      {activeTab === 'S' && <ShootShotListTab shootId={shoot.id} />}
      {activeTab === 'O' && <ShootOutfitsTab shootId={shoot.id} />}
      {activeTab === 'M' && <ShootMoodBoardTab shootId={shoot.id} />}
      {activeTab === 'T' && <ShootTeamTab shootId={shoot.id} />}

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

function ShootInfoTab({ shoot }) {
  return (
    <section className="kro-mobile-card">
      <div className="kro-mobile-card-header">
        <div className="kro-mobile-card-icon">
          <CameraIcon size={24} />
        </div>
        <div className="min-w-0">
          <h2>Info</h2>
          <p>Core details for this shoot</p>
        </div>
      </div>

      <div className="kro-mobile-stats">
        <div className="kro-mobile-stat">
          <p>Name</p>
          <strong style={{ color: '#f8fafc', fontSize: 20 }}>{shoot?.name || '—'}</strong>
        </div>
        <div className="kro-mobile-stat">
          <p>Date</p>
          <strong style={{ color: '#ef4444' }}>{formatDate(shoot?.date)}</strong>
        </div>
        <div className="kro-mobile-stat">
          <p>Location</p>
          <strong style={{ color: '#3b82f6' }}>{shoot?.location || '—'}</strong>
        </div>
        <div className="kro-mobile-stat">
          <p>Status</p>
          <strong style={{ color: '#22c55e' }}>{shoot?.status || 'planned'}</strong>
        </div>
      </div>

      {shoot?.notes ? (
        <div style={{ marginTop: 16 }}>
          <div className="kro-mobile-card-header" style={{ marginBottom: 10 }}>
            <div
              className="kro-mobile-card-icon"
              style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}
            >
              <Sparkles size={24} />
            </div>
            <div className="min-w-0">
              <h2>Notes</h2>
              <p>Concept, mood & context</p>
            </div>
          </div>
          <p
            style={{
              color: '#f8fafc',
              fontSize: 16,
              lineHeight: 1.5,
              margin: 0,
              whiteSpace: 'pre-wrap',
            }}
          >
            {shoot.notes}
          </p>
        </div>
      ) : (
        <div style={{ marginTop: 16, color: '#94a3b8', fontSize: 16, fontWeight: 700 }}>
          No notes yet.
        </div>
      )}
    </section>
  )
}

function ShootShotListTab({ shootId }) {
  const [shots, setShots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
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

  const refetch = async () => {
    const { data, error: err } = await supabase
      .from('shot_list')
      .select('id, shoot_id, description, is_done, created_at')
      .eq('shoot_id', shootId)
      .order('created_at', { ascending: true })
    if (err) {
      setError(err.message)
      return
    }
    setShots(data || [])
  }

  const handleAdd = async (e) => {
    e.preventDefault()
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
    await refetch()
  }

  const handleToggleDone = async (shot) => {
    const { error: err } = await supabase
      .from('shot_list')
      .update({ is_done: !shot.is_done })
      .eq('id', shot.id)

    if (err) {
      setError(err.message)
      return
    }

    setShots((prev) =>
      prev.map((s) => (s.id === shot.id ? { ...s, is_done: !s.is_done } : s))
    )
  }

  const handleDelete = async (id) => {
    await supabase.from('shot_list').delete().eq('id', id)
    await refetch()
  }

  const doneCount = shots.filter((s) => s.is_done).length

  return (
    <section className="kro-mobile-card">
      <div className="kro-mobile-card-header">
        <div className="kro-mobile-card-icon">
          <ListChecks size={24} />
        </div>
        <div className="min-w-0">
          <h2>Shot List</h2>
          <p>
            {doneCount} of {shots.length} complete
          </p>
        </div>
      </div>

      <ErrorBanner message={error} />

      <form
        onSubmit={handleAdd}
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

      <div style={{ marginTop: 16 }} />

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading shots…</p>
      ) : shots.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 16, fontWeight: 700 }}>
          No shots yet — add your first above.
        </p>
      ) : (
        <div className="kro-mobile-list" style={{ marginTop: 12 }}>
          {shots.map((shot) => (
            <div
              key={shot.id}
              className="kro-mobile-list-item"
              style={{
                opacity: shot.is_done ? 0.6 : 1,
                textDecoration: shot.is_done ? 'line-through' : 'none',
                paddingRight: 12,
                alignItems: 'center',
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleToggleDone(shot)
                }}
                aria-label={shot.is_done ? 'Mark as not done' : 'Mark as done'}
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: shot.is_done
                    ? 'rgba(34,197,94,0.18)'
                    : 'rgba(148,163,184,0.12)',
                  border: `1px solid ${shot.is_done ? 'rgba(34,197,94,0.5)' : '#334155'}`,
                  color: shot.is_done ? '#22c55e' : '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 56px',
                  cursor: 'pointer',
                }}
              >
                {shot.is_done ? <Check size={24} /> : <span style={{ fontSize: 22 }}>○</span>}
              </button>

              <span
                onClick={() => {
                  window.location.hash = `/shots/shoot/${shot.id}`
                }}
                style={{
                  flex: 1,
                  cursor: 'pointer',
                  color: shot.is_done ? '#64748b' : '#f8fafc',
                  fontSize: 17,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  paddingRight: 12,
                  textDecoration: shot.is_done ? 'line-through' : 'none',
                }}
              >
                {shot.description}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(shot.id)
                }}
                aria-label="Delete shot"
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 12,
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.25)',
                  color: '#ef4444',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flex: '0 0 56px',
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={22} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ShootOutfitsTab({ shootId }) {
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    supabase
      .from('outfits')
      .select('id, shoot_id, name, description, notes, image_url')
      .eq('shoot_id', shootId)
      .order('id', { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return
        setLoading(false)
        if (err) {
          setError(err.message)
          return
        }
        setOutfits(data || [])
      })

    return () => {
      cancelled = true
    }
  }, [shootId])

  const takeOrPickPhoto = async () => {
    if (!Camera) {
      setError('Camera not available on this device')
      return
    }
    try {
      setUploading(true)
      setError(null)
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      })

      const res = await fetch(image.dataUrl)
      const blob = await res.blob()
      const fileName = `${Date.now()}.jpg`
      const filePath = `${shootId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('outfits')
        .upload(filePath, blob, { contentType: 'image/jpeg' })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('outfits')
        .getPublicUrl(filePath)

      await supabase.from('outfits').insert({
        shoot_id: shootId,
        name: 'New outfit',
        image_url: urlData.publicUrl,
      })

      const { data: fresh } = await supabase
        .from('outfits')
        .select('id, shoot_id, name, description, notes, image_url')
        .eq('shoot_id', shootId)
      if (fresh) setOutfits(fresh)
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <section className="kro-mobile-card">
      <div className="kro-mobile-card-header">
        <div className="kro-mobile-card-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}>
          <Sparkles size={24} />
        </div>
        <div className="min-w-0">
          <h2>Outfits</h2>
          <p>{outfits.length} outfit{outfits.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      <button
        type="button"
        onClick={takeOrPickPhoto}
        className="kro-btn kro-btn-primary"
        style={{ minHeight: 56, width: '100%', justifyContent: 'center', marginBottom: 16 }}
        disabled={uploading}
      >
        <Plus size={18} /> {uploading ? 'Uploading...' : 'Add Photo'}
      </button>

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading outfits…</p>
      ) : outfits.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 16, fontWeight: 700 }}>
          No outfits yet.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 12,
          }}
        >
          {outfits.map((o) => (
            <div
              key={o.id}
              style={{
                border: '1px solid #334155',
                borderRadius: 12,
                background: '#0f172a',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '100%',
                  height: 140,
                  background: '#0f172a',
                  borderBottom: '1px solid #334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {o.image_url ? (
                  <img
                    src={o.image_url}
                    alt={o.name || 'Outfit'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ color: '#64748b', fontWeight: 900, fontSize: 16 }}>
                    No Image
                  </div>
                )}
              </div>
              <div style={{ padding: 12 }}>
                <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: 16, lineHeight: 1.2 }}>
                  {o.name || 'Untitled'}
                </div>
                {o.description && (
                  <div style={{ color: '#94a3b8', fontWeight: 700, fontSize: 14, marginTop: 6, lineHeight: 1.35 }}>
                    {o.description}
                  </div>
                )}
                {o.notes && (
                  <div style={{ color: '#64748b', fontWeight: 700, fontSize: 13, marginTop: 6, lineHeight: 1.35 }}>
                    {o.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function ShootMoodBoardTab({ shootId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    supabase
      .from('mood_board')
      .select('id, shoot_id, image_url')
      .eq('shoot_id', shootId)
      .order('id', { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return
        setLoading(false)
        if (err) {
          setError(err.message)
          return
        }
        setItems(data || [])
      })

    return () => {
      cancelled = true
    }
  }, [shootId])

  const refreshMoodBoard = async () => {
    const { data: fresh, error: err } = await supabase
      .from('mood_board')
      .select('id, shoot_id, image_url')
      .eq('shoot_id', shootId)
      .order('id', { ascending: true })
    if (err) throw err
    setItems(fresh || [])
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploading(true)
      setError(null)
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${Date.now()}.${ext}`
      const filePath = `${shootId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('mood-board')
        .upload(filePath, file, { contentType: file.type || 'image/jpeg' })

      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('mood-board')
        .getPublicUrl(filePath)

      await supabase.from('mood_board').insert({
        shoot_id: shootId,
        image_url: urlData.publicUrl,
      })

      await refreshMoodBoard()
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <section className="kro-mobile-card">
      <div className="kro-mobile-card-header">
        <div className="kro-mobile-card-icon" style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b' }}>
          <Lightbulb size={24} />
        </div>
        <div className="min-w-0">
          <h2>Mood Board</h2>
          <p>{items.length} image{items.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      <label
        style={{
          cursor: uploading ? 'default' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          minHeight: 56,
          width: '100%',
          padding: '0 20px',
          background: uploading ? '#991b1b' : '#ef4444',
          color: '#fff',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 16,
          marginBottom: 16,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleUpload}
          disabled={uploading}
        />
        <Plus size={18} /> {uploading ? 'Uploading...' : '+ Add Photo'}
      </label>

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading mood board…</p>
      ) : items.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 16, fontWeight: 700 }}>
          No mood board images yet.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
          }}
        >
          {items.map((it, index) => (
            <div
              key={it.id}
              style={{
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: 12,
                overflow: 'hidden',
                border: '1px solid #334155',
                background: '#0f172a',
              }}
            >
              {it.image_url ? (
                <img
                  src={it.image_url}
                  alt="Mood board"
                  onClick={() => setLightboxIndex(index)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                  }}
                />
              ) : (
                <div style={{ color: '#64748b', fontWeight: 900, fontSize: 14 }}>—</div>
              )}
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <div
          onClick={() => setLightboxIndex(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((i) => Math.max(0, i - 1))
            }}
            style={{
              position: 'absolute',
              left: 16,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 48,
              cursor: 'pointer',
            }}
          >
            ‹
          </button>
          <img
            src={items[lightboxIndex]?.image_url}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '95vw',
              maxHeight: '90vh',
              objectFit: 'contain',
              borderRadius: 8,
            }}
          />
          <button
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex((i) => Math.min(items.length - 1, i + 1))
            }}
            style={{
              position: 'absolute',
              right: 16,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 48,
              cursor: 'pointer',
            }}
          >
            ›
          </button>
          <div
            style={{
              position: 'absolute',
              bottom: 24,
              color: '#94a3b8',
              fontSize: 14,
            }}
          >
            {lightboxIndex + 1} of {items.length}
          </div>
          <button
            onClick={() => setLightboxIndex(null)}
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: 24,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </section>
  )
}

function ShootTeamTab({ shootId }) {
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    supabase
      .from('shoot_team')
      .select('id, shoot_id, team_id, team(name, role, phone, email, notes)')
      .eq('shoot_id', shootId)
      .order('id', { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return
        setLoading(false)
        if (err) {
          setError(err.message)
          return
        }
        const rows = data || []
        setPeople(rows)
      })

    return () => {
      cancelled = true
    }
  }, [shootId])

  return (
    <section className="kro-mobile-card">
      <div className="kro-mobile-card-header">
        <div className="kro-mobile-card-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
          <Users size={24} />
        </div>
        <div className="min-w-0">
          <h2>Team</h2>
          <p>{people.length} contact{people.length === 1 ? '' : 's'}</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      {loading ? (
        <p style={{ color: '#94a3b8', fontSize: 16 }}>Loading team…</p>
      ) : people.length === 0 ? (
        <p style={{ color: '#94a3b8', fontSize: 16, fontWeight: 700 }}>
          No team contacts added.
        </p>
      ) : (
        <div className="kro-mobile-list">
          {people.map((st) => {
            const t = st.team || {}
            return (
              <div
                key={st.id || st.team_id}
                className="kro-mobile-list-item"
                style={{ alignItems: 'flex-start' }}
              >
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
                    fontWeight: 900,
                    fontSize: 20,
                    flex: '0 0 52px',
                  }}
                >
                  {(t.name || 'K').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ color: '#f8fafc', fontWeight: 900, fontSize: 17, lineHeight: 1.2 }}>{t.name || 'Unknown'}</div>
                  {t.role && (
                    <div style={{ color: '#94a3b8', fontWeight: 800, fontSize: 15, lineHeight: 1.3 }}>{t.role}</div>
                  )}
                  {t.phone && (
                    <a
                      href={`tel:${t.phone}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 16,
                        color: '#3b82f6',
                        fontWeight: 900,
                        textDecoration: 'none',
                        minHeight: 36,
                      }}
                    >
                      <Phone size={16} /> {t.phone}
                    </a>
                  )}
                  {t.email && (
                    <a
                      href={`mailto:${t.email}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        fontSize: 16,
                        color: '#3b82f6',
                        fontWeight: 900,
                        textDecoration: 'none',
                        minHeight: 36,
                      }}
                    >
                      <Mail size={16} /> {t.email}
                    </a>
                  )}
                  {t.notes && (
                    <div style={{ color: '#64748b', fontWeight: 800, fontSize: 14, lineHeight: 1.4, marginTop: 2 }}>
                      {t.notes}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
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
    // Direct fetch back into local state so the new shot appears instantly
    const { data: fresh } = await supabase
      .from('shot_list')
      .select('*')
      .eq('shoot_id', shootId)
      .order('created_at', { ascending: true })
    if (fresh) setShots(fresh)
  }

  const handleToggle = async (shot) => {
    const { error } = await supabase
      .from('shot_list')
      .update({ is_done: !shot.is_done })
      .eq('id', shot.id)
    if (error) {
      setError(error.message)
      return
    }
    const { data: fresh } = await supabase
      .from('shot_list')
      .select('*')
      .eq('shoot_id', shootId)
      .order('created_at', { ascending: true })
    if (fresh) setShots(fresh)
  }

  const handleDelete = async (id) => {
    await supabase.from('shot_list').delete().eq('id', id)
    const { data: fresh } = await supabase
      .from('shot_list')
      .select('*')
      .eq('shoot_id', shootId)
      .order('created_at', { ascending: true })
    if (fresh) setShots(fresh)
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
            <div
              className="kro-mobile-list"
              style={{ overflowY: 'auto', flex: 1, paddingBottom: 120 }}
            >
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
                      width: 56,
                      height: 56,
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
                      flex: '0 0 56px',
                      cursor: 'pointer',
                    }}
                  >
                    {shot.is_done ? <Check size={24} /> : <span style={{ fontSize: 22 }}>○</span>}
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
                      width: 56,
                      height: 56,
                      borderRadius: 12,
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.25)',
                      color: '#ef4444',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: '0 0 56px',
                      cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={22} />
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
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

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


  const takeOrPickPhoto = async () => {
    if (!Camera) {
      setError('Camera not available on this device')
      return
    }
    try {
      setUploadingPhoto(true)
      setError(null)
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      })

      const title = `Photo idea ${new Date().toLocaleDateString()}`
      const { data: idea, error: ideaErr } = await supabase
        .from('ideas')
        .insert({ title, description: '', category: 'fashion' })
        .select('id')
        .single()
      if (ideaErr) throw ideaErr

      const res = await fetch(image.dataUrl)
      const blob = await res.blob()
      const fileName = `${Date.now()}.jpg`
      const filePath = `${idea.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('idea-mood-board')
        .upload(filePath, blob, { contentType: 'image/jpeg' })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('idea-mood-board')
        .getPublicUrl(filePath)

      await supabase.from('idea_mood_board').insert({
        idea_id: idea.id,
        image_url: urlData.publicUrl,
      })

      await fetchIdeas()
    } catch (e) {
      setError(e.message)
    } finally {
      setUploadingPhoto(false)
    }
  }

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
      // Direct fetch back into local state so the new idea appears instantly
      const { data: fresh } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false })
      if (fresh) setIdeas(fresh)
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

      <label
        style={{
          cursor: uploading ? 'default' : 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          minHeight: 56,
          width: '100%',
          padding: '0 20px',
          background: uploading ? '#991b1b' : '#ef4444',
          color: '#fff',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 16,
          marginBottom: 16,
        }}
      >
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading ? 'Uploading...' : '+ Add Photo'}
      </label>

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

/* ============== REMINDERS BUTTON ============== */
function RemindersButton({ shoots }) {
  const [permission, setPermission] = useState(() => getStoredNotifPermission())
  const [reminderCount, setReminderCount] = useState(0)
  const scheduledRef = useRef([])

  useEffect(() => {
    if (permission === 'granted' && shoots && shoots.length > 0) {
      scheduledRef.current.forEach((id) => clearTimeout(id))
      scheduledRef.current = scheduleShootReminders(shoots)
      setReminderCount(scheduledRef.current.length)
    }
    return () => {
      scheduledRef.current.forEach((id) => clearTimeout(id))
    }
  }, [shoots, permission])

  useEffect(() => {
    if (permission !== 'granted') return
    const now = new Date()
    if (now.getDate() !== 1) return
    const monthKey = `${now.getFullYear()}-${now.getMonth()}`
    const sentKey = 'kro_shootos_monthly_summary_sent'
    let sent = null
    try {
      sent = window.localStorage.getItem(sentKey)
    } catch (e) {
      sent = null
    }
    if (sent === monthKey) return
    const monthlyShoots = (shoots || []).filter((s) => {
      if (!s.date) return false
      const d = new Date(s.date)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    if (monthlyShoots.length === 0) return
    fireNotification(
      'KRO ShootOS',
      `This month: ${monthlyShoots.map((s) => s.name).join(', ')}`,
      '/m/calendar'
    )
    try {
      window.localStorage.setItem(sentKey, monthKey)
    } catch (e) {
      /* ignore */
    }
  }, [shoots, permission])

  const enableReminders = async () => {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      setPermission('unsupported')
      return
    }
    try {
      const result = await Notification.requestPermission()
      const value = result || 'default'
      setPermission(value)
      storeNotifPermission(value)
      if (value === 'granted' && shoots && shoots.length > 0) {
        scheduledRef.current.forEach((id) => clearTimeout(id))
        scheduledRef.current = scheduleShootReminders(shoots)
        setReminderCount(scheduledRef.current.length)
      }
    } catch (e) {
      setPermission('default')
    }
  }

  const notifUnsupported =
    typeof window === 'undefined' || typeof Notification === 'undefined'

  const buttonLabel = notifUnsupported
    ? 'Notifications unsupported'
    : permission === 'granted'
    ? `Reminders Enabled${reminderCount ? ` (${reminderCount})` : ''}`
    : permission === 'denied'
    ? 'Notifications blocked — enable in Settings'
    : 'Enable Shoot Reminders'

  const buttonStyle =
    permission === 'granted'
      ? {
          background: 'rgba(34,197,94,0.15)',
          color: '#22c55e',
          border: '1px solid rgba(34,197,94,0.35)',
        }
      : permission === 'denied'
      ? {
          background: 'rgba(239,68,68,0.1)',
          color: '#ef4444',
          border: '1px solid rgba(239,68,68,0.3)',
        }
      : {}

  return (
    <button
      type="button"
      onClick={enableReminders}
      className="kro-btn"
      style={{
        minHeight: 56,
        width: '100%',
        justifyContent: 'center',
        fontSize: 16,
        ...buttonStyle,
      }}
    >
      {buttonLabel}
    </button>
  )
}

/* ============== CALENDAR ============== */
function CalendarView() {
  const [shoots, setShoots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('shoots')
      .select('id, name, date, location, status')
      .order('date', { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return
        setLoading(false)
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

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthName = cursor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const isoForDay = (d) => {
    const m = String(month + 1).padStart(2, '0')
    const day = String(d).padStart(2, '0')
    return `${year}-${m}-${day}`
  }
  const shootsForDay = (d) => shoots.filter((s) => s.date === isoForDay(d))
  const shootsForSelected = selectedDate
    ? shoots.filter((s) => s.date === selectedDate)
    : []

  const todayObj = new Date()
  const isToday = (d) =>
    d === todayObj.getDate() &&
    month === todayObj.getMonth() &&
    year === todayObj.getFullYear()

  const goPrev = () => setCursor(new Date(year, month - 1, 1))
  const goNext = () => setCursor(new Date(year, month + 1, 1))

  return (
    <div className="kro-mobile-page">
      <div className="kro-mobile-hero">
        <div className="min-w-0">
          <p className="kro-mobile-eyebrow">Calendar</p>
          <h1>{monthName}</h1>
          <p>Tap a day with a dot to see shoots.</p>
        </div>
      </div>

      <ErrorBanner message={error} />

      <section className="kro-mobile-card">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            marginBottom: 14,
          }}
        >
          <button
            type="button"
            onClick={goPrev}
            className="kro-btn kro-btn-ghost"
            style={{
              minHeight: 56,
              minWidth: 56,
              padding: '0 14px',
              justifyContent: 'center',
            }}
            aria-label="Previous month"
          >
            <ChevronRight size={22} style={{ transform: 'rotate(180deg)' }} />
          </button>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#f8fafc' }}>
            {monthName}
          </span>
          <button
            type="button"
            onClick={goNext}
            className="kro-btn kro-btn-ghost"
            style={{
              minHeight: 56,
              minWidth: 56,
              padding: '0 14px',
              justifyContent: 'center',
            }}
            aria-label="Next month"
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
            marginBottom: 6,
          }}
        >
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div
              key={`hdr-${i}`}
              style={{
                textAlign: 'center',
                color: '#94a3b8',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                minHeight: 24,
              }}
            >
              {d}
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 6,
          }}
        >
          {cells.map((d, idx) => {
            if (d === null) {
              return <div key={`e-${idx}`} style={{ minHeight: 56 }} />
            }
            const dayShoots = shootsForDay(d)
            const hasShoot = dayShoots.length > 0
            const today = isToday(d)
            const isSelected = selectedDate === isoForDay(d)
            return (
              <button
                key={`d-${d}`}
                type="button"
                onClick={() => hasShoot && setSelectedDate(isoForDay(d))}
                disabled={!hasShoot}
                style={{
                  minHeight: 56,
                  borderRadius: 12,
                  border: isSelected
                    ? '1px solid #ef4444'
                    : today
                    ? '1px solid #ef4444'
                    : '1px solid #334155',
                  background: isSelected
                    ? 'rgba(239,68,68,0.18)'
                    : today
                    ? 'rgba(239,68,68,0.08)'
                    : '#0f172a',
                  color: today ? '#ef4444' : '#f8fafc',
                  fontWeight: 800,
                  fontSize: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  cursor: hasShoot ? 'pointer' : 'default',
                  opacity: hasShoot ? 1 : 0.55,
                  fontFamily: 'inherit',
                  padding: 0,
                }}
              >
                <span>{d}</span>
                {hasShoot && (
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: today ? '#ef4444' : '#22c55e',
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {loading && (
          <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 12 }}>
            Loading shoots…
          </p>
        )}
      </section>

      {selectedDate && (
        <section className="kro-mobile-card">
          <div className="kro-mobile-card-header" style={{ marginBottom: 12 }}>
            <div
              className="kro-mobile-card-icon"
              style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}
            >
              <CalendarDays size={24} />
            </div>
            <div className="min-w-0">
              <h2>{formatDate(selectedDate)}</h2>
              <p>
                {shootsForSelected.length} shoot
                {shootsForSelected.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="kro-mobile-list">
            {shootsForSelected.map((s) => (
              <div
                className="kro-mobile-list-item"
                key={s.id}
                style={{ alignItems: 'flex-start' }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'rgba(239,68,68,0.12)',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '0 0 44px',
                  }}
                >
                  <CameraIcon size={22} />
                </div>
                <div
                  className="min-w-0 flex-1"
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  <span style={{ fontSize: 17, fontWeight: 800, color: '#f8fafc' }}>
                    {s.name}
                  </span>
                  {s.location && (
                    <span style={{ fontSize: 14, color: '#94a3b8', fontWeight: 600 }}>
                      {s.location}
                    </span>
                  )}
                  <span
                    className="kro-badge"
                    style={{
                      alignSelf: 'flex-start',
                      background:
                        s.status === 'done'
                          ? 'rgba(34,197,94,0.15)'
                          : 'rgba(239,68,68,0.15)',
                      color: s.status === 'done' ? '#22c55e' : '#ef4444',
                      marginTop: 4,
                    }}
                  >
                    {s.status || 'planned'}
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

/* ============== MOBILE PAGE (router-aware dispatcher) ============== */
export default function MobilePage() {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState(() => tabFromPath(location.pathname))
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  )

  useEffect(() => {
    setActiveTab(tabFromPath(location.pathname))
  }, [location.pathname])

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  let view = null
  if (activeTab === 'home') view = <HomeView />
  else if (activeTab === 'calendar') view = <CalendarView />
  else if (activeTab === 'shoots') view = <ShootsView />
  else if (activeTab === 'shot-list') view = <ShotListView />
  else if (activeTab === 'ideas') view = <IdeasView />
  else if (activeTab === 'team') view = <TeamView />

  return (
    <div className="kro-mobile-page-wrap">
      {!isOnline && (
        <div
          style={{
            background: '#ef4444',
            color: '#fff',
            padding: '12px 16px',
            textAlign: 'center',
            fontWeight: 700,
            fontSize: 14,
          }}
        >
          You are offline — showing cached data
        </div>
      )}
      {view}
    </div>
  )
}

function tabFromPath(pathname) {
  const p = (pathname || '').replace(/\/+$/, '')
  if (p === '' || p === '/m') return 'home'
  if (p.endsWith('/calendar')) return 'calendar'
  if (p.endsWith('/shoots')) return 'shoots'
  if (p.endsWith('/shot-list')) return 'shot-list'
  if (p.endsWith('/ideas')) return 'ideas'
  if (p.endsWith('/team')) return 'team'
  return 'home'
}
     
