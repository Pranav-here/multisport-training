import { NextResponse } from 'next/server'

// Simple server-side proxy to call Groq chat completions compatible with the OpenAI schema.
// Important: keep your API key in environment variables (GROQ_API_KEY).
// This route protects the key from the browser and centralizes usage controls.

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, model = process.env.GROQ_DEFAULT_MODEL ?? 'llama-3.1-8b-instant' } = body || {}

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'messages array required' }, { status: 400 })
    }

    const key = process.env.GROQ_API_KEY
    if (!key) {
      return NextResponse.json({ error: 'Groq API key not configured on server' }, { status: 500 })
    }

    // Basic safety: cap the number of messages forwarded to avoid sending huge payloads
    const safeMessages = messages.slice(-20)

    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model,
        messages: safeMessages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    })

    const data = await resp.json()

    // Forward Groq response (caller can inspect choices). Keep it simple.
    return NextResponse.json(data)
  } catch (error) {
    console.error('[api/ai/chat] upstream failure', error)
    // Don't leak internals to the client
    return NextResponse.json({ error: 'server error' }, { status: 500 })
  }
}
