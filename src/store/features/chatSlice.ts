import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatState, Message, GraphData } from '@/src/types'

const initialState: ChatState = {
  currentChatId: null,
  conversations: {}
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentChatId: (state, action: PayloadAction<string>) => {
      state.currentChatId = action.payload
      if (!state.conversations[action.payload]) {
        state.conversations[action.payload] = {
          messages: [],
          graphData: null
        }
      }
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
    },

    updateGraphData: (state, action: PayloadAction<{
      chatId: string,
      graphData: GraphData
    }>) => {
      const { chatId, graphData } = action.payload
      if (state.conversations[chatId]) {
        state.conversations[chatId].graphData = graphData
      }
    },

    clearCurrentChat: (state) => {
      state.currentChatId = null
    }
  }
})

export const {
  setCurrentChatId,
  addMessage,
  updateGraphData,
  clearCurrentChat
} = chatSlice.actions

export default chatSlice.reducer 