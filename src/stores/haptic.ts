import { defineStore } from 'pinia'
import type { Position3D, HapticInputFrame, ForceFeedbackFrame, FilteredForceFeedback, NetworkSimulationConfig, FilterStats, TissueSafetyState, HapticState } from '@/types/haptic'
import { TISSUE_PROFILES } from '@/types/tissue'

const MAX_HISTORY = 300

export const useHapticStore = defineStore('haptic', {
  state: (): HapticState => ({
    sampleRateHz: 500,
    deviceConnected: false,
    calibrated: false,
    currentPosition: { x: 0, y: 0, z: 0 },
    currentGripOpenness: 0,
    positionHistory: [],
    forceFeedback: null,
    filteredForceFeedback: null,
    forceHistory: [],
    filteredForceHistory: [],
    wsConnected: false,
    wsUrl: 'ws://localhost:8765/haptic',
    latencyMs: 0,
    collisionAlert: false,
    networkSim: {
      enabled: false,
      baseLatencyMs: 150,
      jitterMs: 30,
      packetLossRate: 0.15,
      burstLossEnabled: true,
      burstLossProbability: 0.05,
      burstLossDurationMs: 200,
    },
    filterStats: {
      kalmanActive: false,
      interpolationActive: false,
      interpolationRate: 0,
      bufferFillLevel: 0,
      innovationMagnitude: 0,
      jitterReductionDb: 0,
      predictedFrames: 0,
    },
    filterEnabled: true,
    tissueSafety: {
      currentTissueType: 'hepatic_parenchyma',
      safetyEnabled: true,
      safetyOverride: false,
      safetyLevel: 'safe',
      forceUtilization: 0,
      torqueUtilization: 0,
      maxUtilization: 0,
      wasClamped: false,
      clampRatio: 1,
      clampingEventCount: 0,
      maxForceN: TISSUE_PROFILES.hepatic_parenchyma.maxForceN,
      maxTorqueNm: TISSUE_PROFILES.hepatic_parenchyma.maxTorqueNm,
      warningThresholdPct: TISSUE_PROFILES.hepatic_parenchyma.warningThresholdPct,
      criticalThresholdPct: TISSUE_PROFILES.hepatic_parenchyma.criticalThresholdPct,
    },
  }),
  actions: {
    updatePosition(frame: HapticInputFrame) {
      this.currentPosition = { ...frame.position }
      this.currentGripOpenness = frame.gripOpenness
      this.positionHistory.push(frame)
      if (this.positionHistory.length > MAX_HISTORY) {
        this.positionHistory.shift()
      }
    },
    updateForceFeedback(frame: ForceFeedbackFrame) {
      this.forceFeedback = frame
      this.forceHistory.push(frame)
      if (this.forceHistory.length > MAX_HISTORY) {
        this.forceHistory.shift()
      }
      this.collisionAlert = frame.collisionDetected
    },
    updateFilteredForceFeedback(filtered: FilteredForceFeedback) {
      this.filteredForceFeedback = filtered
      this.filteredForceHistory.push(filtered)
      if (this.filteredForceHistory.length > MAX_HISTORY) {
        this.filteredForceHistory.shift()
      }
    },
    updateFilterStats(stats: Partial<FilterStats>) {
      Object.assign(this.filterStats, stats)
    },
    updateNetworkSim(config: Partial<NetworkSimulationConfig>) {
      Object.assign(this.networkSim, config)
    },
    setFilterEnabled(enabled: boolean) {
      this.filterEnabled = enabled
    },
    setWsConnected(connected: boolean) {
      this.wsConnected = connected
    },
    setDeviceConnected(connected: boolean) {
      this.deviceConnected = connected
    },
    setCalibrated(calibrated: boolean) {
      this.calibrated = calibrated
    },
    setWsUrl(url: string) {
      this.wsUrl = url
    },
    setLatency(ms: number) {
      this.latencyMs = ms
    },
    clearAlert() {
      this.collisionAlert = false
    },
    updateTissueSafety(partial: Partial<TissueSafetyState>) {
      Object.assign(this.tissueSafety, partial)
    },
    setTissueType(type: string) {
      const profile = TISSUE_PROFILES[type as keyof typeof TISSUE_PROFILES]
      if (profile) {
        this.tissueSafety.currentTissueType = type
        this.tissueSafety.maxForceN = profile.maxForceN
        this.tissueSafety.maxTorqueNm = profile.maxTorqueNm
        this.tissueSafety.warningThresholdPct = profile.warningThresholdPct
        this.tissueSafety.criticalThresholdPct = profile.criticalThresholdPct
      }
    },
    setSafetyEnabled(enabled: boolean) {
      this.tissueSafety.safetyEnabled = enabled
    },
    setSafetyOverride(override: boolean) {
      this.tissueSafety.safetyOverride = override
    },
  },
})
