import { defineStore } from 'pinia'
import type { WebRTCFullState, WebRTCConnectionState, VideoStreamState } from '@/types/webrtc'

export const useWebRTCStore = defineStore('webrtc', {
  state: (): WebRTCFullState => ({
    connection: {
      connectionState: 'disconnected',
      iceState: 'new',
      sdpState: 'idle',
      bitrate: 0,
      packetsLost: 0,
      jitter: 0,
      rtt: 0,
    },
    leftStream: {
      streamType: 'left',
      resolution: '3840x2160',
      frameRate: 60,
      isActive: false,
      codec: 'H.265',
    },
    rightStream: {
      streamType: 'right',
      resolution: '3840x2160',
      frameRate: 60,
      isActive: false,
      codec: 'H.265',
    },
    signalingUrl: 'http://localhost:8080',
    iceStrategy: 'all',
  }),
  actions: {
    updateConnection(partial: Partial<WebRTCConnectionState>) {
      Object.assign(this.connection, partial)
    },
    updateStream(side: 'left' | 'right', partial: Partial<VideoStreamState>) {
      const stream = side === 'left' ? this.leftStream : this.rightStream
      Object.assign(stream, partial)
    },
    setSignalingUrl(url: string) {
      this.signalingUrl = url
    },
    setIceStrategy(strategy: 'all' | 'stun' | 'turn') {
      this.iceStrategy = strategy
    },
    resetConnection() {
      this.connection = {
        connectionState: 'disconnected',
        iceState: 'new',
        sdpState: 'idle',
        bitrate: 0,
        packetsLost: 0,
        jitter: 0,
        rtt: 0,
      }
      this.leftStream.isActive = false
      this.rightStream.isActive = false
    },
  },
})
