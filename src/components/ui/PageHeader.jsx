import React from 'react'

export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div
      className="flex items-center justify-between px-8 py-6"
      style={{ borderBottom: '1px solid #334155' }}
    >
      <div>
        <h1
          className="font-bold text-white"
          style={{ fontSize: '1.5rem', letterSpacing: '0.02em' }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm mt-0.5" style={{ color: '#94a3b8' }}>{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  )
}
