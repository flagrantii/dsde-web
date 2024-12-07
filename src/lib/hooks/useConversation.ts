import { useState, useCallback, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { chatService } from '@/src/services/api'
import { conversationService } from '@/src/services/conversation'
import { setCurrentChatId, addMessage, updateGraphData } from '@/src/store/features/chatSlice'
import { Message, GraphData } from '@/src/types'
import { useChatState } from '@/src/store/hooks'
import { graphService } from '@/src/services/graph'

export function useConversation() {
  const dispatch = useDispatch()
  const { currentChatId, messages, graphData } = useChatState()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Send message
  const sendMessage = useCallback(async (message: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let response
      if (!currentChatId) {
        response = await chatService.initialChat(message)
        dispatch(setCurrentChatId(response.chat_id))
      } else {
        const currentGraph = graphData || { nodes: [], links: [] }
        response = await chatService.continueChat(currentChatId, message, currentGraph)
      }

      // Add user message
      dispatch(addMessage({
        chatId: response.chat_id,
        message: {
          id: Date.now().toString(),
          content: message,
          role: 'user',
          timestamp: new Date(),
          status: 'unselected'
        }
      }))

      // Add assistant message
      dispatch(addMessage({
        chatId: response.chat_id,
        message: {
          id: (Date.now() + 1).toString(),
          content: response.message,
          role: 'assistant',
          timestamp: new Date(),
          status: 'unselected'
        }
      }))

      // Update graph if new data is received
      if (response.newGraph) {
        const mergedGraph = graphService.mergeGraphData(graphData, response.newGraph)
        dispatch(updateGraphData({
          chatId: response.chat_id,
          graphData: mergedGraph
        }))
      }

      return response
    } catch (error) {
      setError('Failed to send message. Please try again.')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentChatId, graphData, dispatch])

  // Save conversation periodically
  useEffect(() => {
    if (currentChatId && messages.length > 0) {
      const saveTimeout = setTimeout(() => {
        conversationService.saveConversation(currentChatId, {
          messages,
          graphData
        })
      }, 1000)

      return () => clearTimeout(saveTimeout)
    }
  }, [currentChatId, messages, graphData])

  return {
    isLoading,
    error,
    sendMessage,
    clearError: () => setError(null)
  }
} 