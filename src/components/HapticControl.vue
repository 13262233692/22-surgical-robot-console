<script setup lang="ts">
import { useHapticStore } from '@/stores/haptic'
import CoordinateDisplay from './CoordinateDisplay.vue'
import GripGauge from './GripGauge.vue'
import { Cpu, AlertTriangle, CheckCircle, Shield, ShieldOff, Wifi, WifiOff } from 'lucide-vue-next'

const hapticStore = useHapticStore()

function toggleFilter() {
  hapticStore.setFilterEnabled(!hapticStore.filterEnabled)
}

function toggleNetworkSim() {
  hapticStore.updateNetworkSim({ enabled: !hapticStore.networkSim.enabled })
}
</script>

<template>
  <div class="flex flex-col bg-[#141A2A] rounded border border-[#1E2A3A] overflow-hidden">
    <div class="flex items-center justify-between px-3 py-1.5 bg-[#0D1320] border-b border-[#1E2A3A]">
      <div class="flex items-center gap-2">
        <Cpu class="w-3.5 h-3.5 text-[#00F0FF]" />
        <span class="text-[11px] font-mono tracking-wider text-gray-300">HAPTIC CONTROL</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-1.5 h-1.5 rounded-full" :class="hapticStore.deviceConnected ? 'bg-[#00F0FF]' : 'bg-gray-600'" :style="hapticStore.deviceConnected ? { boxShadow: '0 0 4px #00F0FF' } : {}" />
        <span class="text-[9px] font-mono" :class="hapticStore.deviceConnected ? 'text-[#00F0FF]' : 'text-gray-500'">
          {{ hapticStore.deviceConnected ? 'CONNECTED' : 'OFFLINE' }}
        </span>
      </div>
    </div>

    <div v-if="hapticStore.collisionAlert" class="px-3 py-1.5 bg-[#FF3B3B]/10 border-b border-[#FF3B3B]/30 flex items-center gap-2 animate-pulse">
      <AlertTriangle class="w-3.5 h-3.5 text-[#FF3B3B]" />
      <span class="text-[10px] font-mono text-[#FF3B3B]">COLLISION DETECTED</span>
    </div>

    <div class="p-3 flex flex-col gap-3">
      <CoordinateDisplay
        :position="hapticStore.currentPosition"
        :history="hapticStore.positionHistory"
      />

      <div class="border-t border-[#1E2A3A] pt-3">
        <GripGauge :value="hapticStore.currentGripOpenness" />
      </div>

      <div class="border-t border-[#1E2A3A] pt-2 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <Shield v-if="hapticStore.filterEnabled" class="w-3 h-3 text-[#00F0FF]" />
            <ShieldOff v-else class="w-3 h-3 text-gray-600" />
            <span class="text-[9px] font-mono" :class="hapticStore.filterEnabled ? 'text-[#00F0FF]' : 'text-gray-500'">KALMAN FILTER</span>
          </div>
          <button
            class="px-2 py-0.5 text-[8px] font-mono rounded border transition-colors"
            :class="hapticStore.filterEnabled
              ? 'bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF] hover:bg-[#00F0FF]/20'
              : 'bg-[#1E2A3A] border-[#1E2A3A] text-gray-500 hover:bg-[#2A3A4A]'"
            @click="toggleFilter"
          >
            {{ hapticStore.filterEnabled ? 'ON' : 'OFF' }}
          </button>
        </div>

        <div v-if="hapticStore.filterEnabled" class="grid grid-cols-3 gap-1 text-[8px] font-mono">
          <div class="bg-[#0A0E17] rounded px-1.5 py-1">
            <div class="text-gray-600">JITTER↓</div>
            <div class="text-[#00F0FF]">{{ hapticStore.filterStats.jitterReductionDb.toFixed(1) }}dB</div>
          </div>
          <div class="bg-[#0A0E17] rounded px-1.5 py-1">
            <div class="text-gray-600">INTERP</div>
            <div class="text-[#00F0FF]">{{ (hapticStore.filterStats.interpolationRate * 100).toFixed(0) }}%</div>
          </div>
          <div class="bg-[#0A0E17] rounded px-1.5 py-1">
            <div class="text-gray-600">INNOV</div>
            <div :class="hapticStore.filterStats.innovationMagnitude > 5 ? 'text-[#FFB800]' : 'text-[#00F0FF]'">
              {{ hapticStore.filterStats.innovationMagnitude.toFixed(1) }}
            </div>
          </div>
        </div>
      </div>

      <div class="border-t border-[#1E2A3A] pt-2 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <Wifi v-if="hapticStore.networkSim.enabled" class="w-3 h-3 text-[#FF3B3B]" />
            <WifiOff v-else class="w-3 h-3 text-gray-600" />
            <span class="text-[9px] font-mono" :class="hapticStore.networkSim.enabled ? 'text-[#FF3B3B]' : 'text-gray-500'">WEAK NET SIM</span>
          </div>
          <button
            class="px-2 py-0.5 text-[8px] font-mono rounded border transition-colors"
            :class="hapticStore.networkSim.enabled
              ? 'bg-[#FF3B3B]/10 border-[#FF3B3B]/30 text-[#FF3B3B] hover:bg-[#FF3B3B]/20'
              : 'bg-[#1E2A3A] border-[#1E2A3A] text-gray-500 hover:bg-[#2A3A4A]'"
            @click="toggleNetworkSim"
          >
            {{ hapticStore.networkSim.enabled ? 'ON' : 'OFF' }}
          </button>
        </div>

        <div v-if="hapticStore.networkSim.enabled" class="grid grid-cols-3 gap-1 text-[8px] font-mono">
          <div class="bg-[#0A0E17] rounded px-1.5 py-1">
            <div class="text-gray-600">LATENCY</div>
            <div class="text-[#FF3B3B]">{{ hapticStore.networkSim.baseLatencyMs }}ms</div>
          </div>
          <div class="bg-[#0A0E17] rounded px-1.5 py-1">
            <div class="text-gray-600">JITTER</div>
            <div class="text-[#FF3B3B]">±{{ hapticStore.networkSim.jitterMs }}ms</div>
          </div>
          <div class="bg-[#0A0E17] rounded px-1.5 py-1">
            <div class="text-gray-600">LOSS</div>
            <div class="text-[#FF3B3B]">{{ (hapticStore.networkSim.packetLossRate * 100).toFixed(0) }}%</div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-between text-[9px] font-mono border-t border-[#1E2A3A] pt-2">
        <div class="flex items-center gap-1">
          <span class="text-gray-500">RATE</span>
          <span class="text-[#00F0FF]">{{ hapticStore.sampleRateHz }}Hz</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="text-gray-500">LATENCY</span>
          <span :class="hapticStore.latencyMs > 80 ? 'text-[#FF3B3B]' : 'text-[#00F0FF]'">{{ hapticStore.latencyMs.toFixed(1) }}ms</span>
        </div>
        <div class="flex items-center gap-1">
          <CheckCircle v-if="hapticStore.calibrated" class="w-3 h-3 text-[#00F0FF]" />
          <CheckCircle v-else class="w-3 h-3 text-gray-600" />
          <span :class="hapticStore.calibrated ? 'text-[#00F0FF]' : 'text-gray-500'">CAL</span>
        </div>
      </div>
    </div>
  </div>
</template>
