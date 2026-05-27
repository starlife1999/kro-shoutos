import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useCampaigns() {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCampaigns = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('campaigns')
        .select('*, shoots(id, name, status, date)')
        .order('created_at', { ascending: false })
      if (err) throw err
      setCampaigns(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchCampaigns() }, [fetchCampaigns])

  return { campaigns, loading, error, refetch: fetchCampaigns }
}
