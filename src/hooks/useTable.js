import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Generic hook for any Supabase table.
 * @param {string} table - table name
 * @param {object} match - optional .match() filter
 * @param {string} select - optional select string
 */
export function useTable(table, match = {}, select = '*') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [deleteError, setDeleteError] = useState(null)

  const matchKey = JSON.stringify(match)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase.from(table).select(select).order('created_at', { ascending: false })
      if (Object.keys(match).length > 0) query = query.match(match)
      const { data: rows, error: err } = await query
      if (err) throw err
      setData(rows || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, matchKey, select])

  useEffect(() => { fetchData() }, [fetchData])

  const insert = async (row) => {
    setSaveError(null)
    try {
      const { data: newRow, error: err } = await supabase.from(table).insert(row).select().single()
      if (err) throw err
      setData((prev) => [newRow, ...prev])
      return newRow
    } catch (err) {
      setSaveError(err.message)
      throw err
    }
  }

  const update = async (id, updates) => {
    setSaveError(null)
    try {
      const { data: updated, error: err } = await supabase.from(table).update(updates).eq('id', id).select().single()
      if (err) throw err
      setData((prev) => prev.map((r) => (r.id === id ? updated : r)))
      return updated
    } catch (err) {
      setSaveError(err.message)
      throw err
    }
  }

  const remove = async (id) => {
    setDeleteError(null)
    try {
      const { error: err } = await supabase.from(table).delete().eq('id', id)
      if (err) throw err
      setData((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setDeleteError(err.message)
      throw err
    }
  }

  return { data, loading, error, saveError, deleteError, refetch: fetchData, insert, update, remove, setSaveError, setDeleteError }
}
