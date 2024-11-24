'use client';

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import axios from 'axios'

interface AIAssistantProps {
  isOpen: boolean
  onClose: () => void
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const [input, setInput] = useState('')
  const [conversation, setConversation] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  const handleSendMessage = async () => {
    if (input.trim()) {
      const userMessage: Message = { role: 'user', content: input }
      setConversation([...conversation, userMessage])
      setInput('')
      setLoading(true)

      try {
        const response = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4', // O usa 'gpt-4-turbo' si lo prefieres
            messages: [...conversation, userMessage], // Conversación completa para contexto
            max_tokens: 150, // Ajusta según la respuesta deseada
            temperature: 0.7, // Nivel de creatividad
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_KEY_CHAT}`,
            },
          }
        )

        const assistantMessage: Message = {
          role: 'assistant',
          content: response.data.choices[0].message.content,
        }

        setConversation((prev) => [...prev, assistantMessage])
      } catch (error: any) {
        // Detectar errores específicos
        if (error.response?.status === 401) {
          setConversation((prev) => [
            ...prev,
            { role: 'assistant', content: 'La clave de API no es válida. Por favor verifica tu configuración.' },
          ])
        } else {
          setConversation((prev) => [
            ...prev,
            { role: 'assistant', content: 'Hubo un error al procesar tu solicitud. Por favor, intenta de nuevo.' },
          ])
        }
        console.error('Error al llamar a la API:', error)
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[var(--cards-background-modal)]">
        <DialogHeader>
          <DialogTitle>AI Assistant</DialogTitle>
          <DialogDescription>
            Pregunta por pokémons recomendados o estratégias!
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col h-[300px]">
          <div className="flex-1 overflow-y-auto mb-4 space-y-4">
            {conversation.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`rounded-lg p-3 max-w-[100%] sm:max-w-[65%] break-words ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-[var(--cards-background-modal)]'}`}
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                    padding: '10px',
                    margin: '5px 0',
                  }}
                >
                  {message.content}
                </div>
              </div>

            ))}
            {loading && (
              <div className="flex justify-start">
                <div
                  className="rounded-lg p-3 max-w-[65%] bg-[var(--cards-background-modal)]"
                  style={{
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  Escribiendo...
                </div>
              </div>
            )}
          </div>


          <div className="flex items-center">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Haz una pregunta..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
            />
            <Button onClick={handleSendMessage} className="ml-2" disabled={loading}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
