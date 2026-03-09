import { useState, useEffect } from 'react'
import { MessageSquare, Users, Settings, X, LogIn } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useDm } from '../context/DmContext'
import styles from './Rail.module.css'
import clsx from 'clsx'

export function Rail() {
  const { theme, toggleTheme, servers, activeServerId, setActiveServerId, createServer, joinByInvite } = useApp()
  const { isDmMode, setIsDmMode, pendingRequests } = useDm()
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [serverName, setServerName] = useState('')
  const [inviteId, setInviteId] = useState('')
  const [creating, setCreating] = useState(false)
  const [joinError, setJoinError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const joinId = params.get('join')
    if (joinId) {
      setInviteId(joinId)
      setShowJoin(true)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  async function handleCreate() {
    if (!serverName.trim()) return
    setCreating(true)
    const initials = serverName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    await createServer(serverName.trim(), initials)
    setServerName('')
    setShowCreate(false)
    setCreating(false)
  }

  async function handleJoin() {
    if (!inviteId.trim()) return
    setCreating(true)
    setJoinError(null)
    let id = inviteId.trim()
    if (id.includes('join=')) {
      id = id.split('join=')[1] || ''
    }
    const err = await joinByInvite(id)
    if (err) setJoinError(err)
    else { setShowJoin(false); setInviteId('') }
    setCreating(false)
  }

  const modalBg: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  }
  const modalCard: React.CSSProperties = {
    background: '#1a1a2e', borderRadius: 16, padding: 24, width: 340,
    border: '1px solid rgba(255,255,255,.08)',
  }
  const modalInput: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
    color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
  }
  const modalBtn: React.CSSProperties = {
    marginTop: 12, width: '100%', padding: '10px 0', borderRadius: 10,
    background: 'linear-gradient(135deg,#5b8def,#7b5ea7)', border: 'none',
    color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
  }

  return (
    <nav className={styles.rail}>
      <div className={styles.logo}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        </svg>
      </div>

      <button className={clsx(styles.btn, isDmMode && styles.active)} title="Mesajlar" onClick={() => setIsDmMode(true)} style={{ position: 'relative' }}>
        <MessageSquare size={18} />
        {pendingRequests.length > 0 && (
          <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, borderRadius: '50%', background: '#e53935' }} />
        )}
      </button>
      <button className={clsx(styles.btn, isDmMode && styles.active)} title="Arkadaslar" onClick={() => setIsDmMode(true)}>
        <Users size={18} />
      </button>

      <div className={styles.sep} />

      {servers.map(s => (
        <div key={s.id} className={clsx(styles.server, !isDmMode && s.id === activeServerId && styles.serverActive)}
          style={{ background: s.color }} title={s.name} onClick={() => { setActiveServerId(s.id); setIsDmMode(false) }}>
          {s.initials}
        </div>
      ))}

      <div className={styles.sep} />
      <div className={styles.addBtn} title="Sunucu Olustur" onClick={() => setShowCreate(true)}>+</div>
      <div className={styles.addBtn} title="Sunucuya Katil" onClick={() => setShowJoin(true)} style={{ fontSize: 14, background: 'rgba(91,141,239,.15)' }}>
        <LogIn size={16} />
      </div>

      {showCreate && (
        <div style={modalBg} onClick={() => setShowCreate(false)}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>Yeni Sunucu Olustur</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <input value={serverName} onChange={e => setServerName(e.target.value)} placeholder="Sunucu adi..." style={modalInput}
              onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus />
            <button onClick={handleCreate} disabled={creating || !serverName.trim()}
              style={{ ...modalBtn, opacity: creating || !serverName.trim() ? 0.5 : 1 }}>
              {creating ? 'Olusturuluyor...' : 'Olustur'}
            </button>
          </div>
        </div>
      )}

      {showJoin && (
        <div style={modalBg} onClick={() => { setShowJoin(false); setJoinError(null) }}>
          <div style={modalCard} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>Sunucuya Katil</h3>
              <button onClick={() => { setShowJoin(false); setJoinError(null) }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, margin: '0 0 12px' }}>Davet linkini veya sunucu ID'sini yapistir.</p>
            <input value={inviteId} onChange={e => setInviteId(e.target.value)} placeholder="Davet linki veya sunucu ID..." style={modalInput}
              onKeyDown={e => e.key === 'Enter' && handleJoin()} autoFocus />
            {joinError && <p style={{ color: '#e53935', fontSize: 12, marginTop: 8 }}>{joinError}</p>}
            <button onClick={handleJoin} disabled={creating || !inviteId.trim()}
              style={{ ...modalBtn, opacity: creating || !inviteId.trim() ? 0.5 : 1 }}>
              {creating ? 'Katiliniyor...' : 'Katil'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.bottom}>
        <button className={styles.btn} title={theme === 'light' ? 'Karanlik Mod' : 'Aydinlik Mod'} onClick={toggleTheme}>
          {theme === 'light' ? '\uD83C\uDF19' : '\u2600\uFE0F'}
        </button>
        <button className={styles.btn} title="Ayarlar"><Settings size={17} /></button>
      </div>
    </nav>
  )
}
