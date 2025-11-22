import React, { useState, useRef, useEffect } from 'react'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatWithAnalysisProps {
  fileId: string
  analysis: string
}

export function ChatWithAnalysis({ fileId, analysis }: ChatWithAnalysisProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Suggestions de questions rapides
  const quickQuestions = [
    "Quels sont les 3 principaux risques?",
    "Peux-tu résumer l'analyse en 3 points?",
    "Quel est ton niveau de confiance (0-10)?",
    "Qu'est-ce qui pourrait faire échouer cet investissement?",
    "Si tu avais $1M, tu investirais combien ici?",
    "Compare ça à un autre deal que tu as fait"
  ]

  // Scroll automatique vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (question: string) => {
    if (!question.trim() || isLoading) return

    // Ajouter le message utilisateur
    const userMessage: ChatMessage = {
      role: 'user',
      content: question,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file_id: fileId,
          question: question,
          chat_history: messages
        }),
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec le serveur')
      }

      const data = await response.json()

      // Ajouter la réponse de l'assistant
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

    } catch (error) {
      console.error('Erreur chat:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: "Désolé, j'ai rencontré une erreur. Peux-tu reformuler ta question?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  return (
    <div style={{
      marginTop: '40px',
      borderTop: '3px solid #d4af37',
      paddingTop: '30px'
    }}>
      {/* Header */}
      <div style={{
        marginBottom: '20px',
        textAlign: 'center'
      }}>
        <h3 style={{
          fontSize: '24px',
          color: '#d4af37',
          margin: '0 0 10px 0',
          fontWeight: 'bold'
        }}>
          💬 Discute avec Warren Buffett
        </h3>
        <p style={{
          color: '#888',
          fontSize: '14px',
          margin: 0
        }}>
          Pose tes questions sur l'analyse. Je suis là pour clarifier n'importe quel point.
        </p>
      </div>

      {/* Quick Questions (only show if no messages yet) */}
      {messages.length === 0 && (
        <div style={{
          marginBottom: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <p style={{
            margin: '0 0 15px 0',
            fontWeight: 'bold',
            color: '#555',
            fontSize: '14px'
          }}>
            💡 Questions suggérées:
          </p>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                disabled={isLoading}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#fff',
                  border: '1px solid #d4af37',
                  borderRadius: '20px',
                  color: '#d4af37',
                  fontSize: '13px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#d4af37'
                    e.currentTarget.style.color = '#fff'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fff'
                  e.currentTarget.style.color = '#d4af37'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div style={{
        maxHeight: '500px',
        overflowY: 'auto',
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            color: '#999',
            padding: '40px 20px',
            fontSize: '14px'
          }}>
            Aucune conversation pour le moment. Pose ta première question ci-dessous!
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {/* Message bubble */}
              <div style={{
                maxWidth: '80%',
                padding: '12px 18px',
                borderRadius: '12px',
                backgroundColor: msg.role === 'user' ? '#d4af37' : '#fff',
                color: msg.role === 'user' ? '#fff' : '#333',
                border: msg.role === 'assistant' ? '1px solid #e0e0e0' : 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontSize: '14px',
                lineHeight: '1.6'
              }}>
                {/* Role indicator */}
                <div style={{
                  fontSize: '11px',
                  fontWeight: 'bold',
                  marginBottom: '6px',
                  opacity: 0.8,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {msg.role === 'user' ? '👤 Toi' : '💼 Warren'}
                </div>

                {/* Message content */}
                <div style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>

                {/* Timestamp */}
                <div style={{
                  fontSize: '10px',
                  marginTop: '6px',
                  opacity: 0.6
                }}>
                  {msg.timestamp.toLocaleTimeString('fr-CA', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: '#999',
            fontSize: '14px',
            padding: '10px'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#d4af37',
              animation: 'pulse 1.5s ease-in-out infinite'
            }} />
            Warren réfléchit...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pose ta question à Warren..."
          disabled={isLoading}
          style={{
            flex: 1,
            padding: '14px 18px',
            fontSize: '15px',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            outline: 'none',
            transition: 'border-color 0.2s',
            backgroundColor: isLoading ? '#f5f5f5' : '#fff'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#d4af37'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e0e0e0'
          }}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          style={{
            padding: '14px 30px',
            fontSize: '15px',
            fontWeight: 'bold',
            backgroundColor: isLoading || !input.trim() ? '#ccc' : '#d4af37',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading || !input.trim() ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
          onMouseEnter={(e) => {
            if (!isLoading && input.trim()) {
              e.currentTarget.style.backgroundColor = '#c9a030'
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)'
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading && input.trim()) {
              e.currentTarget.style.backgroundColor = '#d4af37'
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
            }
          }}
        >
          {isLoading ? 'Envoi...' : 'Envoyer'}
        </button>
      </form>

      {/* Animation CSS */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.2);
            }
          }
        `}
      </style>
    </div>
  )
}
