import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Save, Check, User, AtSign, Palette, Activity } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import styles from './ProfilePage.module.css'

const STATUS_OPTIONS = [
  { value: 'online', label: 'Cevrimici', color: '#23a55a', icon: '●' },
  { value: 'idle', label: 'Bosta', color: '#f0b232', icon: '◑' },
  { value: 'dnd', label: 'Rahatsiz Etme', color: '#da373c', icon: '⊘' },
  { value: 'offline', label: 'Gorunmez', color: '#80848e', icon: '○' },
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
]

export default function ProfilePage() {
  const navigate = useNavigate()
  const { profile, signOut, user } = useAuth()

  const [username, setUsername] = useState(profile?.username ?? '')
  const [activity, setActivity] = useState(profile?.activity ?? '')
  const [status, setStatus] = useState(profile?.status ?? 'online')
  const [avatarColor, setAvatarColor] = useState(profile?.avatarColor ?? AVATAR_COLORS[0])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tab, setTab] = useState<'profile' | 'account'>('profile')

  async function handleSave() {
    if (!user) return
    setSaving(true)
    await updateDoc(doc(db, 'profiles', user.uid), {
      username: username.trim(),
      activity: activity.trim() || null,
      status,
      avatarColor,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className={styles.page}>
      <aside className={styles.nav}>
        <button className={styles.backBtn} onClick={() => navigate('/app')}>
          <ArrowLeft size={16} />
          <span>Uygulamaya Don</span>
        </button>
        <div className={styles.navSection}>KULLANICI AYARLARI</div>
        <button className={`${styles.navItem} ${tab === 'profile' ? styles.navActive : ''}`} onClick={() => setTab('profile')}>
          <User size={16} /> Profilim
        </button>
        <button className={`${styles.navItem} ${tab === 'account' ? styles.navActive : ''}`} onClick={() => setTab('account')}>
          <AtSign size={16} /> Hesap
        </button>
        <div className={styles.navDivider} />
        <button className={styles.navLogout} onClick={handleSignOut}>
          <LogOut size={16} /> Cikis Yap
        </button>
      </aside>

      <main className={styles.content}>
        {tab === 'profile' && (
          <>
            <h1 className={styles.heading}>Profilim</h1>
            <p className={styles.subheading}>Diger kullanicilarin seni nasil gorecegini ayarla</p>

            <div className={styles.previewCard}>
              <div className={styles.previewBanner} style={{ background: avatarColor }} />
              <div className={styles.previewBody}>
                <div className={styles.previewAvatar} style={{ background: avatarColor }}>
                  {username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className={styles.previewInfo}>
                  <div className={styles.previewName}>{username || 'Kullanici'}</div>
                  <div className={styles.previewTag}>{profile?.tag ?? '#0000'}</div>
                  {activity && <div className={styles.previewActivity}>{activity}</div>}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formIcon}><Palette size={18} /></div>
              <div className={styles.formContent}>
                <div className={styles.formLabel}>Avatar Rengi</div>
                <div className={styles.colorGrid}>
                  {AVATAR_COLORS.map(c => (
                    <button key={c} className={`${styles.colorSwatch} ${avatarColor === c ? styles.colorActive : ''}`} style={{ background: c }} onClick={() => setAvatarColor(c)}>
                      {avatarColor === c && <Check size={14} color="#fff" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formIcon}><User size={18} /></div>
              <div className={styles.formContent}>
                <label className={styles.formLabel}>Kullanici Adi</label>
                <input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="kullanici_adi" />
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formIcon}><Activity size={18} /></div>
              <div className={styles.formContent}>
                <label className={styles.formLabel}>Durum Mesaji</label>
                <input className={styles.input} value={activity} onChange={e => setActivity(e.target.value)} placeholder="Ne yapiyorsun?" maxLength={64} />
                <span className={styles.fieldHint}>{activity.length}/64</span>
              </div>
            </div>

            <div className={styles.formSection}>
              <div className={styles.formContent} style={{ marginLeft: 42 }}>
                <div className={styles.formLabel}>Cevrimici Durumu</div>
                <div className={styles.statusGrid}>
                  {STATUS_OPTIONS.map(s => (
                    <button key={s.value} className={`${styles.statusBtn} ${status === s.value ? styles.statusActive : ''}`} onClick={() => setStatus(s.value as any)}>
                      <span className={styles.statusDot} style={{ color: s.color }}>{s.icon}</span>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'account' && (
          <>
            <h1 className={styles.heading}>Hesap</h1>
            <p className={styles.subheading}>Hesap bilgilerini yonet</p>
            <div className={styles.accountCard}>
              <div className={styles.accountRow}>
                <div>
                  <div className={styles.accountLabel}>E-posta</div>
                  <div className={styles.accountValue}>{user?.email}</div>
                </div>
              </div>
              <div className={styles.accountRow}>
                <div>
                  <div className={styles.accountLabel}>Kullanici ID</div>
                  <div className={styles.accountValue} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>{user?.uid}</div>
                </div>
              </div>
              <div className={styles.accountRow}>
                <div>
                  <div className={styles.accountLabel}>Katilim Tarihi</div>
                  <div className={styles.accountValue}>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className={styles.saveBar} data-visible={saving || saved || undefined}>
          <span>{saved ? 'Degisiklikler kaydedildi!' : 'Kaydedilmemis degisiklikler var'}</span>
          <button className={styles.saveBtn} onClick={handleSave} disabled={saving || saved}>
            {saving ? <span className={styles.spinner} /> : saved ? <><Check size={15} /> Kaydedildi</> : <><Save size={15} /> Kaydet</>}
          </button>
        </div>
      </main>
    </div>
  )
}
