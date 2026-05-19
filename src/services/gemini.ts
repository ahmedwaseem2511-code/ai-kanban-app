export async function generateDescription(
  title: string
): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey || apiKey === 'undefined' || apiKey.trim() === '') {
      console.error('Gemini API key missing. Check deployment environment variables.')
      return '⚠️ API key missing. Please set VITE_GEMINI_API_KEY in your deployment settings.'
    }

    // Try multiple models — if one is deprecated/unavailable, next one is tried
    const models = [
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
    ]

    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `Write a short professional task description (2-3 sentences) for this task: "${title}". Be concise and actionable.`,
                    },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 150,
              },
            }),
          }
        )

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}))
          console.warn(`Model ${model} failed (${response.status}):`, errBody)
          continue // try next model
        }

        const data = await response.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

        if (text) return text.trim()

      } catch (modelErr) {
        console.warn(`Model ${model} threw error:`, modelErr)
        continue
      }
    }

    return '❌ AI generation failed. Please verify your Gemini API key in deployment settings.'

  } catch (error) {
    console.error('Gemini Error:', error)
    return '❌ Could not generate description. Please try again.'
  }
}