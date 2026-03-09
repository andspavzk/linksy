import { useState, useRef } from 'react'
import { ChevronDown, Plus, Settings, Mic, MicOff, Headphones } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { ChannelIcon } from './ChannelIcon'
import { StatusDot } from './StatusDot'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const navigate = useNavigate()
  const app = useApp()
  const { profile } = useAuth()
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [showMenu, setShowMenu] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)

  const { activeChannelId, setActiveChannelId, voiceState, toggleMute, categories, channels, activeServer, setModal, isMod } = app

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
  const getChannelsForCategory = (catId: string) => filteredChannels.filter(c => c.categoryId === catId)
  const uncategorizedChannels = filteredChannels.filter(c => !c.categoryId)
  const userInitial = profile?.username?.[0]?.toUpperCase() ?? '?'
  const status = (profile?.status ?? 'online') as 'online' | 'idle' | 'dnd' | 'offline'

  function openSettings() {
    setShowMenu(false)
    setModal('server-settings')
  }

  return (
    <aside className={styles.sidebar} style={{ position: 'relative' }}>
      <div ref={headerRef} className={styles.header} onClick={() => setShowMenu(v => !v)} style={{ cursor: 'pointer' }}>
        <span className={styles.title}>{activeServer?.name ?? 'Linksy'}</span>
        <ChevronDown size={14} className={styles.chevron} style={{ transform: showMenu ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </div>

      {showMenu && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={() => setShowMenu(false)} />
          <div style={{
            position: 'fixed', top: headerRef.current ? headerRef.current.getBoundingClientRect().bottom + 4 : 52,
            left: headerRef.current ? headerRef.current.getBoundingClientRect().left : 60,
            width: 240, zIndex: 1000,
            background: '#12121f', borderRadius: 10, padding: 6,
            border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 8px 24px rgba(0,0,0,.5)',
          }}>
            <MenuBtn icon={<Settings size={14} />} label="Sunucu Ayarlari" onClick={openSettings} />
            <MenuBtn icon={<Plus size={14} />} label="Kanal Olustur" onClick={openSettings} />
            <MenuBtn icon={<Plus size={14} />} label="Kategori Olustur" onClick={openSettings} />
          </div>
        </>
      )}

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}>&#128269;</span>
        <input className={styles.searchInput} placeholder="Ara..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={styles.scroll}>
        {channels.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,.35)', fontSize: 13 }}>
            Henuz kanal yok.
            {isMod && <button onClick={openSettings} style={{ display: 'block', margin: '8px auto 0', background: 'none', border: 'none', color: '#5b8def', cursor: 'pointer', fontSize: 13 }}>Kanal olustur</button>}
          </div>
        )}

        {uncategorizedChannels.map(ch => (
          <div key={ch.id} className={clsx(styles.channel, ch.id === activeChannelId && styles.active, ch.type === 'voice' && styles.voiceCh)} onClick={() => setActiveChannelId(ch.id)}>
            {ch.id === activeChannelId && <span className={styles.dot} />}
            <ChannelIcon type={ch.type} size={15} />
            <span className={styles.chName}>{ch.name}</span>
          </div>
        ))}

        {categories.map(cat => {
          const catChannels = getChannelsForCategory(cat.id)
          if (catChannels.length === 0 && search) return null
          const isCollapsed = collapsed.has(cat.id)
          return (
            <div key={cat.id}>
              <div className={clsx(styles.catLabel, isCollapsed && styles.catCollapsed)} onClick={() => toggleCategory(cat.id)}>
                <span>{cat.name.toUpperCase()}</span>
                {isMod && <Plus size={12} onClick={e => { e.stopPropagation(); openSettings() }} />}
              </div>
              {!isCollapsed && catChannels.map(ch => (
                <div key={ch.id} className={clsx(styles.channel, ch.id === activeChannelId && styles.active, ch.type === 'voice' && styles.voiceCh)} onClick={() => setActiveChannelId(ch.id)}>
                  {ch.id === activeChannelId && <span className={styles.dot} />}
                  <ChannelIcon type={ch.type} size={15} />
                  <span className={styles.chName}>{ch.name}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>

      <div className={styles.userPanel}>
        <div className={styles.avatar} style={{ background: profile?.avatarColor ?? 'linear-gradient(135deg,#2b5bde,#7b5ea7)', cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          {userInitial}
          <StatusDot status={status} />
        </div>
        <div className={styles.userInfo} style={{ cursor: 'pointer' }} onClick={() => navigate('/profile')}>
          <div className={styles.username}>{profile?.username ?? 'Kullanici'}</div>
          <div className={styles.tag}>{profile?.tag ?? '#0000'}</div>
        </div>
        <div className={styles.userBtns}>
          <button className={clsx(styles.userBtn, voiceState.muted && styles.mutedBtn)} onClick={toggleMute}>
            {voiceState.muted ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
          <button className={styles.userBtn}><Headphones size={15} /></button>
          <button className={styles.userBtn} onClick={() => navigate('/profile')}><Settings size={15} /></button>
        </div>
      </div>
    </aside>
  )
}

function MenuBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: '100%', padding: '8px 12px', background: 'none', border: 'none',
      color: '#fff', fontSize: 13, textAlign: 'left', cursor: 'pointer', borderRadius: 6,
      display: 'flex', alignItems: 'center', gap: 8, transition: 'background .15s',
    }}
    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.06)')}
    onMouseLeave={e => (e.currentTarget.style.background = 'none')}>
      {icon} {label}
    </button>
  )
}
