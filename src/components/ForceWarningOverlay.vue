<script setup lang="ts">
import { computed } from 'vue'
import type { TissueSafetyState } from '@/types/haptic'
import type { TissueProfile } from '@/types/tissue'
import { TISSUE_PROFILES } from '@/types/tissue'
import { AlertOctagon, ShieldAlert, AlertTriangle } from 'lucide-vue-next'

const props = defineProps<{
  safety: TissueSafetyState
  visible: boolean
}>()

const tissueProfile = computed<TissueProfile>(() => {
  const profile = TISSUE_PROFILES[props.safety.currentTissueType as keyof typeof TISSUE_PROFILES]
  return profile ?? TISSUE_PROFILES.hepatic_parenchyma
})

const safetyColor = computed(() => {
  switch (props.safety.safetyLevel) {
    case 'exceeded': return '#FF3B3B'
    case 'critical': return '#FF6B00'
    case 'warning': return '#FFB800'
    default: return '#00F0FF'
  }
})

const utilizationPct = computed(() => (props.safety.maxUtilization * 100).toFixed(0))

const warningText = computed(() => {
  if (props.safety.safetyLevel === 'exceeded') {
    return props.safety.wasClamped && !props.safety.safetyOverride
      ? '施力过大 — 力矩已钳制至安全阈值'
      : '施力过大 — 安全覆写激活，力矩未钳制！'
  }
  if (props.safety.safetyLevel === 'critical') {
    return '施力接近临界阈值'
  }
  return ''
})

const showOverlay = computed(() => {
  return props.visible && (props.safety.safetyLevel === 'exceeded' || props.safety.safetyLevel === 'critical')
})
</script>

<template>
  <transition name="warning-overlay">
    <div
      v-if="showOverlay"
      class="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      <div
        class="absolute inset-0"
        :style="{
          backgroundColor: safetyColor,
          opacity: props.safety.safetyLevel === 'exceeded' ? 0.15 + Math.sin(Date.now() * 0.008) * 0.05 : 0.08,
        }"
      />

      <div
        class="absolute inset-x-0 top-0 h-2"
        :style="{
          background: `linear-gradient(180deg, ${safetyColor}40, transparent)`,
        }"
      />
      <div
        class="absolute inset-x-0 bottom-0 h-2"
        :style="{
          background: `linear-gradient(0deg, ${safetyColor}40, transparent)`,
        }"
      />

      <div
        class="absolute border-2 rounded-lg"
        :style="{
          inset: '8px',
          borderColor: `${safetyColor}60`,
          animation: props.safety.safetyLevel === 'exceeded' ? 'pulse-border 0.6s ease-in-out infinite' : 'none',
        }"
      />

      <div class="relative flex flex-col items-center gap-3 pointer-events-auto">
        <div
          class="flex items-center gap-3 px-8 py-4 rounded-lg border-2 backdrop-blur-sm"
          :style="{
            backgroundColor: `${safetyColor}20`,
            borderColor: safetyColor,
            boxShadow: `0 0 40px ${safetyColor}40`,
          }"
        >
          <AlertOctagon
            v-if="safety.safetyLevel === 'exceeded'"
            class="w-10 h-10"
            :style="{ color: safetyColor }"
            :class="{ 'animate-pulse': true }"
          />
          <AlertTriangle
            v-else
            class="w-8 h-8"
            :style="{ color: safetyColor }"
          />

          <div class="flex flex-col">
            <span
              class="text-lg font-mono font-bold tracking-wider"
              :style="{ color: safetyColor }"
            >
              {{ safety.safetyLevel === 'exceeded' ? '⚠ 施力过大预警' : '⚠ 施力接近临界' }}
            </span>
            <span class="text-xs font-mono text-gray-300 mt-0.5">
              {{ warningText }}
            </span>
          </div>
        </div>

        <div
          class="flex items-center gap-6 px-6 py-3 rounded-lg border backdrop-blur-sm bg-[#0A0E17]/80"
          :style="{ borderColor: `${safetyColor}40` }"
        >
          <div class="flex flex-col items-center">
            <span class="text-[9px] font-mono text-gray-500">组织类型</span>
            <span class="text-sm font-mono" :style="{ color: safetyColor }">{{ tissueProfile.labelCn }}</span>
          </div>
          <div class="w-px h-8 bg-[#1E2A3A]" />
          <div class="flex flex-col items-center">
            <span class="text-[9px] font-mono text-gray-500">力矩利用率</span>
            <span class="text-2xl font-mono font-bold" :style="{ color: safetyColor }">{{ utilizationPct }}%</span>
          </div>
          <div class="w-px h-8 bg-[#1E2A3A]" />
          <div class="flex flex-col items-center">
            <span class="text-[9px] font-mono text-gray-500">极限力矩</span>
            <span class="text-sm font-mono text-gray-300">{{ tissueProfile.maxForceN }}N / {{ tissueProfile.maxTorqueNm }}Nm</span>
          </div>
          <div class="w-px h-8 bg-[#1E2A3A]" />
          <div class="flex flex-col items-center">
            <span class="text-[9px] font-mono text-gray-500">钳制状态</span>
            <span
              class="text-sm font-mono"
              :class="safety.wasClamped ? 'text-[#00F0FF]' : 'text-gray-500'"
            >
              {{ safety.wasClamped ? `已钳制 (${(safety.clampRatio * 100).toFixed(0)}%)` : '未触发' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.warning-overlay-enter-active {
  transition: opacity 0.15s ease-out;
}
.warning-overlay-leave-active {
  transition: opacity 0.3s ease-in;
}
.warning-overlay-enter-from,
.warning-overlay-leave-to {
  opacity: 0;
}

@keyframes pulse-border {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
</style>
