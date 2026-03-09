import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Trash2, Reply } from 'lucide-react'
import styles from './MessageList.module.css'

function formatTime(ts: number) {
  const d = new Date(ts)
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Bugun'
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Dun'
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export function MessageList() {
  const { messages, messagesLoading, deleteMessage, setReplyTo } = useApp()
  const { user } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messagesLoading) {
    return (
      <div className={styles.list}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,.3)' }}>
          Mesajlar yukleniyor...
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className={styles.list}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,.3)', gap: 8 }}>
          <span style={{ fontSize: 36 }}>&#127881;</span>
          <span style={{ fontSize: 14 }}>Bu kanalda henuz mesaj yok. Ilk mesaji sen yaz!</span>
        </div>
      </div>
    )
  }

  let lastDate = ''

  return (
    <div className={styles.list}>
      {messages.map((msg, i) => {
        const msgDate = formatDate(msg.createdAt)
        const showDate = msgDate !== lastDate
        if (showDate) lastDate = msgDate

        const prevMsg = messages[i - 1]
        const sameAuthor = prevMsg && prevMsg.authorId === msg.authorId
        const isMe = msg.authorId === user?.uid

        return (
          <div key={msg.id}>
            {showDate && (
              <div className={styles.dateSep}><span>{msgDate}</span></div>
            )}
            <div className={`${styles.msgRow} ${sameAuthor ? styles.compact : ''}`}>
              {!sameAuthor && (
                <div className={styles.avatar} style={{ background: msg.author?.avatarColor ?? 'linear-gradient(135deg,#555,#888)' }}>
                  {msg.author?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              {sameAuthor && <div className={styles.avatarSpacer} />}
              <div className={styles.msgBody}>
                {!sameAuthor && (
                  <div className={styles.msgHeader}>
                    <span className={styles.authorName}>{msg.author?.username ?? 'Bilinmeyen'}</span>
                    <span className={styles.tag}>{msg.author?.tag}</span>
                    <span className={styles.time}>{formatTime(msg.createdAt)}</span>
                  </div>
                )}
                <div className={styles.msgContent}>{msg.content}</div>
              </div>
              <div className={styles.msgActions}>
                <button title="Yanitla" onClick={() => setReplyTo(msg)}>
                  <Reply size={13} />
                </button>
                {isMe && (
                  <button title="Sil" onClick={() => deleteMessage(msg.id)}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
