export type LogLevel = 'info' | 'warn' | 'error' | 'critical'

export interface LogEntry {
  id: string
  timestamp: number
  level: LogLevel
  source: string
  message: string
}

export interface SystemStatusState {
  webrtcLatencyMs: number
  wsLatencyMs: number
  packetLoss: number
  uptime: number
  sessionActive: boolean
  sessionId: string
  emergencyStop: boolean
  robotArmed: boolean
  logs: LogEntry[]
}

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed'
