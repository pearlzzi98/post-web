import { api } from './client'
import type { ChatMessage } from '../types'

const WS_BASE = typeof window !== 'undefined'
  ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/api`
  : 'ws://localhost:8000'

export const chatApi = {
  history: (otherUserId: string, offset = 0, limit = 50) =>
    api.get<ChatMessage[]>(`/chat/history?other_user_id=${otherUserId}&offset=${offset}&limit=${limit}`),

  connect: (token: string): WebSocket =>
    new WebSocket(`${WS_BASE}/ws/chat?token=${token}`),
}
