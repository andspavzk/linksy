import { useEffect, useRef, useState } from 'react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Trash2, Reply, Pencil, Pin, SmilePlus } from 'lucide-react'
import { ProfilePopup } from './ProfilePopup'
import styles from './MessageList.module.css'

const QUICK_EMOJIS = ['👍', '❤️', '😂', '🔥', '😮', '🎉', '👀', '✅']

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
  const { messages, messagesLoading, deleteMessage, setReplyTo, editMessage, toggleReaction, togglePin, editingMessageId, setEditingMessageId, isMod } = useApp()
  const { user } = useAuth()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [profilePopup, setProfilePopup] = useState<{ uid: string; x: number; y: number } | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function startEdit(msg: any) {
    setEditingMessageId(msg.id)
    setEditValue(msg.content)
  }

  async function saveEdit(id: string) {
    await editMessage(id, editValue)
    setEditValue('')
  }

  function handleAvatarClick(uid: string, e: React.MouseEvent) {
    e.stopPropagation()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setProfilePopup({ uid, x: rect.right + 8, y: rect.top })
  }

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
    <div className={styles.list} onClick={() => { setEmojiPickerFor(null); setProfilePopup(null) }}>
      {messages.map((msg, i) => {
        const msgDate = formatDate(msg.createdAt)
        const showDate = msgDate !== lastDate
        if (showDate) lastDate = msgDate

        const prevMsg = messages[i - 1]
        const sameAuthor = prevMsg && prevMsg.authorId === msg.authorId
        const isMe = msg.authorId === user?.uid
        const isEditing = editingMessageId === msg.id
        const reactions = msg.reactions || {}

        return (
          <div key={msg.id}>
            {showDate && (
              <div className={styles.dateSep}><span>{msgDate}</span></div>
            )}
            <div className={`${styles.msgRow} ${sameAuthor ? styles.compact : ''} ${msg.pinned ? styles.pinned : ''}`}>
              {!sameAuthor && (
                <div className={styles.avatar}
                  style={{ background: msg.author?.avatarColor ?? 'linear-gradient(135deg,#555,#888)', cursor: 'pointer' }}
                  onClick={(e) => msg.author?.uid && handleAvatarClick(msg.author.uid, e)}>
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
                    {msg.pinned && <Pin size={10} style={{ color: '#f5c542', marginLeft: 4 }} />}
                  </div>
                )}
                {isEditing ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <input value={editValue} onChange={e => setEditValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(msg.id); if (e.key === 'Escape') setEditingMessageId(null) }}
                      autoFocus
                      style={{ flex: 1, padding: '6px 10px', borderRadius: 6, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: '#fff', fontSize: 13, outline: 'none' }} />
                    <button onClick={() => saveEdit(msg.id)} style={{ background: '#4fae4e', border: 'none', color: '#fff', borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer', fontWeight: 600 }}>Kaydet</button>
                    <button onClick={() => setEditingMessageId(null)} style={{ background: 'rgba(255,255,255,.08)', border: 'none', color: 'rgba(255,255,255,.5)', borderRadius: 6, padding: '5px 10px', fontSize: 11, cursor: 'pointer' }}>Iptal</button>
                  </div>
                ) : (
                  <div className={styles.msgContent}>
                    {msg.content}
                    {msg.edited && <span style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', marginLeft: 6 }}>(duzenlendi)</span>}
                  </div>
                )}

                {Object.keys(reactions).length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                    {Object.entries(reactions).map(([emoji, users]) => (
                      <button key={emoji} onClick={(e) => { e.stopPropagation(); toggleReaction(msg.id, emoji) }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4, padding: '2px 8px',
                          borderRadius: 12, border: '1px solid',
                          borderColor: (users as string[]).includes(user?.uid ?? '') ? '#5b8def' : 'rgba(255,255,255,.08)',
                          background: (users as string[]).includes(user?.uid ?? '') ? 'rgba(91,141,239,.15)' : 'rgba(255,255,255,.04)',
                          cursor: 'pointer', fontSize: 12, color: '#fff',
                        }}>
                        <span>{emoji}</span>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.5)' }}>{(users as string[]).length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.msgActions}>
                <button title="Reaksiyon" onClick={(e) => { e.stopPropagation(); setEmojiPickerFor(emojiPickerFor === msg.id ? null : msg.id) }}>
                  <SmilePlus size={13} />
                </button>
                <button title="Yanitla" onClick={() => setReplyTo(msg)}>
                  <Reply size={13} />
                </button>
                {isMe && (
                  <button title="Duzenle" onClick={() => startEdit(msg)}>
                    <Pencil size={13} />
                  </button>
                )}
                {isMod && (
                  <button title={msg.pinned ? 'Pin kaldir' : 'Pinle'} onClick={() => togglePin(msg.id)}>
                    <Pin size={13} />
                  </button>
                )}
                {(isMe || isMod) && (
                  <button title="Sil" onClick={() => deleteMessage(msg.id)}>
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {emojiPickerFor === msg.id && (
                <div style={{
                  position: 'absolute', right: 8, top: -36, display: 'flex', gap: 2,
                  background: '#1a1a2e', borderRadius: 8, padding: '4px 6px',
                  border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 4px 12px rgba(0,0,0,.4)',
                  zIndex: 10,
                }} onClick={e => e.stopPropagation()}>
                  {QUICK_EMOJIS.map(em => (
                    <button key={em} onClick={() => { toggleReaction(msg.id, em); setEmojiPickerFor(null) }}
                      style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', padding: '2px 4px', borderRadius: 4 }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />

      {profilePopup && (
        <ProfilePopup uid={profilePopup.uid} x={profilePopup.x} y={profilePopup.y} onClose={() => setProfilePopup(null)} />
      )}
    </div>
  )
}
