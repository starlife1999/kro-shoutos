import React, { useEffect } from 'react'
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import PCLayout from './components/layout/PCLayout'
import MobileLayout from './components/MobileLayout'

import Dashboard from './pages/pc/Dashboard'
import Campaigns from './pages/pc/Campaigns'
import Shoots from './pages/pc/Shoots'
import ShootDetail from './pages/pc/ShootDetail'
import CalendarPage from './pages/pc/CalendarPage'
import Ideas from './pages/pc/Ideas'
import MoodBoard from './pages/pc/MoodBoard'
import Outfits from './pages/pc/Outfits'
import PoseReferences from './pages/pc/PoseReferences'
import ColorPalette from './pages/pc/ColorPalette'
import Locations from './pages/pc/Locations'
import Team from './pages/pc/Team'
import Budget from './pages/pc/Budget'
import RawPhotos from './pages/pc/RawPhotos'
import AITools from './pages/pc/AITools'
import ShotList from './lib/pc/ShotList'
import MobilePage from './pages/mobile/MobilePage'

function MobileRedirect() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const isMobile = window.innerWidth < 768
    const isAtRoot = location.pathname === '/'
    if (isMobile && isAtRoot) {
      navigate('/m', { replace: true })
    }
  }, [])

  return null
}

export default function App() {
  return (
    <HashRouter>
      <MobileRedirect />
      <Routes>
        <Route path="/m" element={<MobileLayout />}>
          <Route index element={<MobilePage />} />
          <Route path="calendar" element={<MobilePage />} />
          <Route path="shoots" element={<MobilePage />} />
          <Route path="shot-list" element={<MobilePage />} />
          <Route path="team" element={<MobilePage />} />
          <Route path="ideas" element={<MobilePage />} />
          <Route path="*" element={<Navigate to="/m/" replace />} />
        </Route>
        <Route element={<PCLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/shoots" element={<Shoots />} />
          <Route path="/shoots/:id" element={<ShootDetail />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/ideas" element={<Ideas />} />
          <Route path="/mood-board" element={<MoodBoard />} />
          <Route path="/outfits" element={<Outfits />} />
          <Route path="/pose-references" element={<PoseReferences />} />
          <Route path="/color-palette" element={<ColorPalette />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/raw-photos" element={<RawPhotos />} />
          <Route path="/team" element={<Team />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/ai-tools" element={<AITools />} />
          <Route path="/shot-list" element={<ShotList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
