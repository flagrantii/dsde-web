'use client'

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { ChatMessage } from "@/components/ui/chat-message"
import ResearchGraph from "@/components/ResearchGraph"
import PaperDetails from "@/components/PaperDetails"

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface GraphNode {
  id: string
  title: string
  type: 'paper' | 'keyword'
  color?: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [selectedPaper, setSelectedPaper] = useState<string>()
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate AI response - Replace with actual API call
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "This is a simulated response. Connect to Gemini API for real responses.",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleNodeClick = (node: GraphNode) => {
    setSelectedNode(node)
    setInput(`Tell me more about "${node.title}"`)
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 border-b border-border bg-background/80 backdrop-blur-sm z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-sm font-medium">Research Assistant</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 pt-16">
        {/* Chat Container */}
        <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4">
          <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin scrollbar-thumb-border">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  role={message.role}
                  timestamp={message.timestamp}
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

        {/* Graph Panel */}
        <div className="w-1/3 border-l border-border pt-16 hidden lg:block">
          <div className="h-full bg-secondary/30">
            <div className="p-4 border-b border-border">
              <h3 className="text-sm font-medium">Research Connections</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Click on nodes to explore related research
              </p>
            </div>
            <div className="p-4">
              <ResearchGraph
                selectedPaper={selectedPaper}
                onNodeClick={handleNodeClick}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Paper Details Panel */}
      <PaperDetails
        paper={selectedNode ? {
          title: selectedNode.title,
          type: selectedNode.type,
          abstract: "Sample abstract for the selected paper...",
          authors: ["Author 1", "Author 2"],
          year: 2024,
          citations: 42
        } : null}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  )
} 