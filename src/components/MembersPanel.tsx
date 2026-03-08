import { MOCK_SERVER } from '../data/mock'
import { useApp } from '../context/AppContext'
import { StatusDot } from './StatusDot'
import styles from './MembersPanel.module.css'

const ROLE_ORDER = ['Founder', 'Moderator', 'Member', 'Bot', 'Offline']

export function MembersPanel() {
  const { voiceState } = useApp()

  const grouped = ROLE_ORDER.reduce<Record<string, typeof MOCK_SERVER.members>>((acc, role) => {
    acc[role] = MOCK_SERVER.members.filter(m => m.roleGroup === role)
    return acc
  }, {})

  return (
    <aside className={styles.panel}>
      {voiceState.connected && (
        <div className={styles.voiceCard}>
          <div className={styles.vcHead}>
            <span className={styles.vcTitle}>Sesli Bağlantı</span>
            <span className={styles.vcChan}>{voiceState.channelName}</span>
          </div>
          <div className={styles.vcGrid}>
            {voiceState.participants.map(u => (
              <div
                key={u.id}
                className={`${styles.vcUser} ${voiceState.speaking.includes(u.id) ? styles.speaking : ''}`}
              >
                <div className={styles.vcAv} style={{ background: u.avatarColor }}>{u.avatar}</div>
                <span className={styles.vcName}>{u.username}</span>
                <span className={styles.vcMic}>
                  {voiceState.speaking.includes(u.id) ? '🎙' : '🔇'}
                </span>
              </div>
            ))}
          </div>
          <div className={styles.vcActions}>
            <button className={styles.vcMute}>🎙 Sessiz</button>
            <button className={styles.vcLeave}>📴 Ayrıl</button>
          </div>
        </div>
      )}

      <div className={styles.tabs}>
        <div className={`${styles.tab} ${styles.tabActive}`}>Üyeler</div>
        <div className={styles.tab}>Profil</div>
      </div>

      <div className={styles.scroll}>
        {ROLE_ORDER.map(role => {
          const members = grouped[role]
          if (!members?.length) return null
          return (
            <div key={role}>
              <div className={styles.roleGroup}>
                {role} <span className={styles.roleCount}>— {members.length}</span>
              </div>
              {members.map(({ user }) => (
                <div
                  key={user.id}
                  className={styles.member}
                  style={{ opacity: user.status === 'offline' ? .45 : 1 }}
                >
                  <div className={styles.av} style={{ background: user.avatarColor }}>
                    {user.avatar}
                    <StatusDot status={user.status} />
                  </div>
                  <div className={styles.info}>
                    <div className={styles.name} style={{ color: user.roleColor }}>
                      {user.username}
                      {user.isBot && <span className={styles.botTag}>BOT</span>}
                    </div>
                    {user.activity && <div className={styles.activity}>{user.activity}</div>}
                  </div>
                  {user.role && (
                    <span
                      className={styles.roleTag}
                      style={{ background: (user.roleColor ?? '#888') + '22', color: user.roleColor }}
                    >
                      {user.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </aside>
  )
}
