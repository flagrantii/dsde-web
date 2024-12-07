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
    <div className="w-64 h-full border-r border-border bg-background/50 backdrop-blur-sm">
      <div className="p-4">
        <Button 
          variant="default" 
          className="w-full gap-2"
          onClick={handleNewChat}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      <div className="px-2 space-y-1 overflow-y-auto">
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
                  className="w-full justify-start gap-2 group relative pr-12"
                  onClick={() => handleSelectChat(chatId)}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="truncate">
                    {data.messages[0]?.content.slice(0, 30) || 'New Chat'}...
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteChat(chatId, e)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </Button>
              </motion.div>
            ))}
        </AnimatePresence>
      </div>
    </div>
  )
} 