<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { FilteredForceFeedback } from '@/types/haptic'

const props = defineProps<{
  filteredData: FilteredForceFeedback | null
  filterEnabled: boolean
  isInterpolated: boolean
  jitterReductionDb: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

const AXES = ['Fx', 'Fy', 'Fz', 'Mx', 'My', 'Mz']
const MAX_FORCE = 25
const MAX_TORQUE = 10
const THRESHOLD = 0.7

function getValues(source: 'filtered' | 'raw'): number[] {
  const d = props.filteredData
  if (!d) return [0, 0, 0, 0, 0, 0]
  const force = source === 'filtered' ? d.filteredForce : d.rawForce
  const torque = source === 'filtered' ? d.filteredTorque : d.rawTorque
  return [
    Math.abs(force.x) / MAX_FORCE,
    Math.abs(force.y) / MAX_FORCE,
    Math.abs(force.z) / MAX_FORCE,
    Math.abs(torque.x) / MAX_TORQUE,
    Math.abs(torque.y) / MAX_TORQUE,
    Math.abs(torque.z) / MAX_TORQUE,
  ].map(v => Math.min(v, 1))
}

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h / 2 - 10
  const maxR = 100

  for (let ring = 1; ring <= 4; ring++) {
    const r = (ring / 4) * maxR
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / 6
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = '#1E2A3A'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 6
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR)
    ctx.strokeStyle = '#1E2A3A'
    ctx.lineWidth = 1
    ctx.stroke()
  }

  const thr = THRESHOLD * maxR
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 6
    const x = cx + Math.cos(angle) * thr
    const y = cy + Math.sin(angle) * thr
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.setLineDash([4, 4])
  ctx.strokeStyle = '#FFB800'
  ctx.lineWidth = 1
  ctx.stroke()
  ctx.setLineDash([])

  if (props.filterEnabled && props.filteredData) {
    const rawValues = getValues('raw')
    ctx.beginPath()
    for (let i = 0; i < 6; i++) {
      const angle = -Math.PI / 2 + (i * Math.PI * 2) / 6
      const r = rawValues[i] * maxR
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.fillStyle = 'rgba(255, 59, 59, 0.06)'
    ctx.fill()
    ctx.strokeStyle = 'rgba(255, 59, 59, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([3, 3])
    ctx.stroke()
    ctx.setLineDash([])
  }

  const filteredValues = getValues('filtered')
  const collisionDetected = props.filteredData?.collisionDetected ?? false
  const collisionIntensity = props.filteredData?.collisionIntensity ?? 0

  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 6
    const r = filteredValues[i] * maxR
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.closePath()

  const isInterp = props.isInterpolated && props.filterEnabled
  let fillColor: string
  let strokeColor: string
  if (collisionDetected) {
    fillColor = 'rgba(255, 59, 59, 0.2)'
    strokeColor = '#FF3B3B'
  } else if (isInterp) {
    fillColor = 'rgba(0, 176, 255, 0.15)'
    strokeColor = '#00B0FF'
  } else {
    fillColor = 'rgba(0, 240, 255, 0.2)'
    strokeColor = '#00F0FF'
  }
  ctx.fillStyle = fillColor
  ctx.fill()
  ctx.strokeStyle = strokeColor
  ctx.lineWidth = 2
  ctx.stroke()

  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 6
    const r = filteredValues[i] * maxR
    const x = cx + Math.cos(angle) * r
    const y = cy + Math.sin(angle) * r
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fillStyle = strokeColor
    ctx.fill()
  }

  for (let i = 0; i < 6; i++) {
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / 6
    const labelR = maxR + 18
    const lx = cx + Math.cos(angle) * labelR
    const ly = cy + Math.sin(angle) * labelR
    ctx.font = '10px JetBrains Mono, monospace'
    ctx.fillStyle = filteredValues[i] > THRESHOLD ? '#FFB800' : '#6B7280'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(AXES[i], lx, ly)
  }

  if (collisionDetected) {
    ctx.strokeStyle = `rgba(255, 59, 59, ${0.3 + Math.sin(Date.now() * 0.01) * 0.3})`
    ctx.lineWidth = 4
    ctx.strokeRect(2, 2, w - 4, h - 4)
  }

  if (collisionIntensity > 0) {
    const barY = h - 24
    const barW = w - 40
    const barH = 6
    ctx.fillStyle = '#0A0E17'
    ctx.fillRect(20, barY, barW, barH)
    const intensityW = collisionIntensity * barW
    const barGrad = ctx.createLinearGradient(20, 0, 20 + barW, 0)
    barGrad.addColorStop(0, '#00F0FF')
    barGrad.addColorStop(0.5, '#FFB800')
    barGrad.addColorStop(1, '#FF3B3B')
    ctx.fillStyle = barGrad
    ctx.fillRect(20, barY, intensityW, barH)
    ctx.font = '8px JetBrains Mono, monospace'
    ctx.fillStyle = '#6B7280'
    ctx.textAlign = 'left'
    ctx.fillText('COLLISION', 20, barY - 4)
  }

  if (props.filterEnabled) {
    ctx.font = '8px JetBrains Mono, monospace'
    ctx.textAlign = 'right'
    ctx.fillStyle = '#00F0FF'
    ctx.fillText(`KALMAN: ${props.jitterReductionDb.toFixed(1)}dB`, w - 12, h - 4)

    if (isInterp) {
      ctx.fillStyle = '#00B0FF'
      ctx.fillText('INTERP', w - 12, h - 16)
    }
  }
}

watch([() => props.filteredData, () => props.filterEnabled, () => props.isInterpolated], draw)
onMounted(draw)
</script>

<template>
  <div class="flex flex-col items-center">
    <canvas ref="canvasRef" width="280" height="280" />
  </div>
</template>
