import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Camera, Megaphone, Lightbulb, DollarSign, CalendarDays, TrendingUp, ArrowRight } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import StatCard from '../../components/ui/StatCard'
import StatusBadge from '../../components/ui/StatusBadge'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const [stats, setStats] = useState({ shoots: 0, campaigns: 0, ideas: 0, budget: 0 })
  const [upcoming, setUpcoming] = useState([])
  const [recentIdeas, setRecentIdeas] = useState([])
  const [activeCampaigns, setActiveCampaigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const [shootsRes, campaignsRes, ideasRes, budgetRes, upcomingRes, ideasRecentRes, activeCampRes] = await Promise.all([
          supabase.from('shoots').select('id', { count: 'exact', head: true }),
          supabase.from('campaigns').select('id', { count: 'exact', head: true }),
          supabase.from('ideas').select('id', { count: 'exact', head: true }),
          supabase.from('budget_items').select('estimated_cost'),
          supabase.from('shoots').select('id, name, date, location, status').gte('date', new Date().toISOString().split('T')[0]).order('date').limit(5),
          supabase.from('ideas').select('id, title, category, created_at').order('created_at', { ascending: false }).limit(4),
          supabase.from('campaigns').select('id, name, status, start_date, end_date').eq('status', 'active').limit(4),
        ])
        const totalBudget = (budgetRes.data || []).reduce((s, r) => s + (r.estimated_cost || 0), 0)
        setStats({ shoots: shootsRes.count || 0, campaigns: campaignsRes.count || 0, ideas: ideasRes.count || 0, budget: totalBudget })
        setUpcoming(upcomingRes.data || [])
        setRecentIdeas(ideasRecentRes.data || [])
        setActiveCampaigns(activeCampRes.data || [])
      } catch (e) { console.error(e) }
      finally { setLoading(false) }
    }
    load()
  }, [])

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
  const formatCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="KRO PK — Photography Creative OS"
      />
      <div className="p-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Shoots" value={stats.shoots} icon={Camera} color="#ef4444" />
          <StatCard label="Campaigns" value={stats.campaigns} icon={Megaphone} color="#f59e0b" />
          <StatCard label="Ideas" value={stats.ideas} icon={Lightbulb} color="#3b82f6" />
          <StatCard label="Est. Budget" value={formatCurrency(stats.budget)} icon={DollarSign} color="#22c55e" sublabel="all shoots" />
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Upcoming Shoots */}
          <div className="col-span-2 kro-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-white" style={{ letterSpacing: '0.04em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                Upcoming Shoots
              </h2>
              <Link to="/shoots" className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#ef4444', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                View All <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <p className="text-sm" style={{ color: '#475569' }}>Loading...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: '#475569' }}>No upcoming shoots scheduled.</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((s) => (
                  <Link
                    key={s.id}
                    to={`/shoots/${s.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg transition-colors"
                    style={{ background: '#0f172a' }}
                  >
                    <div
                      className="flex items-center justify-center flex-shrink-0 font-bold text-xs"
                      style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}
                    >
                      {formatDate(s.date)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white text-sm truncate">{s.name}</p>
                      <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{s.location || 'No location set'}</p>
                    </div>
                    <StatusBadge status={s.status} />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Active Campaigns */}
            <div className="kro-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-white" style={{ letterSpacing: '0.04em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Active Campaigns
                </h2>
                <Link to="/campaigns" className="text-xs font-semibold" style={{ color: '#ef4444', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  All
                </Link>
              </div>
              {activeCampaigns.length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: '#475569' }}>No active campaigns.</p>
              ) : (
                <div className="space-y-2">
                  {activeCampaigns.map((c) => (
                    <Link key={c.id} to="/campaigns" className="block p-2 rounded-lg" style={{ background: '#0f172a' }}>
                      <p className="font-semibold text-white text-xs truncate">{c.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>
                        {formatDate(c.start_date)} – {formatDate(c.end_date)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Ideas */}
            <div className="kro-card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-white" style={{ letterSpacing: '0.04em', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                  Recent Ideas
                </h2>
                <Link to="/ideas" className="text-xs font-semibold" style={{ color: '#ef4444', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  All
                </Link>
              </div>
              {recentIdeas.length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: '#475569' }}>No ideas yet.</p>
              ) : (
                <div className="space-y-2">
                  {recentIdeas.map((i) => (
                    <div key={i.id} className="p-2 rounded-lg" style={{ background: '#0f172a' }}>
                      <p className="font-semibold text-white text-xs truncate">{i.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{i.category}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
