import { Menu, Phone, Video, Users, Search, Hash } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ChannelIcon } from './ChannelIcon'
import styles from './ChatHeader.module.css'

interface Props {
  onMenuClick?: () => void
  isMobile?: boolean
}

export function ChatHeader({ onMenuClick, isMobile }: Props) {
  const { activeChannelId, channels } = useApp()
  const channel = channels.find(c => c.id === activeChannelId)
  if (!channel) return null

  return (
    <header className={styles.header}>
      {isMobile && (
        <button className={styles.menuBtn} onClick={onMenuClick}>
          <Menu size={20} />
        </button>
      )}
      <ChannelIcon type={channel.type as any} size={19} className={styles.chIcon} />
      <span className={styles.name}>{channel.name}</span>
      {!isMobile && channel.description && (
        <span className={styles.topic}>{channel.description}</span>
      )}
      <div className={styles.actions}>
        {!isMobile && (
          <>
            <button className={styles.btn} title="Sesli Ara"><Phone size={18} /></button>
            <button className={styles.btn} title="Goruntulu Ara"><Video size={18} /></button>
          </>
        )}
        <button className={styles.btn} title="Uyeler"><Users size={18} /></button>
        <button className={styles.btn} title="Arama"><Search size={18} /></button>
      </div>
    </header>
  )
}
