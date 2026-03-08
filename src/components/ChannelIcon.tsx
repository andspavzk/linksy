import { MessageSquare, Volume2, Megaphone, FileText, MessageCircle, Calendar, Image, Lock } from 'lucide-react'
import type { ChannelType } from '../types'

interface Props {
  type: ChannelType
  size?: number
  className?: string
}

export function ChannelIcon({ type, size = 16, className }: Props) {
  const props = { size, className, strokeWidth: 1.8 }
  switch (type) {
    case 'voice': return <Volume2 {...props} />
    case 'announcement': return <Megaphone {...props} />
    case 'docs': return <FileText {...props} />
    case 'forum': return <MessageCircle {...props} />
    case 'calendar': return <Calendar {...props} />
    case 'media': return <Image {...props} />
    case 'locked': return <Lock {...props} />
    default: return <MessageSquare {...props} />
  }
}
