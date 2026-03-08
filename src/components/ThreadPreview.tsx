import type { Thread } from '../types'
import styles from './ThreadPreview.module.css'

export function ThreadPreview({ thread }: { thread: Thread }) {
  return (
    <div className={styles.wrap}>
      <div className={styles.header}>
        <span className={styles.arrow}>↪</span>
        <span className={styles.label}>Arşivlenmiş Thread · {thread.title}</span>
      </div>
      <div className={styles.box}>
        {thread.messages.slice(0, 2).map(msg => (
          <div key={msg.id} className={styles.msg}>
            <div className={styles.meta}>
              <div className={styles.av} style={{ background: msg.author.avatarColor }}>
                {msg.author.avatar}
              </div>
              <span className={styles.sender}>{msg.author.username}</span>
            </div>
            <div className={styles.text}>{msg.content}</div>
          </div>
        ))}
        <button className={styles.more}>
          ↪ {thread.replyCount} yanıt · Devamını görüntüle
        </button>
      </div>
    </div>
  )
}
