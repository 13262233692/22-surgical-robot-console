export interface SdpOffer {
  sdp: string
  type: 'offer'
  streamType: 'binocular-left' | 'binocular-right'
  sessionId: string
}

export interface SdpAnswer {
  sdp: string
  type: 'answer'
  sessionId: string
}

export interface IceCandidateMessage {
  candidate: string
  sdpMid: string
  sdpMLineIndex: number
  sessionId: string
}

export interface VideoStreamState {
  streamType: 'left' | 'right'
  resolution: string
  frameRate: number
  isActive: boolean
  codec: string
}

export interface WebRTCConnectionState {
  connectionState: RTCPeerConnectionState
  iceState: RTCIceConnectionState
  sdpState: 'idle' | 'creating-offer' | 'waiting-answer' | 'completed' | 'failed'
  bitrate: number
  packetsLost: number
  jitter: number
  rtt: number
}

export interface WebRTCFullState {
  connection: WebRTCConnectionState
  leftStream: VideoStreamState
  rightStream: VideoStreamState
  signalingUrl: string
  iceStrategy: 'all' | 'stun' | 'turn'
}
