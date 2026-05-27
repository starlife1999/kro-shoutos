import React from 'react'
import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'

const PAGE_COPY = {
  Dashboard: {
    subtitle: 'Command center for KRO PK shoots, campaigns, and creative operations.',
    cards: ['Upcoming shoots', 'Active campaigns', 'Creative queue'],
  },
  Campaigns: {
    subtitle: 'Plan campaign beats, deliverables, channels, and launch timelines.',
    cards: ['Campaign brief', 'Deliverables', 'Timeline'],
  },
  Shoots: {
    subtitle: 'Track shoot concepts, production status, locations, and crew notes.',
    cards: ['Pre-production', 'Shot list', 'On-set status'],
  },
  'Shoot Detail': {
    subtitle: 'Single shoot workspace for brief, references, schedule, team, and assets.',
    cards: ['Brief', 'Call sheet', 'Shot references'],
  },
  Calendar: {
    subtitle: 'Map shoots, deadlines, prep days, and campaign milestones.',
    cards: ['This week', 'Upcoming', 'Deadlines'],
  },
  Ideas: {
    subtitle: 'Capture concepts, prompts, hooks, captions, and visual sparks.',
    cards: ['New concepts', 'Saved hooks', 'Priority ideas'],
  },
  'Mood Board': {
    subtitle: 'Collect visual direction, textures, lighting, composition, and references.',
    cards: ['Hero references', 'Lighting', 'Composition'],
  },
  Outfits: {
    subtitle: 'Organize wardrobe, fits, styling notes, sizes, and sourcing.',
    cards: ['Looks', 'Accessories', 'Styling notes'],
  },
  'Pose References': {
    subtitle: 'Build a pose library for models, products, and campaign scenes.',
    cards: ['Standing', 'Movement', 'Detail shots'],
  },
  'Color Palette': {
    subtitle: 'Lock visual colors for campaigns, sets, edits, and brand systems.',
    cards: ['Primary tones', 'Accent tones', 'Export palette'],
  },
  Locations: {
    subtitle: 'Archive studios, streets, sets, and permits for future shoots.',
    cards: ['Saved locations', 'Scouting notes', 'Availability'],
  },
  Team: {
    subtitle: 'Manage collaborators, crew roles, contacts, and responsibilities.',
    cards: ['Crew', 'Talent', 'Vendors'],
  },
  Budget: {
    subtitle: 'Track estimates, actuals, deposits, and production spend.',
    cards: ['Estimate', 'Actuals', 'Outstanding'],
  },
  'Raw Photos': {
    subtitle: 'Archive raw photo batches, selects, upload status, and handoff notes.',
    cards: ['Imports', 'Selects', 'Client handoff'],
  },
  'AI Tools': {
    subtitle: 'Generate shoot names, captions, prompts, and production helpers.',
    cards: ['Caption assistant', 'Shoot name generator', 'Prompt builder'],
  },
}

export default function StubPage({ title }) {
  const page = PAGE_COPY[title] || {
    subtitle: 'KRO ShootOS workspace.',
    cards: ['Plan', 'Create', 'Ship'],
  }

  return (
    <div>
      <PageHeader
        title={title}
        subtitle={page.subtitle}
        actions={
          <button className="kro-btn kro-btn-primary">
            <Plus size={16} />
            New
          </button>
        }
      />
      <div className="p-8">
        <div className="mb-6 flex items-center gap-3">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={16} color="#94a3b8" />
            <input className="kro-input pl-9" placeholder={`Search ${title.toLowerCase()}`} />
          </div>
          <button className="kro-btn kro-btn-ghost" aria-label="Filter">
            <SlidersHorizontal size={16} />
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {page.cards.map((card, index) => (
            <section className="kro-card min-h-44" key={card}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-white">{card}</h2>
                <span className="kro-badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: '#ef4444' }}>
                  Stub
                </span>
              </div>
              <p className="text-sm leading-6" style={{ color: '#94a3b8' }}>
                Scaffold panel ready for Supabase data, uploads, and production workflows.
              </p>
              <div className="mt-6 h-2 rounded-full" style={{ background: '#0f172a' }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${35 + index * 18}%`,
                    background: index === 1 ? '#f59e0b' : index === 2 ? '#3b82f6' : '#ef4444',
                  }}
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
