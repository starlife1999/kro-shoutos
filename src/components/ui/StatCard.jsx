import React from 'react'

export default function StatCard({ label, value, icon: Icon, color = '#ef4444', sublabel }) {
  return (
    <div className="kro-card flex items-center gap-4">
      <div
        className="flex items-center justify-center flex-shrink-0"
        style={{
          width: 48, height: 48, borderRadius: 12,
          background: color + '22', color
        }}
      >
        <Icon size={22} />
      </div>
      <div>
        <div className="font-bold text-white" style={{ fontSize: '1.6rem', lineHeight: 1 }}>{value}</div>
        <div className="text-xs mt-1 font-semibold uppercase" style={{ color: '#94a3b8', letterSpacing: '0.08em' }}>{label}</div>
        {sublabel && <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{sublabel}</div>}
      </div>
    </div>
  )
}
