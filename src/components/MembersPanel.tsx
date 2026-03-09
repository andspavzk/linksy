import { useApp } from '../context/AppContext'
import { StatusDot } from './StatusDot'
import styles from './MembersPanel.module.css'

const ROLE_ORDER = ['Founder', 'Moderator', 'Member', 'Bot']

export function MembersPanel() {
  const { members } = useApp()

  const grouped = ROLE_ORDER.reduce<Record<string, typeof members>>((acc, role) => {
    acc[role] = members.filter(m => m.role === role)
    return acc
  }, {})

  const offlineMembers = members.filter(m => m.profile?.status === 'offline')

  return (
    <aside className={styles.panel}>
      <div className={styles.tabs}>
        <div className={`${styles.tab} ${styles.tabActive}`}>Üyeler</div>
        <div className={styles.tab}>Profil</div>
      </div>

      <div className={styles.scroll}>
        {members.length === 0 && (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: 'rgba(255,255,255,.35)', fontSize: 13 }}>
            Henüz üye yok
          </div>
        )}

        {ROLE_ORDER.map(role => {
          const roleMembers = grouped[role]?.filter(m => m.profile?.status !== 'offline')
          if (!roleMembers?.length) return null
          return (
            <div key={role}>
              <div className={styles.roleGroup}>
                {role} <span className={styles.roleCount}>— {roleMembers.length}</span>
              </div>
              {roleMembers.map(({ user_id, profile }) => (
                <div key={user_id} className={styles.member}>
                  <div className={styles.av} style={{ background: profile?.avatar_color ?? 'linear-gradient(135deg,#555,#888)' }}>
                    {profile?.username?.[0]?.toUpperCase() ?? '?'}
                    <StatusDot status={(profile?.status ?? 'offline') as any} />
                  </div>
                  <div className={styles.info}>
                    <div className={styles.name}>
                      {profile?.username ?? 'Kullanıcı'}
                    </div>
                    {profile?.activity && <div className={styles.activity}>{profile.activity}</div>}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

        {offlineMembers.length > 0 && (
          <div>
            <div className={styles.roleGroup}>
              Çevrimdışı <span className={styles.roleCount}>— {offlineMembers.length}</span>
            </div>
            {offlineMembers.map(({ user_id, profile }) => (
              <div key={user_id} className={styles.member} style={{ opacity: 0.45 }}>
                <div className={styles.av} style={{ background: profile?.avatar_color ?? 'linear-gradient(135deg,#555,#888)' }}>
                  {profile?.username?.[0]?.toUpperCase() ?? '?'}
                  <StatusDot status="offline" />
                </div>
                <div className={styles.info}>
                  <div className={styles.name}>{profile?.username ?? 'Kullanıcı'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
