import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export interface RealtimeMessage {
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

export function useMessages(channelId: string | null) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!channelId) return
    setLoading(true)

    supabase
      .from('messages')
      .select(`
        id, channel_id, content, created_at, reply_to, edited,
        author:profiles!messages_author_id_fkey(id, username, tag, avatar_color, status)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data }) => {
        setMessages((data as unknown as RealtimeMessage[]) ?? [])
        setLoading(false)
      })

    const sub = supabase
      .channel(`messages:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
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
      .subscribe()

    return () => { supabase.removeChannel(sub) }
  }, [channelId])

  const sendMessage = useCallback(async (content: string, replyTo?: string) => {
    if (!user || !channelId || !content.trim()) return
    await supabase.from('messages').insert({
      channel_id: channelId,
      author_id: user.id,
      content: content.trim(),
      reply_to: replyTo ?? null,
    })
  }, [user, channelId])

  const deleteMessage = useCallback(async (id: string) => {
    await supabase.from('messages').delete().eq('id', id)
    setMessages(prev => prev.filter(m => m.id !== id))
  }, [])

  return { messages, loading, sendMessage, deleteMessage }
}
