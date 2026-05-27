import React, { useState, useEffect } from 'react'
import { Upload, PersonStanding, Trash2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import { useTable } from '../../hooks/useTable'
import { supabase, uploadFile } from '../../lib/supabase'

export default function PoseReferences() {
  const [shoots, setShoots] = useState([])
  const [shootId, setShootId] = useState('')
  const { data: shots, refetch } = useTable('shot_list', shootId ? { shoot_id: shootId } : {})
  const [uploading, setUploading] = useState(null)
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    supabase.from('shoots').select('id, name').order('date', { ascending: false }).then(({ data }) => setShoots(data || []))
  }, [])

  const posedShots = shots.filter((s) => s.pose_reference_url)

  const handleUpload = async (shotId, e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(shotId)
    try {
      const path = `${shootId || 'general'}/${Date.now()}-${file.name}`
      const url = await uploadFile('pose-references', path, file)
      await supabase.from('shot_list').update({ pose_reference_url: url }).eq('id', shotId)
      await refetch()
    } catch (err) { alert('Upload failed: ' + err.message) }
    finally { setUploading(null) ; e.target.value = '' }
  }

  return (
    <div>
      <PageHeader title="Pose References" subtitle="Pose inspiration per shot"
        actions={
          <select className="kro-input" style={{ width: 220 }} value={shootId} onChange={(e) => setShootId(e.target.value)}>
            <option value="">All Shoots</option>
            {shoots.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        }
      />
      <div className="p-8">
        {shots.length === 0 ? (
          <EmptyState icon={PersonStanding} title="No Shot List" description="Select a shoot with a shot list to manage pose references." />
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {shots.map((shot) => (
              <div key={shot.id} className="kro-card group">
                <p className="font-semibold text-white text-sm mb-3">{shot.description}</p>
                {shot.pose_reference_url ? (
                  <div className="relative">
                    <img src={shot.pose_reference_url} alt="" className="w-full h-48 object-cover rounded-lg cursor-pointer" onClick={() => setLightbox(shot.pose_reference_url)} />
                  </div>
                ) : (
                  <div className="w-full h-48 rounded-lg flex items-center justify-center" style={{ background: '#0f172a', border: '2px dashed #334155' }}>
                    <p className="text-xs" style={{ color: '#475569' }}>No reference yet</p>
                  </div>
                )}
                <label className="mt-3 kro-btn kro-btn-ghost w-full justify-center cursor-pointer" style={{ display: 'flex' }}>
                  <Upload size={13} /> {uploading === shot.id ? 'Uploading...' : 'Upload Reference'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(shot.id, e)} disabled={uploading === shot.id} />
                </label>
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
