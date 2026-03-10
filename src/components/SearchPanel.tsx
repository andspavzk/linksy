import { useState, useEffect } from 'react'
import { X, Search, Pin, Bookmark } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import styles from './SearchPanel.module.css'

type PanelTab = 'search' | 'pinned' | 'saved'

interface Props {
  visible: boolean
  onClose: () => void
  initialTab?: PanelTab
}

export function SearchPanel({ visible, onClose, initialTab = 'search' }: Props) {
  const { messages, pinnedMessages, activeChannelId } = useApp()
  const { user } = useAuth()
  const [tab, setTab] = useState<PanelTab>(initialTab)
  const [searchQuery, setSearchQuery] = useState('')
  const [savedMessages, setSavedMessages] = useState<any[]>([])

  useEffect(() => { setTab(initialTab) }, [initialTab])

  useEffect(() => {
    if (!user || tab !== 'saved') return
    getDocs(query(collection(db, 'savedMessages'), where('userId', '==', user.uid)))
      .then(snap => {
        setSavedMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      })
  }, [user, tab])

  async function saveMessage(msg: any) {
    if (!user) return
    await addDoc(collection(db, 'savedMessages'), {
      userId: user.uid,
      messageId: msg.id,
      content: msg.content,
      authorName: msg.author?.username ?? '?',
      authorColor: msg.author?.avatarColor ?? '#555',
      channelId: msg.channelId,
      savedAt: Date.now(),
    })
  }

  async function unsaveMessage(savedId: string) {
    await deleteDoc(doc(db, 'savedMessages', savedId))
    setSavedMessages(prev => prev.filter(m => m.id !== savedId))
  }

  if (!visible) return null

  const searchResults = searchQuery.length >= 2
    ? messages.filter(m => {
        const q = searchQuery.toLowerCase()
        if (q.startsWith('from:')) {
          const name = q.slice(5).trim()
          return m.author?.username?.toLowerCase().includes(name)
        }
        if (q === 'has:link') return m.content.includes('http')
        if (q === 'has:image') return m.content.match(/\.(jpg|jpeg|png|gif|webp)/i)
        return m.content.toLowerCase().includes(q)
      })
    : []

  function formatTime(ts: number) {
    return new Date(ts).toLocaleString('tr-TR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'search' ? styles.tabActive : ''}`} onClick={() => setTab('search')}>
            <Search size={14} /> Search
          </button>
          <button className={`${styles.tab} ${tab === 'pinned' ? styles.tabActive : ''}`} onClick={() => setTab('pinned')}>
            <Pin size={14} /> Pinned
          </button>
          <button className={`${styles.tab} ${tab === 'saved' ? styles.tabActive : ''}`} onClick={() => setTab('saved')}>
            <Bookmark size={14} /> Saved
          </button>
        </div>
        <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
      </div>

      <div className={styles.body}>
        {tab === 'search' && (
          <>
            <div className={styles.searchWrap}>
              <Search size={16} className={styles.searchIcon} />
              <input className={styles.searchInput} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search messages..." autoFocus />
            </div>
            <div className={styles.searchHints}>
              <span className={styles.hint}>from:username</span>
              <span className={styles.hint}>has:link</span>
              <span className={styles.hint}>has:image</span>
            </div>
            {searchQuery.length >= 2 && (
              <div className={styles.resultCount}>{searchResults.length} results</div>
            )}
            {searchResults.map(msg => (
              <div key={msg.id} className={styles.msgItem}>
                <div className={styles.msgAvatar} style={{ background: msg.author?.avatarColor ?? '#555' }}>
                  {msg.author?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className={styles.msgContent}>
                  <div className={styles.msgMeta}>
                    <span className={styles.msgAuthor}>{msg.author?.username}</span>
                    <span className={styles.msgTime}>{formatTime(msg.createdAt)}</span>
                  </div>
                  <div className={styles.msgText}>{msg.content}</div>
                </div>
                <button className={styles.saveBtn} onClick={() => saveMessage(msg)} title="Save">
                  <Bookmark size={14} />
                </button>
              </div>
            ))}
          </>
        )}

        {tab === 'pinned' && (
          <>
            <div className={styles.sectionTitle}>Pinned Messages</div>
            {pinnedMessages.length === 0 && (
              <div className={styles.emptyMsg}>This channel doesn't have any pinned messages... yet.</div>
            )}
            {pinnedMessages.map(msg => (
              <div key={msg.id} className={styles.msgItem}>
                <div className={styles.msgAvatar} style={{ background: msg.author?.avatarColor ?? '#555' }}>
                  {msg.author?.username?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className={styles.msgContent}>
                  <div className={styles.msgMeta}>
                    <span className={styles.msgAuthor}>{msg.author?.username}</span>
                    <span className={styles.msgTime}>{formatTime(msg.createdAt)}</span>
                  </div>
                  <div className={styles.msgText}>{msg.content}</div>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'saved' && (
          <>
            <div className={styles.sectionTitle}>Saved Messages</div>
            {savedMessages.length === 0 && (
              <div className={styles.emptyMsg}>You don't have any saved messages yet. Right-click or use the bookmark icon to save messages.</div>
            )}
            {savedMessages.map(msg => (
              <div key={msg.id} className={styles.msgItem}>
                <div className={styles.msgAvatar} style={{ background: msg.authorColor ?? '#555' }}>
                  {msg.authorName?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className={styles.msgContent}>
                  <div className={styles.msgMeta}>
                    <span className={styles.msgAuthor}>{msg.authorName}</span>
                    <span className={styles.msgTime}>{formatTime(msg.savedAt)}</span>
                  </div>
                  <div className={styles.msgText}>{msg.content}</div>
                </div>
                <button className={styles.unsaveBtn} onClick={() => unsaveMessage(msg.id)} title="Unsave">
                  <X size={14} />
                </button>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
