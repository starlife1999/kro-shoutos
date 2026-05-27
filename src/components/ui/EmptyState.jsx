import React from 'react'

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      {Icon && (
        <div
          className="flex items-center justify-center mb-4"
          style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'rgba(239,68,68,0.1)', color: '#ef4444'
          }}
        >
          <Icon size={28} />
        </div>
      )}
      <h3 className="font-bold text-white mb-1" style={{ fontSize: '1rem' }}>{title}</h3>
      {description && (
        <p className="text-sm mb-6" style={{ color: '#94a3b8', maxWidth: 320 }}>{description}</p>
      )}
      {action}
    </div>
  )
}
