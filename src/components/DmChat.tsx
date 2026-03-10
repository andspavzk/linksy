import { useEffect, useRef, useState } from 'react'
import { useDm } from '../context/DmContext'
import { useAuth } from '../context/AuthContext'
import { Phone, Video, Pin, Search } from 'lucide-react'
import styles from './ChatMain.module.css'
import msgStyles from './MessageList.module.css'
import inputStyles from './MessageInput.module.css'
import type { KeyboardEvent } from 'react'

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

export function DmChat() {
  const { activeDmId, dmMessages, dmLoading, sendDm, dmChannels } = useDm()
  const { user } = useAuth()
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const activeDm = dmChannels.find(d => d.id === activeDmId)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [dmMessages])

  async function submit() {
    if (!value.trim() || sending) return
    setSending(true)
    await sendDm(value.trim())
    setValue('')
    setSending(false)
    inputRef.current?.focus()
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit() }
  }

  if (!activeDmId || !activeDm) return null

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg-medium)', minWidth: 0 }}>
      <header style={{
        height: 48, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(0,0,0,.24)', boxShadow: '0 1px 0 rgba(0,0,0,.2)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: activeDm?.otherUser?.avatarColor ?? 'var(--bg-lighter)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 12,
        }}>
          {activeDm?.otherUser?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <span style={{ color: 'var(--t1)', fontWeight: 700, fontSize: 15, flex: 1 }}>
          {activeDm?.otherUser?.username ?? 'Kullanici'}
        </span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={{ width: 32, height: 32, borderRadius: 4, background: 'none', border: 'none', color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Phone size={18} /></button>
          <button style={{ width: 32, height: 32, borderRadius: 4, background: 'none', border: 'none', color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Video size={18} /></button>
          <button style={{ width: 32, height: 32, borderRadius: 4, background: 'none', border: 'none', color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Pin size={18} /></button>
          <button style={{ width: 32, height: 32, borderRadius: 4, background: 'none', border: 'none', color: 'var(--t2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Search size={18} /></button>
        </div>
      </header>

      <div className={msgStyles.list}>
        {dmLoading && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t-muted)' }}>Yukleniyor...</div>}
        {!dmLoading && dmMessages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8, padding: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: activeDm?.otherUser?.avatarColor ?? 'var(--bg-lighter)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 24 }}>
              {activeDm?.otherUser?.username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t1)' }}>{activeDm?.otherUser?.username}</div>
            <div style={{ fontSize: 14, color: 'var(--t3)' }}>Bu, {activeDm?.otherUser?.username} ile direkt mesaj gecmisinizin baslangici.</div>
          </div>
        )}
        {dmMessages.map((msg, i) => {
          const prevMsg = dmMessages[i - 1]
          const sameAuthor = prevMsg && prevMsg.authorId === msg.authorId
          return (
            <div key={msg.id} className={`${msgStyles.msgRow} ${sameAuthor ? msgStyles.compact : ''}`}>
              {!sameAuthor && (
                <div className={msgStyles.avatar} style={{ background: msg.author?.avatarColor ?? 'var(--bg-lighter)' }}>
                  {msg.author?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div className={msgStyles.msgBody}>
                {!sameAuthor && (
                  <div className={msgStyles.msgHeader}>
                    <span className={msgStyles.authorName}>{msg.author?.username ?? '?'}</span>
                    <span className={msgStyles.time}>{formatTime(msg.createdAt)}</span>
                  </div>
                )}
                <div className={msgStyles.msgContent}>{msg.content}</div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className={inputStyles.zone}>
        <div className={inputStyles.box}>
          <textarea ref={inputRef} className={inputStyles.field} rows={1}
            placeholder={`@${activeDm?.otherUser?.username ?? 'Kullanici'} adresine mesaj gonder`}
            value={value} onChange={e => setValue(e.target.value)} onKeyDown={handleKey} />
          <button className={inputStyles.sendBtn} onClick={submit} disabled={!value.trim() || sending}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
