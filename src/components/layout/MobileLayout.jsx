import React from 'react'
import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function MobileLayout() {
  return (
    <div className="kro-mobile-shell">
      <header className="kro-mobile-header">
        <div className="kro-mobile-logo">KRO</div>
        <div className="min-w-0">
          <div className="kro-mobile-brand">ShootOS</div>
          <div className="kro-mobile-subtitle">KRO PK - On-Set Companion</div>
        </div>
      </header>

      <main className="kro-mobile-main">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
