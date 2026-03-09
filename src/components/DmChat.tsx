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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  if (!activeDmId) {
    return (
      <main className={styles.main}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,.3)', gap: 8 }}>
          <span style={{ fontSize: 40 }}>&#128172;</span>
          <span style={{ fontSize: 15 }}>Bir sohbet sec veya yeni bir mesaj baslat</span>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <header style={{
        padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,.06)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          background: activeDm?.otherUser?.avatarColor ?? '#555',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 12,
        }}>
          {activeDm?.otherUser?.username?.[0]?.toUpperCase() ?? '?'}
        </div>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
          {activeDm?.otherUser?.username ?? 'Kullanici'}
        </span>
      </header>

      <div className={msgStyles.list}>
        {dmLoading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,.3)' }}>
            Yukleniyor...
          </div>
        )}
        {!dmLoading && dmMessages.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,.3)', gap: 8 }}>
            <span style={{ fontSize: 14 }}>Henuz mesaj yok. Ilk mesaji gonder!</span>
          </div>
        )}
        {dmMessages.map((msg, i) => {
          const prevMsg = dmMessages[i - 1]
          const sameAuthor = prevMsg && prevMsg.authorId === msg.authorId
          const isMe = msg.authorId === user?.uid
          return (
            <div key={msg.id} className={`${msgStyles.msgRow} ${sameAuthor ? msgStyles.compact : ''}`}>
              {!sameAuthor && (
                <div className={msgStyles.avatar} style={{ background: msg.author?.avatarColor ?? '#555' }}>
                  {msg.author?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              {sameAuthor && <div className={msgStyles.avatarSpacer} />}
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
