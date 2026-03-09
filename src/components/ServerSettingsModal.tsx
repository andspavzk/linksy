import { useState } from 'react'
import { X, Plus, Trash2, Copy, Check, Shield, Hash, Volume2, Megaphone } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import type { ChannelType } from '../types'

const COLORS = [
  'linear-gradient(135deg,#2b5bde,#7b5ea7)',
  'linear-gradient(135deg,#e53935,#f5a623)',
  'linear-gradient(135deg,#4fae4e,#00bcd4)',
  'linear-gradient(135deg,#f5c542,#f0855a)',
  'linear-gradient(135deg,#9c27b0,#5c6bc0)',
  'linear-gradient(135deg,#ff6b6b,#feca57)',
]

const CHANNEL_TYPES: { value: ChannelType; label: string; icon: any }[] = [
  { value: 'text', label: 'Metin', icon: Hash },
  { value: 'voice', label: 'Ses', icon: Volume2 },
  { value: 'announcement', label: 'Duyuru', icon: Megaphone },
]

const ROLES = ['Founder', 'Moderator', 'Member']

const overlay: React.CSSProperties = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex',
  alignItems: 'center', justifyContent: 'center', zIndex: 9999,
}
const card: React.CSSProperties = {
  background: '#1a1a2e', borderRadius: 16, width: 480, maxHeight: '85vh',
  border: '1px solid rgba(255,255,255,.08)', display: 'flex', flexDirection: 'column',
  overflow: 'hidden',
}
const header: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)',
}
const body: React.CSSProperties = { padding: '16px 20px', overflowY: 'auto', flex: 1 }
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
  color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box',
}
const btnPrimary: React.CSSProperties = {
  padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
  background: 'linear-gradient(135deg,#5b8def,#7b5ea7)', color: '#fff',
  fontWeight: 600, fontSize: 13,
}
const btnDanger: React.CSSProperties = {
  ...btnPrimary, background: '#e53935',
}
const label: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,.45)',
  textTransform: 'uppercase', marginBottom: 6, display: 'block', letterSpacing: 0.5,
}
const section: React.CSSProperties = { marginBottom: 20 }
const row: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
  borderRadius: 8, background: 'rgba(255,255,255,.03)', marginBottom: 4,
}

type Tab = 'general' | 'channels' | 'members' | 'invite'

export function ServerSettingsModal() {
  const {
    modal, setModal, activeServer, isOwner, isMod,
    categories, channels, members,
    updateServer, deleteServer,
    createCategory, deleteCategory,
    createChannel, deleteChannel,
    updateMemberRole, kickMember,
    getInviteCode,
  } = useApp()
  const { user } = useAuth()

  const [tab, setTab] = useState<Tab>('general')
  const [serverName, setServerName] = useState(activeServer?.name ?? '')
  const [serverColor, setServerColor] = useState(activeServer?.color ?? COLORS[0])
  const [newCatName, setNewCatName] = useState('')
  const [newChName, setNewChName] = useState('')
  const [newChType, setNewChType] = useState<ChannelType>('text')
  const [newChCat, setNewChCat] = useState<string>('')
  const [newChDesc, setNewChDesc] = useState('')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  if (modal !== 'server-settings' || !activeServer) return null

  const inviteCode = getInviteCode()
  const inviteLink = `${window.location.origin}/app?join=${inviteCode}`

  async function handleSaveGeneral() {
    setSaving(true)
    const initials = serverName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    await updateServer({ name: serverName.trim(), initials, color: serverColor })
    setSaving(false)
  }

  async function handleAddCategory() {
    if (!newCatName.trim()) return
    await createCategory(newCatName.trim())
    setNewCatName('')
  }

  async function handleAddChannel() {
    if (!newChName.trim()) return
    await createChannel(newChName.trim(), newChType, newChCat || null, newChDesc)
    setNewChName('')
    setNewChDesc('')
  }

  function handleCopyInvite() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'general', label: 'Genel' },
    { key: 'channels', label: 'Kanallar' },
    { key: 'members', label: 'Uyeler' },
    { key: 'invite', label: 'Davet' },
  ]

  return (
    <div style={overlay} onClick={() => setModal(null)}>
      <div style={card} onClick={e => e.stopPropagation()}>
        <div style={header}>
          <h3 style={{ color: '#fff', margin: 0, fontSize: 16 }}>Sunucu Ayarlari</h3>
          <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.5)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: '10px 0', background: 'none', border: 'none',
              color: tab === t.key ? '#5b8def' : 'rgba(255,255,255,.4)',
              borderBottom: tab === t.key ? '2px solid #5b8def' : '2px solid transparent',
              fontWeight: 600, fontSize: 12, cursor: 'pointer',
            }}>{t.label}</button>
          ))}
        </div>

        <div style={body}>

          {tab === 'general' && (
            <>
              <div style={section}>
                <span style={label}>Sunucu Adi</span>
                <input value={serverName} onChange={e => setServerName(e.target.value)} style={inputStyle} disabled={!isOwner} />
              </div>
              <div style={section}>
                <span style={label}>Sunucu Rengi</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  {COLORS.map(c => (
                    <button key={c} onClick={() => isOwner && setServerColor(c)} style={{
                      width: 32, height: 32, borderRadius: 8, background: c, border: serverColor === c ? '2px solid #fff' : '2px solid transparent',
                      cursor: isOwner ? 'pointer' : 'default',
                    }} />
                  ))}
                </div>
              </div>
              {isOwner && (
                <>
                  <button onClick={handleSaveGeneral} disabled={saving} style={{ ...btnPrimary, opacity: saving ? 0.5 : 1 }}>
                    {saving ? 'Kaydediliyor...' : 'Kaydet'}
                  </button>
                  <div style={{ marginTop: 32, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,.06)' }}>
                    <span style={label}>Tehlikeli Bolge</span>
                    <button onClick={async () => { if (confirm('Sunucuyu silmek istedigine emin misin?')) { await deleteServer(); setModal(null) } }} style={btnDanger}>
                      Sunucuyu Sil
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {tab === 'channels' && (
            <>
              <div style={section}>
                <span style={label}>Kategoriler</span>
                {categories.map(cat => (
                  <div key={cat.id} style={row}>
                    <span style={{ flex: 1, color: '#fff', fontSize: 13 }}>{cat.name}</span>
                    {isMod && (
                      <button onClick={() => deleteCategory(cat.id)} style={{ background: 'none', border: 'none', color: '#e53935', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {isMod && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Kategori adi..." style={{ ...inputStyle, flex: 1 }}
                      onKeyDown={e => e.key === 'Enter' && handleAddCategory()} />
                    <button onClick={handleAddCategory} style={btnPrimary}><Plus size={14} /></button>
                  </div>
                )}
              </div>

              <div style={section}>
                <span style={label}>Kanallar</span>
                {channels.map(ch => (
                  <div key={ch.id} style={row}>
                    <Hash size={14} style={{ color: 'rgba(255,255,255,.4)' }} />
                    <span style={{ flex: 1, color: '#fff', fontSize: 13 }}>{ch.name}</span>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>{ch.type}</span>
                    {isMod && (
                      <button onClick={() => deleteChannel(ch.id)} style={{ background: 'none', border: 'none', color: '#e53935', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
                {isMod && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <input value={newChName} onChange={e => setNewChName(e.target.value)} placeholder="Kanal adi..." style={inputStyle} />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select value={newChType} onChange={e => setNewChType(e.target.value as ChannelType)}
                        style={{ ...inputStyle, flex: 1 }}>
                        {CHANNEL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <select value={newChCat} onChange={e => setNewChCat(e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}>
                        <option value="">Kategorisiz</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <input value={newChDesc} onChange={e => setNewChDesc(e.target.value)} placeholder="Aciklama (opsiyonel)" style={inputStyle} />
                    <button onClick={handleAddChannel} style={btnPrimary}>Kanal Olustur</button>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'members' && (
            <div style={section}>
              <span style={label}>Uyeler ({members.length})</span>
              {members.map(m => (
                <div key={m.odocId} style={{ ...row, justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: m.profile?.avatarColor ?? '#555',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#fff', fontWeight: 700, fontSize: 13,
                    }}>
                      {m.profile?.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{m.profile?.username ?? '?'}</div>
                      <div style={{ color: 'rgba(255,255,255,.35)', fontSize: 11 }}>{m.profile?.tag}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isOwner && m.userId !== user?.uid ? (
                      <>
                        <select value={m.role} onChange={e => updateMemberRole(m.odocId, e.target.value)}
                          style={{ ...inputStyle, width: 'auto', padding: '4px 8px', fontSize: 11 }}>
                          {ROLES.filter(r => r !== 'Founder').map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={() => { if (confirm(`${m.profile?.username} atilsin mi?`)) kickMember(m.odocId) }}
                          style={{ background: 'none', border: 'none', color: '#e53935', cursor: 'pointer' }}>
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <span style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: m.role === 'Founder' ? 'rgba(229,57,53,.15)' : m.role === 'Moderator' ? 'rgba(91,141,239,.15)' : 'rgba(255,255,255,.06)',
                        color: m.role === 'Founder' ? '#e53935' : m.role === 'Moderator' ? '#5b8def' : 'rgba(255,255,255,.5)',
                      }}>
                        <Shield size={10} style={{ marginRight: 4 }} />{m.role}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'invite' && (
            <div style={section}>
              <span style={label}>Davet Linki</span>
              <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 13, marginBottom: 12 }}>
                Bu linki paylasarak insanlari sunucuna davet edebilirsin.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={inviteLink} readOnly style={{ ...inputStyle, flex: 1, fontSize: 12 }} />
                <button onClick={handleCopyInvite} style={btnPrimary}>
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              {copied && <p style={{ color: '#4fae4e', fontSize: 12, marginTop: 8 }}>Kopyalandi!</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
