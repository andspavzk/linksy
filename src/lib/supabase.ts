import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          tag: string
          avatar_color: string
          status: 'online' | 'idle' | 'dnd' | 'offline'
          activity: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      servers: {
        Row: {
          id: string
          name: string
          initials: string
          color: string
          owner_id: string
          created_at: string
        }
      }
      channels: {
        Row: {
          id: string
          server_id: string
          name: string
          type: string
          category: string
          description: string | null
          position: number
          created_at: string
        }
      }
      messages: {
        Row: {
          id: string
          channel_id: string
          author_id: string
          content: string
          reply_to: string | null
          edited: boolean
          created_at: string
        }
        Insert: {
          channel_id: string
          author_id: string
          content: string
          reply_to?: string | null
        }
      }
    }
  }
}
