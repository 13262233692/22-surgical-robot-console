<script setup lang="ts">
import { computed } from 'vue'
import { useSystemStore } from '@/stores/system'
import { useWebRTCStore } from '@/stores/webrtc'
import { useHapticStore } from '@/stores/haptic'
import { Shield, ShieldAlert, Wifi, WifiOff, Radio, Activity } from 'lucide-vue-next'

const systemStore = useSystemStore()
const webrtcStore = useWebRTCStore()
const hapticStore = useHapticStore()

const uptimeFormatted = computed(() => {
  const total = Math.floor(systemStore.uptime / 1000)
  const h = String(Math.floor(total / 3600)).padStart(2, '0')
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
})

const webrtcColor = computed(() => {
  const s = webrtcStore.connection.connectionState
  if (s === 'connected') return '#00F0FF'
  if (s === 'connecting' || s === 'new') return '#FFB800'
  if (s === 'failed' || s === 'disconnected') return '#FF3B3B'
  return '#4A5568'
})

const wsColor = computed(() => hapticStore.wsConnected ? '#00F0FF' : '#FF3B3B')
</script>

<template>
  <div class="h-12 flex items-center px-4 bg-[#0A0E17] border-b border-[#1E2A3A] select-none shrink-0">
    <div class="flex items-center gap-3 mr-auto">
      <div class="flex items-center gap-1.5">
        <Radio class="w-4 h-4 text-[#00F0FF]" />
        <span class="text-xs font-mono text-[#00F0FF] tracking-wider">SURGICAL-ROBOT</span>
      </div>
      <div class="w-px h-5 bg-[#1E2A3A]" />
      <div v-if="systemStore.sessionActive" class="flex items-center gap-1.5">
        <span class="text-[10px] text-gray-500">SESSION</span>
        <span class="text-xs font-mono text-[#00F0FF]">{{ systemStore.sessionId }}</span>
      </div>
      <div class="w-px h-5 bg-[#1E2A3A]" />
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] text-gray-500">UPTIME</span>
        <span class="text-xs font-mono text-gray-300">{{ uptimeFormatted }}</span>
      </div>
    </div>

    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: webrtcColor, boxShadow: `0 0 6px ${webrtcColor}` }" />
        <span class="text-[10px] text-gray-400">WebRTC</span>
        <span class="text-xs font-mono" :style="{ color: webrtcColor }">{{ webrtcStore.connection.connectionState }}</span>
      </div>

      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: wsColor, boxShadow: `0 0 6px ${wsColor}` }" />
        <span class="text-[10px] text-gray-400">WS</span>
        <span class="text-xs font-mono" :style="{ color: wsColor }">{{ hapticStore.wsConnected ? 'connected' : 'disconnected' }}</span>
      </div>

      <div class="w-px h-5 bg-[#1E2A3A]" />

      <div class="flex items-center gap-1.5">
        <Activity class="w-3 h-3 text-gray-500" />
        <span class="text-[10px] text-gray-500">RTT</span>
        <span class="text-xs font-mono" :class="systemStore.webrtcLatencyMs > 80 ? 'text-[#FF3B3B]' : 'text-[#00F0FF]'">{{ systemStore.webrtcLatencyMs.toFixed(0) }}ms</span>
      </div>

      <div class="flex items-center gap-1.5">
        <span class="text-[10px] text-gray-500">WS</span>
        <span class="text-xs font-mono text-[#00F0FF]">{{ systemStore.wsLatencyMs.toFixed(1) }}ms</span>
      </div>

      <div class="flex items-center gap-1.5">
        <span class="text-[10px] text-gray-500">LOSS</span>
        <span class="text-xs font-mono" :class="systemStore.packetLoss > 10 ? 'text-[#FF3B3B]' : 'text-gray-300'">{{ systemStore.packetLoss }}</span>
      </div>

      <div class="w-px h-5 bg-[#1E2A3A]" />

      <div class="flex items-center gap-1.5">
        <Shield v-if="systemStore.robotArmed" class="w-3.5 h-3.5 text-[#00F0FF]" />
        <ShieldAlert v-else class="w-3.5 h-3.5 text-gray-500" />
        <span class="text-[10px]" :class="systemStore.robotArmed ? 'text-[#00F0FF]' : 'text-gray-500'">ARMED</span>
      </div>

      <button
        v-if="!systemStore.emergencyStop"
        class="px-3 py-1 text-[10px] font-bold tracking-wider bg-[#FF3B3B] hover:bg-[#FF5555] text-white rounded transition-colors"
        @click="systemStore.triggerEmergencyStop()"
      >
        E-STOP
      </button>
      <button
        v-else
        class="px-3 py-1 text-[10px] font-bold tracking-wider bg-[#FF3B3B] text-white rounded animate-pulse"
        @click="systemStore.releaseEmergencyStop()"
      >
        ⚠ E-STOP ACTIVE — CLICK TO RELEASE
      </button>
    </div>
  </div>
</template>
