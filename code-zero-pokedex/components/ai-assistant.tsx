'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bot, Send } from 'lucide-react'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [input, setInput] = useState('')
  const [conversation, setConversation] = useState<{ role: 'user' | 'assistant'; content: string }[]>([])

  const handleSendMessage = () => {
    if (input.trim()) {
      setConversation([...conversation, { role: 'user', content: input }])
      // Here you would typically send the input to your AI service and get a response
      // For this example, we'll just echo the input
      setTimeout(() => {
        setConversation(prev => [...prev, { role: 'assistant', content: `You said: ${input}` }])
      }, 500)
      setInput('')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
          <DialogDescription>
            Ask for Pokémon recommendations or strategies!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-[300px]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {conversation.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg p-2 max-w-[80%] ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                  {message.content}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} className="ml-2">
              <Send size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

