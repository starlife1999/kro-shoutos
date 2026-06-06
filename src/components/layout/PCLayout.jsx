import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function PCLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0f172a' }}>

      {/* Sidebar — always in flow on desktop, off-canvas on mobile */}
      <div
        style={{
          flexShrink: 0,
          width: 220,
          height: '100vh',
          overflowY: 'auto',
        }}
        className="hidden md:block"
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden"
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 120,
          width: 44, height: 44, borderRadius: 12,
          border: '1px solid #334155', background: '#080d18',
          color: '#f8fafc', fontSize: 20, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        ☰
      </button>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden"
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 110,
            background: 'rgba(0,0,0,0.55)',
          }}
        />
      )}

      {/* Mobile sidebar overlay */}
      <div
        className="md:hidden"
        style={{
          position: 'fixed', top: 0, left: 0,
          height: '100vh', zIndex: 115, width: 220,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 180ms ease',
          overflowY: 'auto',
        }}
      >
        <Sidebar onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>

    </div>
  )
}

