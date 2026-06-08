import { ref, onUnmounted } from 'vue'
import { useWebRTCStore } from '@/stores/webrtc'
import { useSystemStore } from '@/stores/system'

export function useWebRTC() {
  const store = useWebRTCStore()
  const systemStore = useSystemStore()
  const leftVideoRef = ref<HTMLCanvasElement | null>(null)
  const rightVideoRef = ref<HTMLCanvasElement | null>(null)
  let leftAnimFrame = 0
  let rightAnimFrame = 0
  let statsInterval = 0

  function drawTestPattern(canvas: HTMLCanvasElement, side: 'left' | 'right', time: number) {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const w = canvas.width
    const h = canvas.height

    const gradient = ctx.createLinearGradient(0, 0, w, h)
    if (side === 'left') {
      gradient.addColorStop(0, '#0a1628')
      gradient.addColorStop(1, '#0d2137')
    } else {
      gradient.addColorStop(0, '#0d2137')
      gradient.addColorStop(1, '#0a1628')
    }
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)'
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()
    }

    const cx = w / 2
    const cy = h / 2
    const pulseScale = 1 + Math.sin(time * 0.002) * 0.05
    ctx.beginPath()
    ctx.arc(cx, cy, 60 * pulseScale, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)'
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(cx, cy, 30 * pulseScale, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()

    const crossSize = 80 * pulseScale
    ctx.beginPath()
    ctx.moveTo(cx - crossSize, cy)
    ctx.lineTo(cx + crossSize, cy)
    ctx.moveTo(cx, cy - crossSize)
    ctx.lineTo(cx, cy + crossSize)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)'
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.font = '14px JetBrains Mono, monospace'
    ctx.fillStyle = 'rgba(0, 240, 255, 0.8)'
    ctx.textAlign = 'left'
    ctx.fillText(`${side.toUpperCase()} EYE — 4K`, 16, 28)
    ctx.fillStyle = 'rgba(0, 240, 255, 0.5)'
    ctx.fillText(`3840×2160 @ 60fps`, 16, 48)
    ctx.fillText(`H.265 | ${(12 + Math.sin(time * 0.001) * 2).toFixed(1)} Mbps`, 16, 68)

    const scanY = (time * 0.1) % h
    ctx.beginPath()
    ctx.moveTo(0, scanY)
    ctx.lineTo(w, scanY)
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)'
    ctx.lineWidth = 2
    ctx.stroke()

    const noiseCount = 8
    for (let i = 0; i < noiseCount; i++) {
      const nx = Math.random() * w
      const ny = Math.random() * h
      const nw = Math.random() * 20 + 5
      ctx.fillStyle = `rgba(0, 240, 255, ${Math.random() * 0.08})`
      ctx.fillRect(nx, ny, nw, 1)
    }
  }

  function animateLeft(time: number) {
    if (leftVideoRef.value) {
      drawTestPattern(leftVideoRef.value, 'left', time)
    }
    leftAnimFrame = requestAnimationFrame(animateLeft)
  }

  function animateRight(time: number) {
    if (rightVideoRef.value) {
      drawTestPattern(rightVideoRef.value, 'right', time)
    }
    rightAnimFrame = requestAnimationFrame(animateRight)
  }

  function startSimulation() {
    store.updateConnection({ connectionState: 'connecting', sdpState: 'creating-offer' })
    systemStore.addLog('info', 'WEBRTC', '正在发起WebRTC连接...')

    setTimeout(() => {
      store.updateConnection({ sdpState: 'waiting-answer' })
      systemStore.addLog('info', 'WEBRTC', 'SDP Offer已发送，等待Answer...')
    }, 500)

    setTimeout(() => {
      store.updateConnection({ iceState: 'checking' })
      systemStore.addLog('info', 'WEBRTC', 'ICE候选收集中...')
    }, 1200)

    setTimeout(() => {
      store.updateConnection({
        connectionState: 'connected',
        iceState: 'connected',
        sdpState: 'completed',
      })
      store.updateStream('left', { isActive: true })
      store.updateStream('right', { isActive: true })
      systemStore.addLog('info', 'WEBRTC', 'WebRTC连接已建立，双目视频流就绪')
    }, 2000)

    leftAnimFrame = requestAnimationFrame(animateLeft)
    rightAnimFrame = requestAnimationFrame(animateRight)

    statsInterval = window.setInterval(() => {
      if (store.connection.connectionState === 'connected') {
        store.updateConnection({
          bitrate: 12 + Math.sin(Date.now() * 0.001) * 2,
          packetsLost: store.connection.packetsLost + (Math.random() < 0.05 ? 1 : 0),
          jitter: 1 + Math.random() * 3,
          rtt: 18 + Math.random() * 12,
        })
        systemStore.updateLatency(
          store.connection.rtt,
          systemStore.wsLatencyMs
        )
        systemStore.updatePacketLoss(store.connection.packetsLost)
      }
    }, 1000)
  }

  function stopSimulation() {
    cancelAnimationFrame(leftAnimFrame)
    cancelAnimationFrame(rightAnimFrame)
    clearInterval(statsInterval)
    store.resetConnection()
    systemStore.addLog('info', 'WEBRTC', 'WebRTC连接已断开')
  }

  function setLeftCanvas(canvas: HTMLCanvasElement | null) {
    leftVideoRef.value = canvas
  }

  function setRightCanvas(canvas: HTMLCanvasElement | null) {
    rightVideoRef.value = canvas
  }

  onUnmounted(() => {
    stopSimulation()
  })

  return {
    store,
    startSimulation,
    stopSimulation,
    setLeftCanvas,
    setRightCanvas,
  }
}
