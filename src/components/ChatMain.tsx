import styles from './ChatMain.module.css'
import { ChatHeader } from './ChatHeader'
import { VoiceBar } from './VoiceBar'
import { MessageList } from './MessageList'
import { MessageInput } from './MessageInput'
import { useApp } from '../context/AppContext'
import { MOCK_SERVER } from '../data/mock'

export function ChatMain() {
  const { activeChannelId, voiceState } = useApp()
  const channel = MOCK_SERVER.channels.find(c => c.id === activeChannelId)

  return (
    <main className={styles.main}>
      <ChatHeader />
      {channel?.description && (
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
