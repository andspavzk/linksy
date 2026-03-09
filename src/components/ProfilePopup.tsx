import { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useDm } from '../context/DmContext'
import { useAuth } from '../context/AuthContext'
import { StatusDot } from './StatusDot'
import { MessageSquare, UserPlus, X } from 'lucide-react'
import type { Profile } from '../types'

interface Props {
  uid: string
  x: number
  y: number
  onClose: () => void
}

export function ProfilePopup({ uid, x, y, onClose }: Props) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const { user } = useAuth()
  const { createDm, setActiveDmId, setIsDmMode, sendFriendRequest } = useDm()
  const [friendMsg, setFriendMsg] = useState<string | null>(null)

  useEffect(() => {
    getDoc(doc(db, 'profiles', uid)).then(snap => {
      if (snap.exists()) setProfile(snap.data() as Profile)
    })
  }, [uid])

  if (!profile) return null

  const isMe = user?.uid === uid
  const clampedY = Math.min(y, window.innerHeight - 320)
  const clampedX = Math.min(x, window.innerWidth - 300)

  async function handleDm() {
    const dmId = await createDm(uid)
    setActiveDmId(dmId)
    setIsDmMode(true)
    onClose()
  }

  async function handleAddFriend() {
    const err = await sendFriendRequest(profile!.username, profile!.tag)
    setFriendMsg(err || 'Istek gonderildi!')
    setTimeout(() => setFriendMsg(null), 2000)
  }

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: 998 }} onClick={onClose} />
      <div style={{
        position: 'fixed', left: clampedX, top: clampedY, zIndex: 999,
        width: 280, background: '#12121f', borderRadius: 12,
        border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 8px 32px rgba(0,0,0,.6)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: 60, background: profile.avatarColor,
          position: 'relative',
        }}>
          <button onClick={onClose} style={{
            position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,.3)',
            border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', padding: '2px 4px',
          }}><X size={14} /></button>
        </div>

        <div style={{ padding: '0 16px 16px', marginTop: -24 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', background: profile.avatarColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: 18,
            border: '3px solid #12121f', position: 'relative',
          }}>
            {profile.username[0].toUpperCase()}
            <div style={{ position: 'absolute', bottom: -2, right: -2 }}>
              <StatusDot status={profile.status} />
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{profile.username}</div>
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 12 }}>{profile.tag}</div>
          </div>

          {profile.activity && (
            <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 12, marginTop: 6 }}>
              {profile.activity}
            </div>
          )}

          {profile.bio && (
            <div style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, marginTop: 8, lineHeight: 1.4 }}>
              {profile.bio}
            </div>
          )}

          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 8 }}>
            Katilim: {new Date(profile.createdAt).toLocaleDateString('tr-TR')}
          </div>

          {!isMe && (
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={handleDm} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#5b8def,#7b5ea7)', color: '#fff',
                fontWeight: 600, fontSize: 12,
              }}>
                <MessageSquare size={13} /> Mesaj
              </button>
              <button onClick={handleAddFriend} style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 0', borderRadius: 8, border: '1px solid rgba(255,255,255,.1)',
                background: 'rgba(255,255,255,.04)', color: '#fff', cursor: 'pointer',
                fontWeight: 600, fontSize: 12,
              }}>
                <UserPlus size={13} /> Arkadas Ekle
              </button>
            </div>
          )}

          {friendMsg && (
            <div style={{ color: friendMsg.includes('!') ? '#4fae4e' : '#e53935', fontSize: 11, marginTop: 6, textAlign: 'center' }}>
              {friendMsg}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
