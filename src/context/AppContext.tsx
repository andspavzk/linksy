import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface DbServer {
  id: string
  name: string
  initials: string
  color: string
  owner_id: string
}

interface DbCategory {
  id: string
  server_id: string
  name: string
  position: number
}

interface DbChannel {
  id: string
  server_id: string
  category_id: string | null
  name: string
  type: string
  description: string | null
  position: number
}

interface DbMember {
  server_id: string
  user_id: string
  role: string
  joined_at: string
  profile: {
    id: string
    username: string
    tag: string
    avatar_color: string
    status: string
    activity: string | null
  }
}

interface RealtimeMessage {
  id: string
  channel_id: string
  content: string
  created_at: string
  reply_to: string | null
  edited: boolean
  author: {
    id: string
    username: string
    tag: string
    avatar_color: string
    status: string
  }
}

interface VoiceState {
  connected: boolean
  channelId: string | null
  channelName: string | null
  muted: boolean
  deafened: boolean
}

interface AppContextValue {
  theme: 'light' | 'dark'
  toggleTheme: () => void
  servers: DbServer[]
  activeServerId: string | null
  setActiveServerId: (id: string) => void
  categories: DbCategory[]
  channels: DbChannel[]
  members: DbMember[]
  activeChannelId: string | null
  setActiveChannelId: (id: string) => void
  messages: RealtimeMessage[]
  messagesLoading: boolean
  sendMessage: (content: string, replyTo?: string) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  voiceState: VoiceState
  leaveVoice: () => void
  toggleMute: () => void
  replyTo: RealtimeMessage | null
  setReplyTo: (msg: RealtimeMessage | null) => void
  createServer: (name: string, initials: string) => Promise<void>
  joinServer: (serverId: string) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [servers, setServers] = useState<DbServer[]>([])
  const [activeServerId, setActiveServerId] = useState<string | null>(null)
  const [categories, setCategories] = useState<DbCategory[]>([])
  const [channels, setChannels] = useState<DbChannel[]>([])
  const [members, setMembers] = useState<DbMember[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>({
    connected: false, channelId: null, channelName: null, muted: false, deafened: false,
  })
  const [replyTo, setReplyTo] = useState<RealtimeMessage | null>(null)

  const toggleTheme = useCallback(() => {
    setTheme(t => t === 'light' ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    if (!user) return
    loadServers()
  }, [user])

  async function loadServers() {
    const { data } = await supabase
      .from('server_members')
      .select('server_id, servers(*)')
      .eq('user_id', user!.id)

    if (data && data.length > 0) {
      const srvs = data.map((d: any) => d.servers).filter(Boolean) as DbServer[]
      setServers(srvs)
      if (!activeServerId && srvs.length > 0) {
        setActiveServerId(srvs[0].id)
      }
    } else {
      setServers([])
    }
  }

  useEffect(() => {
    if (!activeServerId) return
    loadServerData(activeServerId)
  }, [activeServerId])

  async function loadServerData(serverId: string) {
    const [catRes, chRes, memRes] = await Promise.all([
      supabase.from('categories').select('*').eq('server_id', serverId).order('position'),
      supabase.from('channels').select('*').eq('server_id', serverId).order('position'),
      supabase.from('server_members').select(`
        server_id, user_id, role, joined_at,
        profile:profiles!server_members_user_id_fkey(id, username, tag, avatar_color, status, activity)
      `).eq('server_id', serverId),
    ])

    setCategories((catRes.data ?? []) as DbCategory[])
    setChannels((chRes.data ?? []) as DbChannel[])
    setMembers((memRes.data as unknown as DbMember[]) ?? [])

    if (chRes.data && chRes.data.length > 0) {
      const textChannel = chRes.data.find((c: any) => c.type === 'text')
      if (textChannel && !activeChannelId) {
        setActiveChannelId(textChannel.id)
      } else if (textChannel && activeChannelId) {
        const exists = chRes.data.find((c: any) => c.id === activeChannelId)
        if (!exists) setActiveChannelId(textChannel.id)
      }
    }
  }

  useEffect(() => {
    if (!activeChannelId) return
    setMessagesLoading(true)
    setMessages([])

    supabase
      .from('messages')
      .select(`
        id, channel_id, content, created_at, reply_to, edited,
        author:profiles!messages_author_id_fkey(id, username, tag, avatar_color, status)
      `)
      .eq('channel_id', activeChannelId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages((data as unknown as RealtimeMessage[]) ?? [])
        setMessagesLoading(false)
      })

    const sub = supabase
      .channel(`messages:${activeChannelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannelId}` },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select(`
              id, channel_id, content, created_at, reply_to, edited,
              author:profiles!messages_author_id_fkey(id, username, tag, avatar_color, status)
            `)
            .eq('id', payload.new.id)
            .single()
          if (data) setMessages(prev => [...prev, data as unknown as RealtimeMessage])
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${activeChannelId}` },
        (payload) => {
          setMessages(prev => prev.filter(m => m.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [activeChannelId])

  useEffect(() => {
    if (!activeServerId) return

    const sub = supabase
      .channel(`presence:${activeServerId}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        (payload) => {
          setMembers(prev => prev.map(m =>
            m.user_id === payload.new.id
              ? { ...m, profile: { ...m.profile, ...payload.new } }
              : m
          ))
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [activeServerId])

  const sendMessage = useCallback(async (content: string, replyToId?: string) => {
    if (!user || !activeChannelId || !content.trim()) return
    await supabase.from('messages').insert({
      channel_id: activeChannelId,
      author_id: user.id,
      content: content.trim(),
      reply_to: replyToId ?? null,
    })
    setReplyTo(null)
  }, [user, activeChannelId])

  const deleteMessage = useCallback(async (id: string) => {
    await supabase.from('messages').delete().eq('id', id)
  }, [])

  const createServer = useCallback(async (name: string, initials: string) => {
    if (!user) return
    const color = 'linear-gradient(135deg,#2b5bde,#7b5ea7)'
    const { data: server } = await supabase.from('servers').insert({
      name, initials, color, owner_id: user.id,
    }).select().single()

    if (server) {
      await supabase.from('server_members').insert({
        server_id: server.id, user_id: user.id, role: 'Founder',
      })

      const { data: cat } = await supabase.from('categories').insert({
        server_id: server.id, name: 'Genel', position: 0,
      }).select().single()

      if (cat) {
        await supabase.from('channels').insert({
          server_id: server.id, category_id: cat.id, name: 'genel-sohbet', type: 'text', position: 0,
        })
      }

      await loadServers()
      setActiveServerId(server.id)
    }
  }, [user])

  const joinServer = useCallback(async (serverId: string) => {
    if (!user) return
    await supabase.from('server_members').insert({
      server_id: serverId, user_id: user.id, role: 'Member',
    })
    await loadServers()
  }, [user])

  const leaveVoice = useCallback(() => {
    setVoiceState(prev => ({ ...prev, connected: false, channelId: null, channelName: null }))
  }, [])

  const toggleMute = useCallback(() => {
    setVoiceState(prev => ({ ...prev, muted: !prev.muted }))
  }, [])

  return (
    <AppContext.Provider value={{
      theme, toggleTheme,
      servers, activeServerId, setActiveServerId,
      categories, channels, members,
      activeChannelId, setActiveChannelId,
      messages, messagesLoading, sendMessage, deleteMessage,
      voiceState, leaveVoice, toggleMute,
      replyTo, setReplyTo,
      createServer, joinServer,
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
