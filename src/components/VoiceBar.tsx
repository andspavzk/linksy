import { useApp } from '../context/AppContext'
import styles from './VoiceBar.module.css'

export function VoiceBar() {
  const { voiceState, leaveVoice, toggleMute } = useApp()
  if (!voiceState.connected) return null

  const barClass = [styles.btn, styles.leave].join(' ')

  return (
    <div className={styles.bar}>
      <span className={styles.dot} />
      <span className={styles.channel}>Sesli kanala baglisin</span>
      <button className={styles.btn} onClick={toggleMute}>
        {voiceState.muted ? 'Mikrofon Acik' : 'Sessiz'}
      </button>
      <button className={barClass} onClick={leaveVoice}>
        Ayril
      </button>
    </div>
  )
}