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

  return (
    <>
      <div className={styles.layout}>
        <Rail />
        {isDmMode ? (
          <>
            <DmPanel />
            <DmChat />
          </>
        ) : (
          <>
            <Sidebar />
            <ChatMain />
            <MembersPanel />
          </>
        )}
      </div>
      <ServerSettingsModal />
    </>
  )
}
