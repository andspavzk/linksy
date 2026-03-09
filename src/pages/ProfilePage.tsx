import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, User, AtSign, Shield, Bell, Palette, Activity, Eye, LogOut, Check, Save, ChevronRight } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import styles from './ProfilePage.module.css'

const STATUS_OPTIONS = [
  { value: 'online', label: 'Cevrimici', color: '#23a55a', dot: styles.dotOnline },
  { value: 'idle', label: 'Bosta', color: '#f0b232', dot: styles.dotIdle },
  { value: 'dnd', label: 'Rahatsiz Etme', color: '#da373c', dot: styles.dotDnd },
  { value: 'offline', label: 'Gorunmez', color: '#80848e', dot: styles.dotOffline },
]

const AVATAR_COLORS = [
  'linear-gradient(135deg,#5865f2,#eb459e)',
  'linear-gradient(135deg,#57f287,#1abc9c)',
  'linear-gradient(135deg,#fee75c,#f0b232)',
  'linear-gradient(135deg,#ed4245,#eb459e)',
  'linear-gradient(135deg,#5865f2,#57f287)',
  'linear-gradient(135deg,#eb459e,#fee75c)',
  'linear-gradient(135deg,#1abc9c,#5865f2)',
  'linear-gradient(135deg,#f0b232,#ed4245)',
  'linear-gradient(135deg,#9b59b6,#3498db)',
  'linear-gradient(135deg,#e74c3c,#f39c12)',
]

type NavItem = 'account' | 'profile' | 'privacy' | 'notifications'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, signOut, user } = useAuth()

  const [username, setUsername] = useState(profile?.username ?? '')
  const [activity, setActivity] = useState(profile?.activity ?? '')
  const [bio, setBio] = useState((profile as any)?.bio ?? '')
  const [status, setStatus] = useState(profile?.status ?? 'online')
  const [avatarColor, setAvatarColor] = useState(profile?.avatarColor ?? AVATAR_COLORS[0])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeNav, setActiveNav] = useState<NavItem>('account')
  const [hasChanges, setHasChanges] = useState(false)

  function change<T>(setter: (v: T) => void) {
    return (v: T) => { setter(v); setHasChanges(true) }
  }

  async function handleSave() {
    if (!user) return
    setSaving(true)
    await updateDoc(doc(db, 'profiles', user.uid), {
      username: username.trim(),
      activity: activity.trim() || null,
      bio: bio.trim() || null,
      status,
      avatarColor,
    })
    setSaving(false)
    setSaved(true)
    setHasChanges(false)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleReset() {
    setUsername(profile?.username ?? '')
    setActivity(profile?.activity ?? '')
    setBio((profile as any)?.bio ?? '')
    setStatus(profile?.status ?? 'online')
    setAvatarColor(profile?.avatarColor ?? AVATAR_COLORS[0])
    setHasChanges(false)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  const NAV_ITEMS: { key: NavItem; label: string; icon: any }[] = [
    { key: 'account', label: 'Hesabim', icon: User },
    { key: 'profile', label: 'Profiller', icon: Palette },
    { key: 'privacy', label: 'Gizlilik', icon: Shield },
    { key: 'notifications', label: 'Bildirimler', icon: Bell },
  ]

  return (
    <div className={styles.page}>
      {/* LEFT SIDEBAR */}
      <nav className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <div className={styles.userCard}>
            <div className={styles.userCardAvatar} style={{ background: avatarColor }}>
              {username?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div>
              <div className={styles.userCardName}>{username || 'Kullanici'}</div>
              <div className={styles.userCardSub}>Profili Duzenle</div>
            </div>
          </div>

          <div className={styles.navGroup}>
            <div className={styles.navGroupTitle}>Kullanici Ayarlari</div>
            {NAV_ITEMS.map(item => (
              <button key={item.key} className={`${styles.navBtn} ${activeNav === item.key ? styles.navBtnActive : ''}`} onClick={() => setActiveNav(item.key)}>
                <item.icon size={16} />
                <span>{item.label}</span>
                {activeNav === item.key && <ChevronRight size={14} className={styles.navArrow} />}
              </button>
            ))}
          </div>

          <div className={styles.navDivider} />

          <button className={styles.logoutBtn} onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Cikis Yap</span>
          </button>

          <div className={styles.navDivider} />
          <div className={styles.sidebarFooter}>Linksy v0.1.0-beta</div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className={styles.main}>
        <div className={styles.mainInner}>
          {/* CLOSE BUTTON */}
          <button className={styles.closeBtn} onClick={() => navigate('/app')}>
            <X size={20} />
            <span className={styles.closeTip}>ESC</span>
          </button>

          {activeNav === 'account' && (
            <>
              <h2 className={styles.heading}>Hesabim</h2>

              {/* PROFILE CARD */}
              <div className={styles.profileCard}>
                <div className={styles.profileBanner} style={{ background: avatarColor }} />
                <div className={styles.profileCardBody}>
                  <div className={styles.profileAvatarWrap}>
                    <div className={styles.profileAvatar} style={{ background: avatarColor }}>
                      {username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                  </div>
                  <div className={styles.profileCardName}>{username || 'Kullanici'}</div>
                  <span className={styles.profileCardTag}>{profile?.tag ?? '#0000'}</span>
                </div>

                <div className={styles.profileFields}>
                  <div className={styles.profileField}>
                    <div className={styles.profileFieldLabel}>Gorunen Ad</div>
                    <div className={styles.profileFieldValue}>{username || '-'}</div>
                    <button className={styles.profileFieldBtn} onClick={() => setActiveNav('profile')}>Duzenle</button>
                  </div>
                  <div className={styles.profileField}>
                    <div className={styles.profileFieldLabel}>Kullanici Adi</div>
                    <div className={styles.profileFieldValue}>{username}{profile?.tag}</div>
                    <button className={styles.profileFieldBtn} onClick={() => setActiveNav('profile')}>Duzenle</button>
                  </div>
                  <div className={styles.profileField}>
                    <div className={styles.profileFieldLabel}>E-posta</div>
                    <div className={styles.profileFieldValue}>{user?.email ?? '-'}</div>
                  </div>
                </div>
              </div>

              {/* PASSWORD SECTION */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Sifre ve Dogrulama</h3>
                <button className={styles.accentBtn}>Sifre Degistir</button>
              </div>

              {/* DANGER ZONE */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Hesap Kaldirma</h3>
                <p className={styles.sectionDesc}>Hesabini devre disi birakmak, istedigin zaman geri donebilecegin anlamina gelir.</p>
                <div className={styles.dangerRow}>
                  <button className={styles.dangerBtn}>Hesabi Devre Disi Birak</button>
                  <button className={styles.dangerBtnOutline}>Hesabi Sil</button>
                </div>
              </div>
            </>
          )}

          {activeNav === 'profile' && (
            <>
              <h2 className={styles.heading}>Profiller</h2>

              <div className={styles.editGrid}>
                <div className={styles.editLeft}>
                  {/* AVATAR COLOR */}
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Avatar</label>
                    <div className={styles.colorGrid}>
                      {AVATAR_COLORS.map(c => (
                        <button key={c} className={`${styles.colorSwatch} ${avatarColor === c ? styles.colorSwatchActive : ''}`} style={{ background: c }} onClick={() => change(setAvatarColor)(c)}>
                          {avatarColor === c && <Check size={14} color="#fff" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* USERNAME */}
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Gorunen Ad</label>
                    <input className={styles.input} value={username} onChange={e => change(setUsername)(e.target.value)} />
                  </div>

                  {/* BIO */}
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Hakkimda</label>
                    <textarea className={styles.textarea} value={bio} onChange={e => change(setBio)(e.target.value)} placeholder="Hakkinda bir seyler yaz..." rows={3} maxLength={190} />
                    <span className={styles.charCount}>{bio.length}/190</span>
                  </div>

                  {/* ACTIVITY */}
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Durum Mesaji</label>
                    <input className={styles.input} value={activity} onChange={e => change(setActivity)(e.target.value)} placeholder="Ne yapiyorsun?" maxLength={64} />
                  </div>

                  {/* STATUS */}
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Cevrimici Durumu</label>
                    <div className={styles.statusList}>
                      {STATUS_OPTIONS.map(s => (
                        <button key={s.value} className={`${styles.statusItem} ${status === s.value ? styles.statusItemActive : ''}`} onClick={() => change(setStatus)(s.value as any)}>
                          <span className={styles.statusCircle} style={{ background: s.color }} />
                          <span>{s.label}</span>
                          {status === s.value && <Check size={14} className={styles.statusCheck} />}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* PREVIEW */}
                <div className={styles.editRight}>
                  <div className={styles.previewLabel}>Onizleme</div>
                  <div className={styles.previewCard}>
                    <div className={styles.previewBanner} style={{ background: avatarColor }} />
                    <div className={styles.previewBody}>
                      <div className={styles.previewAvatarWrap}>
                        <div className={styles.previewAvatar} style={{ background: avatarColor }}>
                          {username?.[0]?.toUpperCase() ?? '?'}
                        </div>
                        <span className={styles.previewStatusDot} style={{ background: STATUS_OPTIONS.find(s => s.value === status)?.color }} />
                      </div>
                      <div className={styles.previewName}>{username || 'Kullanici'}</div>
                      <div className={styles.previewTag}>{profile?.tag ?? '#0000'}</div>
                      {bio && (
                        <div className={styles.previewSection}>
                          <div className={styles.previewSectionTitle}>HAKKIMDA</div>
                          <div className={styles.previewBio}>{bio}</div>
                        </div>
                      )}
                      {activity && (
                        <div className={styles.previewSection}>
                          <div className={styles.previewSectionTitle}>DURUM</div>
                          <div className={styles.previewBio}>{activity}</div>
                        </div>
                      )}
                      <div className={styles.previewSection}>
                        <div className={styles.previewSectionTitle}>LINKSY UYESI</div>
                        <div className={styles.previewBio}>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeNav === 'privacy' && (
            <>
              <h2 className={styles.heading}>Gizlilik ve Guvenlik</h2>
              <p className={styles.sectionDesc}>Gizlilik ayarlari yakinda eklenecek.</p>
            </>
          )}

          {activeNav === 'notifications' && (
            <>
              <h2 className={styles.heading}>Bildirimler</h2>
              <p className={styles.sectionDesc}>Bildirim ayarlari yakinda eklenecek.</p>
            </>
          )}
        </div>
      </main>

      {/* SAVE BAR */}
      <div className={`${styles.saveBar} ${hasChanges || saved ? styles.saveBarVisible : ''}`}>
        <span className={styles.saveBarText}>{saved ? 'Degisiklikler kaydedildi!' : 'Dikkat — kaydedilmemis degisikliklerin var!'}</span>
        <div className={styles.saveBarActions}>
          {!saved && <button className={styles.saveBarReset} onClick={handleReset}>Sifirla</button>}
          <button className={styles.saveBarBtn} onClick={handleSave} disabled={saving || saved}>
            {saving ? <span className={styles.spinner} /> : saved ? <><Check size={15} /> Kaydedildi</> : 'Degisiklikleri Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
