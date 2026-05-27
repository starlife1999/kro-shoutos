import React from 'react'
import { Camera, CheckCircle2, Clock3, Plus, Sparkles } from 'lucide-react'

const rows = [
  { label: 'Call time', value: '09:00', color: '#f59e0b' },
  { label: 'Shot list', value: 'Ready', color: '#22c55e' },
  { label: 'Assets', value: 'Sync', color: '#3b82f6' },
]

export default function MobilePage({ title, mode }) {
  return (
    <div className="kro-mobile-page">
      <div className="kro-mobile-hero">
        <div className="min-w-0">
          <p className="kro-mobile-eyebrow">{mode}</p>
          <h1>{title}</h1>
          <p>KRO ShootOS mobile companion for on-set decisions.</p>
        </div>
        <button className="kro-mobile-icon-button" aria-label="Add">
          <Plus size={24} />
        </button>
      </div>

      <section className="kro-mobile-card">
        <div className="kro-mobile-card-header">
          <div className="kro-mobile-card-icon">
            <Camera size={24} />
          </div>
          <div className="min-w-0">
            <h2>Next Shoot</h2>
            <p>Editorial prep board</p>
          </div>
        </div>
        <div className="kro-mobile-stats">
          {rows.map((row) => (
            <div className="kro-mobile-stat" key={row.label}>
              <p>{row.label}</p>
              <strong style={{ color: row.color }}>{row.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="kro-mobile-list">
        {[
          ['Confirm location notes', Clock3, '#f59e0b'],
          ['Review pose references', Sparkles, '#3b82f6'],
          ['Pack final outfit list', CheckCircle2, '#22c55e'],
        ].map(([text, Icon, color]) => (
          <div className="kro-mobile-list-item" key={text}>
            <Icon color={color} size={24} />
            <span>{text}</span>
          </div>
        ))}
      </section>
    </div>
  )
}
