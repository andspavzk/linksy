import { useState } from 'react'
import { X, Zap } from 'lucide-react'
import styles from './BetaBanner.module.css'

export function BetaBanner() {
  const [visible, setVisible] = useState(true)
  if (!visible) return null

  return (
    <div className={styles.banner}>
      <Zap size={14} />
      <span>
        <strong>Linksy Beta</strong> — Erken erişim sürümü. Özellikler değişebilir.
        Geri bildirim için{' '}
        <a href="mailto:beta@linksy.chat" className={styles.link}>beta@linksy.chat</a>
      </span>
      <button className={styles.close} onClick={() => setVisible(false)} aria-label="Kapat">
        <X size={13} />
      </button>
    </div>
  )
}
