import styles from './ChatLayout.module.css'
import { Rail } from './Rail'
import { Sidebar } from './Sidebar'
import { ChatMain } from './ChatMain'
import { MembersPanel } from './MembersPanel'

export function ChatLayout() {
  return (
    <div className={styles.layout}>
      <Rail />
      <Sidebar />
      <ChatMain />
      <MembersPanel />
    </div>
  )
}
