import { useState, useEffect } from 'react'
import styles from './ChatLayout.module.css'
import { Rail } from './Rail'
import { Sidebar } from './Sidebar'
import { ChatMain } from './ChatMain'
import { MembersPanel } from './MembersPanel'
import { ServerSettingsModal } from './ServerSettingsModal'
import { DmPanel } from './DmPanel'
import { DmChat } from './DmChat'
import { useDm } from '../context/DmContext'

export function ChatLayout() {
  const { isDmMode } = useDm()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  return (
    <>
      <div className={styles.layout}>
        <Rail />
        {isDmMode ? (
          <>
            <aside style={isMobile ? {
              position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 200,
              width: 280, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform .25s cubic-bezier(.2,0,0,1)',
              boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,.5)' : 'none',
            } : undefined}>
              <DmPanel />
            </aside>
            <DmChat />
          </>
        ) : (
          <>
            <aside style={isMobile ? {
              position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 200,
              width: 280, transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
              transition: 'transform .25s cubic-bezier(.2,0,0,1)',
              boxShadow: sidebarOpen ? '4px 0 24px rgba(0,0,0,.5)' : 'none',
            } : undefined}>
              <Sidebar />
            </aside>
            <ChatMain onMenuClick={() => setSidebarOpen(true)} isMobile={isMobile} />
            <MembersPanel />
          </>
        )}
      </div>

      {isMobile && sidebarOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)',
          zIndex: 199,
        }} onClick={() => setSidebarOpen(false)} />
      )}

      <ServerSettingsModal />
    </>
  )
}
