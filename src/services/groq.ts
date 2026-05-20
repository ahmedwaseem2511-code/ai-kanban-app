export async function generateDescription(title: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY

    if (!apiKey || apiKey === 'undefined' || apiKey.trim() === '') {
      return '⚠️ API key missing. Please set VITE_GROQ_API_KEY in your .env file.'
    }

    // ✅ Updated model names (2025)
    const models = [
      'llama-3.1-8b-instant',
      'llama-3.3-70b-versatile',
      'gemma2-9b-it',
    ]

    for (const model of models) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            max_tokens: 150,
            temperature: 0.7,
            messages: [
              {
                role: 'user',
                content: `Write a short professional task description (2-3 sentences) for this task: "${title}". Be concise and actionable.`,
              },
            ],
          }),
        })

        if (!response.ok) {
          const err = await response.json().catch(() => ({}))
          console.warn(`Model ${model} failed (${response.status}):`, err)
          continue
        }

        const data = await response.json()
        const text = data?.choices?.[0]?.message?.content
        if (text) return text.trim()

      } catch (modelErr) {
        console.warn(`Model ${model} error:`, modelErr)
        continue
      }
    }

    return '❌ AI generation failed. All models exhausted.'

  } catch (error) {
    console.error('Groq Error:', error)
    return '❌ Could not generate description. Please try again.'
  }
}