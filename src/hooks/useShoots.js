import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useShoots(filters = {}) {
  const [shoots, setShoots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchShoots = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('shoots')
        .select('*, campaigns(name)')
        .order('date', { ascending: true })

      if (filters.status) query = query.eq('status', filters.status)
      if (filters.campaign_id) query = query.eq('campaign_id', filters.campaign_id)

      const { data, error: err } = await query
      if (err) throw err
      setShoots(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line

  useEffect(() => { fetchShoots() }, [fetchShoots])

  return { shoots, loading, error, refetch: fetchShoots }
}

export function useShoot(id) {
  const [shoot, setShoot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchShoot = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const { data, error: err } = await supabase
        .from('shoots')
        .select('*, campaigns(name)')
        .eq('id', id)
        .single()
      if (err) throw err
      setShoot(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchShoot() }, [fetchShoot])

  return { shoot, loading, error, refetch: fetchShoot }
}
