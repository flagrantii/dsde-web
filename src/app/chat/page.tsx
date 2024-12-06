'use client'

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, ArrowLeft, LayoutGrid, LayoutList } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { cn } from "@/src/lib/utils"
import Link from "next/link"
import { ChatMessage } from "@/src/components/ui/chat-message"
import ResearchGraph from "@/src/components/research/graph/ResearchGraph"
import PaperDetails from "@/src/components/research/papers/PaperDetails"
import { Message, GraphNode, Paper, GraphData } from "@/src/types"
import { useGraph } from "@/src/lib/hooks/useGraph"
import { ChatSelection } from '@/src/components/ui/chat-selection'
import { addLink, addNode } from "@/src/store/features/graphSlice"
import { useDispatch } from 'react-redux'
import { SelectionHistory } from '@/src/components/ui/selection-history'
import { useLocalStorage } from "@/src/lib/hooks/useLocalStorage"

// Initial graph data
const initialGraphData = {
  nodes: [
    { 
      id: '1',
      data: {
        title: 'Machine Learning Basics', 
        type: 'paper', 
        color: '#22c55e',
        citations: 1200,
        year: 2022,
        relevance: 0.95
      }
    },
    // Add more sample nodes here
  ],
  links: [
    { source: '1', target: '3', strength: 0.8 },
    // Add more sample links here
  ]
}

export default function ChatPage() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showGraph, setShowGraph] = useState(true)

  // Graph state using custom hook
  const {
    graphData,
    hoveredNode,
    graphLoading,
    fgRef,
    handleNodeClick,
    handleNodeHover,
    zoomIn,
    zoomOut,
    resetView
  } = useGraph(initialGraphData as GraphData)

  // Selected paper state
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  // Add selection history state
  const [selectionHistory, setSelectionHistory] = useLocalStorage<GraphNode[]>('selection-history', [])

  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Add dispatch declaration
  const dispatch = useDispatch()

  // Move handleClearSelection declaration before it's used
  const handleClearSelection = useCallback(() => {
    setSelectedNode(null)
  }, [])

  // Add view details handler
  const handleViewDetails = useCallback(() => {
    if (selectedNode) {
      // Scroll paper details into view or trigger modal
      const detailsElement = document.getElementById('paper-details')
      detailsElement?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedNode])

  // Add loading states for better UX
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingState, setLoadingState] = useState<'idle' | 'thinking' | 'generating'>('idle')

  // Handle message submission with selection logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting || !input.trim()) return

    setIsSubmitting(true)
    setLoadingState('thinking')

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date(),
      selectedNode: selectedNode,
      status: selectedNode ? 'selected' : 'unselected'
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')

    try {
      const hasPaper = Math.random() > 0.5
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      setLoadingState('generating')

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: hasPaper 
          ? "I found a relevant paper. Creating a new node in the graph..."
          : "This is a regular response without paper detection.",
        role: 'assistant',
        timestamp: new Date(),
        status: hasPaper ? 'selected' : 'unselected'
      }

      setMessages(prev => [...prev, assistantMessage])
      
      if (hasPaper && selectedNode) {
        // Add node creation animation
        setLoadingState('idle')
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const newNodeId = Date.now().toString()
        const newNode: GraphNode = {
          id: newNodeId,
          data: {
            title: 'New Related Paper',
            type: 'paper',
            year: 2024,
            citations: 0,
          }
        }
        
        dispatch(addNode(newNode))
        dispatch(addLink({ 
          source: selectedNode.id, 
          target: newNodeId,
          strength: 0.5 
        }))
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsSubmitting(false)
      setLoadingState('idle')
    }
  }

  // Handle node selection
  const handleNodeSelect = useCallback((node: GraphNode) => {
    setSelectedNode(node)
    setInput(`Tell me more about "${node.data.title}"`)
    
    setSelectionHistory((prev: GraphNode[]) => {
      const exists = prev.some((n: GraphNode) => n.id === node.id)
      if (!exists) {
        return [node, ...prev].slice(0, 5) // Keep last 5 selections
      }
      return prev
    })
  }, [setSelectionHistory])

  // Add history clear handler
  const handleClearHistory = useCallback((nodeId: string) => {
    setSelectionHistory((prev: GraphNode[]) => 
      prev.filter((node: GraphNode) => node.id !== nodeId)
    )
  }, [setSelectionHistory])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 p-4 border-b border-border bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-8xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2 hover:bg-secondary/80">
                <ArrowLeft className="w-4 h-4" />
                <span className="font-semibold text-primary">nodi</span>
              </Button>
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-sm font-medium text-muted-foreground">Research Assistant</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Graph Toggle Button with improved styling */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGraph(prev => !prev)}
              className="gap-2 hover:bg-secondary/80"
            >
              {showGraph ? (
                <>
                  <LayoutList className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Hide Graph</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Show Graph</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 pt-16 h-[calc(100vh-4rem)]">
        {/* Chat Container */}
        <div 
          className={cn(
            "flex flex-col transition-all duration-300 ease-in-out",
            showGraph 
              ? "w-1/2 border-r border-border"
              : "w-full"
          )}
        >
          <div className="flex-1 flex flex-col h-full p-4">
            {/* Selection display and history */}
            <div className="space-y-4 mb-4">
              <AnimatePresence>
                {selectedNode && (
                  <ChatSelection
                    selectedNode={selectedNode}
                    onClear={handleClearSelection}
                    onViewDetails={handleViewDetails}
                  />
                )}
              </AnimatePresence>
              
              <SelectionHistory
                history={selectionHistory}
                onSelect={handleNodeSelect}
                onClear={handleClearHistory}
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin scrollbar-thumb-border">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    {...message}
                  />
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-4"
                >
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Analyzing research...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="flex gap-2 pt-4 border-t border-border"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about research papers..."
                className="flex-1 bg-secondary/50"
                disabled={isLoading}
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-primary hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </motion.form>
          </div>
        </div>

        {/* Graph Panel */}
        <AnimatePresence>
          {showGraph && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "50%" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full bg-secondary/30"
            >
              <ResearchGraph
                selectedPaper={selectedNode?.id}
                onNodeClick={handleNodeSelect}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Paper Details Panel */}
      {selectedNode && (
        <PaperDetails
          paper={{
            title: selectedNode?.data?.title,
            type: selectedNode?.data?.type,
            abstract: "Sample abstract for the selected paper...",
            authors: ["Author 1", "Author 2"],
            year: selectedNode?.data?.year,
            citations: selectedNode?.data?.citations,
          }}
          onClose={handleClearSelection}
        />
      )}

      {/* Update loading indicator */}
      {loadingState !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 bg-secondary/80 backdrop-blur-sm rounded-full shadow-lg"
        >
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span className="text-sm">
            {loadingState === 'thinking' ? 'Analyzing your question...' : 'Generating response...'}
          </span>
        </motion.div>
      )}
    </div>
  )
} 