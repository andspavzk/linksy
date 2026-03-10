import { useState } from 'react'
import styles from './ChatMain.module.css'
import { ChatHeader } from './ChatHeader'
import { VoiceBar } from './VoiceBar'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { SearchPanel } from './SearchPanel'
import { useApp } from '../context/AppContext'
import { Menu } from 'lucide-react'

interface Props {
  onMenuClick?: () => void
  isMobile?: boolean
}

export function ChatMain({ onMenuClick, isMobile }: Props) {
  const { activeChannelId, voiceState, channels } = useApp()
  const channel = channels.find(c => c.id === activeChannelId)
  const [panelTab, setPanelTab] = useState<'search' | 'pinned' | 'saved' | null>(null)

  function togglePanel(tab: 'search' | 'pinned' | 'saved') {
    setPanelTab(prev => prev === tab ? null : tab)
  }

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
        </div>
      </main>
    )
  }

  return (
    <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
      <main className={styles.main}>
        <ChatHeader onMenuClick={onMenuClick} isMobile={isMobile} onPanelToggle={togglePanel} />
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
      <SearchPanel visible={!!panelTab} onClose={() => setPanelTab(null)} initialTab={panelTab ?? 'search'} />
    </div>
  )
}
