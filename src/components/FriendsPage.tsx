import { useState } from 'react'
import { useDm } from '../context/DmContext'
import { useAuth } from '../context/AuthContext'
import { StatusDot } from './StatusDot'
import { Users, MessageSquare, Check, X, UserPlus, Search, MoreVertical } from 'lucide-react'
import styles from './FriendsPage.module.css'

type Tab = 'all' | 'pending' | 'add'

export function FriendsPage() {
  const { user } = useAuth()
  const { friends, pendingRequests, sendFriendRequest, acceptFriend, rejectFriend, searchUsers, createDm, setActiveDmId } = useDm()
  const [tab, setTab] = useState<Tab>('all')
  const [addInput, setAddInput] = useState('')
  const [addMsg, setAddMsg] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  async function handleAdd() {
    if (!addInput.trim()) return
    const parts = addInput.trim().split('#')
    if (parts.length !== 2) { setAddMsg('Format: kullaniciadi#0000'); return }
    setAddMsg(null)
    const err = await sendFriendRequest(parts[0], '#' + parts[1])
    setAddMsg(err || 'Arkadas istegi basariyla gonderildi!')
    if (!err) setAddInput('')
    setTimeout(() => setAddMsg(null), 4000)
  }

  async function handleSearch(term: string) {
    setSearchTerm(term)
    if (term.length >= 2) {
      const results = await searchUsers(term)
      setSearchResults(results)
    } else { setSearchResults([]) }
  }

  async function openDm(uid: string) {
    const dmId = await createDm(uid)
    setActiveDmId(dmId)
  }

  const onlineFriends = friends.filter(f => f.profile?.status !== 'offline')

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        {/* HEADER */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Users size={20} className={styles.headerIcon} />
            <span className={styles.headerTitle}>Arkadaslar</span>
            <div className={styles.headerDivider} />
            <button className={`${styles.headerTab} ${tab === 'all' ? styles.headerTabActive : ''}`} onClick={() => setTab('all')}>
              Tumu
            </button>
            <button className={`${styles.headerTab} ${tab === 'pending' ? styles.headerTabActive : ''}`} onClick={() => setTab('pending')}>
              Bekleyen {pendingRequests.length > 0 && <span className={styles.headerBadge}>{pendingRequests.length}</span>}
            </button>
            <button className={`${styles.headerTab} ${styles.headerTabAdd} ${tab === 'add' ? styles.headerTabAddActive : ''}`} onClick={() => setTab('add')}>
              Arkadas Ekle
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <div className={styles.content}>
          {tab === 'add' && (
            <div className={styles.addSection}>
              <h2 className={styles.addTitle}>Arkadas Ekle</h2>
              <p className={styles.addDesc}>Linksy kullanici adinla arkadas ekleyebilirsin.</p>
              <div className={styles.addInputWrap}>
                <input className={styles.addInput} value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="Kullanici adi ve tag gir, ornek: kullanici#0000" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
                <button className={styles.addBtn} onClick={handleAdd} disabled={!addInput.trim()}>Arkadas Istegi Gonder</button>
              </div>
              {addMsg && <div className={`${styles.addFeedback} ${addMsg.includes('!') && !addMsg.includes('Format') ? styles.addSuccess : styles.addError}`}>{addMsg}</div>}

              {/* Search users */}
              <div className={styles.searchSection}>
                <div className={styles.searchLabel}>VEYA KULLANICI ARA</div>
                <div className={styles.searchWrap}>
                  <Search size={16} className={styles.searchIcon} />
                  <input className={styles.searchInput} value={searchTerm} onChange={e => handleSearch(e.target.value)} placeholder="Kullanici adi ile ara..." />
                </div>
                {searchResults.map(p => (
                  <div key={p.uid} className={styles.friendRow}>
                    <div className={styles.friendAvatar} style={{ background: p.avatarColor }}>{p.username[0].toUpperCase()}</div>
                    <div className={styles.friendInfo}>
                      <span className={styles.friendName}>{p.username}</span>
                      <span className={styles.friendTag}>{p.tag}</span>
                    </div>
                    <button className={styles.actionBtn} onClick={() => openDm(p.uid)} title="Mesaj Gonder"><MessageSquare size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'all' && (
            <>
              <div className={styles.listHeader}>TUMU — {friends.length}</div>
              {friends.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>&#128075;</div>
                  <div className={styles.emptyTitle}>Henuz arkadasin yok</div>
                  <div className={styles.emptyDesc}>Arkadas Ekle sekmesinden kullanici adi ile arkadas ekleyebilirsin.</div>
                </div>
              )}
              {friends.map(f => (
                <div key={f.id} className={styles.friendRow}>
                  <div className={styles.friendAvatar} style={{ background: f.profile?.avatarColor ?? 'var(--bg-lighter)' }}>
                    {f.profile?.username?.[0]?.toUpperCase() ?? '?'}
                    <StatusDot status={f.profile?.status ?? 'offline'} />
                  </div>
                  <div className={styles.friendInfo}>
                    <span className={styles.friendName}>{f.profile?.username}</span>
                    <span className={styles.friendStatus}>{f.profile?.status === 'online' ? 'Cevrimici' : f.profile?.activity || 'Cevrimdisi'}</span>
                  </div>
                  <div className={styles.friendActions}>
                    <button className={styles.actionBtn} onClick={() => openDm(f.profile?.uid ?? '')} title="Mesaj"><MessageSquare size={18} /></button>
                    <button className={styles.actionBtn} title="Daha Fazla"><MoreVertical size={18} /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'pending' && (
            <>
              <div className={styles.listHeader}>BEKLEYEN — {pendingRequests.length}</div>
              {pendingRequests.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyTitle}>Bekleyen arkadas istegi yok</div>
                </div>
              )}
              {pendingRequests.map(r => (
                <div key={r.id} className={styles.friendRow}>
                  <div className={styles.friendAvatar} style={{ background: r.profile?.avatarColor ?? 'var(--bg-lighter)' }}>
                    {r.profile?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className={styles.friendInfo}>
                    <span className={styles.friendName}>{r.profile?.username}</span>
                    <span className={styles.friendStatus}>Gelen Arkadas Istegi</span>
                  </div>
                  <div className={styles.friendActions}>
                    <button className={styles.acceptBtn} onClick={() => acceptFriend(r.id)} title="Kabul Et"><Check size={18} /></button>
                    <button className={styles.rejectBtn} onClick={() => rejectFriend(r.id)} title="Reddet"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* ACTIVE NOW SIDEBAR */}
      <aside className={styles.activePanel}>
        <h3 className={styles.activePanelTitle}>Aktif Simdi</h3>
        {onlineFriends.length === 0 ? (
          <div className={styles.activeEmpty}>
            <div className={styles.activeEmptyTitle}>Simdilik sessiz...</div>
            <div className={styles.activeEmptyDesc}>Bir arkadasin bir aktivite baslattiginda — oyun oynamak veya sesli sohbet gibi — burada gosterilecek!</div>
          </div>
        ) : (
          onlineFriends.map(f => (
            <div key={f.id} className={styles.activeUser}>
              <div className={styles.friendAvatar} style={{ background: f.profile?.avatarColor ?? 'var(--bg-lighter)' }}>
                {f.profile?.username?.[0]?.toUpperCase() ?? '?'}
                <StatusDot status={f.profile?.status ?? 'online'} />
              </div>
              <div className={styles.friendInfo}>
                <span className={styles.friendName}>{f.profile?.username}</span>
                {f.profile?.activity && <span className={styles.friendStatus}>{f.profile.activity}</span>}
              </div>
            </div>
          ))
        )}
      </aside>
    </div>
  )
}
