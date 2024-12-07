'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { Button } from './button'
import { useDispatch } from 'react-redux'
import { setCurrentChatId, clearCurrentChat, deleteConversation } from '@/src/store/features/chatSlice'
import { useChatState } from '@/src/store/hooks'

export function ConversationList() {
  const dispatch = useDispatch()
  const { currentChatId, conversations } = useChatState()

  const handleNewChat = () => {
    dispatch(clearCurrentChat())
  }

  const handleSelectChat = (chatId: string) => {
    dispatch(setCurrentChatId(chatId))
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    dispatch(deleteConversation(chatId))
  }

  return (
    <div className="w-64 h-full border-r border-border bg-background/50 backdrop-blur-sm flex flex-col">
      <div className="p-4 border-b border-border">
        <Button 
          variant="default" 
          className="w-full gap-2 hover:scale-[1.02] transition-transform"
          onClick={handleNewChat}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {/* Fade overlay for top scroll */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-background/50 to-transparent z-10 pointer-events-none" />
        
        <div className="px-2 space-y-1 overflow-y-auto h-full scrollbar-thin scrollbar-thumb-secondary scrollbar-track-transparent">
          <AnimatePresence mode="popLayout">
            {Object.entries(conversations)
              .sort(([, a], [, b]) => {
                const aTime = a.messages[a.messages.length - 1]?.timestamp || 0
                const bTime = b.messages[b.messages.length - 1]?.timestamp || 0
                return new Date(bTime).getTime() - new Date(aTime).getTime()
              })
              .map(([chatId, data]) => (
                <motion.div
                  key={chatId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  layout
                >
                  <Button
                    variant={currentChatId === chatId ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2 group relative pr-12 hover:scale-[1.01] transition-all duration-200"
                    onClick={() => handleSelectChat(chatId)}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    <span className="truncate text-sm">
                      {data.messages[0]?.content.trim().slice(0, 35) || 'New Chat'}
                      {data.messages[0]?.content.length > 35 ? '...' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10"
                      onClick={(e) => handleDeleteChat(chatId, e)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </Button>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>

        {/* Fade overlay for bottom scroll */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-background/50 to-transparent z-10 pointer-events-none" />
      </div>
    </div>
  )
} 