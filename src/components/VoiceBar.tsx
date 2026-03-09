import { useApp } from '../context/AppContext'
import styles from './VoiceBar.module.css'

export function VoiceBar() {
  const { voiceState, leaveVoice, toggleMute } = useApp()
  if (!voiceState.connected) return null

  return (
    <div className={styles.bar}>
      <span className={styles.dot} />
      <span className={styles.channel}>🔊 {voiceState.channelName}'de baglısin</span>
      <button className={styles.btn} onClick={toggleMute}>
        {voiceState.muted ? '🔇 Acik' : '🎙 Sessiz'}
      </button>
      <button className={${styles.btn} } onClick={leaveVoice}>
        Ayril
      </button>
    </div>
  )
}
