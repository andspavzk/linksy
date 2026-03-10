import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDm } from '../context/DmContext'
import { useAuth } from '../context/AuthContext'
import { StatusDot } from './StatusDot'
import { Users, Plus, Mic, MicOff, Headphones, Settings } from 'lucide-react'
import styles from './DmSidebar.module.css'

export function DmSidebar() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { dmChannels, activeDmId, setActiveDmId, pendingRequests } = useDm()
  const [search, setSearch] = useState('')

  const filtered = search
    ? dmChannels.filter(dm => dm.otherUser?.username?.toLowerCase().includes(search.toLowerCase()))
    : dmChannels

  const userInitial = profile?.username?.[0]?.toUpperCase() ?? '?'

  return (
    <aside className={styles.sidebar}>
      <div className={styles.searchWrap}>
        <input className={styles.searchInput} placeholder="Bir sohbet bul veya baslat" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className={styles.scroll}>
        <button className={`${styles.navItem} ${!activeDmId ? styles.navActive : ''}`} onClick={() => setActiveDmId(null)}>
          <Users size={20} className={styles.navIcon} />
          <span>Arkadaslar</span>
          {pendingRequests.length > 0 && <span className={styles.navBadge}>{pendingRequests.length}</span>}
        </button>

        <div className={styles.dmHeader}>
          <span>Direkt Mesajlar</span>
          <button className={styles.dmAddBtn} title="DM Olustur"><Plus size={16} /></button>
        </div>

        {filtered.map(dm => (
          <button key={dm.id} className={`${styles.dmItem} ${activeDmId === dm.id ? styles.dmActive : ''}`} onClick={() => setActiveDmId(dm.id)}>
            <div className={styles.dmAvatar} style={{ background: dm.otherUser?.avatarColor ?? 'var(--bg-lighter)' }}>
              {dm.otherUser?.username?.[0]?.toUpperCase() ?? '?'}
              <StatusDot status={dm.otherUser?.status ?? 'offline'} />
            </div>
            <div className={styles.dmInfo}>
              <div className={styles.dmName}>{dm.otherUser?.username ?? 'Kullanici'}</div>
              {dm.lastMessage && <div className={styles.dmPreview}>{dm.lastMessage}</div>}
              {!dm.lastMessage && dm.otherUser?.activity && <div className={styles.dmPreview}>{dm.otherUser.activity}</div>}
            </div>
          </button>
        ))}

        {filtered.length === 0 && !search && (
          <div className={styles.empty}>Henuz DM yok</div>
        )}
        {filtered.length === 0 && search && (
          <div className={styles.empty}>Sonuc bulunamadi</div>
        )}
      </div>

      <div className={styles.userPanel}>
        <div className={styles.userAvatar} style={{ background: profile?.avatarColor ?? 'var(--bg-lighter)' }}>
          {userInitial}
          <StatusDot status={(profile?.status ?? 'online') as any} />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.userName}>{profile?.username ?? 'Kullanici'}</div>
          <div className={styles.userStatus}>Cevrimici</div>
        </div>
        <div className={styles.userBtns}>
          <button className={styles.userBtn}><Mic size={15} /></button>
          <button className={styles.userBtn}><Headphones size={15} /></button>
          <button className={styles.userBtn} onClick={() => navigate('/profile')}><Settings size={15} /></button>
        </div>
      </div>
    </aside>
  )
}
