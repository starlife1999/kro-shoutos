import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function PCLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="kro-pc-shell flex h-screen overflow-hidden" style={{ background: '#0f172a' }}>
      {/* Mobile hamburger */}
      <button
        className="kro-mobile-hamburger"
        aria-label="Open sidebar"
        onClick={() => setSidebarOpen(true)}
        type="button"
      >
        ☰
      </button>

      {/* Mobile backdrop */}
      <div
        className={`kro-mobile-backdrop ${sidebarOpen ? 'open' : ''}`}
        onClick={() => setSidebarOpen(false)}
        role="button"
        tabIndex={-1}
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar (desktop always visible, mobile off-canvas overlay) */}
      <div className={`kro-sidebar-wrap ${sidebarOpen ? 'open' : ''}`}>
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>


      {/* Main content always visible */}
      <main className="kro-pc-main flex-1 overflow-y-auto">
        <Outlet />
      </main>

      {/* Close sidebar when route changes via footer click; also allow Sidebar to close through links below */}
      <div className="sr-only" />
    </div>
  )
}

