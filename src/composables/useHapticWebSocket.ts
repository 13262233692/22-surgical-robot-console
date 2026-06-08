import { ref, onUnmounted } from 'vue'
import { useHapticStore } from '@/stores/haptic'
import { useSystemStore } from '@/stores/system'
import type { HapticInputFrame, ForceFeedbackFrame } from '@/types/haptic'

export function useHapticWebSocket() {
  const hapticStore = useHapticStore()
  const systemStore = useSystemStore()
  let simulationInterval = 0
  let latencyInterval = 0
  const sampleRate = 500
  const intervalMs = 1000 / sampleRate

  function startSimulation() {
    hapticStore.setDeviceConnected(true)
    hapticStore.setCalibrated(true)
    hapticStore.setWsConnected(true)
    systemStore.addLog('info', 'HAPTIC', '触觉手柄已连接，校准完成')
    systemStore.addLog('info', 'WEBSOCKET', `WebSocket已连接: ${hapticStore.wsUrl}`)

    const startTime = Date.now()
    let frameCount = 0

    simulationInterval = window.setInterval(() => {
      const t = Date.now() - startTime
      frameCount++

      const positionFrame: HapticInputFrame = {
        timestamp: Date.now(),
        position: {
          x: Math.sin(t * 0.002) * 120 + Math.sin(t * 0.005) * 30,
          y: Math.cos(t * 0.003) * 80 + Math.cos(t * 0.007) * 20,
          z: Math.sin(t * 0.001) * 50 + 200,
        },
        gripOpenness: (Math.sin(t * 0.004) * 0.5 + 0.5) * 100,
        quaternion: {
          w: Math.cos(t * 0.001),
          x: Math.sin(t * 0.001) * 0.3,
          y: Math.cos(t * 0.002) * 0.2,
          z: Math.sin(t * 0.002) * 0.1,
        },
      }
      hapticStore.updatePosition(positionFrame)

      if (frameCount % 5 === 0) {
        const collisionDetected = Math.random() < 0.03
        const collisionIntensity = collisionDetected
          ? Math.random() * 0.8 + 0.2
          : 0

        const forceFrame: ForceFeedbackFrame = {
          timestamp: Date.now(),
          force: {
            x: Math.sin(t * 0.003) * 5 + (collisionDetected ? Math.random() * 20 : 0),
            y: Math.cos(t * 0.002) * 3 + (collisionDetected ? Math.random() * 15 : 0),
            z: Math.sin(t * 0.001) * 8 + (collisionDetected ? Math.random() * 25 : 0),
          },
          torque: {
            x: Math.sin(t * 0.004) * 2 + (collisionDetected ? Math.random() * 10 : 0),
            y: Math.cos(t * 0.003) * 1.5 + (collisionDetected ? Math.random() * 8 : 0),
            z: Math.sin(t * 0.002) * 1 + (collisionDetected ? Math.random() * 5 : 0),
          },
          collisionDetected,
          collisionIntensity,
        }
        hapticStore.updateForceFeedback(forceFrame)

        if (collisionDetected) {
          systemStore.addLog('warn', 'FORCE', `碰撞检测！强度: ${(collisionIntensity * 100).toFixed(0)}%`)
        }
      }
    }, intervalMs)

    latencyInterval = window.setInterval(() => {
      hapticStore.setLatency(2 + Math.random() * 3)
      systemStore.updateLatency(
        systemStore.webrtcLatencyMs,
        hapticStore.latencyMs
      )
    }, 500)
  }

  function stopSimulation() {
    clearInterval(simulationInterval)
    clearInterval(latencyInterval)
    hapticStore.setWsConnected(false)
    hapticStore.setDeviceConnected(false)
    systemStore.addLog('info', 'HAPTIC', '触觉手柄已断开')
    systemStore.addLog('info', 'WEBSOCKET', 'WebSocket已断开')
  }

  onUnmounted(() => {
    stopSimulation()
  })

  return {
    hapticStore,
    startSimulation,
    stopSimulation,
  }
}
