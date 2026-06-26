import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Upload, Trash2, Image as ImageIcon } from 'lucide-react'
import { supabase, uploadFile } from '../../lib/supabase'

export default function ShotDetail() {
  const { type, shotId } = useParams()
  const [shot, setShot] = useState(null)
  const [references, setReferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const fetchShot = useCallback(async () => {
    if (!shotId) return
    setLoading(true)
    try {
      const table = type === 'idea' ? 'idea_shots' : 'shot_list'
      const { data, error: err } = await supabase
        .from(table)
        .select('*')
        .eq('id', shotId)
        .single()
      if (err) throw err
      setShot(data)
    } catch (e) {
      console.error('Fetch shot failed:', e)
    } finally {
      setLoading(false)
    }
  }, [shotId, type])

  const fetchReferences = useCallback(async () => {
    if (!shotId) return
    try {
      const { data, error: err } = await supabase
        .from('shot_references')
        .select('*')
        .eq('shot_id', shotId)
        .eq('shot_type', type)
        .order('created_at', { ascending: false })
      if (err) throw err
      setReferences(data || [])
    } catch (e) {
      console.error('Fetch references failed:', e)
    }
  }, [shotId, type])

  useEffect(() => { fetchShot() }, [fetchShot])
  useEffect(() => { fetchReferences() }, [fetchReferences])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `${shotId}/${Date.now()}-${file.name}`
      const url = await uploadFile('shot-references', path, file)
      const { error: err } = await supabase
        .from('shot_references')
        .insert({ shot_id: shotId, image_url: url, shot_type: type })
      if (err) throw err
      await fetchReferences()
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this reference image?')) return
    try {
      const { error: err } = await supabase
        .from('shot_references')
        .delete()
        .eq('id', id)
      if (err) throw err
      await fetchReferences()
    } catch (e) {
      alert('Failed to delete: ' + e.message)
    }
  }

  if (loading) return <div className="p-8" style={{ color: '#94a3b8' }}>Loading shot...</div>
  if (!shot) return <div className="p-8" style={{ color: '#94a3b8' }}>Shot not found.</div>

  const backPath = type === 'idea' ? '/ideas' : '/shot-list'

  return (
    <div style={{ background: '#080d18', minHeight: '100vh' }}>
      {/* Header */}
      <div className="px-8 py-6" style={{ borderBottom: '1px solid #334155' }}>
        <Link
          to={backPath}
          className="flex items-center gap-2 text-xs font-semibold mb-4 w-fit"
          style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}
        >
          <ArrowLeft size={12} /> Back to {type === 'idea' ? 'Ideas' : 'Shot List'}
        </Link>
        <div>
          <h1 className="font-bold text-white" style={{ fontSize: '1.5rem' }}>{shot.description || shot.title}</h1>
          <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
            {type === 'idea' ? 'Idea Shot' : 'Shoot Shot'} · {references.length} reference image{references.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Reference Images */}
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-bold text-white text-sm uppercase" style={{ letterSpacing: '0.08em' }}>Reference Images</h2>
          <label className="kro-btn kro-btn-primary cursor-pointer">
            <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Image'}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {references.length === 0 ? (
          <div className="kro-card flex flex-col items-center justify-center py-16">
            <ImageIcon size={40} style={{ color: '#334155' }} />
            <p className="mt-4 font-bold text-sm text-white">No Reference Images</p>
            <p className="mt-1 text-xs" style={{ color: '#94a3b8' }}>
              Upload reference images for this shot.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {references.map((ref) => (
              <div key={ref.id} className="group relative">
                <img
                  src={ref.image_url}
                  alt=""
                  className="w-full h-40 object-cover rounded-xl"
                  style={{ border: '1px solid #334155' }}
                />
                <button
                  onClick={() => handleDelete(ref.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg"
                  style={{ background: 'rgba(0,0,0,0.7)', color: '#ef4444' }}
                  aria-label="Delete reference image"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}