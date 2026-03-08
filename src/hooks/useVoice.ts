import { useEffect, useRef, useState, useCallback } from 'react'
import {
  Room,
  RoomEvent,
  LocalParticipant,
  RemoteParticipant,
  Track,
  createLocalAudioTrack,
} from 'livekit-client'
import { supabase } from '../lib/supabase'

interface VoiceParticipant {
  identity: string
  username: string
  speaking: boolean
  muted: boolean
}

export function useVoice() {
  const roomRef = useRef<Room | null>(null)
  const [connected, setConnected] = useState(false)
  const [participants, setParticipants] = useState<VoiceParticipant[]>([])
  const [muted, setMuted] = useState(false)
  const [currentChannel, setCurrentChannel] = useState<string | null>(null)

  const updateParticipants = useCallback((room: Room) => {
    const parts: VoiceParticipant[] = []

    const addPart = (p: LocalParticipant | RemoteParticipant) => {
        let isMuted = true
      p.trackPublications.forEach(pub => {
        if (pub.kind === Track.Kind.Audio) isMuted = pub.isMuted
      })
      parts.push({
        identity: p.identity,
        username: p.identity,
        speaking: p.isSpeaking,
        muted: isMuted,
      })
    }

    addPart(room.localParticipant)
    room.remoteParticipants.forEach(addPart)
    setParticipants(parts)
  }, [])

  async function joinChannel(channelId: string, channelName: string) {
    if (roomRef.current) await leaveChannel()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const res = await fetch('/api/livekit-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ room: channelId }),
    })
    const { token } = await res.json()

    const room = new Room()
    roomRef.current = room

    room.on(RoomEvent.ParticipantConnected, () => updateParticipants(room))
    room.on(RoomEvent.ParticipantDisconnected, () => updateParticipants(room))
    room.on(RoomEvent.ActiveSpeakersChanged, () => updateParticipants(room))
    room.on(RoomEvent.TrackMuted, () => updateParticipants(room))
    room.on(RoomEvent.TrackUnmuted, () => updateParticipants(room))
    room.on(RoomEvent.Disconnected, () => {
      setConnected(false)
      setParticipants([])
      setCurrentChannel(null)
    })

    await room.connect(import.meta.env.VITE_LIVEKIT_URL, token)
    const audioTrack = await createLocalAudioTrack()
    await room.localParticipant.publishTrack(audioTrack)

    setConnected(true)
    setCurrentChannel(channelName)
    updateParticipants(room)
  }

  async function leaveChannel() {
    await roomRef.current?.disconnect()
    roomRef.current = null
    setConnected(false)
    setParticipants([])
    setCurrentChannel(null)
  }

  function toggleMute() {
    if (!roomRef.current) return
    const local = roomRef.current.localParticipant
    let audioTrack: import('livekit-client').LocalTrackPublication | undefined
    local.trackPublications.forEach(pub => {
      if (pub.kind === Track.Kind.Audio) audioTrack = pub
    })
    if (!audioTrack) return
    if (muted) { audioTrack.unmute(); setMuted(false) }
    else { audioTrack.mute(); setMuted(true) }
  }

  useEffect(() => {
    return () => { roomRef.current?.disconnect() }
  }, [])

  return { connected, participants, muted, currentChannel, joinChannel, leaveChannel, toggleMute }
}
