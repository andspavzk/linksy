import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import {
  collection, doc, query, where, orderBy, limit, onSnapshot,
  addDoc, deleteDoc, updateDoc, getDoc, serverTimestamp, getDocs,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'
import type { Server, Category, Channel, Message, Profile, ChannelType } from '../types'

interface MemberWithProfile {
  oderId: string
  odocId: string
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
  activeServer: Server | null
  categories: Category[]
  channels: Channel[]
  members: MemberWithProfile[]
  activeChannelId: string | null
  setActiveChannelId: (id: string) => void
  messages: Message[]
  messagesLoading: boolean
  sendMessage: (content: string, replyTo?: string) => Promise<void>
  editMessage: (id: string, newContent: string) => Promise<void>
  deleteMessage: (id: string) => Promise<void>
  toggleReaction: (msgId: string, emoji: string) => Promise<void>
  togglePin: (msgId: string) => Promise<void>
  pinnedMessages: Message[]
  searchMessages: (term: string) => Promise<Message[]>
  editingMessageId: string | null
  setEditingMessageId: (id: string | null) => void
  voiceState: VoiceState
  leaveVoice: () => void
  toggleMute: () => void
  replyTo: Message | null
  setReplyTo: (msg: Message | null) => void
  createServer: (name: string, initials: string) => Promise<void>
  updateServer: (data: Partial<Server>) => Promise<void>
  deleteServer: () => Promise<void>
  createCategory: (name: string) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  createChannel: (name: string, type: ChannelType, categoryId: string | null, description?: string) => Promise<void>
  deleteChannel: (id: string) => Promise<void>
  updateChannel: (id: string, data: Partial<Channel>) => Promise<void>
  updateMemberRole: (memberDocId: string, role: string) => Promise<void>
  kickMember: (memberDocId: string) => Promise<void>
  getInviteCode: () => string | null
  joinByInvite: (serverId: string) => Promise<string | null>
  isOwner: boolean
  isMod: boolean
  modal: string | null
  setModal: (m: string | null) => void
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
  const [modal, setModal] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [pinnedMessages, setPinnedMessages] = useState<Message[]>([])

  const toggleTheme = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), [])

  const activeServer = servers.find(s => s.id === activeServerId) || null
  const isOwner = !!(activeServer && user && activeServer.ownerId === user.uid)
  const myMembership = members.find(m => m.userId === user?.uid)
  const isMod = isOwner || myMembership?.role === 'Moderator'

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
    if (!activeServerId) { setCategories([]); setChannels([]); setMembers([]); return }

    const unsubCats = onSnapshot(
      query(collection(db, 'categories'), where('serverId', '==', activeServerId), orderBy('position')),
      (snap) => setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() } as Category)))
    )

    const unsubChannels = onSnapshot(
      query(collection(db, 'channels'), where('serverId', '==', activeServerId), orderBy('position')),
      (snap) => {
        const chs = snap.docs.map(d => ({ id: d.id, ...d.data() } as Channel))
        setChannels(chs)
        if (chs.length > 0) {
          const current = chs.find(c => c.id === activeChannelId)
          if (!current) {
            const textCh = chs.find(c => c.type === 'text')
            if (textCh) setActiveChannelId(textCh.id)
          }
        } else {
          setActiveChannelId(null)
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
            oderId: data.serverId,
            odocId: d.id,
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
    if (!activeChannelId) { setMessages([]); return }
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

  const editMessage = useCallback(async (id: string, newContent: string) => {
    if (!newContent.trim()) return
    await updateDoc(doc(db, 'messages', id), {
      content: newContent.trim(), edited: true, editedAt: Date.now(),
    })
    setEditingMessageId(null)
  }, [])

  const toggleReaction = useCallback(async (msgId: string, emoji: string) => {
    if (!user) return
    const msgRef = doc(db, 'messages', msgId)
    const msgSnap = await getDoc(msgRef)
    if (!msgSnap.exists()) return
    const data = msgSnap.data()
    const reactions: Record<string, string[]> = data.reactions || {}
    const users = reactions[emoji] || []
    if (users.includes(user.uid)) {
      reactions[emoji] = users.filter(u => u !== user.uid)
      if (reactions[emoji].length === 0) delete reactions[emoji]
    } else {
      reactions[emoji] = [...users, user.uid]
    }
    await updateDoc(msgRef, { reactions })
  }, [user])

  const togglePin = useCallback(async (msgId: string) => {
    const msgRef = doc(db, 'messages', msgId)
    const msgSnap = await getDoc(msgRef)
    if (!msgSnap.exists()) return
    const pinned = !msgSnap.data().pinned
    await updateDoc(msgRef, { pinned })
  }, [])

  useEffect(() => {
    if (!activeChannelId) { setPinnedMessages([]); return }
    const q = query(
      collection(db, 'messages'),
      where('channelId', '==', activeChannelId),
      where('pinned', '==', true)
    )
    const unsub = onSnapshot(q, async (snap) => {
      const pins: Message[] = []
      for (const d of snap.docs) {
        const data = d.data()
        let author: Profile | undefined
        try {
          const pDoc = await getDoc(doc(db, 'profiles', data.authorId))
          if (pDoc.exists()) author = pDoc.data() as Profile
        } catch {}
        pins.push({
          id: d.id, channelId: data.channelId, authorId: data.authorId,
          content: data.content, replyTo: null, edited: data.edited || false,
          pinned: true, createdAt: data.createdAt?.toMillis?.() || Date.now(), author,
        })
      }
      setPinnedMessages(pins)
    })
    return () => unsub()
  }, [activeChannelId])

  const searchMessages = useCallback(async (term: string): Promise<Message[]> => {
    if (!activeChannelId || term.length < 2) return []
    return messages.filter(m => m.content.toLowerCase().includes(term.toLowerCase()))
  }, [activeChannelId, messages])

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

  const updateServer = useCallback(async (data: Partial<Server>) => {
    if (!activeServerId) return
    await updateDoc(doc(db, 'servers', activeServerId), data)
    setServers(prev => prev.map(s => s.id === activeServerId ? { ...s, ...data } : s))
  }, [activeServerId])

  const deleteServer = useCallback(async () => {
    if (!activeServerId) return
    const memSnap = await getDocs(query(collection(db, 'serverMembers'), where('serverId', '==', activeServerId)))
    for (const d of memSnap.docs) await deleteDoc(d.ref)
    const catSnap = await getDocs(query(collection(db, 'categories'), where('serverId', '==', activeServerId)))
    for (const d of catSnap.docs) await deleteDoc(d.ref)
    const chSnap = await getDocs(query(collection(db, 'channels'), where('serverId', '==', activeServerId)))
    for (const d of chSnap.docs) {
      const msgSnap = await getDocs(query(collection(db, 'messages'), where('channelId', '==', d.id)))
      for (const m of msgSnap.docs) await deleteDoc(m.ref)
      await deleteDoc(d.ref)
    }
    await deleteDoc(doc(db, 'servers', activeServerId))
    setActiveServerId(null)
    setActiveChannelId(null)
  }, [activeServerId])

  const createCategory = useCallback(async (name: string) => {
    if (!activeServerId) return
    await addDoc(collection(db, 'categories'), {
      serverId: activeServerId, name, position: categories.length,
    })
  }, [activeServerId, categories])

  const deleteCategory = useCallback(async (id: string) => {
    await deleteDoc(doc(db, 'categories', id))
  }, [])

  const createChannel = useCallback(async (name: string, type: ChannelType, categoryId: string | null, description?: string) => {
    if (!activeServerId) return
    await addDoc(collection(db, 'channels'), {
      serverId: activeServerId, categoryId, name, type,
      description: description || null, position: channels.length,
    })
  }, [activeServerId, channels])

  const deleteChannel = useCallback(async (id: string) => {
    const msgSnap = await getDocs(query(collection(db, 'messages'), where('channelId', '==', id)))
    for (const m of msgSnap.docs) await deleteDoc(m.ref)
    await deleteDoc(doc(db, 'channels', id))
    if (activeChannelId === id) setActiveChannelId(null)
  }, [activeChannelId])

  const updateChannel = useCallback(async (id: string, data: Partial<Channel>) => {
    await updateDoc(doc(db, 'channels', id), data)
  }, [])

  const updateMemberRole = useCallback(async (memberDocId: string, role: string) => {
    await updateDoc(doc(db, 'serverMembers', memberDocId), { role })
  }, [])

  const kickMember = useCallback(async (memberDocId: string) => {
    await deleteDoc(doc(db, 'serverMembers', memberDocId))
  }, [])

  const getInviteCode = useCallback(() => {
    return activeServerId
  }, [activeServerId])

  const joinByInvite = useCallback(async (serverId: string) => {
    if (!user) return 'Giris yapman gerekiyor'
    const sDoc = await getDoc(doc(db, 'servers', serverId))
    if (!sDoc.exists()) return 'Sunucu bulunamadi'
    const existing = await getDocs(
      query(collection(db, 'serverMembers'), where('serverId', '==', serverId), where('userId', '==', user.uid))
    )
    if (!existing.empty) return 'Zaten bu sunucudasin'
    await addDoc(collection(db, 'serverMembers'), {
      serverId, userId: user.uid, role: 'Member', joinedAt: Date.now(),
    })
    setActiveServerId(serverId)
    return null
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
      servers, activeServerId, setActiveServerId, activeServer,
      categories, channels, members,
      activeChannelId, setActiveChannelId,
      messages, messagesLoading, sendMessage, editMessage, deleteMessage,
      toggleReaction, togglePin, pinnedMessages, searchMessages,
      editingMessageId, setEditingMessageId,
      voiceState, leaveVoice, toggleMute,
      replyTo, setReplyTo,
      createServer, updateServer, deleteServer,
      createCategory, deleteCategory,
      createChannel, deleteChannel, updateChannel,
      updateMemberRole, kickMember,
      getInviteCode, joinByInvite,
      isOwner, isMod,
      modal, setModal,
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
