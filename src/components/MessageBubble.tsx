import { useState } from 'react'
import { SmilePlus, Reply, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import type { Message } from '../types'
import { CURRENT_USER } from '../data/mock'
import { EmbedCard } from './EmbedCard'
import { ThreadPreview } from './ThreadPreview'
import styles from './MessageBubble.module.css'

interface Props {
  message: Message
  showAvatar: boolean
  onReply: (msg: Message) => void
}

function formatTime(d: Date) {
  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

function renderContent(text: string) {
  const parts = text.split(/(`[^`]+`)/)
  return parts.map((p, i) =>
    p.startsWith('`') && p.endsWith('`')
      ? <code key={i} className={styles.code}>{p.slice(1, -1)}</code>
      : <span key={i}>{p}</span>
  )
}

export function MessageBubble({ message, showAvatar, onReply }: Props) {
  const isOwn = message.author.id === CURRENT_USER.id
  const [reactions, setReactions] = useState(message.reactions ?? [])

  const toggleReaction = (emoji: string) => {
    setReactions(prev => prev.map(r =>
      r.emoji === emoji
        ? { ...r, mine: !r.mine, count: r.mine ? r.count - 1 : r.count + 1 }
        : r
    ))
  }

  if (message.type === 'system') {
    return (
      <div className={styles.system}>
        <span className={styles.systemMsg}>{message.content}</span>
      </div>
    )
  }

  return (
    <div className={clsx(styles.row, isOwn ? styles.out : styles.in, showAvatar && styles.mt)}>
      {!isOwn && (
        <div className={styles.avWrap}>
          {showAvatar
            ? <div className={styles.av} style={{ background: message.author.avatarColor }}>{message.author.avatar}</div>
            : <div className={clsx(styles.av, styles.avHidden)} />
          }
        </div>
      )}

      <div className={styles.bub}>
        {!isOwn && showAvatar && (
          <div className={styles.sender} style={{ color: message.author.roleColor ?? message.author.avatarColor.split(',')[1]?.trim().replace(')', '') ?? '#888' }}>
            {message.author.username}
            {message.author.isBot && <span className={styles.botTag}>BOT</span>}
          </div>
        )}

        {message.replyTo && (
          <div className={styles.reply}>
            <span className={styles.replyName}>{message.replyTo.author.username}</span>
            {' '}{message.replyTo.content.slice(0, 60)}{message.replyTo.content.length > 60 ? '…' : ''}
          </div>
        )}

        <div className={styles.text}>{renderContent(message.content)}</div>

        {message.embed && <EmbedCard embed={message.embed} />}
        {message.thread && <ThreadPreview thread={message.thread} />}

        {reactions.length > 0 && (
          <div className={styles.reactions}>
            {reactions.map(r => (
              <button
                key={r.emoji}
                className={clsx(styles.rxn, r.mine && styles.rxnMine)}
                onClick={() => toggleReaction(r.emoji)}
              >
                <span>{r.emoji}</span>
                <span className={styles.rxnN}>{r.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          {message.edited && <span className={styles.edited}>(düzenlendi)</span>}
          <span className={styles.time}>{formatTime(message.timestamp)}</span>
          {isOwn && <span className={styles.check}>✓✓</span>}
        </div>

        <div className={styles.actions}>
          <button title="Reaksiyon"><SmilePlus size={12} /></button>
          <button title="Yanıtla" onClick={() => onReply(message)}><Reply size={12} /></button>
          {isOwn && <button title="Düzenle"><Pencil size={12} /></button>}
          {isOwn && <button title="Sil" className={styles.danger}><Trash2 size={12} /></button>}
          <button title="Daha Fazla"><MoreHorizontal size={12} /></button>
        </div>
      </div>
    </div>
  )
}
