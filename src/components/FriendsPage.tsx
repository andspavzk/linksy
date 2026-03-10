import { useState } from 'react'
import { useDm } from '../context/DmContext'
import { useAuth } from '../context/AuthContext'
import { StatusDot } from './StatusDot'
import { Users, MessageSquare, Check, X, Search, MoreVertical } from 'lucide-react'
import styles from './FriendsPage.module.css'

type Tab = 'online' | 'all' | 'pending' | 'blocked' | 'add'

export function FriendsPage() {
  const { user } = useAuth()
  const { friends, pendingRequests, sendFriendRequest, acceptFriend, rejectFriend, searchUsers, createDm, setActiveDmId } = useDm()
  const [tab, setTab] = useState<Tab>('online')
  const [addInput, setAddInput] = useState('')
  const [addMsg, setAddMsg] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [listSearch, setListSearch] = useState('')

  async function handleAdd() {
    if (!addInput.trim()) return
    const parts = addInput.trim().split('#')
    if (parts.length !== 2) { setAddMsg('Format: kullaniciadi#0000'); return }
    setAddMsg(null)
    const err = await sendFriendRequest(parts[0], '#' + parts[1])
    setAddMsg(err || 'Basariyla gonderildi!')
    if (!err) setAddInput('')
    setTimeout(() => setAddMsg(null), 4000)
  }

  async function handleSearch(term: string) {
    setSearchTerm(term)
    if (term.length >= 2) setSearchResults(await searchUsers(term))
    else setSearchResults([])
  }

  async function openDm(uid: string) {
    const dmId = await createDm(uid)
    setActiveDmId(dmId)
  }

  const onlineFriends = friends.filter(f => f.profile?.status === 'online')
  const idleFriends = friends.filter(f => f.profile?.status === 'idle')
  const dndFriends = friends.filter(f => f.profile?.status === 'dnd')
  const offlineFriends = friends.filter(f => f.profile?.status === 'offline' || !f.profile?.status)

  const filterBySearch = (list: typeof friends) =>
    listSearch ? list.filter(f => f.profile?.username?.toLowerCase().includes(listSearch.toLowerCase())) : list

  function FriendGroup({ title, list }: { title: string; list: typeof friends }) {
    const filtered = filterBySearch(list)
    if (filtered.length === 0) return null
    return (
      <>
        <div className={styles.groupHeader}>{title} — {filtered.length}</div>
        {filtered.map(f => (
          <div key={f.id} className={styles.friendRow}>
            <div className={styles.friendAvatar} style={{ background: f.profile?.avatarColor ?? 'var(--bg-lighter)' }}>
              {f.profile?.username?.[0]?.toUpperCase() ?? '?'}
              <StatusDot status={f.profile?.status ?? 'offline'} />
            </div>
            <div className={styles.friendInfo}>
              <span className={styles.friendName}>{f.profile?.username}</span>
              <span className={styles.friendStatus}>
                {f.profile?.status === 'online' ? 'Online' : f.profile?.status === 'idle' ? 'Idle' : f.profile?.status === 'dnd' ? 'Do Not Disturb' : f.profile?.activity || 'Offline'}
              </span>
            </div>
            <div className={styles.friendActions}>
              <button className={styles.actionBtn} onClick={() => openDm(f.profile?.uid ?? '')} title="Mesaj"><MessageSquare size={18} /></button>
              <button className={styles.actionBtn} title="Daha Fazla"><MoreVertical size={18} /></button>
            </div>
          </div>
        ))}
      </>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <Users size={20} className={styles.headerIcon} />
            <span className={styles.headerTitle}>People</span>
            <div className={styles.headerDivider} />
            {(['online', 'all', 'pending', 'blocked'] as Tab[]).map(t => (
              <button key={t} className={`${styles.headerTab} ${tab === t ? styles.headerTabActive : ''}`} onClick={() => setTab(t)}>
                {t === 'online' && 'Online'}
                {t === 'all' && 'All'}
                {t === 'pending' && <>Pending {pendingRequests.length > 0 && <span className={styles.headerBadge}>{pendingRequests.length}</span>}</>}
                {t === 'blocked' && 'Blocked'}
              </button>
            ))}
            <button className={`${styles.headerTab} ${styles.addFriendBtn} ${tab === 'add' ? styles.addFriendBtnActive : ''}`} onClick={() => setTab('add')}>
              Add Friend
            </button>
          </div>
        </header>

        <div className={styles.content}>
          {(tab === 'online' || tab === 'all') && (
            <>
              <div className={styles.searchBar}>
                <input className={styles.searchInput} value={listSearch} onChange={e => setListSearch(e.target.value)} placeholder="Search" />
                <Search size={16} className={styles.searchBarIcon} />
              </div>

              {tab === 'online' && (
                <>
                  <FriendGroup title="ONLINE" list={onlineFriends} />
                  <FriendGroup title="IDLE" list={idleFriends} />
                  <FriendGroup title="DO NOT DISTURB" list={dndFriends} />
                  {onlineFriends.length + idleFriends.length + dndFriends.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyTitle}>There are no friends online at this time. Check back later!</div>
                    </div>
                  )}
                </>
              )}

              {tab === 'all' && (
                <>
                  <FriendGroup title="ONLINE" list={onlineFriends} />
                  <FriendGroup title="IDLE" list={idleFriends} />
                  <FriendGroup title="DO NOT DISTURB" list={dndFriends} />
                  <FriendGroup title="OFFLINE" list={offlineFriends} />
                  {friends.length === 0 && (
                    <div className={styles.emptyState}>
                      <div className={styles.emptyTitle}>No one's around to play with Wumpus.</div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {tab === 'pending' && (
            <>
              <div className={styles.searchBar}>
                <input className={styles.searchInput} placeholder="Search" />
                <Search size={16} className={styles.searchBarIcon} />
              </div>
              {pendingRequests.length === 0 && (
                <div className={styles.emptyState}>
                  <div className={styles.emptyTitle}>There are no pending friend requests.</div>
                </div>
              )}
              {pendingRequests.map(r => (
                <div key={r.id} className={styles.friendRow}>
                  <div className={styles.friendAvatar} style={{ background: r.profile?.avatarColor ?? 'var(--bg-lighter)' }}>
                    {r.profile?.username?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div className={styles.friendInfo}>
                    <span className={styles.friendName}>{r.profile?.username}</span>
                    <span className={styles.friendStatus}>Incoming Friend Request</span>
                  </div>
                  <div className={styles.friendActions}>
                    <button className={styles.acceptBtn} onClick={() => acceptFriend(r.id)}><Check size={18} /></button>
                    <button className={styles.rejectBtn} onClick={() => rejectFriend(r.id)}><X size={18} /></button>
                  </div>
                </div>
              ))}
            </>
          )}

          {tab === 'blocked' && (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>You haven't blocked anyone.</div>
            </div>
          )}

          {tab === 'add' && (
            <div className={styles.addSection}>
              <h2 className={styles.addTitle}>ADD FRIEND</h2>
              <p className={styles.addDesc}>You can add friends with their Linksy username.</p>
              <div className={styles.addInputWrap}>
                <input className={styles.addInput} value={addInput} onChange={e => setAddInput(e.target.value)} placeholder="You can add friends with their Linksy username. Ex: username#0000" onKeyDown={e => e.key === 'Enter' && handleAdd()} />
                <button className={styles.addBtn} onClick={handleAdd} disabled={!addInput.trim()}>Send Friend Request</button>
              </div>
              {addMsg && <div className={`${styles.addFeedback} ${addMsg.includes('!') && !addMsg.includes('Format') ? styles.addSuccess : styles.addError}`}>{addMsg}</div>}

              <div className={styles.userSearchSection}>
                <div className={styles.userSearchLabel}>OR SEARCH USERS</div>
                <div className={styles.userSearchWrap}>
                  <Search size={16} className={styles.userSearchIcon} />
                  <input className={styles.userSearchInput} value={searchTerm} onChange={e => handleSearch(e.target.value)} placeholder="Search by username..." />
                </div>
                {searchResults.map(p => (
                  <div key={p.uid} className={styles.friendRow}>
                    <div className={styles.friendAvatar} style={{ background: p.avatarColor }}>{p.username[0].toUpperCase()}</div>
                    <div className={styles.friendInfo}>
                      <span className={styles.friendName}>{p.username}</span>
                      <span className={styles.friendTag}>{p.tag}</span>
                    </div>
                    <button className={styles.actionBtn} onClick={() => openDm(p.uid)}><MessageSquare size={18} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className={styles.nowPlaying}>
        <h3 className={styles.npTitle}>NOW PLAYING</h3>
        {onlineFriends.filter(f => f.profile?.activity).length > 0 ? (
          onlineFriends.filter(f => f.profile?.activity).map(f => (
            <div key={f.id} className={styles.npUser}>
              <div className={styles.friendAvatar} style={{ background: f.profile?.avatarColor ?? '#555' }}>
                {f.profile?.username?.[0]?.toUpperCase() ?? '?'}
                <StatusDot status="online" />
              </div>
              <div className={styles.friendInfo}>
                <span className={styles.friendName}>{f.profile?.username}</span>
                <span className={styles.friendStatus}>{f.profile?.activity}</span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.npEmpty}>
            <div className={styles.npEmptyImg}>&#127918;</div>
            <div className={styles.npEmptyTitle}>Nobody is playing anything right now...</div>
            <div className={styles.npEmptyDesc}>When someone starts playing a game we'll show it here!</div>
          </div>
        )}
      </aside>
    </div>
  )
}
