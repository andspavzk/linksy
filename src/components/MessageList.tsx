import { useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { MessageBubble } from './MessageBubble'
import type { Message } from '../types'
import styles from './MessageList.module.css'

export function MessageList() {
  const { messages, setReplyTo } = useApp()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isPrevSameAuthor = (i: number) =>
    i > 0 && messages[i].author.id === messages[i - 1].author.id

  return (
    <div className={styles.list}>
      <div className={styles.dateSep}><span>Bugün</span></div>

      {messages.map((msg: Message, i) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          showAvatar={!isPrevSameAuthor(i)}
          onReply={setReplyTo}
        />
      ))}

      <div className={styles.typing}>
        <div className={styles.dots}>
          <span /><span /><span />
        </div>
        <span>Emircan yazıyor...</span>
      </div>

      <div ref={bottomRef} />
    </div>
  )
}
