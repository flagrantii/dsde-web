'use client'

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, ArrowLeft, LayoutGrid, LayoutList } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { cn } from "@/src/lib/utils"
import Link from "next/link"
import { ChatMessage } from "@/src/components/ui/chat-message"
import ResearchGraph from "@/src/components/research/graph/ResearchGraph"
import PaperDetails from "@/src/components/research/papers/PaperDetails"
import { Message, GraphNode, GraphData } from "@/src/types"
import { useGraph } from "@/src/lib/hooks/useGraph"
import { ChatSelection } from '@/src/components/ui/chat-selection'
import { addLink, addNode } from "@/src/store/features/graphSlice"
import { useDispatch } from 'react-redux'
import { SelectionHistory } from '@/src/components/ui/selection-history'
import { useLocalStorage } from "@/src/lib/hooks/useLocalStorage"
import { useChatManager } from "@/src/lib/hooks/useChatManager"
import { ConversationList } from '@/src/components/ui/conversation-list'
import { EmptyChat } from '@/src/components/ui/empty-chat'

export default function ChatPage() {
  const {
    messages,
    selectedNode,
    isLoading,
    handleUserMessage,
    handleAIResponse,
    handleNodeSelect,
    clearSelection
  } = useChatManager()

  const [input, setInput] = useState('')
  const [showGraph, setShowGraph] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectionHistory, setSelectionHistory] = useLocalStorage<GraphNode[]>('selection-history', [])
  const [loadingState, setLoadingState] = useState<'idle' | 'thinking' | 'generating'>('idle')

  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const message = input.trim()
    setInput('') // Clear input immediately for better UX
    
    try {
      // 1. Set thinking state and handle user message
      setLoadingState('thinking')
      const chatId = await handleUserMessage(message)
      
      // 2. Set generating state and get AI response for continuing chat
      if (chatId && messages.length > 0) {
        setLoadingState('generating')
        await handleAIResponse(message, chatId)
      }
    } catch (error) {
      console.error('Error:', error)
      // Show error message to user
      setLoadingState('idle')
    } finally {
      setLoadingState('idle')
    }
  }

  // Handle node selection
  const onNodeSelect = useCallback((node: GraphNode) => {
    handleNodeSelect(node)
    // Force update input with the node title
    const prompt = `Tell me more papers like "${node.title}"`
    setInput(prompt)
    
    setSelectionHistory((prev: GraphNode[]) => {
      const exists = prev.some((n: GraphNode) => n.id === node.id)
      if (!exists) {
        return [node, ...prev].slice(0, 5)
      }
      return prev
    })
  }, [handleNodeSelect, setSelectionHistory])

  // Add history clear handler
  const handleClearHistory = useCallback((nodeId: string) => {
    setSelectionHistory((prev: GraphNode[]) => 
      prev.filter((node: GraphNode) => node.id !== nodeId)
    )
  }, [setSelectionHistory])

  // Add this with other useCallback hooks
  const handleViewDetails = useCallback(() => {
    if (selectedNode) {
      const detailsElement = document.getElementById('paper-details')
      detailsElement?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedNode])

  // Add this effect to handle input updates when selected node changes
  useEffect(() => {
    if (selectedNode) {
      const prompt = `Tell me more papers like "${selectedNode.title}"`
      setInput(prompt)
    }
  }, [selectedNode])

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
      <div className="flex flex-1 pt-16 h-screen">
        {/* Conversation List */}
        <ConversationList />

        {/* Chat Container */}
        <div 
          className={cn(
            "flex flex-col transition-all duration-300 ease-in-out",
            showGraph 
              ? "w-[calc(50%-16rem)]"
              : "w-[calc(100%-16rem)]"
          )}
        >
          <div className="flex-1 flex flex-col h-full p-4">
            {/* Selection display and history */}
            <div className="space-y-4 mb-4">
              <AnimatePresence>
                {selectedNode && (
                  <ChatSelection
                    selectedNode={selectedNode}
                    onClear={clearSelection}
                    onViewDetails={handleViewDetails}
                  />
                )}
              </AnimatePresence>
              
              <SelectionHistory
                history={selectionHistory}
                onSelect={onNodeSelect}
                onClear={handleClearHistory}
              />
            </div>

            {messages.length === 0 ? (
              <EmptyChat />
            ) : (
              <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin scrollbar-thumb-border">
                <AnimatePresence initial={false}>
                  {messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      {...message}
                    />
                  ))}
                </AnimatePresence>
                
                {loadingState !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2 p-4"
                  >
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {loadingState === 'thinking' ? 'nodi is thinking...' : 'Generating insights...'}
                    </span>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Form */}
            <motion.form
              onSubmit={onSubmit}
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
      {selectedNode && (
        <PaperDetails
          paper={selectedNode}
          onClose={clearSelection}
        />
      )}
    </div>
  )
} 