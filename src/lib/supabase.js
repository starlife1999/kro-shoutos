import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yxpwhdjfqpeamduptatb.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cHdoZGpmcXBlYW1kdXB0YXRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MzY5MTAsImV4cCI6MjA5NTMxMjkxMH0.hmg4aV2QhSOSZnZoOClUfWFMEFhajlE2RVPh_Evvj48'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Storage helpers
export const getPublicUrl = (bucket, path) => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export const uploadFile = async (bucket, filePath, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: true })
  if (error) throw error
  return getPublicUrl(bucket, filePath)
}
