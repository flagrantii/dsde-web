import { useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { GraphData, GraphNode, Message } from '@/src/types'
import { useChatState } from '@/src/store/hooks'
import { chatService } from '@/src/services/api'
import { setCurrentChatId, addMessage, updateGraphData } from '@/src/store/features/chatSlice'
import { graphService } from '@/src/services/graph'

export function useChatManager() {
  const dispatch = useDispatch()
  const { currentChatId, messages, graphData } = useChatState()
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUserMessage = useCallback((message: string) => {
    setIsLoading(true)
    setError(null)

    try {
        dispatch(addMessage({
            chatId: currentChatId || '',
            message: {
              id: Date.now().toString(),
              content: message,
              role: 'user',
              timestamp: new Date(),
              selectedNode,
              status: selectedNode ? 'selected' : 'unselected'
            }
        }))
    } catch (error) {
      setError('Failed to send message')
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  const handleAIResponse = useCallback(async (message: string) => {
    setIsLoading(true)
    setError(null)

    try {
      let response;
      
      if (!currentChatId) {
        // Initial chat
        response = await chatService.initialChat(message)
        dispatch(setCurrentChatId(response.chat_id))
      } else {
        // Continue chat
        response = await chatService.continueChat(
          currentChatId,
          message,
          graphData || { nodes: [], links: [] }
        )
      }

      console.log("Response:", response)

      // Add AI response
      dispatch(addMessage({
        chatId: response.chat_id,
        message: {
          id: (Date.now() + 1).toString(),
          content: response.message,
          role: 'assistant',
          timestamp: new Date(),
          selectedNode,
          status: selectedNode ? 'selected' : 'unselected'
        }
      }))

      // Update graph if new data is received
      if (response.newGraph) {
        const mergedGraph = graphService.mergeGraphData(graphData, response.newGraph)
        dispatch(updateGraphData({
          chatId: response.chat_id,
          graphData: mergedGraph
        }))

        console.log("Merged Graph:", mergedGraph)
      }

      return response
    } catch (error) {
      setError('Failed to send message')
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