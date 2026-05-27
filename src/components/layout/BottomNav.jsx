import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Camera, Aperture, ImagePlus, Users } from 'lucide-react'

const TABS = [
  { to: '/m/', label: 'Home', icon: Home, end: true },
  { to: '/m/shoots', label: 'Shoots', icon: Camera },
  { to: '/m/on-set', label: 'On-Set', icon: Aperture },
  { to: '/m/capture', label: 'Capture', icon: ImagePlus },
  { to: '/m/team', label: 'Team', icon: Users },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 flex items-center"
      style={{
        background: '#080d18',
        borderTop: '1px solid #334155',
        height: 64,
        zIndex: 100,
      }}
    >
      {TABS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            'flex-1 flex flex-col items-center justify-center gap-0.5 transition-all'
            + (isActive ? ' text-red-500' : ' text-slate-500')
          }
          style={{ minHeight: 48 }}
        >
          <Icon size={20} />
          <span
            className="font-semibold"
            style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}
          >
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}
