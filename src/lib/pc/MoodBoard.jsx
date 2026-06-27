import React, { useState, useEffect } from 'react'
import { Upload, Image, Trash2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import { useTable } from '../../hooks/useTable'
import { supabase, uploadFile } from '../../lib/supabase'

export default function MoodBoard() {
  const [shoots, setShoots] = useState([])
  const [shootId, setShootId] = useState('')
  const { data: items, insert, remove, refetch } = useTable('mood_board', shootId ? { shoot_id: shootId } : {})
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    supabase.from('shoots').select('id, name').order('date', { ascending: false }).then(({ data }) => setShoots(data || []))
  }, [])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length || !shootId) return
    setUploading(true)
    try {
      await Promise.all(files.map(async (file) => {
        const path = `${shootId}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name}`
        const url = await uploadFile('mood-board', path, file)
        await insert({ shoot_id: shootId, image_url: url })
      }))
      await refetch()
    } catch (err) {
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div>
      <PageHeader title="Mood Board" subtitle="Visual reference library by shoot"
        actions={
          <div className="flex items-center gap-3">
            <select className="kro-input" style={{ width: 220 }} value={shootId} onChange={(e) => setShootId(e.target.value)}>
              <option value="">All Shoots</option>
              {shoots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {shootId && (
              <label className="kro-btn kro-btn-primary cursor-pointer">
                <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload Images'}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>
        }
      />
      <div className="p-8">
        {items.length === 0 ? (
          <EmptyState icon={Image} title="No Mood Board Images" description={shootId ? "Upload reference images for this shoot." : "Select a shoot to view its mood board."} />
        ) : (
          <div className="columns-4 gap-3 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="group relative break-inside-avoid mb-3">
                <img src={item.image_url} alt="" className="w-full rounded-xl cursor-pointer" style={{ border: '1px solid #334155' }} onClick={() => setLightbox(item.image_url)} />
                <button onClick={() => remove(item.id)} className="absolute top-2 right-2 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.7)', color: '#ef4444' }}><Trash2 size={13} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}
