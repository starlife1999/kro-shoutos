import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Camera, Home, Lightbulb, ListChecks, Users, CalendarDays } from 'lucide-react'

const TABS = [
  { to: '/m/', label: 'Home', icon: Home, end: true },
  { to: '/m/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/m/shoots', label: 'Shoots', icon: Camera },
  { to: '/m/shot-list', label: 'Shot List', icon: ListChecks },
  { to: '/m/team', label: 'Team', icon: Users },
  { to: '/m/ideas', label: 'Ideas', icon: Lightbulb },
]

export default function MobileLayout() {
  return (
    <div className="kro-mobile-shell">
      <main className="kro-mobile-main">
        <Outlet />
      </main>

      <nav className="kro-mobile-bottom-nav">
        {TABS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            className={({ isActive }) => `kro-mobile-bottom-item ${isActive ? 'active' : ''}`}
            end={end}
            key={to}
            to={to}
          >
            <Icon size={24} strokeWidth={2.2} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
