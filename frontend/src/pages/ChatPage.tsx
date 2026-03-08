import { useEffect, useRef, useState } from 'react'
import { chatApi } from '../api/chat'
import { useAuthStore } from '../store/authStore'
import type { ChatMessage } from '../types'

export function ChatPage() {
  const { token, user } = useAuthStore()
  const [targetUserId, setTargetUserId] = useState('')
  const [inputTarget, setInputTarget] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [connected, setConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    return () => { wsRef.current?.close() }
  }, [])

  const connect = async () => {
    if (!token || !inputTarget.trim()) return

    // 기존 이력 로드
    try {
      const history = await chatApi.history(inputTarget.trim())
      setMessages(history)
    } catch {
      setMessages([])
    }

    setTargetUserId(inputTarget.trim())

    if (wsRef.current) wsRef.current.close()

    const ws = chatApi.connect(token)
    wsRef.current = ws

    ws.onopen = () => setConnected(true)
    ws.onclose = () => setConnected(false)
    ws.onmessage = (e) => {
      const msg: ChatMessage = JSON.parse(e.data)
      if (!('error' in msg)) {
        setMessages((prev) => [...prev, msg])
      }
    }
  }

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    if (!wsRef.current || !input.trim() || !targetUserId) return
    wsRef.current.send(JSON.stringify({ receiver_id: targetUserId, content: input.trim() }))
    setInput('')
  }

  return (
    <div className="max-w-2xl mx-auto p-6 flex flex-col h-[calc(100vh-60px)]">
      <h1 className="text-2xl font-bold mb-4">채팅</h1>

      {!connected ? (
        <div className="flex gap-2 mb-4">
          <input
            value={inputTarget}
            onChange={(e) => setInputTarget(e.target.value)}
            placeholder="상대방 UUID 입력"
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={connect}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            연결
          </button>
        </div>
      ) : (
        <p className="text-xs text-green-600 mb-2">연결됨 — 상대방: {targetUserId}</p>
      )}

      <div className="flex-1 overflow-y-auto border rounded bg-white p-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                msg.sender_id === user?.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              <p>{msg.content}</p>
              <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-blue-200' : 'text-gray-400'}`}>
                {new Date(msg.created_at).toLocaleTimeString('ko-KR')}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {connected && (
        <form onSubmit={send} className="flex gap-2 mt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="메시지 입력..."
            className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            전송
          </button>
        </form>
      )}
    </div>
  )
}
