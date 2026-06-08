import { defineStore } from 'pinia'
import type { Position3D, HapticInputFrame, ForceFeedbackFrame, HapticState } from '@/types/haptic'

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
    forceHistory: [],
    wsConnected: false,
    wsUrl: 'ws://localhost:8765/haptic',
    latencyMs: 0,
    collisionAlert: false,
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
  },
})
