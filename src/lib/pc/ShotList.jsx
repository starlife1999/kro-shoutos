import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardList, Plus, Trash2, Check } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import { supabase } from '../../lib/supabase'

/**
 * Shot List page
 * Schema: shot_list(id, shoot_id, description, is_done, created_at)
 *
 * After every insert / update / delete we re-fetch the rows for the
 * currently selected shoot directly into local state. We deliberately
 * do NOT call any hook's `refetch()` so the list is always in sync
 * with the latest server data and we never race with a cached result.
 */
export default function ShotList() {
  const [shoots, setShoots] = useState([])
  const [shootId, setShootId] = useState('')
  const [shots, setShots] = useState([])
  const [loading, setLoading] = useState(false)
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Load the list of shoots for the dropdown once on mount
  useEffect(() => {
    let cancelled = false
    supabase
      .from('shoots')
      .select('id, name, date')
      .order('date', { ascending: false })
      .then(({ data, error: err }) => {
        if (cancelled) return
        if (err) {
          setError(err.message)
          return
        }
        setShoots(data || [])
      })
    return () => {
      cancelled = true
    }
  }, [])

  // Direct fetch into local state whenever the selected shoot changes
  useEffect(() => {
    if (!shootId) {
      setShots([])
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)
    supabase
      .from('shot_list')
      .select('id, shoot_id, description, is_done, created_at')
      .eq('shoot_id', shootId)
      .order('created_at', { ascending: true })
      .then(({ data, error: err }) => {
        if (cancelled) return
        setLoading(false)
        if (err) {
          setError(err.message)
          return
        }
        setShots(data || [])
      })
    return () => {
      cancelled = true
    }
  }, [shootId])

  // Helper: re-fetch the shots for the current shoot straight into state
  const refetchShots = async () => {
    if (!shootId) return
    const { data, error: err } = await supabase
      .from('shot_list')
      .select('id, shoot_id, description, is_done, created_at')
      .eq('shoot_id', shootId)
      .order('created_at', { ascending: true })
    if (err) {
      setError(err.message)
      return
    }
    setShots(data || [])
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    console.log('ADD SHOT CALLED', { shootId, description })
    if (!shootId) {
      setError('Pick a shoot first')
      return
    }
    const trimmed = description.trim()
    console.log('TRIMMED', trimmed)
    if (!trimmed) {
      setError('Please enter a shot description')
      return
    }
    setSaving(true)
    setError(null)
    console.log('INSERTING', { shoot_id: shootId, description: trimmed, is_done: false })
    const { data, error: err } = await supabase
      .from('shot_list')
      .insert({ shoot_id: shootId, description: trimmed, is_done: false })
      .select()
    console.log('INSERT RESULT', data, err)
    setSaving(false)
    if (err) {
      setError(err.message)
      return
    }
    setDescription('')
    await refetchShots()
  }


  const handleToggle = async (shot) => {
    console.log('TOGGLE SHOT CALLED', { id: shot?.id, is_done: shot?.is_done })
    setError(null)

    const newIsDone = !shot.is_done
    const { error: err } = await supabase
      .from('shot_list')
      .update({ is_done: newIsDone })
      .eq('id', shot.id)

    console.log('TOGGLE SHOT RESULT', { id: shot?.id, err })

    if (err) {
      setError(err.message)
      return
    }

    await refetchShots()
  }

  const handleDelete = async (id) => {
    console.log('DELETE SHOT CALLED', { id })
    setError(null)

    const { error: err } = await supabase
      .from('shot_list')
      .delete()
      .eq('id', id)

    console.log('DELETE SHOT RESULT', { id, err })

    if (err) {
      setError(err.message)
      return
    }

    await refetchShots()
  }


  const doneCount = shots.filter((s) => s.is_done).length
  const totalCount = shots.length

  return (
    <div>
      <PageHeader
        title="Shot List"
        subtitle={
          shootId
            ? `${doneCount} of ${totalCount} shot${totalCount !== 1 ? 's' : ''} complete`
            : 'Pick a shoot to start planning shots'
        }
        actions={
          <div className="flex items-center gap-3">
            <select
              className="kro-input"
              style={{ width: 260 }}
              value={shootId}
              onChange={(e) => setShootId(e.target.value)}
            >
              <option value="">Select Shoot…</option>
              {shoots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="p-8">
        {error && (
          <div
            className="kro-card mb-4"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}
          >
            <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {!shootId ? (
          <EmptyState
            icon={ClipboardList}
            title="No Shoot Selected"
            description="Choose a shoot from the dropdown above to view and edit its shot list."
          />
        ) : (
          <>
            {/* Add-shot form */}
            <form onSubmit={handleAdd} className="kro-card mb-6 flex items-center gap-3">
              <input
                className="kro-input flex-1"
                placeholder="Describe the next shot…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
              />
              <button
                type="submit"
                className="kro-btn kro-btn-primary"
                disabled={saving || !description.trim()}
              >
                <Plus size={14} /> {saving ? 'Adding…' : 'Add Shot'}
              </button>
            </form>

            {loading ? (
              <p style={{ color: '#94a3b8' }}>Loading shots…</p>
            ) : shots.length === 0 ? (
              <EmptyState
                icon={ClipboardList}
                title="No Shots Yet"
                description="Add your first shot above to start planning this shoot."
              />
            ) : (
              <ul className="grid gap-2">
                {shots.map((shot) => (
                  <li
                    key={shot.id}
                    className="kro-card flex items-center gap-3"
                    style={{
                      opacity: shot.is_done ? 0.6 : 1,
                      textDecoration: shot.is_done ? 'line-through' : 'none',
                    }}
                  >
                    <button
                      onClick={() => handleToggle(shot)}
                      aria-label={shot.is_done ? 'Mark as not done' : 'Mark as done'}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                      style={{
                        background: shot.is_done ? 'rgba(34,197,94,0.18)' : 'rgba(148,163,184,0.12)',
                        border: `1px solid ${shot.is_done ? 'rgba(34,197,94,0.5)' : '#334155'}`,
                        color: shot.is_done ? '#22c55e' : '#94a3b8',
                      }}
                    >
                      {shot.is_done ? <Check size={14} /> : <span style={{ fontSize: 10 }}>○</span>}
                    </button>
                    <Link
                      to={`/shots/shoot/${shot.id}`}
                      className="flex-1 text-sm text-white no-underline"
                      style={{ color: '#f8fafc' }}
                    >
                      {shot.description}
                    </Link>
                    <button
                      onClick={() => handleDelete(shot.id)}
                      aria-label="Delete shot"
                      className="p-2 rounded-lg"
                      style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  )
}
