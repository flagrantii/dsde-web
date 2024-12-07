import { ChatState } from '@/src/types'

const STORAGE_KEY = 'nodi_conversations'

export const conversationService = {
  saveConversation(chatId: string, data: {
    messages: ChatState['conversations'][string]['messages'],
    graphData: ChatState['conversations'][string]['graphData']
  }) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const conversations = stored ? JSON.parse(stored) : {}
      
      conversations[chatId] = data
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (error) {
      console.error('Error saving conversation:', error)
    }
  },

  loadConversations(): ChatState['conversations'] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error loading conversations:', error)
      return {}
    }
  },

  deleteConversation(chatId: string) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const conversations = JSON.parse(stored)
        delete conversations[chatId]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
      }
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }
} 