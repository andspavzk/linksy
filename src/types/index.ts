export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline'
export type ChannelType = 'text' | 'voice' | 'announcement' | 'forum' | 'calendar' | 'media' | 'docs' | 'locked'
export type MessageType = 'text' | 'system' | 'thread'

export interface User {
  id: string
  username: string
  tag: string
  avatar: string
  avatarColor: string
  status: UserStatus
  activity?: string
  role?: string
  roleColor?: string
  isBot?: boolean
}

export interface Message {
  id: string
  author: User
  content: string
  timestamp: Date
  type: MessageType
  replyTo?: Message
  reactions?: Reaction[]
  embed?: Embed
  thread?: Thread
  edited?: boolean
}

export interface Reaction {
  emoji: string
  count: number
  mine: boolean
}

export interface Embed {
  site: string
  siteColor?: string
  title: string
  description: string
  url?: string
  footer?: string
  accentColor?: string
  tag?: { label: string; color: string }
}

export interface Thread {
  id: string
  title: string
  messages: Message[]
  replyCount: number
}

export interface Channel {
  id: string
  name: string
  type: ChannelType
  categoryId: string
  unread?: number
  isNew?: boolean
  description?: string
  activeUsers?: number
}

export interface Category {
  id: string
  name: string
  collapsed?: boolean
}

export interface Server {
  id: string
  name: string
  initials: string
  color: string
  categories: Category[]
  channels: Channel[]
  members: ServerMember[]
}

export interface ServerMember {
  user: User
  roleGroup: string
}

export interface VoiceState {
  connected: boolean
  channelId: string | null
  channelName: string | null
  participants: User[]
  muted: boolean
  deafened: boolean
  speaking: string[]
}
