<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Eye } from 'lucide-vue-next'

const props = defineProps<{
  setLeftCanvas: (canvas: HTMLCanvasElement | null) => void
  setRightCanvas: (canvas: HTMLCanvasElement | null) => void
  leftActive: boolean
  rightActive: boolean
  sdpState: string
  iceState: string
}>()

const leftCanvas = ref<HTMLCanvasElement | null>(null)
const rightCanvas = ref<HTMLCanvasElement | null>(null)

onMounted(() => {
  if (leftCanvas.value) props.setLeftCanvas(leftCanvas.value)
  if (rightCanvas.value) props.setRightCanvas(rightCanvas.value)
})

onUnmounted(() => {
  props.setLeftCanvas(null)
  props.setRightCanvas(null)
})

const stateColor = (state: string) => {
  if (state === 'completed' || state === 'connected') return '#00F0FF'
  if (state === 'failed' || state === 'disconnected') return '#FF3B3B'
  return '#FFB800'
}
</script>

<template>
  <div class="flex gap-2 h-full">
    <div class="flex-1 flex flex-col bg-[#141A2A] rounded border border-[#1E2A3A] overflow-hidden">
      <div class="flex items-center justify-between px-3 py-1.5 bg-[#0D1320] border-b border-[#1E2A3A]">
        <div class="flex items-center gap-2">
          <Eye class="w-3.5 h-3.5 text-[#00F0FF]" />
          <span class="text-[11px] font-mono tracking-wider text-gray-300">LEFT EYE</span>
          <div class="w-1.5 h-1.5 rounded-full" :class="leftActive ? 'bg-[#00F0FF]' : 'bg-gray-600'" :style="leftActive ? { boxShadow: '0 0 4px #00F0FF' } : {}" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0A0E17] border border-[#1E2A3A]" :style="{ color: stateColor(sdpState) }">SDP:{{ sdpState }}</span>
          <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0A0E17] border border-[#1E2A3A]" :style="{ color: stateColor(iceState) }">ICE:{{ iceState }}</span>
        </div>
      </div>
      <div class="relative flex-1 bg-black">
        <canvas ref="leftCanvas" width="960" height="540" class="w-full h-full" />
        <div v-if="!leftActive" class="absolute inset-0 flex items-center justify-center bg-black/80">
          <div class="text-center">
            <div class="text-[#FF3B3B] text-sm font-mono tracking-widest animate-pulse">NO SIGNAL</div>
            <div class="text-gray-600 text-[10px] font-mono mt-1">AWAITING WEBRTC STREAM</div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 flex flex-col bg-[#141A2A] rounded border border-[#1E2A3A] overflow-hidden">
      <div class="flex items-center justify-between px-3 py-1.5 bg-[#0D1320] border-b border-[#1E2A3A]">
        <div class="flex items-center gap-2">
          <Eye class="w-3.5 h-3.5 text-[#00F0FF]" />
          <span class="text-[11px] font-mono tracking-wider text-gray-300">RIGHT EYE</span>
          <div class="w-1.5 h-1.5 rounded-full" :class="rightActive ? 'bg-[#00F0FF]' : 'bg-gray-600'" :style="rightActive ? { boxShadow: '0 0 4px #00F0FF' } : {}" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0A0E17] border border-[#1E2A3A]" :style="{ color: stateColor(sdpState) }">SDP:{{ sdpState }}</span>
          <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#0A0E17] border border-[#1E2A3A]" :style="{ color: stateColor(iceState) }">ICE:{{ iceState }}</span>
        </div>
      </div>
      <div class="relative flex-1 bg-black">
        <canvas ref="rightCanvas" width="960" height="540" class="w-full h-full" />
        <div v-if="!rightActive" class="absolute inset-0 flex items-center justify-center bg-black/80">
          <div class="text-center">
            <div class="text-[#FF3B3B] text-sm font-mono tracking-widest animate-pulse">NO SIGNAL</div>
            <div class="text-gray-600 text-[10px] font-mono mt-1">AWAITING WEBRTC STREAM</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
