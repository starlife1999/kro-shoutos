import React, { useEffect, useMemo, useState } from 'react'
import { DollarSign, Plus, Trash2 } from 'lucide-react'
import PageHeader from '../../components/ui/PageHeader'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import { useTable } from '../../hooks/useTable'
import { supabase } from '../../lib/supabase'

const EMPTY_FORM = { item: '', estimated_cost: '', actual_cost: '', paid: false }

function ErrorNotice({ message }) {
  if (!message) return null
  return (
    <div className="kro-card" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)' }}>
      <p className="text-xs" style={{ color: '#ef4444' }}>{message}</p>
    </div>
  )
}


export default function Budget() {
  const [shoots, setShoots] = useState([])
  const [shootId, setShootId] = useState('')
  const { data: items, loading, insert, update, remove, saveError, deleteError, setSaveError, setDeleteError } = useTable('budget_items', shootId ? { shoot_id: shootId } : {})
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('shoots').select('id, name').order('date', { ascending: false }).then(({ data }) => setShoots(data || []))
  }, [])

  const totals = useMemo(() => items.reduce((acc, item) => ({
    estimated: acc.estimated + Number(item.estimated_cost || 0),
    actual: acc.actual + Number(item.actual_cost || 0),
    paid: acc.paid + (item.paid ? Number(item.actual_cost || 0) : 0),
  }), { estimated: 0, actual: 0, paid: 0 }), [items])

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)

    const payload = {
      shoot_id: shootId || null,
      item: form.item,
      estimated_cost: Number(form.estimated_cost || 0),
      actual_cost: Number(form.actual_cost || 0),
      paid: form.paid,
    }

    console.log('[Budget] insert payload:', payload)

    try {
      if (form.__TRIGGER_BAD_SAVE) {
        const badPayload = { ...payload, item: null }
        console.log('[Budget] BAD insert payload:', badPayload)
        await insert(badPayload)
      } else {
        await insert(payload)
      }

      setForm(EMPTY_FORM)
      setModal(false)
    } catch (error) {
      setSaveError(error.message)
    } finally {
      setSaving(false)
    }
  }

  // Must send *exactly* required columns on update as well.
  const handlePaidToggle = async (item) => {
    // Ensure payload uses the full required shape.
    const payload = {
      shoot_id: item.shoot_id || shootId || null,
      item: item.item,
      estimated_cost: Number(item.estimated_cost || 0),
      actual_cost: Number(item.actual_cost || 0),
      paid: !item.paid,
    }


    console.log('[Budget] update payload:', payload)

    try {
      await update(item.id, payload)
    } catch (error) {
      setSaveError(error.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      console.log('[Budget] delete id:', id)
      await remove(id)
    } catch (error) {
      setDeleteError(error.message)
    }
  }


  const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

  return (
    <div>
      <PageHeader
        title="Budget"
        subtitle="Estimated, actual, and paid production spend"
        actions={
          <div className="flex items-center gap-3">
            <select className="kro-input" style={{ width: 220 }} value={shootId} onChange={(e) => setShootId(e.target.value)}>
              <option value="">All Shoots</option>
              {shoots.map((shoot) => <option key={shoot.id} value={shoot.id}>{shoot.name}</option>)}
            </select>
            <button className="kro-btn kro-btn-primary" onClick={() => { setSaveError(null); setModal(true) }}><Plus size={14} /> Add Item</button>
          </div>
        }
      />
      <div className="p-8">
        <div className="mb-4 space-y-2">
          <ErrorNotice message={saveError} />
          <ErrorNotice message={deleteError} />
        </div>
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          {[['Estimated', totals.estimated, '#f59e0b'], ['Actual', totals.actual, '#3b82f6'], ['Paid', totals.paid, '#22c55e']].map(([label, value, color]) => (
            <div key={label} className="kro-card">
              <p className="kro-label">{label}</p>
              <p className="text-3xl font-bold" style={{ color }}>{money(value)}</p>
            </div>
          ))}
        </div>

        {loading ? (
          <p style={{ color: '#94a3b8' }}>Loading budget...</p>
        ) : items.length === 0 ? (
          <EmptyState icon={DollarSign} title="No Budget Items" description="Add costs for shoots, crew, sets, wardrobe, and post-production." action={<button className="kro-btn kro-btn-primary" onClick={() => setModal(true)}><Plus size={14} /> Add Item</button>} />
        ) : (
          <div className="kro-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  {['Item', 'Estimated', 'Actual', 'Paid', ''].map((heading) => <th key={heading} className="px-3 py-3 text-left text-xs uppercase tracking-[0.12em]" style={{ color: '#94a3b8' }}>{heading}</th>)}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #334155' }}>
                    <td className="px-3 py-3 font-semibold text-white">{item.item}</td>
                    <td className="px-3 py-3" style={{ color: '#94a3b8' }}>{money(Number(item.estimated_cost || 0))}</td>
                    <td className="px-3 py-3" style={{ color: '#94a3b8' }}>{money(Number(item.actual_cost || 0))}</td>
                    <td className="px-3 py-3"><button className="kro-badge" onClick={() => handlePaidToggle(item)} style={{ background: item.paid ? 'rgba(34,197,94,0.15)' : 'rgba(148,163,184,0.12)', color: item.paid ? '#22c55e' : '#94a3b8' }}>{item.paid ? 'Paid' : 'Unpaid'}</button></td>
                    <td className="px-3 py-3 text-right"><button onClick={() => handleDelete(item.id)} style={{ color: '#ef4444' }} aria-label="Delete budget item"><Trash2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Add Budget Item">
        <form onSubmit={handleSave} className="space-y-4">
          <ErrorNotice message={saveError} />
          <div className="flex justify-end">
            <button
              type="button"
              className="kro-btn"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
              onClick={() => setForm({ ...form, __TRIGGER_BAD_SAVE: true })}
            >
              Trigger Failed Save
            </button>
          </div>
          <div><label className="kro-label">Item</label><input className="kro-input" required value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })} placeholder="Studio rental" /></div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="kro-label">Estimated Cost</label><input type="number" className="kro-input" value={form.estimated_cost} onChange={(e) => setForm({ ...form, estimated_cost: e.target.value })} /></div>
            <div><label className="kro-label">Actual Cost</label><input type="number" className="kro-input" value={form.actual_cost} onChange={(e) => setForm({ ...form, actual_cost: e.target.value })} /></div>
          </div>
          <label className="flex items-center gap-2 text-sm" style={{ color: '#94a3b8' }}><input type="checkbox" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} /> Paid</label>
          <div className="flex justify-end gap-3"><button type="button" className="kro-btn kro-btn-ghost" onClick={() => setModal(false)}>Cancel</button><button className="kro-btn kro-btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Item'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
