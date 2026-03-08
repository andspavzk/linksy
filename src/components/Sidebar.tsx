import { useState } from 'react'
import { ChevronDown, Plus, Settings, Mic, MicOff, Headphones } from 'lucide-react'
import clsx from 'clsx'
import { useApp } from '../context/AppContext'
import { MOCK_SERVER, CURRENT_USER } from '../data/mock'
import { ChannelIcon } from './ChannelIcon'
import { StatusDot } from './StatusDot'
import type { Category } from '../types'
import styles from './Sidebar.module.css'

const SECTION_ITEMS = [
  { icon: '🏠', label: 'Overview' },
  { icon: '👥', label: 'Members' },
  { icon: '📋', label: 'Applications' },
  { icon: '📝', label: 'Audit Log' },
]

export function Sidebar() {
  const { activeChannelId, setActiveChannelId, voiceState, toggleMute } = useApp()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const toggleCategory = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filteredChannels = MOCK_SERVER.channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const getChannelsForCategory = (cat: Category) =>
    filteredChannels.filter(c => c.categoryId === cat.id)

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>{MOCK_SERVER.name}</span>
        <ChevronDown size={14} className={styles.chevron} />
      </div>

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>🔍</span>
        <input
          className={styles.searchInput}
          placeholder="Ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.scroll}>
        {!search && (
          <>
            <div className={styles.sectionLabel}>
              <span>Sections</span>
              <Plus size={13} />
            </div>
            {SECTION_ITEMS.map(item => (
              <div key={item.label} className={styles.sectionRow}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </>
        )}

        {MOCK_SERVER.categories.map(cat => {
          const channels = getChannelsForCategory(cat)
          if (channels.length === 0 && search) return null
          const isCollapsed = collapsed.has(cat.id)

          return (
            <div key={cat.id}>
              <div
                className={clsx(styles.catLabel, isCollapsed && styles.catCollapsed)}
                onClick={() => toggleCategory(cat.id)}
              >
                <span>{cat.name.toUpperCase()}</span>
                <Plus size={12} onClick={e => e.stopPropagation()} />
              </div>

              {!isCollapsed && channels.map(ch => (
                <div
                  key={ch.id}
                  className={clsx(
                    styles.channel,
                    ch.id === activeChannelId && styles.active,
                    ch.type === 'voice' && styles.voiceCh,
                  )}
                  onClick={() => setActiveChannelId(ch.id)}
                >
                  {ch.id === activeChannelId && <span className={styles.dot} />}
                  <ChannelIcon type={ch.type} size={15} />
                  <span className={styles.chName}>{ch.name}</span>
                  {ch.isNew && <span className={styles.newTag}>YENİ</span>}
                  {ch.unread != null && <span className={styles.badge}>{ch.unread}</span>}
                  {ch.activeUsers != null && (
                    <span className={styles.activeCount}>{ch.activeUsers}</span>
                  )}
                  <div className={styles.chActions}>
                    <button title="Ayarlar"><Settings size={11} /></button>
                    <button title="Davet"><Plus size={11} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className={styles.userPanel}>
        <div className={styles.avatar} style={{ background: CURRENT_USER.avatarColor }}>
          {CURRENT_USER.avatar}
          <StatusDot status={CURRENT_USER.status} />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.username}>{CURRENT_USER.username}</div>
          <div className={styles.tag}>{CURRENT_USER.tag}</div>
        </div>
        <div className={styles.userBtns}>
          <button
            className={clsx(styles.userBtn, voiceState.muted && styles.mutedBtn)}
            title={voiceState.muted ? 'Mikrofonu Aç' : 'Sessize Al'}
            onClick={toggleMute}
          >
            {voiceState.muted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
          <button className={styles.userBtn} title="Kulaklık">
            <Headphones size={15} />
          </button>
          <button className={styles.userBtn} title="Ayarlar">
            <Settings size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
