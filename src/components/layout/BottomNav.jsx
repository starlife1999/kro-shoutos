import React from 'react'
import { NavLink } from 'react-router-dom'
import { Aperture, Camera, Home, ImagePlus, Users } from 'lucide-react'

const TABS = [
  { to: '/m/', label: 'Home', icon: Home, end: true },
  { to: '/m/shoots', label: 'Shoots', icon: Camera },
  { to: '/m/on-set', label: 'On-Set', icon: Aperture },
  { to: '/m/capture', label: 'Capture', icon: ImagePlus },
  { to: '/m/team', label: 'Team', icon: Users },
]

export default function BottomNav() {
  return (
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
  )
}
