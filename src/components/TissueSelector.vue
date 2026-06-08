<script setup lang="ts">
import { useHapticStore } from '@/stores/haptic'
import { TISSUE_PROFILES, TISSUE_LIST } from '@/types/tissue'
import type { TissueType } from '@/types/tissue'
import { Heart, Brain, Bone, ShieldCheck, ShieldOff, AlertTriangle } from 'lucide-vue-next'

const hapticStore = useHapticStore()

const tissueIcons: Record<string, string> = {
  vessel_anastomosis: '❤️‍🩹',
  cerebral_cortex: '🧠',
  cardiac_myocardium: '❤️',
  pulmonary_parenchyma: '🫁',
  hepatic_parenchyma: '🫀',
  intestinal_wall: '🫁',
  muscle_tissue: '💪',
  bone: '🦴',
}

function selectTissue(type: TissueType) {
  hapticStore.setTissueType(type)
}

function toggleSafety() {
  hapticStore.setSafetyEnabled(!hapticStore.tissueSafety.safetyEnabled)
}

function toggleOverride() {
  hapticStore.setSafetyOverride(!hapticStore.tissueSafety.safetyOverride)
}

function safetyLevelColor(level: string): string {
  switch (level) {
    case 'exceeded': return '#FF3B3B'
    case 'critical': return '#FF6B00'
    case 'warning': return '#FFB800'
    default: return '#00F0FF'
  }
}
</script>

<template>
  <div class="flex flex-col bg-[#141A2A] rounded border border-[#1E2A3A] overflow-hidden">
    <div class="flex items-center justify-between px-3 py-1.5 bg-[#0D1320] border-b border-[#1E2A3A]">
      <div class="flex items-center gap-2">
        <ShieldCheck v-if="hapticStore.tissueSafety.safetyEnabled" class="w-3.5 h-3.5" :style="{ color: safetyLevelColor(hapticStore.tissueSafety.safetyLevel) }" />
        <ShieldOff v-else class="w-3.5 h-3.5 text-gray-600" />
        <span class="text-[11px] font-mono tracking-wider text-gray-300">TISSUE SAFETY</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          class="px-2 py-0.5 text-[8px] font-mono rounded border transition-colors"
          :class="hapticStore.tissueSafety.safetyEnabled
            ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20'
            : 'bg-[#1E2A3A] border-[#1E2A3A] text-gray-500 hover:bg-[#2A3A4A]'"
          @click="toggleSafety"
        >
          {{ hapticStore.tissueSafety.safetyEnabled ? 'ON' : 'OFF' }}
        </button>
      </div>
    </div>

    <div v-if="hapticStore.tissueSafety.safetyLevel === 'exceeded' || hapticStore.tissueSafety.safetyLevel === 'critical'" class="px-3 py-1 flex items-center gap-2"
      :style="{ backgroundColor: `${safetyLevelColor(hapticStore.tissueSafety.safetyLevel)}15`, borderBottom: `1px solid ${safetyLevelColor(hapticStore.tissueSafety.safetyLevel)}30` }"
    >
      <AlertTriangle class="w-3 h-3" :style="{ color: safetyLevelColor(hapticStore.tissueSafety.safetyLevel) }" />
      <span class="text-[9px] font-mono" :style="{ color: safetyLevelColor(hapticStore.tissueSafety.safetyLevel) }">
        {{ hapticStore.tissueSafety.safetyLevel === 'exceeded' ? 'FORCE EXCEEDED' : 'APPROACHING LIMIT' }}
      </span>
    </div>

    <div class="p-3 flex flex-col gap-3">
      <div class="flex flex-col gap-1.5">
        <label class="text-[9px] font-mono text-gray-500 tracking-wider">CURRENT TISSUE</label>
        <select
          :value="hapticStore.tissueSafety.currentTissueType"
          class="bg-[#0A0E17] border border-[#1E2A3A] rounded px-2 py-1.5 text-[11px] font-mono text-[#00F0FF] focus:border-[#00F0FF]/50 focus:outline-none transition-colors"
          @change="(e: any) => selectTissue(e.target.value as TissueType)"
        >
          <option v-for="type in TISSUE_LIST" :key="type" :value="type">
            {{ TISSUE_PROFILES[type].labelCn }} ({{ TISSUE_PROFILES[type].label }})
          </option>
        </select>
        <div class="text-[8px] font-mono text-gray-600 mt-0.5">
          {{ TISSUE_PROFILES[hapticStore.tissueSafety.currentTissueType as TissueType]?.description }}
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-[9px] font-mono">
        <div class="bg-[#0A0E17] rounded px-2 py-1.5">
          <div class="text-gray-600">力极限</div>
          <div class="text-[#00F0FF] text-sm font-bold">{{ hapticStore.tissueSafety.maxForceN }}N</div>
        </div>
        <div class="bg-[#0A0E17] rounded px-2 py-1.5">
          <div class="text-gray-600">力矩极限</div>
          <div class="text-[#00F0FF] text-sm font-bold">{{ hapticStore.tissueSafety.maxTorqueNm }}Nm</div>
        </div>
      </div>

      <div class="bg-[#0A0E17] rounded px-2 py-2">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[8px] font-mono text-gray-500">力矩利用率</span>
          <span class="text-[10px] font-mono font-bold" :style="{ color: safetyLevelColor(hapticStore.tissueSafety.safetyLevel) }">
            {{ (hapticStore.tissueSafety.maxUtilization * 100).toFixed(0) }}%
          </span>
        </div>
        <div class="h-2 bg-[#1E2A3A] rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-100"
            :style="{
              width: `${Math.min(hapticStore.tissueSafety.maxUtilization * 100, 100)}%`,
              backgroundColor: safetyLevelColor(hapticStore.tissueSafety.safetyLevel),
              boxShadow: hapticStore.tissueSafety.maxUtilization > hapticStore.tissueSafety.criticalThresholdPct
                ? `0 0 8px ${safetyLevelColor(hapticStore.tissueSafety.safetyLevel)}`
                : 'none',
            }"
          />
        </div>
        <div class="flex justify-between mt-1">
          <div class="h-px w-px bg-transparent" />
          <div
            class="h-3 w-px"
            :style="{ backgroundColor: `${safetyLevelColor('warning')}40` }"
            :title="`警告阈值 ${(hapticStore.tissueSafety.warningThresholdPct * 100).toFixed(0)}%`"
          />
          <div
            class="h-3 w-px"
            :style="{ backgroundColor: `${safetyLevelColor('critical')}40` }"
            :title="`临界阈值 ${(hapticStore.tissueSafety.criticalThresholdPct * 100).toFixed(0)}%`"
          />
        </div>
      </div>

      <div class="grid grid-cols-3 gap-1 text-[8px] font-mono">
        <div class="bg-[#0A0E17] rounded px-1.5 py-1">
          <div class="text-gray-600">力利用率</div>
          <div :style="{ color: hapticStore.tissueSafety.forceUtilization > 1 ? '#FF3B3B' : '#00F0FF' }">
            {{ (hapticStore.tissueSafety.forceUtilization * 100).toFixed(0) }}%
          </div>
        </div>
        <div class="bg-[#0A0E17] rounded px-1.5 py-1">
          <div class="text-gray-600">矩利用率</div>
          <div :style="{ color: hapticStore.tissueSafety.torqueUtilization > 1 ? '#FF3B3B' : '#00F0FF' }">
            {{ (hapticStore.tissueSafety.torqueUtilization * 100).toFixed(0) }}%
          </div>
        </div>
        <div class="bg-[#0A0E17] rounded px-1.5 py-1">
          <div class="text-gray-600">钳制次数</div>
          <div :class="hapticStore.tissueSafety.clampingEventCount > 0 ? 'text-[#FF3B3B]' : 'text-gray-500'">
            {{ hapticStore.tissueSafety.clampingEventCount }}
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between border-t border-[#1E2A3A] pt-2">
        <div class="flex items-center gap-1.5">
          <AlertTriangle class="w-3 h-3" :class="hapticStore.tissueSafety.safetyOverride ? 'text-[#FF3B3B]' : 'text-gray-600'" />
          <span class="text-[9px] font-mono" :class="hapticStore.tissueSafety.safetyOverride ? 'text-[#FF3B3B]' : 'text-gray-500'">安全覆写</span>
        </div>
        <button
          class="px-2 py-0.5 text-[8px] font-mono rounded border transition-colors"
          :class="hapticStore.tissueSafety.safetyOverride
            ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30 text-[#FF3B3B] hover:bg-[#FF3B3B]/20'
            : 'bg-[#1E2A3A] border-[#1E2A3A] text-gray-500 hover:bg-[#2A3A4A]'"
          @click="toggleOverride"
        >
          {{ hapticStore.tissueSafety.safetyOverride ? 'OVERRIDE ON' : 'OVERRIDE' }}
        </button>
      </div>
    </div>
  </div>
</template>
