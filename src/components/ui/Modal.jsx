import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, width = 520 }) {
  useEffect(() => {
    const handle = (e) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="kro-card relative flex flex-col"
        style={{ width, maxWidth: '95vw', maxHeight: '90vh', overflow: 'auto' }}
      >
        <div
          className="flex items-center justify-between mb-4"
          style={{ borderBottom: '1px solid #334155', paddingBottom: '0.75rem' }}
        >
          <h2 className="font-bold text-white" style={{ letterSpacing: '0.02em', fontSize: '1rem' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded transition-colors"
            style={{ color: '#94a3b8' }}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
