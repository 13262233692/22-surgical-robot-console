import { defineStore } from 'pinia'
import type { LogEntry, SystemStatusState, LogLevel } from '@/types/system'

const MAX_LOGS = 200

export const useSystemStore = defineStore('system', {
  state: (): SystemStatusState => ({
    webrtcLatencyMs: 0,
    wsLatencyMs: 0,
    packetLoss: 0,
    uptime: 0,
    sessionActive: false,
    sessionId: '',
    emergencyStop: false,
    robotArmed: false,
    logs: [],
  }),
  actions: {
    addLog(level: LogLevel, source: string, message: string) {
      const entry: LogEntry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: Date.now(),
        level,
        source,
        message,
      }
      this.logs.push(entry)
      if (this.logs.length > MAX_LOGS) {
        this.logs.shift()
      }
    },
    startSession() {
      this.sessionActive = true
      this.sessionId = `SRG-${Date.now().toString(36).toUpperCase()}`
      this.uptime = 0
      this.addLog('info', 'SESSION', `手术会话已启动: ${this.sessionId}`)
    },
    stopSession() {
      this.sessionActive = false
      this.addLog('info', 'SESSION', `手术会话已结束: ${this.sessionId}`)
    },
    triggerEmergencyStop() {
      this.emergencyStop = true
      this.robotArmed = false
      this.addLog('critical', 'SAFETY', '紧急停止已触发')
    },
    releaseEmergencyStop() {
      this.emergencyStop = false
      this.addLog('warn', 'SAFETY', '紧急停止已解除')
    },
    armRobot() {
      if (!this.emergencyStop) {
        this.robotArmed = true
        this.addLog('info', 'ROBOT', '机械臂已使能')
      }
    },
    disarmRobot() {
      this.robotArmed = false
      this.addLog('info', 'ROBOT', '机械臂已失能')
    },
    updateUptime(ms: number) {
      this.uptime = ms
    },
    updateLatency(webrtc: number, ws: number) {
      this.webrtcLatencyMs = webrtc
      this.wsLatencyMs = ws
    },
    updatePacketLoss(loss: number) {
      this.packetLoss = loss
    },
  },
})
