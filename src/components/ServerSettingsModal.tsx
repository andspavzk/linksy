import { useState } from 'react'
import { X, Plus, Trash2, Copy, Check, Shield, Hash, Volume2, Megaphone, Settings, Users, Link2, Layers } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import type { ChannelType } from '../types'
import styles from './ServerSettingsModal.module.css'

const COLORS = [
  'linear-gradient(135deg,#5865f2,#eb459e)',
  'linear-gradient(135deg,#57f287,#1abc9c)',
  'linear-gradient(135deg,#fee75c,#f0b232)',
  'linear-gradient(135deg,#ed4245,#eb459e)',
  'linear-gradient(135deg,#5865f2,#57f287)',
  'linear-gradient(135deg,#eb459e,#fee75c)',
]

const CHANNEL_TYPES: { value: ChannelType; label: string }[] = [
  { value: 'text', label: 'Metin Kanali' },
  { value: 'voice', label: 'Ses Kanali' },
  { value: 'announcement', label: 'Duyuru Kanali' },
]

type Tab = 'general' | 'channels' | 'members' | 'invite'

export function ServerSettingsModal() {
  const { modal, setModal, activeServer, isOwner, isMod, categories, channels, members, updateServer, deleteServer, createCategory, deleteCategory, createChannel, deleteChannel, updateMemberRole, kickMember, getInviteCode } = useApp()
  const { user } = useAuth()

  const [tab, setTab] = useState<Tab>('general')
  const [serverName, setServerName] = useState(activeServer?.name ?? '')
  const [serverColor, setServerColor] = useState(activeServer?.color ?? COLORS[0])
  const [newCatName, setNewCatName] = useState('')
  const [newChName, setNewChName] = useState('')
  const [newChType, setNewChType] = useState<ChannelType>('text')
  const [newChCat, setNewChCat] = useState('')
  const [copied, setCopied] = useState(false)
  const [saving, setSaving] = useState(false)

  if (modal !== 'server-settings' || !activeServer) return null

  const inviteLink = `${window.location.origin}/app?join=${getInviteCode()}`

  async function handleSave() {
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
    await createChannel(newChName.trim(), newChType, newChCat || null)
    setNewChName('')
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: 'general', label: 'Genel', icon: Settings },
    { key: 'channels', label: 'Kanallar', icon: Layers },
    { key: 'members', label: 'Uyeler', icon: Users },
    { key: 'invite', label: 'Davet', icon: Link2 },
  ]

  return (
    <div className={styles.overlay} onClick={() => setModal(null)}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarTitle}>{activeServer.name}</div>
          {tabs.map(t => (
            <button key={t.key} className={`${styles.sidebarItem} ${tab === t.key ? styles.sidebarActive : ''}`} onClick={() => setTab(t.key)}>
              <t.icon size={16} /> {t.label}
            </button>
          ))}
        </aside>

        <main className={styles.content}>
          <div className={styles.contentHeader}>
            <h2 className={styles.contentTitle}>{tabs.find(t => t.key === tab)?.label}</h2>
            <button className={styles.closeBtn} onClick={() => setModal(null)}><X size={20} /></button>
          </div>

          <div className={styles.contentBody}>
            {tab === 'general' && (
              <>
                <div className={styles.field}>
                  <label className={styles.label}>Sunucu Adi</label>
                  <input className={styles.input} value={serverName} onChange={e => setServerName(e.target.value)} disabled={!isOwner} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Sunucu Rengi</label>
                  <div className={styles.colorRow}>
                    {COLORS.map(c => (
                      <button key={c} className={`${styles.colorDot} ${serverColor === c ? styles.colorDotActive : ''}`} style={{ background: c }} onClick={() => isOwner && setServerColor(c)}>
                        {serverColor === c && <Check size={14} color="#fff" />}
                      </button>
                    ))}
                  </div>
                </div>
                {isOwner && (
                  <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
                    {saving ? 'Kaydediliyor...' : 'Degisiklikleri Kaydet'}
                  </button>
                )}
                {isOwner && (
                  <div className={styles.dangerZone}>
                    <div className={styles.dangerTitle}>Tehlikeli Bolge</div>
                    <p className={styles.dangerText}>Sunucuyu silmek geri alinamaz. Tum kanallar, mesajlar ve uyeler silinecek.</p>
                    <button className={styles.dangerBtn} onClick={async () => { if (confirm('Sunucuyu silmek istedigine emin misin?')) { await deleteServer(); setModal(null) } }}>
                      Sunucuyu Sil
                    </button>
                  </div>
                )}
              </>
            )}

            {tab === 'channels' && (
              <>
                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHead}>
                    <span>Kategoriler</span>
                    <span className={styles.count}>{categories.length}</span>
                  </div>
                  {categories.map(cat => (
                    <div key={cat.id} className={styles.listItem}>
                      <Layers size={14} className={styles.listIcon} />
                      <span className={styles.listName}>{cat.name}</span>
                      {isMod && <button className={styles.listDelete} onClick={() => deleteCategory(cat.id)}><Trash2 size={14} /></button>}
                    </div>
                  ))}
                  {isMod && (
                    <div className={styles.addRow}>
                      <input className={styles.addInput} value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Yeni kategori..." onKeyDown={e => e.key === 'Enter' && handleAddCategory()} />
                      <button className={styles.addBtn} onClick={handleAddCategory}><Plus size={14} /></button>
                    </div>
                  )}
                </div>

                <div className={styles.sectionBlock}>
                  <div className={styles.sectionHead}>
                    <span>Kanallar</span>
                    <span className={styles.count}>{channels.length}</span>
                  </div>
                  {channels.map(ch => (
                    <div key={ch.id} className={styles.listItem}>
                      <Hash size={14} className={styles.listIcon} />
                      <span className={styles.listName}>{ch.name}</span>
                      <span className={styles.listBadge}>{ch.type}</span>
                      {isMod && <button className={styles.listDelete} onClick={() => deleteChannel(ch.id)}><Trash2 size={14} /></button>}
                    </div>
                  ))}
                  {isMod && (
                    <div className={styles.addForm}>
                      <input className={styles.addInput} value={newChName} onChange={e => setNewChName(e.target.value)} placeholder="Kanal adi..." />
                      <select className={styles.addSelect} value={newChType} onChange={e => setNewChType(e.target.value as ChannelType)}>
                        {CHANNEL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <select className={styles.addSelect} value={newChCat} onChange={e => setNewChCat(e.target.value)}>
                        <option value="">Kategorisiz</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <button className={styles.primaryBtn} onClick={handleAddChannel}>Olustur</button>
                    </div>
                  )}
                </div>
              </>
            )}

            {tab === 'members' && (
              <div className={styles.sectionBlock}>
                <div className={styles.sectionHead}>
                  <span>Uyeler</span>
                  <span className={styles.count}>{members.length}</span>
                </div>
                {members.map(m => (
                  <div key={m.odocId} className={styles.memberRow}>
                    <div className={styles.memberAvatar} style={{ background: m.profile?.avatarColor ?? '#555' }}>
                      {m.profile?.username?.[0]?.toUpperCase() ?? '?'}
                    </div>
                    <div className={styles.memberInfo}>
                      <div className={styles.memberName}>{m.profile?.username ?? '?'}</div>
                      <div className={styles.memberTag}>{m.profile?.tag}</div>
                    </div>
                    {isOwner && m.userId !== user?.uid ? (
                      <div className={styles.memberActions}>
                        <select className={styles.roleSelect} value={m.role} onChange={e => updateMemberRole(m.odocId, e.target.value)}>
                          <option value="Moderator">Moderator</option>
                          <option value="Member">Member</option>
                        </select>
                        <button className={styles.kickBtn} onClick={() => { if (confirm(`${m.profile?.username} atilsin mi?`)) kickMember(m.odocId) }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className={`${styles.roleBadge} ${styles['role' + m.role]}`}>
                        <Shield size={10} /> {m.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {tab === 'invite' && (
              <div className={styles.inviteSection}>
                <div className={styles.inviteIcon}>&#128279;</div>
                <h3 className={styles.inviteTitle}>Arkadaslarini Davet Et</h3>
                <p className={styles.inviteDesc}>Bu linki paylasarak insanlari sunucuna davet edebilirsin.</p>
                <div className={styles.inviteRow}>
                  <input className={styles.inviteInput} value={inviteLink} readOnly />
                  <button className={styles.copyBtn} onClick={handleCopy}>
                    {copied ? <><Check size={14} /> Kopyalandi</> : <><Copy size={14} /> Kopyala</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
