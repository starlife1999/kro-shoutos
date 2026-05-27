import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import { supabase } from '../../lib/supabase'

const STATUS_COLORS = {
  planning: '#3b82f6',
  confirmed: '#f59e0b',
  'in-progress': '#ef4444',
  completed: '#22c55e',
  cancelled: '#475569',
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarPage() {
  const today = new Date()
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [shoots, setShoots] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    supabase.from('shoots').select('id, name, date, status, location').then(({ data }) => setShoots(data || []))
  }, [])

  const firstDay = new Date(current.year, current.month, 1).getDay()
  const daysInMonth = new Date(current.year, current.month + 1, 0).getDate()

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const getShootsForDay = (day) => {
    if (!day) return []
    const dateStr = `${current.year}-${String(current.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return shoots.filter((s) => s.date && s.date.startsWith(dateStr))
  }

  const prevMonth = () => setCurrent((c) => c.month === 0 ? { year: c.year - 1, month: 11 } : { ...c, month: c.month - 1 })
  const nextMonth = () => setCurrent((c) => c.month === 11 ? { year: c.year + 1, month: 0 } : { ...c, month: c.month + 1 })

  const isToday = (day) => day && today.getFullYear() === current.year && today.getMonth() === current.month && today.getDate() === day

  return (
    <div>
      <PageHeader title="Calendar" subtitle="Monthly shoot overview" />
      <div className="p-8">
        <div className="kro-card">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prevMonth} className="kro-btn kro-btn-ghost" style={{ padding: '0.4rem 0.7rem' }}><ChevronLeft size={16} /></button>
            <h2 className="font-bold text-white text-lg" style={{ letterSpacing: '0.04em' }}>
              {MONTHS[current.month]} {current.year}
            </h2>
            <button onClick={nextMonth} className="kro-btn kro-btn-ghost" style={{ padding: '0.4rem 0.7rem' }}><ChevronRight size={16} /></button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center py-2" style={{ color: '#475569', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              const dayShootsList = getShootsForDay(day)
              return (
                <div
                  key={idx}
                  className="min-h-24 p-2 rounded-xl transition-colors"
                  style={{
                    background: day ? '#0f172a' : 'transparent',
                    border: isToday(day) ? '2px solid #ef4444' : '1px solid transparent',
                    cursor: dayShootsList.length ? 'pointer' : 'default',
                  }}
                  onClick={() => dayShootsList.length && setSelected(dayShootsList)}
                >
                  {day && (
                    <>
                      <p
                        className="text-xs font-bold mb-1"
                        style={{ color: isToday(day) ? '#ef4444' : '#94a3b8' }}
                      >
                        {day}
                      </p>
                      <div className="space-y-0.5">
                        {dayShootsList.slice(0, 3).map((s) => (
                          <div
                            key={s.id}
                            className="text-xs px-1.5 py-0.5 rounded font-semibold truncate"
                            style={{ background: (STATUS_COLORS[s.status] || '#475569') + '22', color: STATUS_COLORS[s.status] || '#475569', fontSize: '0.6rem' }}
                          >
                            {s.name}
                          </div>
                        ))}
                        {dayShootsList.length > 3 && (
                          <p className="text-xs" style={{ color: '#475569', fontSize: '0.6rem' }}>+{dayShootsList.length - 3} more</p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 pt-4" style={{ borderTop: '1px solid #334155' }}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ background: color }} />
                <span className="text-xs font-semibold uppercase" style={{ color: '#94a3b8', letterSpacing: '0.06em' }}>{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Day Shoot List */}
        {selected && (
          <div className="mt-4 kro-card">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-white text-sm uppercase" style={{ letterSpacing: '0.08em' }}>Shoots on this day</h3>
              <button onClick={() => setSelected(null)} className="text-xs" style={{ color: '#94a3b8' }}>✕ Close</button>
            </div>
            <div className="space-y-2">
              {selected.map((s) => (
                <Link key={s.id} to={`/shoots/${s.id}`} className="flex items-center gap-3 p-2 rounded-lg" style={{ background: '#0f172a' }}>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: STATUS_COLORS[s.status] || '#475569' }} />
                  <p className="font-semibold text-white text-sm flex-1">{s.name}</p>
                  {s.location && <p className="text-xs" style={{ color: '#94a3b8' }}>{s.location}</p>}
                  <StatusBadge status={s.status} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
