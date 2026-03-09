import { useState } from 'react'
import { useDm } from '../context/DmContext'
import { useAuth } from '../context/AuthContext'
import { StatusDot } from './StatusDot'
import { MessageSquare, UserPlus, Check, X, Search, Users } from 'lucide-react'
import styles from './Sidebar.module.css'

type Tab = 'dms' | 'friends' | 'requests' | 'add'

export function DmPanel() {
  const { user, profile } = useAuth()
  const { dmChannels, activeDmId, setActiveDmId, friends, pendingRequests, sendFriendRequest, acceptFriend, rejectFriend, searchUsers, createDm, setIsDmMode } = useDm()
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
    } else {
      setSearchResults([])
    }
  }

  async function openDmWith(uid: string) {
    const dmId = await createDm(uid)
    setActiveDmId(dmId)
  }

  const tabStyle = (t: Tab): React.CSSProperties => ({
    flex: 1, padding: '8px 0', background: 'none', border: 'none',
    color: tab === t ? '#5b8def' : 'rgba(255,255,255,.4)',
    borderBottom: tab === t ? '2px solid #5b8def' : '2px solid transparent',
    fontWeight: 600, fontSize: 11, cursor: 'pointer',
  })

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.title}>Mesajlar</span>
      </div>

      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <button style={tabStyle('dms')} onClick={() => setTab('dms')}>DM</button>
        <button style={tabStyle('friends')} onClick={() => setTab('friends')}>
          Arkadaslar
        </button>
        <button style={tabStyle('requests')} onClick={() => setTab('requests')}>
          Istekler {pendingRequests.length > 0 && `(${pendingRequests.length})`}
        </button>
        <button style={tabStyle('add')} onClick={() => setTab('add')}>
          <UserPlus size={12} />
        </button>
      </div>

      <div className={styles.scroll}>
        {tab === 'dms' && (
          <>
            {dmChannels.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13 }}>
                Henuz ozel mesajin yok
              </div>
            )}
            {dmChannels.map(dm => (
              <div key={dm.id} onClick={() => setActiveDmId(dm.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 8, cursor: 'pointer',
                  background: activeDmId === dm.id ? 'rgba(91,141,239,.12)' : 'transparent',
                }}
                onMouseEnter={e => { if (activeDmId !== dm.id) e.currentTarget.style.background = 'rgba(255,255,255,.04)' }}
                onMouseLeave={e => { if (activeDmId !== dm.id) e.currentTarget.style.background = 'transparent' }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: dm.otherUser?.avatarColor ?? '#555',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 13, position: 'relative',
                }}>
                  {dm.otherUser?.username?.[0]?.toUpperCase() ?? '?'}
                  <div style={{ position: 'absolute', bottom: -1, right: -1 }}>
                    <StatusDot status={dm.otherUser?.status ?? 'offline'} />
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{dm.otherUser?.username ?? '?'}</div>
                  {dm.lastMessage && (
                    <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {dm.lastMessage}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'friends' && (
          <>
            {friends.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13 }}>
                Henuz arkadasin yok
              </div>
            )}
            {friends.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: f.profile?.avatarColor ?? '#555',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                }}>
                  {f.profile?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{f.profile?.username}</div>
                  <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>{f.profile?.status}</div>
                </div>
                <button onClick={() => openDmWith(f.profile?.uid ?? '')}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer' }}>
                  <MessageSquare size={16} />
                </button>
              </div>
            ))}
          </>
        )}

        {tab === 'requests' && (
          <>
            {pendingRequests.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'rgba(255,255,255,.3)', fontSize: 13 }}>
                Bekleyen istek yok
              </div>
            )}
            {pendingRequests.map(r => (
              <div key={r.id} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: r.profile?.avatarColor ?? '#555',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 13,
                }}>
                  {r.profile?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{r.profile?.username}</div>
                  <div style={{ color: 'rgba(255,255,255,.3)', fontSize: 11 }}>Arkadas olmak istiyor</div>
                </div>
                <button onClick={() => acceptFriend(r.id)}
                  style={{ background: '#4fae4e', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', padding: '4px 6px' }}>
                  <Check size={14} />
                </button>
                <button onClick={() => rejectFriend(r.id)}
                  style={{ background: '#e53935', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', padding: '4px 6px' }}>
                  <X size={14} />
                </button>
              </div>
            ))}
          </>
        )}

        {tab === 'add' && (
          <div style={{ padding: 16 }}>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginBottom: 12 }}>
              Kullanici adi ve tag ile arkadas ekle
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={addInput} onChange={e => setAddInput(e.target.value)}
                placeholder="kullaniciadi#0000"
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                style={{
                  flex: 1, padding: '9px 12px', borderRadius: 8,
                  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                  color: '#fff', fontSize: 13, outline: 'none',
                }} />
              <button onClick={handleAdd} style={{
                padding: '9px 14px', borderRadius: 8, border: 'none',
                background: 'linear-gradient(135deg,#5b8def,#7b5ea7)', color: '#fff',
                fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}>Gonder</button>
            </div>
            {addMsg && <p style={{ color: addMsg.includes('!') ? '#4fae4e' : '#e53935', fontSize: 12, marginTop: 8 }}>{addMsg}</p>}

            <div style={{ marginTop: 20 }}>
              <p style={{ color: 'rgba(255,255,255,.4)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Veya kullanici ara</p>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'rgba(255,255,255,.3)' }} />
                <input value={searchTerm} onChange={e => handleSearch(e.target.value)}
                  placeholder="Kullanici ara..."
                  style={{
                    width: '100%', padding: '9px 12px 9px 32px', borderRadius: 8,
                    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                    color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
                  }} />
              </div>
              {searchResults.map(p => (
                <div key={p.uid} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', background: p.avatarColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: 12,
                  }}>{p.username[0].toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#fff', fontSize: 13 }}>{p.username}</span>
                    <span style={{ color: 'rgba(255,255,255,.3)', fontSize: 11, marginLeft: 4 }}>{p.tag}</span>
                  </div>
                  <button onClick={() => openDmWith(p.uid)}
                    style={{ background: 'none', border: 'none', color: '#5b8def', cursor: 'pointer' }}>
                    <MessageSquare size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.userPanel} style={{ cursor: 'default' }}>
        <div className={styles.avatar} style={{ background: profile?.avatarColor ?? '#555' }}>
          {profile?.username?.[0]?.toUpperCase() ?? '?'}
          <StatusDot status={(profile?.status ?? 'online') as any} />
        </div>
        <div className={styles.userInfo}>
          <div className={styles.username}>{profile?.username ?? 'Kullanici'}</div>
          <div className={styles.tag}>{profile?.tag ?? '#0000'}</div>
        </div>
      </div>
    </aside>
  )
}
