import styles from './ChatMain.module.css'
import { ChatHeader } from './ChatHeader'
import { VoiceBar } from './VoiceBar'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useApp } from '../context/AppContext'

export function ChatMain() {
  const { activeChannelId, voiceState, channels } = useApp()
  const channel = channels.find(c => c.id === activeChannelId)

  if (!activeChannelId || !channel) {
    return (
      <main className={styles.main}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,.35)',
          gap: 8,
        }}>
          <span style={{ fontSize: 40 }}>💬</span>
          <span style={{ fontSize: 15 }}>Bir kanal seç veya sunucu oluştur</span>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <ChatHeader />
      {channel.description && (
        <div className={styles.chDesc}>
          <div className={styles.chDescTitle}>#{channel.name}</div>
          <div className={styles.chDescSub}>{channel.description}</div>
        </div>
      )}
      {voiceState.connected && <VoiceBar />}
      <MessageList />
      <MessageInput />
    </main>
  )
}
