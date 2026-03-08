import { Phone, Video, Users, Search, Hash } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MOCK_SERVER } from '../data/mock'
import { ChannelIcon } from './ChannelIcon'
import styles from './ChatHeader.module.css'

export function ChatHeader() {
  const { activeChannelId } = useApp()
  const channel = MOCK_SERVER.channels.find(c => c.id === activeChannelId)
  if (!channel) return null

  return (
    <header className={styles.header}>
      <ChannelIcon type={channel.type} size={19} className={styles.chIcon} />
      <span className={styles.name}>{channel.name}</span>
      {channel.description && (
        <span className={styles.topic}>{channel.description}</span>
      )}
      <div className={styles.actions}>
        <button className={styles.btn} title="Sesli Ara"><Phone size={18} /></button>
        <button className={styles.btn} title="Görüntülü Ara"><Video size={18} /></button>
        <button className={styles.btn} title="Thread"><Hash size={18} /></button>
        <button className={styles.btn} title="Üyeler"><Users size={18} /></button>
        <button className={styles.btn} title="Arama"><Search size={18} /></button>
      </div>
    </header>
  )
}
