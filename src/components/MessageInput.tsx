import { useState, useRef, type KeyboardEvent } from 'react'
import { Paperclip, Smile, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MOCK_SERVER } from '../data/mock'
import styles from './MessageInput.module.css'

export function MessageInput() {
  const { activeChannelId, sendMessage, replyTo, setReplyTo } = useApp()
  const [value, setValue] = useState('')
  const ref = useRef<HTMLTextAreaElement>(null)

  const channel = MOCK_SERVER.channels.find(c => c.id === activeChannelId)

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const submit = () => {
    if (!value.trim()) return
    sendMessage(value.trim())
    setValue('')
    if (ref.current) {
      ref.current.style.height = 'auto'
    }
  }

  const handleInput = () => {
    if (!ref.current) return
    ref.current.style.height = 'auto'
    ref.current.style.height = Math.min(ref.current.scrollHeight, 150) + 'px'
  }

  return (
    <div className={styles.zone}>
      {replyTo && (
        <div className={styles.replyPreview}>
          <div className={styles.replyBar} />
          <div className={styles.replyInfo}>
            <div className={styles.replyName}>{replyTo.author.username}</div>
            <div className={styles.replyText}>
              {replyTo.content.slice(0, 80)}{replyTo.content.length > 80 ? '…' : ''}
            </div>
          </div>
          <button className={styles.replyClose} onClick={() => setReplyTo(null)}>
            <X size={13} />
          </button>
        </div>
      )}

      <div className={styles.box}>
        <button className={styles.btn} title="Dosya Ekle">
          <Paperclip size={17} />
        </button>

        <textarea
          ref={ref}
          className={styles.field}
          rows={1}
          placeholder={channel ? `${channel.name}'e mesaj yaz...` : 'Mesaj yaz...'}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKey}
          onInput={handleInput}
        />

        <button className={styles.btn} title="Emoji">
          <Smile size={17} />
        </button>
        <button className={styles.gifBtn} title="GIF">GIF</button>

        <button
          className={styles.sendBtn}
          onClick={submit}
          disabled={!value.trim()}
          title="Gönder"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}
