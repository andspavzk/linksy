import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Trash2, Reply } from 'lucide-react'
import styles from './MessageList.module.css'

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const today = new Date()
  if (d.toDateString() === today.toDateString()) return 'Bugün'
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) return 'Dün'
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
          Mesajlar yükleniyor...
        </div>
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className={styles.list}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,.3)', gap: 8,
        }}>
          <span style={{ fontSize: 36 }}>🎉</span>
          <span style={{ fontSize: 14 }}>Bu kanalda henüz mesaj yok. İlk mesajı sen yaz!</span>
        </div>
      </div>
    )
  }

  let lastDate = ''

  return (
    <div className={styles.list}>
      {messages.map((msg, i) => {
        const msgDate = formatDate(msg.created_at)
        const showDate = msgDate !== lastDate
        if (showDate) lastDate = msgDate

        const prevMsg = messages[i - 1]
        const sameAuthor = prevMsg && prevMsg.author?.id === msg.author?.id
        const isMe = msg.author?.id === user?.id

        return (
          <div key={msg.id}>
            {showDate && (
              <div className={styles.dateSep}><span>{msgDate}</span></div>
            )}
            <div className={`${styles.msgRow} ${sameAuthor ? styles.compact : ''}`}>
              {!sameAuthor && (
                <div
                  className={styles.avatar}
                  style={{ background: msg.author?.avatar_color ?? 'linear-gradient(135deg,#555,#888)' }}
                >
                  {msg.author?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              {sameAuthor && <div className={styles.avatarSpacer} />}
              <div className={styles.msgBody}>
                {!sameAuthor && (
                  <div className={styles.msgHeader}>
                    <span className={styles.authorName}>{msg.author?.username ?? 'Bilinmeyen'}</span>
                    <span className={styles.tag}>{msg.author?.tag}</span>
                    <span className={styles.time}>{formatTime(msg.created_at)}</span>
                  </div>
                )}
                <div className={styles.msgContent}>{msg.content}</div>
              </div>
              <div className={styles.msgActions}>
                <button title="Yanıtla" onClick={() => setReplyTo(msg)}>
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
