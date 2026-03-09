import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import {
  collection, doc, query, where, orderBy, limit, onSnapshot,
  addDoc, deleteDoc, getDocs, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'
import type { Server, Category, Channel, Message, Profile } from '../types'

interface MemberWithProfile {
  userId: string
  role: string
  joinedAt: number
  profile: Profile | null
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
  servers: Server[]
  activeServerId: string | null
  setActiveServerId: (id: string) => void
  categories: Category[]
  channels: Channel[]
  members: MemberWithProfile[]
  activeChannelId: string | null
  setActiveChannelId: (id: string) => void
  messages: Message[]
  messagesLoading: boolean
  sendMessage: (content: string, replyTo?: string) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  voiceState: VoiceState
  leaveVoice: () => void
  toggleMute: () => void
  replyTo: Message | null
  setReplyTo: (msg: Message | null) => void
  createServer: (name: string, initials: string) => Promise<void>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [servers, setServers] = useState<Server[]>([])
  const [activeServerId, setActiveServerId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [members, setMembers] = useState<MemberWithProfile[]>([])
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>({
    connected: false, channelId: null, channelName: null, muted: false, deafened: false,
  })
  const [replyTo, setReplyTo] = useState<Message | null>(null)

  const toggleTheme = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), [])

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'serverMembers'), where('userId', '==', user.uid))
    const unsub = onSnapshot(q, async (snap) => {
      const serverIds = snap.docs.map(d => d.data().serverId as string)
      if (serverIds.length === 0) { setServers([]); return }

      const srvs: Server[] = []
      for (const sid of serverIds) {
        const sDoc = await getDoc(doc(db, 'servers', sid))
        if (sDoc.exists()) srvs.push({ id: sDoc.id, ...sDoc.data() } as Server)
      }
      setServers(srvs)
      if (!activeServerId && srvs.length > 0) setActiveServerId(srvs[0].id)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!activeServerId) return

    const unsubCats = onSnapshot(
      query(collection(db, 'categories'), where('serverId', '==', activeServerId), orderBy('position')),
      (snap) => setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)))
    )

    const unsubChannels = onSnapshot(
      query(collection(db, 'channels'), where('serverId', '==', activeServerId), orderBy('position')),
      (snap) => {
        const chs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Channel))
        setChannels(chs)
        if (chs.length > 0 && !activeChannelId) {
          const textCh = chs.find(c => c.type === 'text')
          if (textCh) setActiveChannelId(textCh.id)
        }
      }
    )

    const unsubMembers = onSnapshot(
      query(collection(db, 'serverMembers'), where('serverId', '==', activeServerId)),
      async (snap) => {
        const mems: MemberWithProfile[] = []
        for (const d of snap.docs) {
          const data = d.data()
          const pDoc = await getDoc(doc(db, 'profiles', data.userId))
          mems.push({
            userId: data.userId,
            role: data.role,
            joinedAt: data.joinedAt,
            profile: pDoc.exists() ? (pDoc.data() as Profile) : null,
          })
        }
        setMembers(mems)
      }
    )

    return () => { unsubCats(); unsubChannels(); unsubMembers() }
  }, [activeServerId])

  useEffect(() => {
    if (!activeChannelId) return
    setMessagesLoading(true)
    setMessages([])

    const q = query(
      collection(db, 'messages'),
      where('channelId', '==', activeChannelId),
      orderBy('createdAt', 'asc'),
      limit(100)
    )

    const unsub = onSnapshot(q, async (snap) => {
      const msgs: Message[] = []
      for (const d of snap.docs) {
        const data = d.data()
        let author: Profile | undefined
        try {
          const pDoc = await getDoc(doc(db, 'profiles', data.authorId))
          if (pDoc.exists()) author = pDoc.data() as Profile
        } catch {}
        msgs.push({
          id: d.id,
          channelId: data.channelId,
          authorId: data.authorId,
          content: data.content,
          replyTo: data.replyTo || null,
          edited: data.edited || false,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          author,
        })
      }
      setMessages(msgs)
      setMessagesLoading(false)
    })

    return () => unsub()
  }, [activeChannelId])

  const sendMessage = useCallback(async (content: string, replyToId?: string) => {
    if (!user || !activeChannelId || !content.trim()) return
    await addDoc(collection(db, 'messages'), {
      channelId: activeChannelId,
      authorId: user.uid,
      content: content.trim(),
      replyTo: replyToId || null,
      edited: false,
      createdAt: serverTimestamp(),
    })
    setReplyTo(null)
  }, [user, activeChannelId])

  const deleteMessage = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'messages', id))
  }, [])

  const createServer = useCallback(async (name: string, initials: string) => {
    if (!user) return
    const color = 'linear-gradient(135deg,#2b5bde,#7b5ea7)'
    const serverRef = await addDoc(collection(db, 'servers'), {
      name, initials, color, ownerId: user.uid, createdAt: Date.now(),
    })

    await addDoc(collection(db, 'serverMembers'), {
      serverId: serverRef.id, userId: user.uid, role: 'Founder', joinedAt: Date.now(),
    })

    const catRef = await addDoc(collection(db, 'categories'), {
      serverId: serverRef.id, name: 'Genel', position: 0,
    })

    await addDoc(collection(db, 'channels'), {
      serverId: serverRef.id, categoryId: catRef.id,
      name: 'genel-sohbet', type: 'text', description: 'Genel sohbet kanali', position: 0,
    })

    setActiveServerId(serverRef.id)
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
      createServer,
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
