import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { RootState } from './index'
import { ChatState, GraphData, Message } from '@/src/types'

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useChatState = () => {
  const currentChatId = useAppSelector(state => state.chat.currentChatId)
  const currentConversation = useAppSelector(state => 
    currentChatId ? state.chat.conversations[currentChatId] : null
  )

  return {
    currentChatId,
    messages: currentConversation?.messages || [],
    graphData: currentConversation?.graphData || null
  }
} 