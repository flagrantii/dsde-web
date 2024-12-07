import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { GraphData, GraphNode, Message } from '@/src/types'
import { useChatState } from '@/src/store/hooks'
import { chatService } from '@/src/services/api'
import { setCurrentChatId, addMessage, updateGraphData, clearChatMessages } from '@/src/store/features/chatSlice'
import { graphService } from '@/src/services/graph'

export function useChatManager() {
  const dispatch = useDispatch()
  const { currentChatId, messages, graphData } = useChatState()
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createMessage = (content: string, role: 'user' | 'assistant'): Message => ({
    id: Date.now().toString(),
    content,
    role,
    timestamp: new Date(),
    selectedNode,
    status: selectedNode ? 'selected' : 'unselected'
  })

  const handleUserMessage = useCallback(async (message: string) => {
    setError(null)
    const userMessage = createMessage(message, 'user')

    try {
      if (!currentChatId) {
        // New chat workflow
        const tempChatId = Date.now().toString()
        dispatch(setCurrentChatId(tempChatId))
        dispatch(addMessage({ chatId: tempChatId, message: userMessage }))
        
        setIsLoading(true)
        const response = await chatService.initialChat(message)
        const chatId = response.chat_id

        // Update chat ID without creating duplicate messages
        if (tempChatId !== chatId) {
          dispatch(setCurrentChatId(chatId))
          // Update the conversation ID in state without adding new messages
          dispatch({ 
            type: 'chat/updateConversationId',
            payload: { oldId: tempChatId, newId: chatId }
          })
        }

        // Add AI response
        const aiMessage = createMessage(response.message, 'assistant')
        dispatch(addMessage({ chatId, message: aiMessage }))

        if (response.newGraph) {
          dispatch(updateGraphData({ chatId, graphData: response.newGraph }))
        }

        return chatId
      } else {
        // Existing chat workflow
        dispatch(addMessage({ chatId: currentChatId, message: userMessage }))
        setIsLoading(true)
        return currentChatId
      }
    } catch (error) {
      setError('Failed to send message')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentChatId, dispatch, selectedNode])

  const handleAIResponse = useCallback(async (message: string, chatId: string) => {
    if (!currentChatId) return

    try {
      const response = await chatService.continueChat(
        chatId,
        message,
        graphData || { nodes: [], links: [] }
      )

      // Add AI response
      const aiMessage = createMessage(response.message, 'assistant')
      dispatch(addMessage({ chatId: response.chat_id, message: aiMessage }))

      // Update graph if needed
      if (response.newGraph) {
        const mergedGraph = graphService.mergeGraphData(graphData, response.newGraph)
        dispatch(updateGraphData({
          chatId: response.chat_id,
          graphData: mergedGraph
        }))
      }

      return response
    } catch (error) {
      setError('Failed to get AI response')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [currentChatId, graphData, selectedNode, dispatch])

  const handleNodeSelect = useCallback((node: GraphNode) => {
    setSelectedNode(node)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedNode(null)
  }, [])

  return {
    currentChatId,
    messages,
    graphData,
    selectedNode,
    isLoading,
    error,
    handleUserMessage,
    handleAIResponse,
    handleNodeSelect,
    clearSelection
  }
} 