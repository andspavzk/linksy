import { useState } from 'react'
import { MessageSquare, Volume2, Users, Settings, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import styles from './Rail.module.css'
import clsx from 'clsx'

export function Rail() {
  const { theme, toggleTheme, servers, activeServerId, setActiveServerId, createServer } = useApp()
  const [showCreate, setShowCreate] = useState(false)
  const [serverName, setServerName] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!serverName.trim()) return
    setCreating(true)
    const initials = serverName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    await createServer(serverName.trim(), initials)
    setServerName('')
    setShowCreate(false)
    setCreating(false)
  }

  return (
    <nav className={styles.rail}>
      <div className={styles.logo}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
        </svg>
      </div>

      <button className={clsx(styles.btn, styles.active)} title="Mesajlar">
        <MessageSquare size={18} />
      </button>
      <button className={styles.btn} title="Sesli Kanallar">
        <Volume2 size={18} />
      </button>
      <button className={styles.btn} title="Arkadaşlar">
        <Users size={18} />
      </button>

      <div className={styles.sep} />

      {servers.map(s => (
        <div
          key={s.id}
          className={clsx(styles.server, s.id === activeServerId && styles.serverActive)}
          style={{ background: s.color }}
          title={s.name}
          onClick={() => setActiveServerId(s.id)}
        >
          {s.initials}
        </div>
      ))}

      <div className={styles.sep} />
      <div className={styles.addBtn} title="Sunucu Ekle" onClick={() => setShowCreate(true)}>+</div>

      {showCreate && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }} onClick={() => setShowCreate(false)}>
          <div style={{
            background: '#1a1a2e', borderRadius: 16, padding: 24, width: 340,
            border: '1px solid rgba(255,255,255,.08)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>Yeni Sunucu Oluştur</h3>
              <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <input
              value={serverName}
              onChange={e => setServerName(e.target.value)}
              placeholder="Sunucu adı..."
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
                color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box',
              }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={creating || !serverName.trim()}
              style={{
                marginTop: 12, width: '100%', padding: '10px 0', borderRadius: 10,
                background: 'linear-gradient(135deg,#5b8def,#7b5ea7)', border: 'none',
                color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                opacity: creating || !serverName.trim() ? 0.5 : 1,
              }}
            >
              {creating ? 'Oluşturuluyor...' : 'Oluştur'}
            </button>
          </div>
        </div>
      )}

      <div className={styles.bottom}>
        <button
          className={styles.btn}
          title={theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'}
          onClick={toggleTheme}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        <button className={styles.btn} title="Ayarlar">
          <Settings size={17} />
        </button>
      </div>
    </nav>
  )
}
