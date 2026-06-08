<script setup lang="ts">
import { ref, nextTick, watch } from 'vue'
import { useSystemStore } from '@/stores/system'
import { ScrollText, ChevronDown, ChevronUp } from 'lucide-vue-next'

const systemStore = useSystemStore()
const isExpanded = ref(true)
const logContainer = ref<HTMLDivElement | null>(null)

const levelColors: Record<string, string> = {
  info: '#00F0FF',
  warn: '#FFB800',
  error: '#FF3B3B',
  critical: '#FF3B3B',
}

const levelBg: Record<string, string> = {
  info: 'transparent',
  warn: 'transparent',
  error: 'transparent',
  critical: 'rgba(255, 59, 59, 0.1)',
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}.${String(d.getMilliseconds()).padStart(3, '0')}`
}

watch(() => systemStore.logs.length, async () => {
  if (isExpanded.value) {
    await nextTick()
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight
    }
  }
})
</script>

<template>
  <div class="flex flex-col bg-[#141A2A] rounded border border-[#1E2A3A] overflow-hidden">
    <button
      class="flex items-center justify-between px-3 py-1.5 bg-[#0D1320] border-b border-[#1E2A3A] cursor-pointer hover:bg-[#141A2A] transition-colors"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <ScrollText class="w-3.5 h-3.5 text-[#00F0FF]" />
        <span class="text-[11px] font-mono tracking-wider text-gray-300">SYSTEM LOG</span>
        <span class="text-[9px] font-mono text-gray-500">({{ systemStore.logs.length }})</span>
      </div>
      <ChevronDown v-if="!isExpanded" class="w-3.5 h-3.5 text-gray-500" />
      <ChevronUp v-else class="w-3.5 h-3.5 text-gray-500" />
    </button>

    <div
      v-if="isExpanded"
      ref="logContainer"
      class="overflow-y-auto font-mono text-[10px] leading-5"
      style="max-height: 200px"
    >
      <div
        v-for="log in systemStore.logs"
        :key="log.id"
        class="flex items-start gap-2 px-3 py-0.5 border-b border-[#0A0E17]/50"
        :style="{ backgroundColor: levelBg[log.level] }"
      >
        <span class="text-gray-600 shrink-0">{{ formatTime(log.timestamp) }}</span>
        <span
          class="shrink-0 px-1 rounded text-[8px] font-bold tracking-wider"
          :style="{ color: levelColors[log.level], backgroundColor: `${levelColors[log.level]}15` }"
        >
          {{ log.level.toUpperCase() }}
        </span>
        <span class="text-gray-500 shrink-0 w-16">{{ log.source }}</span>
        <span class="text-gray-300">{{ log.message }}</span>
      </div>
      <div v-if="systemStore.logs.length === 0" class="px-3 py-4 text-center text-gray-600">
        No logs yet
      </div>
    </div>
  </div>
</template>
