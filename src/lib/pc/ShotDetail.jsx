import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronLeft, ChevronRight, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function ShotDetail() {
  const { type, shotId } = useParams()
  const [shot, setShot] = useState(null)
  const [references, setReferences] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [touchStartX, setTouchStartX] = useState(null)

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
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploading(true)
    try {
      await Promise.all(files.map(async (file) => {
        const filePath = `${shotId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`

        const { error: uploadError } = await supabase.storage
          .from('shot-references')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('shot-references')
          .getPublicUrl(filePath)

        const { error: insertError } = await supabase.from('shot_references').insert({
          shot_id: shotId,
          shot_type: type,
          image_url: urlData.publicUrl,
        })

        if (insertError) throw insertError
      }))
      await fetchReferences()
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const showPreviousImage = (e) => {
    e?.stopPropagation()
    setLightboxIndex((current) => (
      current === null ? null : (current - 1 + references.length) % references.length
    ))
  }

  const showNextImage = (e) => {
    e?.stopPropagation()
    setLightboxIndex((current) => (
      current === null ? null : (current + 1) % references.length
    ))
  }

  const handleLightboxTouchEnd = (e) => {
    if (touchStartX === null || references.length < 2) return
    const distance = touchStartX - e.changedTouches[0].clientX
    setTouchStartX(null)
    if (Math.abs(distance) < 40) return
    if (distance > 0) {
      showNextImage(e)
    } else {
      showPreviousImage(e)
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
          <label style={{ cursor: uploading ? 'not-allowed' : 'pointer' }}>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleUpload}
              disabled={uploading}
            />
            <span className="kro-btn kro-btn-primary" style={{ opacity: uploading ? 0.7 : 1 }}>
              <Plus size={14} /> {uploading ? 'Uploading...' : 'Upload Images'}
            </span>
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
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 12,
              marginTop: 16,
            }}
          >
            {references.map((ref, index) => (
              <div key={ref.id} className="group relative">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="block w-full text-left"
                  aria-label={`Open reference image ${index + 1}`}
                >
                  <img
                    src={ref.image_url}
                    onClick={() => setLightboxIndex(index)}
                    alt=""
                    style={{
                      width: '100%',
                      height: 220,
                      objectFit: 'cover',
                      borderRadius: 12,
                      cursor: 'pointer',
                      display: 'block',
                      border: '1px solid #334155',
                    }}
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(ref.id)
                  }}
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

      {lightboxIndex !== null && references[lightboxIndex] && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setLightboxIndex(null)}
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={handleLightboxTouchEnd}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setLightboxIndex(null)
            }}
            aria-label="Close image viewer"
            className="absolute top-5 right-5 p-3 rounded-lg"
            style={{ background: 'rgba(15,23,42,0.85)', color: '#f8fafc' }}
          >
            <X size={20} />
          </button>

          {references.length > 1 && (
            <button
              type="button"
              onClick={showPreviousImage}
              aria-label="Previous reference image"
              className="absolute left-5 p-4 rounded-full"
              style={{ background: 'rgba(15,23,42,0.85)', color: '#f8fafc' }}
            >
              <ChevronLeft size={28} />
            </button>
          )}

          <img
            src={references[lightboxIndex].image_url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
          />

          {references.length > 1 && (
            <button
              type="button"
              onClick={showNextImage}
              aria-label="Next reference image"
              className="absolute right-5 p-4 rounded-full"
              style={{ background: 'rgba(15,23,42,0.85)', color: '#f8fafc' }}
            >
              <ChevronRight size={28} />
            </button>
          )}

          <div
            className="absolute bottom-5 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ background: 'rgba(15,23,42,0.85)', color: '#f8fafc' }}
          >
            {lightboxIndex + 1} of {references.length}
          </div>
        </div>
      )}
    </div>
  )
}
