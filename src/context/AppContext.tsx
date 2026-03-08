import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Message, VoiceState, Channel } from '../types'
import { MOCK_MESSAGES, MOCK_VOICE_STATE, MOCK_SERVER, CURRENT_USER } from '../data/mock'

interface AppContextValue {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  activeChannelId: string
  setActiveChannelId: (id: string) => void
  activeChannel: Channel | undefined
  messages: Message[]
  sendMessage: (content: string) => void
  voiceState: VoiceState
  leaveVoice: () => void
  toggleMute: () => void
  replyTo: Message | null
  setReplyTo: (msg: Message | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [activeChannelId, setActiveChannelId] = useState('genel')
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES)
  const [voiceState, setVoiceState] = useState<VoiceState>(MOCK_VOICE_STATE)
  const [replyTo, setReplyTo] = useState<Message | null>(null)

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }, [])

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return
    const msg: Message = {
      id: Date.now().toString(),
      author: CURRENT_USER,
      content: content.trim(),
      timestamp: new Date(),
      type: 'text',
      replyTo: replyTo ?? undefined,
    }
    setMessages(prev => [...prev, msg])
    setReplyTo(null)
  }, [replyTo])

  const leaveVoice = useCallback(() => {
    setVoiceState(prev => ({ ...prev, connected: false, channelId: null, channelName: null, participants: [] }))
  }, [])

  const toggleMute = useCallback(() => {
    setVoiceState(prev => ({ ...prev, muted: !prev.muted }))
  }, [])

  const activeChannel = MOCK_SERVER.channels.find(c => c.id === activeChannelId)

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      activeChannelId, setActiveChannelId, activeChannel,
      messages, sendMessage,
      voiceState, leaveVoice, toggleMute,
      replyTo, setReplyTo,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
