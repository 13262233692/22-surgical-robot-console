<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { HapticInputFrame } from '@/types/haptic'

const props = defineProps<{
  position: { x: number; y: number; z: number }
  history: HapticInputFrame[]
}>()

const xCanvas = ref<HTMLCanvasElement | null>(null)
const yCanvas = ref<HTMLCanvasElement | null>(null)
const zCanvas = ref<HTMLCanvasElement | null>(null)

function drawSparkline(canvas: HTMLCanvasElement | null, data: number[], color: string, min: number, max: number) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const w = canvas.width
  const h = canvas.height
  ctx.clearRect(0, 0, w, h)

  if (data.length < 2) return

  const range = max - min || 1
  ctx.beginPath()
  for (let i = 0; i < data.length; i++) {
    const x = (i / (data.length - 1)) * w
    const y = h - ((data[i] - min) / range) * h
    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }
  ctx.strokeStyle = color
  ctx.lineWidth = 1.5
  ctx.stroke()

  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, color.replace(')', ',0.15)').replace('rgb', 'rgba'))
  gradient.addColorStop(1, 'transparent')
  ctx.lineTo(w, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  ctx.fillStyle = gradient
  ctx.fill()
}

function draw() {
  const last100 = props.history.slice(-100)
  const xs = last100.map(f => f.position.x)
  const ys = last100.map(f => f.position.y)
  const zs = last100.map(f => f.position.z)

  const allVals = [...xs, ...ys, ...zs]
  const min = Math.min(...allVals) - 10
  const max = Math.max(...allVals) + 10

  drawSparkline(xCanvas.value, xs, '#00F0FF', min, max)
  drawSparkline(yCanvas.value, ys, '#00FF88', min, max)
  drawSparkline(zCanvas.value, zs, '#FF8800', min, max)
}

watch(() => props.history.length, draw)
onMounted(draw)
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center gap-3">
      <span class="text-[10px] font-mono text-[#00F0FF] w-3">X</span>
      <span class="text-sm font-mono text-[#00F0FF] w-20 text-right">{{ position.x.toFixed(2) }}</span>
      <canvas ref="xCanvas" width="120" height="30" class="flex-1" />
    </div>
    <div class="flex items-center gap-3">
      <span class="text-[10px] font-mono text-[#00FF88] w-3">Y</span>
      <span class="text-sm font-mono text-[#00FF88] w-20 text-right">{{ position.y.toFixed(2) }}</span>
      <canvas ref="yCanvas" width="120" height="30" class="flex-1" />
    </div>
    <div class="flex items-center gap-3">
      <span class="text-[10px] font-mono text-[#FF8800] w-3">Z</span>
      <span class="text-sm font-mono text-[#FF8800] w-20 text-right">{{ position.z.toFixed(2) }}</span>
      <canvas ref="zCanvas" width="120" height="30" class="flex-1" />
    </div>
  </div>
</template>
