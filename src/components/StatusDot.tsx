import type { UserStatus } from '../types'
import styles from './StatusDot.module.css'
import clsx from 'clsx'

export function StatusDot({ status }: { status: UserStatus }) {
  return <span className={clsx(styles.dot, styles[status])} />
}
