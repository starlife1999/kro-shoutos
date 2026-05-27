import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function MobileLayout() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0f172a', paddingBottom: 64 }}>
      {/* Mobile Header */}
      <header
        className="flex items-center gap-3 px-4 py-3 sticky top-0 z-50"
        style={{ background: '#080d18', borderBottom: '1px solid #334155' }}
      >
        <div
          className="flex items-center justify-center font-bold text-white text-xs"
          style={{ width: 30, height: 30, background: '#ef4444', borderRadius: 6 }}
        >
          KRO
        </div>
        <div>
          <div className="text-white font-bold text-sm" style={{ letterSpacing: '0.04em' }}>ShootOS</div>
          <div className="text-xs" style={{ color: '#475569' }}>KRO PK — On-Set Companion</div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
