import axios from 'axios'
import { GraphData } from '@/src/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  }
})

export const chatService = {
  async initialChat(message: string) {
    const response = await api.post('/api/continue_chat', {
      chat_id: null,
      message,
      currentGraph: null
    })
    return response.data
  },

  async continueChat(chatId: string, message: string, currentGraph: GraphData) {
    const response = await api.post('/api/continue_chat', {
      chat_id: chatId,
      message,
      currentGraph
    })
    return response.data
  }
} 