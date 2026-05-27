import React, { useEffect, useState } from 'react'
import { PersonStanding, Trash2, Upload } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import { useTable } from '../../hooks/useTable'
import { supabase, uploadFile } from '../../lib/supabase'

export default function PoseReferences() {
  const [shoots, setShoots] = useState([])
  const [shootId, setShootId] = useState('')
  const { data: references, loading, insert, update, remove } = useTable('pose_references', shootId ? { shoot_id: shootId } : {})
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
        const url = await uploadFile('pose-references', `${shootId}/${Date.now()}-${file.name}`, file)
        await insert({ shoot_id: shootId, image_url: url, caption: '', notes: '' })
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
        title="Pose References"
        subtitle="Reference image grid by shoot"
        actions={
          <div className="flex items-center gap-3">
            <select className="kro-input" style={{ width: 220 }} value={shootId} onChange={(e) => setShootId(e.target.value)}>
              <option value="">Select Shoot</option>
              {shoots.map((shoot) => <option key={shoot.id} value={shoot.id}>{shoot.name}</option>)}
            </select>
            <label className={`kro-btn ${shootId ? 'kro-btn-primary' : 'kro-btn-ghost'} cursor-pointer`}>
              <Upload size={14} /> {uploading ? 'Uploading...' : 'Upload'}
              <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={!shootId || uploading} />
            </label>
          </div>
        }
      />
      <div className="p-8">
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading references...</p>
        ) : references.length === 0 ? (
          <EmptyState icon={PersonStanding} title="No Pose References" description={shootId ? 'Upload pose reference images for this shoot.' : 'Select a shoot to upload pose references.'} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-4">
            {references.map((reference) => (
              <article className="kro-card group p-3" key={reference.id}>
                <img src={reference.image_url} alt={reference.caption || 'Pose reference'} className="h-56 w-full cursor-pointer rounded-md object-cover" style={{ border: '1px solid #334155' }} onClick={() => setLightbox(reference.image_url)} />
                <input className="kro-input mt-3" placeholder="Caption" value={reference.caption || ''} onChange={(e) => update(reference.id, { caption: e.target.value })} />
                <div className="mt-3 flex justify-end"><button onClick={() => remove(reference.id)} style={{ color: '#ef4444' }} aria-label="Delete reference"><Trash2 size={15} /></button></div>
              </article>
            ))}
          </div>
        )}
      </div>
      {lightbox && <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.9)' }} onClick={() => setLightbox(null)}><img src={lightbox} alt="" style={{ maxHeight: '90vh', maxWidth: '90vw', borderRadius: 8 }} /></div>}
    </div>
  )
}
