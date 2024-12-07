import { ChatState, Message, GraphData } from '@/src/types'

const STORAGE_KEY = 'nodi_conversations'

export const conversationService = {
  saveConversation(chatId: string, data: {
    messages: Message[],
    graphData: GraphData | null
  }) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const conversations = stored ? JSON.parse(stored) : {}
      
      // Ensure proper data structure
      conversations[chatId] = {
        messages: data.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp) // Convert date strings back to Date objects
        })),
        graphData: data.graphData
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations))
    } catch (error) {
      console.error('Error saving conversation:', error)
    }
  },

  loadConversations(): ChatState['conversations'] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return {}

      const conversations = JSON.parse(stored)
      
      // Convert stored data back to proper format
      return Object.entries(conversations).reduce((acc, [id, data]: [string, any]) => {
        acc[id] = {
          messages: data.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          })),
          graphData: data.graphData
        }
        return acc
      }, {} as ChatState['conversations'])
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