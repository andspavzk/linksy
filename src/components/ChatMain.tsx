import styles from './ChatMain.module.css'
import { ChatHeader } from './ChatHeader'
import { VoiceBar } from './VoiceBar'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useApp } from '../context/AppContext'
import { Menu } from 'lucide-react'

interface Props {
  onMenuClick?: () => void
  isMobile?: boolean
}

export function ChatMain({ onMenuClick, isMobile }: Props) {
  const { activeChannelId, voiceState, channels } = useApp()
  const channel = channels.find(c => c.id === activeChannelId)

  if (!activeChannelId || !channel) {
    return (
      <main className={styles.main}>
        {isMobile && (
          <div className={styles.mobileHeader}>
            <button className={styles.menuBtn} onClick={onMenuClick}><Menu size={22} /></button>
            <span className={styles.mobileTitle}>Linksy</span>
          </div>
        )}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', height: '100%', color: 'var(--t-muted)',
          gap: 12, padding: 20,
        }}>
          <span style={{ fontSize: 48, opacity: .5 }}>&#128172;</span>
          <span style={{ fontSize: 16, fontWeight: 600 }}>Bir kanal sec veya sunucu olustur</span>
          {isMobile && <span style={{ fontSize: 13 }}>Sol menu icin yana kaydir</span>}
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <ChatHeader onMenuClick={onMenuClick} isMobile={isMobile} />
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
