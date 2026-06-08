import { ref, onUnmounted } from 'vue'
import { useWebRTC } from './useWebRTC'
import { useHapticWebSocket } from './useHapticWebSocket'
import { useSystemStore } from '@/stores/system'
import { useWebRTCStore } from '@/stores/webrtc'
import { useHapticStore } from '@/stores/haptic'

export function useSimulation() {
  const systemStore = useSystemStore()
  const webrtcStore = useWebRTCStore()
  const hapticStore = useHapticStore()
  const webrtc = useWebRTC()
  const haptic = useHapticWebSocket()
  const isRunning = ref(false)
  let uptimeInterval = 0

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    systemStore.startSession()
    webrtc.startSimulation()
    haptic.startSimulation()

    uptimeInterval = window.setInterval(() => {
      if (systemStore.sessionActive) {
        systemStore.updateUptime(systemStore.uptime + 1000)
      }
    }, 1000)
  }

  function stop() {
    if (!isRunning.value) return
    isRunning.value = false
    clearInterval(uptimeInterval)
    webrtc.stopSimulation()
    haptic.stopSimulation()
    systemStore.stopSession()
  }

  function emergencyStop() {
    systemStore.triggerEmergencyStop()
    stop()
  }

  function releaseEmergency() {
    systemStore.releaseEmergencyStop()
  }

  onUnmounted(() => {
    stop()
  })

  return {
    isRunning,
    start,
    stop,
    emergencyStop,
    releaseEmergency,
    webrtcStore,
    hapticStore,
    systemStore,
    setLeftCanvas: webrtc.setLeftCanvas,
    setRightCanvas: webrtc.setRightCanvas,
  }
}
