import { useState } from 'react'
import { ChevronDown, Plus, Settings, Mic, MicOff, Headphones } from 'lucide-react'
import clsx from 'clsx'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ChannelIcon } from './ChannelIcon'
import { StatusDot } from './StatusDot'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { activeChannelId, setActiveChannelId, voiceState, toggleMute, categories, channels, servers, activeServerId } = useApp()
  const { profile } = useAuth()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')

  const activeServer = servers.find(s => s.id === activeServerId)

  const toggleCategory = (id: string) => {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const getChannelsForCategory = (catId: string) =>
    filteredChannels.filter(c => c.category_id === catId)

  const uncategorizedChannels = filteredChannels.filter(c => !c.category_id)

  const userInitial = profile?.username?.[0]?.toUpperCase() ?? '?'
  const status = (profile?.status ?? 'online') as 'online' | 'idle' | 'dnd' | 'offline'

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>{activeServer?.name ?? 'Linksy'}</span>
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
        {channels.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,.35)', fontSize: 13 }}>
            Henüz kanal yok. Sunucu sahibi kanal ekleyebilir.
          </div>
        )}

        {uncategorizedChannels.length > 0 && (
          <div>
            {uncategorizedChannels.map(ch => (
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
                <ChannelIcon type={ch.type as any} size={15} />
                <span className={styles.chName}>{ch.name}</span>
              </div>
            ))}
          </div>
        )}

        {categories.map(cat => {
          const catChannels = getChannelsForCategory(cat.id)
          if (catChannels.length === 0 && search) return null
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

              {!isCollapsed && catChannels.map(ch => (
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
                  <ChannelIcon type={ch.type as any} size={15} />
                  <span className={styles.chName}>{ch.name}</span>
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
        <div className={styles.avatar} style={{ background: profile?.avatar_color ?? 'linear-gradient(135deg,#2b5bde,#7b5ea7)' }}>
          {userInitial}
          <StatusDot status={status} />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.username}>{profile?.username ?? 'Kullanıcı'}</div>
          <div className={styles.tag}>{profile?.tag ?? '#0000'}</div>
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
