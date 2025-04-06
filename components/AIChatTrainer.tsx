// AIChatTrainer.tsx
'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateFireDrillQuestion, evaluateFireDrillResponse } from '../src/app/gemini'

type Message = {
  id: number
  text: string
  sender: 'user' | 'ai'
  options?: string[]
  score?: number
  feedback?: string
  improvements?: string[]
}

export default function AIChatTrainer() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 1, 
      text: "Welcome to Fire Safety Training! I'll ask you scenario-based questions to test your knowledge.", 
      sender: 'ai'
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [usedQuestions, setUsedQuestions] = useState<string[]>([])

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const generateNewQuestion = useCallback(async () => {
    setIsLoading(true)
    try {
      const question = await generateFireDrillQuestion(usedQuestions)
      setUsedQuestions(prev => [...prev, question])
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: question,
        sender: 'ai'
      }])
    } catch (error) {
      console.error("Error generating question:", error)
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: "Let's try another fire safety scenario...",
        sender: 'ai'
      }])
    } finally {
      setIsLoading(false)
    }
  }, [usedQuestions])

  const handleUserResponse = useCallback(async (response: string) => {
    const newUserMessage: Message = {
      id: messages.length + 1,
      text: response,
      sender: 'user'
    }
    
    setMessages(prev => [...prev, newUserMessage])
    setIsLoading(true)
    
    try {
      // Find the last AI question
      const lastAIQuestion = [...messages].reverse().find(m => m.sender === 'ai')?.text || ""
      
      const evaluation = await evaluateFireDrillResponse(lastAIQuestion, response)
      
      setMessages(prev => [...prev, {
        id: prev.length + 2,
        text: `Evaluation: ${evaluation.feedback}\n\nScore: ${evaluation.score}/5`,
        sender: 'ai',
        score: evaluation.score,
        feedback: evaluation.feedback,
        improvements: evaluation.improvements
      }])
      
      // Generate follow-up after short delay
      setTimeout(() => {
        generateNewQuestion()
      }, 2000)
    } catch (error) {
      console.error("Error evaluating response:", error)
      setMessages(prev => [...prev, {
        id: prev.length + 2,
        text: "Let's try another scenario...",
        sender: 'ai'
      }])
      generateNewQuestion()
    } finally {
      setIsLoading(false)
    }
  }, [messages, generateNewQuestion])

  const resetChat = useCallback(() => {
    setMessages([
      { 
        id: 1, 
        text: "Welcome to Fire Safety Training! I'll ask you scenario-based questions to test your knowledge.", 
        sender: 'ai'
      }
    ])
    setUsedQuestions([])
  }, [])

  // Start with first question when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 1) {
      generateNewQuestion()
    }
  }, [isOpen, messages.length, generateNewQuestion])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chatbot toggle button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-red-600 text-white p-4 rounded-full shadow-lg"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>

      {/* Chatbot popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25 }}
            className="absolute bottom-16 right-0 w-80 md:w-96 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden"
          >
            <div className="flex justify-between items-center p-4 bg-gray-900 border-b border-gray-700">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <span className="text-red-500">🔥</span> Fire Safety Trainer
              </h3>
              <div className="flex gap-2">
                <button 
                  onClick={resetChat}
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                >
                  Reset
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="h-64 overflow-y-auto p-4 space-y-3">
              {messages.map((message) => (
                <div key={message.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender === 'ai' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-xs rounded-lg px-3 py-2 ${
                      message.sender === 'ai' 
                        ? 'bg-gray-700/50 rounded-bl-none' 
                        : 'bg-blue-600/50 rounded-br-none'
                    }`}>
                      {message.text}
                      {message.score && (
                        <div className={`mt-1 text-xs font-bold ${
                          message.score >= 4 ? 'text-green-400' : 
                          message.score >= 2 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          Score: {message.score}/5
                        </div>
                      )}
                      {message.improvements && message.improvements.length > 0 && (
                        <div className="mt-2 text-xs text-gray-300">
                          <div className="font-semibold">Suggestions:</div>
                          <ul className="list-disc list-inside">
                            {message.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-700/50 rounded-lg px-3 py-2 rounded-bl-none">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-gray-900 border-t border-gray-700">
              <form 
                onSubmit={(e) => {
                  e.preventDefault()
                  const form = e.target as HTMLFormElement
                  const input = form.elements.namedItem('response') as HTMLInputElement
                  if (input.value.trim()) {
                    handleUserResponse(input.value.trim())
                    input.value = ''
                  }
                }}
                className="flex gap-2"
              >
                <input
                  name="response"
                  type="text"
                  disabled={isLoading}
                  placeholder="Type your response..."
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}