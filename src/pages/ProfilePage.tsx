import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, LogOut, Save } from 'lucide-react'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import styles from './ProfilePage.module.css'

const STATUS_OPTIONS = [
  { value: 'online', label: 'Cevrimici' },
  { value: 'idle', label: 'Bosta' },
  { value: 'dnd', label: 'Rahatsiz Etme' },
  { value: 'offline', label: 'Gorunmez' },
]

const AVATAR_COLORS = [
  'linear-gradient(135deg,#2b5bde,#7b5ea7)',
  'linear-gradient(135deg,#e53935,#f5a623)',
  'linear-gradient(135deg,#4fae4e,#00bcd4)',
  'linear-gradient(135deg,#f5c542,#f0855a)',
  'linear-gradient(135deg,#9c27b0,#5c6bc0)',
  'linear-gradient(135deg,#00bcd4,#4fae4e)',
  'linear-gradient(135deg,#ff6b6b,#feca57)',
  'linear-gradient(135deg,#a29bfe,#fd79a8)',
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
    setTimeout(() => setSaved(false), 2000)
  }

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.topBar}>
          <button className={styles.backBtn} onClick={() => navigate('/app')}>
            <ArrowLeft size={16} /> Geri Don
          </button>
          <button className={styles.logoutBtn} onClick={handleSignOut}>
            <LogOut size={14} /> Cikis
          </button>
        </div>

        <div className={styles.avatarSection}>
          <div className={styles.avatar} style={{ background: avatarColor }}>
            {username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className={styles.avatarInfo}>
            <div className={styles.displayName}>{username || 'Kullanici'}</div>
            <div className={styles.tag}>{profile?.tag ?? '#0000'}</div>
            <div className={styles.email}>{user?.email}</div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Avatar Rengi</div>
          <div className={styles.colorGrid}>
            {AVATAR_COLORS.map(c => (
              <button
                key={c}
                className={`${styles.colorSwatch} ${avatarColor === c ? styles.colorActive : ''}`}
                style={{ background: c }}
                onClick={() => setAvatarColor(c)}
              />
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Profil Bilgileri</div>
          <div className={styles.field}>
            <label className={styles.label}>Kullanici Adi</label>
            <input className={styles.input} value={username} onChange={e => setUsername(e.target.value)} placeholder="kullanici_adi" />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Aktivite / Durum Mesaji</label>
            <input className={styles.input} value={activity} onChange={e => setActivity(e.target.value)} placeholder="VS Code ile calisiyor..." maxLength={64} />
            <span className={styles.fieldHint}>{activity.length}/64</span>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Cevrimici Durumu</label>
            <div className={styles.statusGrid}>
              {STATUS_OPTIONS.map(s => (
                <button key={s.value} className={`${styles.statusBtn} ${status === s.value ? styles.statusActive : ''}`} onClick={() => setStatus(s.value as any)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button className={styles.saveBtn} onClick={handleSave} disabled={saving || saved}>
          {saving ? <span className={styles.spinner} /> : saved ? 'Kaydedildi' : <><Save size={15} /> Degisiklikleri Kaydet</>}
        </button>
      </div>
    </div>
  )
}
