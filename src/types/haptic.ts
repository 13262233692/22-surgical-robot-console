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

export interface FilteredForceFeedback {
  timestamp: number
  filteredForce: Position3D
  filteredTorque: Position3D
  rawForce: Position3D
  rawTorque: Position3D
  collisionDetected: boolean
  collisionIntensity: number
  isInterpolated: boolean
  innovation: number
}

export interface NetworkSimulationConfig {
  enabled: boolean
  baseLatencyMs: number
  jitterMs: number
  packetLossRate: number
  burstLossEnabled: boolean
  burstLossProbability: number
  burstLossDurationMs: number
}

export interface FilterStats {
  kalmanActive: boolean
  interpolationActive: boolean
  interpolationRate: number
  bufferFillLevel: number
  innovationMagnitude: number
  jitterReductionDb: number
  predictedFrames: number
}

export type SafetyLevel = 'safe' | 'warning' | 'critical' | 'exceeded'

export interface TissueSafetyState {
  currentTissueType: string
  safetyEnabled: boolean
  safetyOverride: boolean
  safetyLevel: SafetyLevel
  forceUtilization: number
  torqueUtilization: number
  maxUtilization: number
  wasClamped: boolean
  clampRatio: number
  clampingEventCount: number
  maxForceN: number
  maxTorqueNm: number
  warningThresholdPct: number
  criticalThresholdPct: number
}

export interface HapticState {
  sampleRateHz: number
  deviceConnected: boolean
  calibrated: boolean
  currentPosition: Position3D
  currentGripOpenness: number
  positionHistory: HapticInputFrame[]
  forceFeedback: ForceFeedbackFrame | null
  filteredForceFeedback: FilteredForceFeedback | null
  forceHistory: ForceFeedbackFrame[]
  filteredForceHistory: FilteredForceFeedback[]
  wsConnected: boolean
  wsUrl: string
  latencyMs: number
  collisionAlert: boolean
  networkSim: NetworkSimulationConfig
  filterStats: FilterStats
  filterEnabled: boolean
  tissueSafety: TissueSafetyState
}
