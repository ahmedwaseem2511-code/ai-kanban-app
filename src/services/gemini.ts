export async function generateDescription(title: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Write a short professional task description (2-3 sentences) for this task: "${title}"`
            }]
          }]
        })
      }
    )
    const data = await response.json()
    return data.candidates[0].content.parts[0].text
  } catch {
    return 'Could not generate description. Please try again.'
  }
}