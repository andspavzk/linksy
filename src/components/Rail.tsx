import { MessageSquare, Volume2, Users, Settings } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { MOCK_SERVER, OTHER_SERVERS } from '../data/mock'
import styles from './Rail.module.css'
import clsx from 'clsx'

export function Rail() {
  const { theme, toggleTheme } = useApp()

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

      <div
        className={clsx(styles.server, styles.serverActive)}
        style={{ background: MOCK_SERVER.color }}
        title={MOCK_SERVER.name}
      >
        {MOCK_SERVER.initials}
      </div>

      {OTHER_SERVERS.map(s => (
        <div
          key={s.id}
          className={styles.server}
          style={{ background: s.color }}
          title={s.name}
        >
          {s.initials}
          {s.badge && <span className={styles.badge}>{s.badge}</span>}
        </div>
      ))}

      <div className={styles.sep} />
      <div className={styles.addBtn} title="Sunucu Ekle">+</div>

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
