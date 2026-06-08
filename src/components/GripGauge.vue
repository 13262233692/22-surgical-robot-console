<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

const props = defineProps<{ value: number }>()
const canvasRef = ref<HTMLCanvasElement | null>(null)

function draw() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  const cx = w / 2
  const cy = h - 20
  const radius = 70

  ctx.beginPath()
  ctx.arc(cx, cy, radius, Math.PI, 0, false)
  ctx.strokeStyle = '#1E2A3A'
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.stroke()

  const angle = Math.PI + (props.value / 100) * Math.PI
  const gradient = ctx.createLinearGradient(cx - radius, cy, cx + radius, cy)
  gradient.addColorStop(0, '#00F0FF')
  gradient.addColorStop(1, '#0080FF')
  ctx.beginPath()
  ctx.arc(cx, cy, radius, Math.PI, angle, false)
  ctx.strokeStyle = gradient
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.stroke()

  const needleAngle = Math.PI + (props.value / 100) * Math.PI
  const needleLen = radius - 20
  const nx = cx + Math.cos(needleAngle) * needleLen
  const ny = cy + Math.sin(needleAngle) * needleLen
  ctx.beginPath()
  ctx.moveTo(cx, cy)
  ctx.lineTo(nx, ny)
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, 4, 0, Math.PI * 2)
  ctx.fillStyle = '#00F0FF'
  ctx.fill()

  ctx.font = 'bold 22px JetBrains Mono, monospace'
  ctx.fillStyle = '#00F0FF'
  ctx.textAlign = 'center'
  ctx.fillText(`${props.value.toFixed(0)}%`, cx, cy - 20)

  ctx.font = '9px JetBrains Mono, monospace'
  ctx.fillStyle = '#4A5568'
  ctx.fillText('GRIP OPENNESS', cx, cy + 4)

  ctx.font = '8px JetBrains Mono, monospace'
  ctx.fillStyle = '#4A5568'
  ctx.textAlign = 'left'
  ctx.fillText('0', cx - radius - 5, cy + 14)
  ctx.textAlign = 'right'
  ctx.fillText('100', cx + radius + 5, cy + 14)
}

watch(() => props.value, draw)
onMounted(draw)
</script>

<template>
  <div class="flex justify-center">
    <canvas ref="canvasRef" width="200" height="120" />
  </div>
</template>
