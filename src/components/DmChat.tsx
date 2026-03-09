import { useEffect, useRef, useState } from 'react'
import { useDm } from '../context/DmContext'
import { useAuth } from '../context/AuthContext'
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

  if (!activeDmId) {
    return (
      <main className={styles.main}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t-muted)', gap: 12 }}>
          <span style={{ fontSize: 48, opacity: .5 }}>&#128172;</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Bir sohbet sec</span>
          <span style={{ fontSize: 13 }}>Sol panelden bir DM sec veya yeni mesaj baslat</span>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <header style={{
        height: 48, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: '1px solid rgba(0,0,0,.24)', boxShadow: '0 1px 0 rgba(0,0,0,.2)',
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: activeDm?.otherUser?.avatarColor ?? 'var(--bg-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 12,
        }}>
          {activeDm?.otherUser?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <span style={{ color: 'var(--t1)', fontWeight: 700, fontSize: 15 }}>
          {activeDm?.otherUser?.username ?? 'Kullanici'}
        </span>
      </header>

      <div className={msgStyles.list}>
        {dmLoading && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t-muted)' }}>Yukleniyor...</div>}
        {!dmLoading && dmMessages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--t-muted)', gap: 8 }}>
            <span style={{ fontSize: 14 }}>Sohbete basla!</span>
          </div>
        )}
        {dmMessages.map((msg, i) => {
          const prevMsg = dmMessages[i - 1]
          const sameAuthor = prevMsg && prevMsg.authorId === msg.authorId
          return (
            <div key={msg.id} className={`${msgStyles.msgRow} ${sameAuthor ? msgStyles.compact : ''}`}>
              {!sameAuthor && (
                <div className={msgStyles.avatar} style={{ background: msg.author?.avatarColor ?? 'var(--bg-light)' }}>
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
            placeholder={`${activeDm?.otherUser?.username ?? 'Kullanici'} ile mesajlas...`}
            value={value} onChange={e => setValue(e.target.value)} onKeyDown={handleKey} />
          <button className={inputStyles.sendBtn} onClick={submit} disabled={!value.trim() || sending} title="Gonder">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    </main>
  )
}
