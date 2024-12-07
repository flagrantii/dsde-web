import { useCallback } from 'react'
import { useDispatch } from 'react-redux'
import { GraphNode, GraphData } from '@/src/types'
import { updateGraphData } from '@/src/store/features/chatSlice'
import { useChatState } from '@/src/store/hooks'
import { graphService } from '@/src/services/graph'

export function useGraph() {
  const dispatch = useDispatch()
  const { currentChatId, graphData } = useChatState()

  const mergeGraphData = useCallback((newGraph: GraphData) => {
    if (!currentChatId) return

    const mergedGraph = graphService.mergeGraphData(graphData, newGraph)
    dispatch(updateGraphData({
      chatId: currentChatId,
      graphData: mergedGraph
    }))
  }, [currentChatId, graphData, dispatch])

  const handleNodeClick = useCallback((node: GraphNode, callback?: (node: GraphNode) => void) => {
    callback?.(node)
  }, [])

  return {
    graphData,
    mergeGraphData,
    handleNodeClick
  }
} 