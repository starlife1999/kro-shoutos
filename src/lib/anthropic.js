const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ''
const MODEL = 'claude-sonnet-4-20250514'

async function callClaude(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'Claude API error')
  }

  const data = await response.json()
  return data.content[0].text
}

export async function generateCaption({ photoDescription, shootConcept, mood = '' }) {
  const prompt = `You are a professional Instagram caption writer for a fashion/photography brand called KRO PK.

Photo description: ${photoDescription}
Shoot concept: ${shootConcept}
${mood ? `Mood/vibe: ${mood}` : ''}

Write 3 Instagram caption options for this photo. Each caption should:
- Be engaging and on-brand for a fashion photography brand
- Include 5-8 relevant hashtags
- Have a distinct tone (editorial, intimate, bold)
- Be separated by "---"

Return only the captions, no extra explanation.`

  return callClaude(prompt)
}

export async function generateShootName({ concept, mood, location = '', season = '' }) {
  const prompt = `You are a creative director for KRO PK, a professional photography brand.

Shoot concept: ${concept}
Mood/vibe: ${mood}
${location ? `Location: ${location}` : ''}
${season ? `Season: ${season}` : ''}

Generate 6 creative, memorable shoot names for this photography project. Each name should:
- Be evocative and professional
- 1-4 words max
- Feel like a fashion editorial title
- Be distinct from each other

Return a numbered list of names only, no explanations.`

  return callClaude(prompt)
}
