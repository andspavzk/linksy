import type { VercelRequest, VercelResponse } from '@vercel/node'
import { AccessToken } from 'livekit-server-sdk'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' })

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return res.status(401).json({ error: 'Invalid token' })

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, tag')
    .eq('id', user.id)
    .single()

  const { room } = req.body as { room: string }
  if (!room) return res.status(400).json({ error: 'room required' })

  const at = new AccessToken(
    process.env.VITE_LIVEKIT_API_KEY!,
    process.env.VITE_LIVEKIT_API_SECRET!,
    { identity: user.id, name: profile?.username ?? user.email ?? 'Kullanıcı' }
  )
  at.addGrant({ roomJoin: true, room, canPublish: true, canSubscribe: true })

  return res.json({ token: await at.toJwt() })
}
