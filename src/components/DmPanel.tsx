import { useState } from 'react'
import { useDm } from '../context/DmContext'
import { useAuth } from '../context/AuthContext'
import { StatusDot } from './StatusDot'
import { MessageSquare, UserPlus, Check, X, Search } from 'lucide-react'
import styles from './DmPanel.module.css'

type Tab = 'dms' | 'friends' | 'requests' | 'add'

export function DmPanel() {
  const { profile } = useAuth()
  const { dmChannels, activeDmId, setActiveDmId, friends, pendingRequests, sendFriendRequest, acceptFriend, rejectFriend, searchUsers, createDm } = useDm()
  const [tab, setTab] = useState<Tab>('dms')
  const [addInput, setAddInput] = useState('')
  const [addMsg, setAddMsg] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  async function handleAdd() {
    const parts = addInput.trim().split('#')
    if (parts.length !== 2) { setAddMsg('Format: kullaniciadi#0000'); return }
    const err = await sendFriendRequest(parts[0], '#' + parts[1])
    setAddMsg(err || 'Istek gonderildi!')
    if (!err) setAddInput('')
    setTimeout(() => setAddMsg(null), 3000)
  }

  async function handleSearch(term: string) {
    setSearchTerm(term)
    if (term.length >= 2) {
      const results = await searchUsers(term)
      setSearchResults(results)
    } else { setSearchResults([]) }
  }

  async function openDmWith(uid: string) {
    const dmId = await createDm(uid)
    setActiveDmId(dmId)
  }

  return (
    <aside className={styles.panel}>
      <div className={styles.header}>Mesajlar</div>

      <div className={styles.tabs}>
        {(['dms', 'friends', 'requests', 'add'] as Tab[]).map(t => (
          <button key={t} className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t === 'dms' && 'DM'}
            {t === 'friends' && 'Arkadaslar'}
            {t === 'requests' && <>Istekler {pendingRequests.length > 0 && <span className={styles.tabBadge}>{pendingRequests.length}</span>}</>}
            {t === 'add' && <UserPlus size={13} />}
          </button>
        ))}
      </div>

      <div className={styles.scroll}>
        {tab === 'dms' && (
          <>
            {dmChannels.length === 0 && <div className={styles.empty}>Henuz ozel mesajin yok</div>}
            {dmChannels.map(dm => (
              <div key={dm.id} className={`${styles.dmItem} ${activeDmId === dm.id ? styles.dmActive : ''}`} onClick={() => setActiveDmId(dm.id)}>
                <div className={styles.dmAvatar} style={{ background: dm.otherUser?.avatarColor ?? '#555' }}>
                  {dm.otherUser?.username?.[0]?.toUpperCase() ?? '?'}
                  <StatusDot status={dm.otherUser?.status ?? 'offline'} />
                </div>
                <div className={styles.dmInfo}>
                  <div className={styles.dmName}>{dm.otherUser?.username ?? '?'}</div>
                  {dm.lastMessage && <div className={styles.dmPreview}>{dm.lastMessage}</div>}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'friends' && (
          <>
            {friends.length === 0 && <div className={styles.empty}>Henuz arkadasin yok</div>}
            {friends.map(f => (
              <div key={f.id} className={styles.friendItem}>
                <div className={styles.dmAvatar} style={{ background: f.profile?.avatarColor ?? '#555' }}>
                  {f.profile?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className={styles.dmInfo}>
                  <div className={styles.dmName}>{f.profile?.username}</div>
                  <div className={styles.dmPreview}>{f.profile?.status}</div>
                </div>
                <button className={styles.iconBtn} onClick={() => openDmWith(f.profile?.uid ?? '')}>
                  <MessageSquare size={16} />
                </button>
              </div>
            ))}
          </>
        )}

        {tab === 'requests' && (
          <>
            {pendingRequests.length === 0 && <div className={styles.empty}>Bekleyen istek yok</div>}
            {pendingRequests.map(r => (
              <div key={r.id} className={styles.friendItem}>
                <div className={styles.dmAvatar} style={{ background: r.profile?.avatarColor ?? '#555' }}>
                  {r.profile?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className={styles.dmInfo}>
                  <div className={styles.dmName}>{r.profile?.username}</div>
                  <div className={styles.dmPreview}>Arkadas olmak istiyor</div>
                </div>
                <button className={styles.acceptBtn} onClick={() => acceptFriend(r.id)}><Check size={14} /></button>
                <button className={styles.rejectBtn} onClick={() => rejectFriend(r.id)}><X size={14} /></button>
              </div>
            ))}
          </>
        )}

        {tab === 'add' && (
          <div className={styles.addSection}>
            <p className={styles.addDesc}>Kullanici adi ve tag ile arkadas ekle</p>
            <div className={styles.addRow}>
              <input className={styles.addInput} value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="kullaniciadi#0000" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
              <button className={styles.addBtn} onClick={handleAdd}>Gonder</button>
            </div>
            {addMsg && <p className={`${styles.addMsg} ${addMsg.includes('!') ? styles.addSuccess : styles.addError}`}>{addMsg}</p>}

            <div className={styles.searchSection}>
              <div className={styles.searchWrap}>
                <Search size={14} className={styles.searchIcon} />
                <input className={styles.searchInput} value={searchTerm} onChange={e => handleSearch(e.target.value)} placeholder="Kullanici ara..." />
              </div>
              {searchResults.map(p => (
                <div key={p.uid} className={styles.searchItem}>
                  <div className={styles.searchAvatar} style={{ background: p.avatarColor }}>{p.username[0].toUpperCase()}</div>
                  <span className={styles.searchName}>{p.username}</span>
                  <span className={styles.searchTag}>{p.tag}</span>
                  <button className={styles.iconBtn} onClick={() => openDmWith(p.uid)}><MessageSquare size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.userPanel}>
        <div className={styles.dmAvatar} style={{ background: profile?.avatarColor ?? '#555' }}>
          {profile?.username?.[0]?.toUpperCase() ?? '?'}
          <StatusDot status={(profile?.status ?? 'online') as any} />
        </div>
        <div className={styles.dmInfo}>
          <div className={styles.dmName}>{profile?.username ?? 'Kullanici'}</div>
          <div className={styles.dmPreview}>{profile?.tag ?? '#0000'}</div>
        </div>
      </div>
    </aside>
  )
}
