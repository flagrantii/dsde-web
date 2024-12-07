import { createSlice, PayloadAction, createAction } from '@reduxjs/toolkit'
import { ChatState, Message, GraphData } from '@/src/types'
import { conversationService } from '@/src/services/conversation'

const initialState: ChatState = {
  currentChatId: null,
  conversations: conversationService.loadConversations()
}

export const clearChatMessages = createAction<string>('chat/clearChatMessages')

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChatId: (state, action: PayloadAction<string>) => {
      state.currentChatId = action.payload
    },
    
    addMessage: (state, action: PayloadAction<{
      chatId: string,
      message: Message
    }>) => {
      const { chatId, message } = action.payload
      if (!state.conversations[chatId]) {
        state.conversations[chatId] = {
          messages: [],
          graphData: null
        }
      }
      state.conversations[chatId].messages.push(message)
      
      // Auto-save to localStorage
      conversationService.saveConversation(chatId, state.conversations[chatId])
    },

    updateGraphData: (state, action: PayloadAction<{
      chatId: string,
      graphData: GraphData
    }>) => {
      const { chatId, graphData } = action.payload
      if (state.conversations[chatId]) {
        state.conversations[chatId].graphData = graphData
        
        // Auto-save to localStorage
        conversationService.saveConversation(chatId, state.conversations[chatId])
      }
    },

    clearCurrentChat: (state) => {
      state.currentChatId = null
    },

    deleteConversation: (state, action: PayloadAction<string>) => {
      const chatId = action.payload
      if (state.conversations[chatId]) {
        delete state.conversations[chatId]
        if (state.currentChatId === chatId) {
          state.currentChatId = null
        }
        // Delete from localStorage
        conversationService.deleteConversation(chatId)
      }
    },

    clearConversations: (state) => {
      state.conversations = {}
      state.currentChatId = null
      localStorage.removeItem('nodi_conversations')
    },

    [clearChatMessages.type]: (state, action: PayloadAction<string>) => {
      const chatId = action.payload
      if (state.conversations[chatId]) {
        state.conversations[chatId].messages = []
      }
    },

    updateConversationId: (state, action: PayloadAction<{ oldId: string, newId: string }>) => {
      const { oldId, newId } = action.payload
      if (state.conversations[oldId]) {
        // Move conversation to new ID
        state.conversations[newId] = state.conversations[oldId]
        // Delete old conversation
        delete state.conversations[oldId]
        // Update localStorage
        conversationService.deleteConversation(oldId)
        conversationService.saveConversation(newId, state.conversations[newId])
      }
    }
  }
})

export const {
  setCurrentChatId,
  addMessage,
  updateGraphData,
  clearCurrentChat,
  deleteConversation,
  clearConversations
} = chatSlice.actions

export default chatSlice.reducer 