import React, { useEffect, useState } from 'react'
import { Camera, Check, ImagePlus, Trash2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import { useTable } from '../../hooks/useTable'
import { supabase, uploadFile } from '../../lib/supabase'

export default function RawPhotos() {
  const [shoots, setShoots] = useState([])
  const [shootId, setShootId] = useState('')
  const { data: photos, loading, insert, update, remove } = useTable('raw_photos', shootId ? { shoot_id: shootId } : {})
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    supabase.from('shoots').select('id, name').order('date', { ascending: false }).then(({ data }) => setShoots(data || []))
  }, [])

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length || !shootId) return
    setUploading(true)
    try {
      for (const file of files) {
        const url = await uploadFile('raw-photos', `${shootId}/${Date.now()}-${file.name}`, file)
        await insert({ shoot_id: shootId, image_url: url, is_select: false, caption: '', notes: '' })
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  return (
    <div>
      <PageHeader
        title="Raw Photos"
        subtitle={`${photos.filter((photo) => photo.is_select).length} selects of ${photos.length} photos`}
        actions={
          <div className="flex items-center gap-3">
            <select className="kro-input" style={{ width: 220 }} value={shootId} onChange={(e) => setShootId(e.target.value)}>
              <option value="">Select Shoot</option>
              {shoots.map((shoot) => <option key={shoot.id} value={shoot.id}>{shoot.name}</option>)}
            </select>
            <label className={`kro-btn ${shootId ? 'kro-btn-primary' : 'kro-btn-ghost'} cursor-pointer`}>
              <ImagePlus size={14} /> {uploading ? 'Uploading...' : 'Upload Photos'}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={!shootId || uploading} />
            </label>
          </div>
        }
      />
      <div className="p-8">
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading photos...</p>
        ) : photos.length === 0 ? (
          <EmptyState icon={Camera} title="No Raw Photos" description={shootId ? 'Upload raw photos for this shoot.' : 'Select a shoot to upload and manage photos.'} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-4">
            {photos.map((photo) => (
              <article className="kro-card group p-3" key={photo.id}>
                <div className="relative">
                  <img src={photo.image_url} alt={photo.caption || 'Raw photo'} className="h-48 w-full cursor-pointer rounded-md object-cover" style={{ border: `2px solid ${photo.is_select ? '#22c55e' : '#334155'}` }} onClick={() => setLightbox(photo.image_url)} />
                  {photo.is_select && <span className="absolute left-2 top-2 kro-badge" style={{ background: 'rgba(34,197,94,0.9)', color: '#fff' }}><Check size={11} /> Select</span>}
                </div>
                <input className="kro-input mt-3" placeholder="Caption" value={photo.caption || ''} onChange={(e) => update(photo.id, { caption: e.target.value })} />
                <textarea className="kro-input mt-2" rows={2} placeholder="Notes" value={photo.notes || ''} onChange={(e) => update(photo.id, { notes: e.target.value })} style={{ resize: 'vertical' }} />
                <div className="mt-3 flex items-center justify-between">
                  <button className="kro-btn kro-btn-ghost" style={{ padding: '0.35rem 0.7rem' }} onClick={() => update(photo.id, { is_select: !photo.is_select })}>{photo.is_select ? 'Unmark' : 'Mark Select'}</button>
                  <button onClick={() => remove(photo.id)} style={{ color: '#ef4444' }} aria-label="Delete photo"><Trash2 size={15} /></button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      {lightbox && <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setLightbox(null)}><img src={lightbox} alt="" style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: 8 }} /></div>}
    </div>
  )
}
