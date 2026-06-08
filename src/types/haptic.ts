export interface Position3D {
  x: number
  y: number
  z: number
}

export interface Quaternion {
  w: number
  x: number
  y: number
  z: number
}

export interface HapticInputFrame {
  timestamp: number
  position: Position3D
  gripOpenness: number
  quaternion: Quaternion
}

export interface ForceFeedbackFrame {
  timestamp: number
  force: Position3D
  torque: Position3D
  collisionDetected: boolean
  collisionIntensity: number
}

export interface HapticState {
  sampleRateHz: number
  deviceConnected: boolean
  calibrated: boolean
  currentPosition: Position3D
  currentGripOpenness: number
  positionHistory: HapticInputFrame[]
  forceFeedback: ForceFeedbackFrame | null
  forceHistory: ForceFeedbackFrame[]
  wsConnected: boolean
  wsUrl: string
  latencyMs: number
  collisionAlert: boolean
}
