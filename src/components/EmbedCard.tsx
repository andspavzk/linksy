import type { Embed } from '../types'
import styles from './EmbedCard.module.css'

export function EmbedCard({ embed }: { embed: Embed }) {
  return (
    <div className={styles.embed} style={{ borderLeftColor: embed.accentColor ?? 'var(--accent)' }}>
      <div className={styles.site} style={{ color: embed.siteColor ?? 'var(--accent)' }}>
        {embed.site}
      </div>
      <div className={styles.title}>{embed.title}</div>
      <div className={styles.desc}>{embed.description}</div>
      {embed.footer && (
        <div className={styles.footer}>
          {embed.tag && (
            <span className={styles.tag} style={{ background: embed.tag.color + '22', color: embed.tag.color }}>
              {embed.tag.label}
            </span>
          )}
          {embed.footer}
        </div>
      )}
    </div>
  )
}
