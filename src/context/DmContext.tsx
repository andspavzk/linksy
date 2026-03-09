import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import {
  collection, doc, query, where, orderBy, limit, onSnapshot,
  addDoc, deleteDoc, updateDoc, getDoc, getDocs, serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from './AuthContext'
import type { Profile, DmChannel, Message, FriendRequest } from '../types'

interface DmContextValue {
  dmChannels: (DmChannel & { otherUser?: Profile })[]
  activeDmId: string | null
  setActiveDmId: (id: string | null) => void
  dmMessages: Message[]
  dmLoading: boolean
  sendDm: (content: string) => Promise<void>
  createDm: (otherUserId: string) => Promise<string>
  friends: (FriendRequest & { profile?: Profile })[]
  pendingRequests: (FriendRequest & { profile?: Profile })[]
  sendFriendRequest: (username: string, tag: string) => Promise<string | null>
  acceptFriend: (requestId: string) => Promise<void>
  rejectFriend: (requestId: string) => Promise<void>
  removeFriend: (requestId: string) => Promise<void>
  searchUsers: (term: string) => Promise<Profile[]>
  isDmMode: boolean
  setIsDmMode: (v: boolean) => void
}

const DmContext = createContext<DmContextValue | null>(null)

export function DmProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [dmChannels, setDmChannels] = useState<(DmChannel & { otherUser?: Profile })[]>([])
  const [activeDmId, setActiveDmId] = useState<string | null>(null)
  const [dmMessages, setDmMessages] = useState<Message[]>([])
  const [dmLoading, setDmLoading] = useState(false)
  const [friends, setFriends] = useState<(FriendRequest & { profile?: Profile })[]>([])
  const [pendingRequests, setPendingRequests] = useState<(FriendRequest & { profile?: Profile })[]>([])
  const [isDmMode, setIsDmMode] = useState(false)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'dmChannels'), where('participants', 'array-contains', user.uid))
    const unsub = onSnapshot(q, async (snap) => {
      const chs: (DmChannel & { otherUser?: Profile })[] = []
      for (const d of snap.docs) {
        const data = d.data()
        const otherId = (data.participants as string[]).find(p => p !== user.uid)
        let otherUser: Profile | undefined
        if (otherId) {
          try {
            const pDoc = await getDoc(doc(db, 'profiles', otherId))
            if (pDoc.exists()) otherUser = pDoc.data() as Profile
          } catch {}
        }
        chs.push({
          id: d.id,
          participants: data.participants,
          lastMessage: data.lastMessage || null,
          lastMessageAt: data.lastMessageAt || null,
          createdAt: data.createdAt || Date.now(),
          otherUser,
        })
      }
      chs.sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
      setDmChannels(chs)
    })
    return () => unsub()
  }, [user])

  useEffect(() => {
    if (!user) return

    const qFrom = query(collection(db, 'friendRequests'), where('fromId', '==', user.uid))
    const unsub1 = onSnapshot(qFrom, async (snap) => {
      const accepted: (FriendRequest & { profile?: Profile })[] = []
      for (const d of snap.docs) {
        const data = d.data()
        if (data.status !== 'accepted') continue
        let profile: Profile | undefined
        try {
          const pDoc = await getDoc(doc(db, 'profiles', data.toId))
          if (pDoc.exists()) profile = pDoc.data() as Profile
        } catch {}
        accepted.push({ ...data, id: d.id, profile } as any)
      }
      setFriends(prev => {
        const others = prev.filter(f => f.fromId !== user.uid)
        return [...accepted, ...others]
      })
    })

    const qTo = query(collection(db, 'friendRequests'), where('toId', '==', user.uid))
    const unsub2 = onSnapshot(qTo, async (snap) => {
      const accepted: (FriendRequest & { profile?: Profile })[] = []
      const pending: (FriendRequest & { profile?: Profile })[] = []
      for (const d of snap.docs) {
        const data = d.data()
        let profile: Profile | undefined
        try {
          const pDoc = await getDoc(doc(db, 'profiles', data.fromId))
          if (pDoc.exists()) profile = pDoc.data() as Profile
        } catch {}
        const item = { ...data, id: d.id, profile } as any
        if (data.status === 'accepted') accepted.push(item)
        else if (data.status === 'pending') pending.push(item)
      }
      setFriends(prev => {
        const mine = prev.filter(f => f.fromId === user.uid)
        return [...mine, ...accepted]
      })
      setPendingRequests(pending)
    })

    return () => { unsub1(); unsub2() }
  }, [user])

  useEffect(() => {
    if (!activeDmId) { setDmMessages([]); return }
    setDmLoading(true)
    const q = query(
      collection(db, 'dmMessages'),
      where('dmChannelId', '==', activeDmId),
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
          id: d.id, channelId: data.dmChannelId, authorId: data.authorId,
          content: data.content, replyTo: null, edited: false,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
          author,
        })
      }
      setDmMessages(msgs)
      setDmLoading(false)
    })
    return () => unsub()
  }, [activeDmId])

  const sendDm = useCallback(async (content: string) => {
    if (!user || !activeDmId || !content.trim()) return
    await addDoc(collection(db, 'dmMessages'), {
      dmChannelId: activeDmId, authorId: user.uid,
      content: content.trim(), createdAt: serverTimestamp(),
    })
    await updateDoc(doc(db, 'dmChannels', activeDmId), {
      lastMessage: content.trim().slice(0, 50), lastMessageAt: Date.now(),
    })
  }, [user, activeDmId])

  const createDm = useCallback(async (otherUserId: string): Promise<string> => {
    if (!user) return ''
    const existing = dmChannels.find(dm =>
      dm.participants.includes(otherUserId) && dm.participants.includes(user.uid)
    )
    if (existing) return existing.id
    const ref = await addDoc(collection(db, 'dmChannels'), {
      participants: [user.uid, otherUserId],
      lastMessage: null, lastMessageAt: null, createdAt: Date.now(),
    })
    return ref.id
  }, [user, dmChannels])

  const sendFriendRequest = useCallback(async (username: string, tag: string): Promise<string | null> => {
    if (!user) return 'Giris yapman gerekiyor'
    const snap = await getDocs(collection(db, 'profiles'))
    const target = snap.docs.find(d => {
      const data = d.data()
      return data.username === username && data.tag === tag
    })
    if (!target) return 'Kullanici bulunamadi'
    if (target.id === user.uid) return 'Kendine istek gonderemezsin'

    const existingSnap = await getDocs(query(collection(db, 'friendRequests'), where('fromId', '==', user.uid)))
    const alreadySent = existingSnap.docs.find(d => d.data().toId === target.id)
    if (alreadySent) return 'Zaten istek gonderilmis'

    await addDoc(collection(db, 'friendRequests'), {
      fromId: user.uid, toId: target.id, status: 'pending', createdAt: Date.now(),
    })
    return null
  }, [user])

  const acceptFriend = useCallback(async (requestId: string) => {
    await updateDoc(doc(db, 'friendRequests', requestId), { status: 'accepted' })
  }, [])

  const rejectFriend = useCallback(async (requestId: string) => {
    await deleteDoc(doc(db, 'friendRequests', requestId))
  }, [])

  const removeFriend = useCallback(async (requestId: string) => {
    await deleteDoc(doc(db, 'friendRequests', requestId))
  }, [])

  const searchUsers = useCallback(async (term: string): Promise<Profile[]> => {
    if (term.length < 2) return []
    const snap = await getDocs(collection(db, 'profiles'))
    return snap.docs
      .map(d => d.data() as Profile)
      .filter(p => p.uid !== user?.uid && p.username.toLowerCase().includes(term.toLowerCase()))
      .slice(0, 10)
  }, [user])

  return (
    <DmContext.Provider value={{
      dmChannels, activeDmId, setActiveDmId, dmMessages, dmLoading,
      sendDm, createDm, friends, pendingRequests,
      sendFriendRequest, acceptFriend, rejectFriend, removeFriend,
      searchUsers, isDmMode, setIsDmMode,
    }}>
      {children}
    </DmContext.Provider>
  )
}

export function useDm() {
  const ctx = useContext(DmContext)
  if (!ctx) throw new Error('useDm must be used within DmProvider')
  return ctx
}
