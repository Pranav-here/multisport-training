"use client"

import { useState } from 'react'

type Message = { role: 'user' | 'assistant' | 'system'; content: string }

export default function AIChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!input.trim()) return
    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      const aiText =
        data?.choices?.[0]?.message?.content || data?.error || 'No response'

      setMessages((m) => [...m, { role: 'assistant', content: aiText }])
    } catch (error) {
      console.error('[components/ai-chat] request failed', error)
      setMessages((m) => [...m, { role: 'assistant', content: 'Error contacting API' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 border rounded-md max-w-xl">
      <div className="mb-3 space-y-2 max-h-48 overflow-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block px-3 py-1 rounded ${m.role === 'user' ? 'bg-sky-500 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 px-3 py-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="Ask the AI about drills, coaching tips, or training plans..."
        />
        <button className="px-4 py-2 bg-sky-600 text-white rounded" onClick={send} disabled={loading}>
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
