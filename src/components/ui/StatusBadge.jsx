import React from 'react'

const STATUS_STYLES = {
  planning:     { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  confirmed:    { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  'in-progress':{ bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
  completed:    { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
  cancelled:    { bg: 'rgba(148,163,184,0.15)',color: '#94a3b8' },
  active:       { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
  archived:     { bg: 'rgba(148,163,184,0.15)',color: '#94a3b8' },
  general:      { bg: 'rgba(148,163,184,0.15)',color: '#94a3b8' },
  fashion:      { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  concept:      { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
  location:     { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
  lighting:     { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
}

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.general
  return (
    <span
      className="kro-badge"
      style={{ background: style.bg, color: style.color }}
    >
      {status}
    </span>
  )
}
