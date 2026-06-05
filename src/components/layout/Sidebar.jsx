import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  Bot,
  CalendarDays,
  Camera,
  DollarSign,
  Images,
  LayoutDashboard,
  Lightbulb,
  MapPin,
  Megaphone,
  Palette,
  PersonStanding,
  Shirt,
  Sparkles,
  Users,
} from 'lucide-react'

const NAV = [
  {
    section: 'Planning',
    items: [
      { to: '/', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/campaigns', label: 'Campaigns', icon: Megaphone },
      { to: '/shoots', label: 'Shoots', icon: Camera },
      { to: '/calendar', label: 'Calendar', icon: CalendarDays },
    ],
  },
  {
    section: 'Creative',
    items: [
      { to: '/ideas', label: 'Ideas', icon: Lightbulb },
      { to: '/mood-board', label: 'Mood Board', icon: Images },
      { to: '/outfits', label: 'Outfits', icon: Shirt },
      { to: '/pose-references', label: 'Pose References', icon: PersonStanding },
      { to: '/color-palette', label: 'Color Palette', icon: Palette },
    ],
  },
  {
    section: 'Archive',
    items: [
      { to: '/locations', label: 'Locations', icon: MapPin },
      { to: '/raw-photos', label: 'Raw Photos', icon: Images },
    ],
  },
  {
    section: 'Operations',
    items: [
      { to: '/team', label: 'Team', icon: Users },
      { to: '/budget', label: 'Budget', icon: DollarSign },
    ],
  },
  {
    section: 'AI Tools',
    items: [
      { to: '/ai-tools', label: 'AI Tools', icon: Bot },
    ],
  },
]

export default function Sidebar({ onNavigate }) {
  return (
    <aside
      className="flex h-full flex-col overflow-y-auto"
      style={{ width: 236, minWidth: 236, background: '#080d18', borderRight: '1px solid #334155' }}
    >

      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid #1e293b' }}>
        <div
          className="flex items-center justify-center rounded-md text-sm font-bold text-white"
          style={{ width: 36, height: 36, background: '#ef4444', letterSpacing: '0.08em' }}
        >
          KRO
        </div>
        <div>
          <div className="text-sm font-bold uppercase text-white tracking-[0.12em]">ShootOS</div>
          <div className="text-xs uppercase tracking-[0.18em]" style={{ color: '#94a3b8' }}>KRO PK</div>
        </div>
      </div>

      <nav className="flex-1 px-2 pb-4">
        {NAV.map((group) => (
          <div key={group.section}>
            <div className="kro-section-title">{group.section}</div>
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                className={({ isActive }) => `kro-nav-item ${isActive ? 'active' : ''}`}
                end={to === '/'}
                key={to}
                to={to}
                onClick={() => onNavigate?.()}
              >
                <Icon size={15} />
                <span>{label}</span>
              </NavLink>

            ))}
          </div>
        ))}
      </nav>

      <div className="px-4 py-4 text-xs uppercase tracking-[0.16em]" style={{ color: '#475569', borderTop: '1px solid #1e293b' }}>
        <div className="mb-2 flex items-center gap-2 text-white">
          <Sparkles size={14} color="#f59e0b" />
          Dark KRO PK
        </div>
        v1.0.0
      </div>
    </aside>
  )
}
