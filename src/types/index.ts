export type UserStatus = 'online' | 'idle' | 'dnd' | 'offline'
export type ChannelType = 'text' | 'voice' | 'announcement' | 'forum' | 'calendar' | 'media' | 'docs' | 'locked'

export interface Profile {
  uid: string
  username: string
  tag: string
  avatarColor: string
  status: UserStatus
  activity: string | null
  email: string
  createdAt: number
}

export interface Server {
  id: string
  name: string
  initials: string
  color: string
  ownerId: string
  createdAt: number
}

export interface Category {
  id: string
  serverId: string
  name: string
  position: number
}

export interface Channel {
  id: string
  serverId: string
  categoryId: string | null
  name: string
  type: ChannelType
  description: string | null
  position: number
}

export interface Message {
  id: string
  channelId: string
  authorId: string
  content: string
  replyTo: string | null
  edited: boolean
  createdAt: number
  author?: Profile
}

export interface ServerMember {
  oderId: string
  role: 'Founder' | 'Moderator' | 'Member' | 'Bot'
  joinedAt: number
  profile?: Profile
}
