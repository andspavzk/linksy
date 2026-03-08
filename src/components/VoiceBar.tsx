import { useApp } from '../context/AppContext'
import styles from './VoiceBar.module.css'

export function VoiceBar() {
  const { voiceState, leaveVoice, toggleMute } = useApp()
  if (!voiceState.connected) return null

  return (
    <div className={styles.bar}>
      <span className={styles.dot} />
      <span className={styles.channel}>🔊 {voiceState.channelName}'de bağlısın</span>
      <div className={styles.users}>
        {voiceState.participants.map(u => (
          <div
            key={u.id}
            className={styles.uav}
            style={{ background: u.avatarColor }}
            title={u.username}
          >
            {u.avatar}
          </div>
        ))}
      </div>
      <button className={styles.btn} onClick={toggleMute}>
        {voiceState.muted ? '🔇 Açık' : '🎙 Sessiz'}
      </button>
      <button className={`${styles.btn} ${styles.leave}`} onClick={leaveVoice}>
        Ayrıl
      </button>
    </div>
  )
}
