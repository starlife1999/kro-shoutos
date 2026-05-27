import React from 'react'
import { Camera, CheckCircle2, Clock3, Plus, Sparkles } from 'lucide-react'

const rows = [
  { label: 'Call time', value: '09:00', color: '#f59e0b' },
  { label: 'Shot list', value: 'Ready', color: '#22c55e' },
  { label: 'Assets', value: 'Sync', color: '#3b82f6' },
]

export default function MobilePage({ title, mode }) {
  return (
    <div className="px-4 py-5">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: '#ef4444' }}>
            {mode}
          </p>
          <h1 className="mt-1 text-2xl font-bold text-white">{title}</h1>
          <p className="mt-1 text-sm" style={{ color: '#94a3b8' }}>
            KRO ShootOS mobile companion for on-set decisions.
          </p>
        </div>
        <button className="kro-btn kro-btn-primary" aria-label="Add">
          <Plus size={16} />
        </button>
      </div>

      <section className="kro-card mb-4">
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-md"
            style={{ width: 40, height: 40, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
          >
            <Camera size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-white">Next Shoot</h2>
            <p className="text-xs" style={{ color: '#94a3b8' }}>Editorial prep board</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {rows.map((row) => (
            <div key={row.label} className="rounded-md p-3" style={{ background: '#0f172a', border: '1px solid #334155' }}>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.12em]" style={{ color: '#94a3b8' }}>
                {row.label}
              </p>
              <p className="mt-2 text-sm font-bold" style={{ color: row.color }}>{row.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        {[
          ['Confirm location notes', Clock3, '#f59e0b'],
          ['Review pose references', Sparkles, '#3b82f6'],
          ['Pack final outfit list', CheckCircle2, '#22c55e'],
        ].map(([text, Icon, color]) => (
          <div key={text} className="flex items-center gap-3 rounded-md p-4" style={{ background: '#1e293b', border: '1px solid #334155' }}>
            <Icon size={18} color={color} />
            <span className="text-sm font-semibold text-white">{text}</span>
          </div>
        ))}
      </section>
    </div>
  )
}
