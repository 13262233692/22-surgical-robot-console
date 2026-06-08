<script setup lang="ts">
import StatusBar from '@/components/StatusBar.vue'
import BinocularVideo from '@/components/BinocularVideo.vue'
import HapticControl from '@/components/HapticControl.vue'
import ForceRadar from '@/components/ForceRadar.vue'
import LogPanel from '@/components/LogPanel.vue'
import { useSimulation } from '@/composables/useSimulation'
import { useWebRTCStore } from '@/stores/webrtc'
import { useHapticStore } from '@/stores/haptic'
import { useSystemStore } from '@/stores/system'
import {
  Play,
  Square,
  OctagonAlert,
  Settings,
  Monitor,
  Zap,
} from 'lucide-vue-next'

const simulation = useSimulation()
const webrtcStore = useWebRTCStore()
const hapticStore = useHapticStore()
const systemStore = useSystemStore()
</script>

<template>
  <div class="h-screen flex flex-col bg-[#0A0E17] text-white overflow-hidden">
    <StatusBar />

    <div class="flex-1 flex min-h-0">
      <div class="flex-1 flex flex-col p-2 gap-2 min-w-0">
        <div class="flex-1 min-h-0">
          <BinocularVideo
            :set-left-canvas="simulation.setLeftCanvas"
            :set-right-canvas="simulation.setRightCanvas"
            :left-active="webrtcStore.leftStream.isActive"
            :right-active="webrtcStore.rightStream.isActive"
            :sdp-state="webrtcStore.connection.sdpState"
            :ice-state="webrtcStore.connection.iceState"
          />
        </div>
        <div class="shrink-0">
          <LogPanel />
        </div>
      </div>

      <div class="w-[360px] shrink-0 flex flex-col p-2 pl-0 gap-2 overflow-y-auto">
        <div class="flex gap-2">
          <button
            v-if="!simulation.isRunning.value"
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded text-[#00F0FF] text-[11px] font-mono tracking-wider hover:bg-[#00F0FF]/20 transition-colors"
            @click="simulation.start()"
          >
            <Play class="w-4 h-4" />
            START SESSION
          </button>
          <button
            v-else
            class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF3B3B]/10 border border-[#FF3B3B]/30 rounded text-[#FF3B3B] text-[11px] font-mono tracking-wider hover:bg-[#FF3B3B]/20 transition-colors"
            @click="simulation.stop()"
          >
            <Square class="w-4 h-4" />
            STOP SESSION
          </button>
        </div>

        <HapticControl />

        <div class="flex flex-col bg-[#141A2A] rounded border border-[#1E2A3A] overflow-hidden">
          <div class="flex items-center justify-between px-3 py-1.5 bg-[#0D1320] border-b border-[#1E2A3A]">
            <div class="flex items-center gap-2">
              <Zap class="w-3.5 h-3.5 text-[#00F0FF]" />
              <span class="text-[11px] font-mono tracking-wider text-gray-300">FORCE FEEDBACK</span>
            </div>
            <div
              v-if="hapticStore.forceFeedback?.collisionDetected"
              class="flex items-center gap-1 animate-pulse"
            >
              <OctagonAlert class="w-3 h-3 text-[#FF3B3B]" />
              <span class="text-[9px] font-mono text-[#FF3B3B]">COLLISION</span>
            </div>
          </div>
          <div class="p-2">
            <ForceRadar
              :filtered-data="hapticStore.filteredForceFeedback"
              :filter-enabled="hapticStore.filterEnabled"
              :is-interpolated="hapticStore.filteredForceFeedback?.isInterpolated ?? false"
              :jitter-reduction-db="hapticStore.filterStats.jitterReductionDb"
            />
          </div>
        </div>

        <div class="flex flex-col bg-[#141A2A] rounded border border-[#1E2A3A] overflow-hidden">
          <div class="flex items-center justify-between px-3 py-1.5 bg-[#0D1320] border-b border-[#1E2A3A]">
            <div class="flex items-center gap-2">
              <Monitor class="w-3.5 h-3.5 text-[#00F0FF]" />
              <span class="text-[11px] font-mono tracking-wider text-gray-300">STREAM STATS</span>
            </div>
          </div>
          <div class="p-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div>
              <span class="text-gray-500">CODEC</span>
              <div class="text-[#00F0FF]">{{ webrtcStore.leftStream.codec }}</div>
            </div>
            <div>
              <span class="text-gray-500">RESOLUTION</span>
              <div class="text-[#00F0FF]">{{ webrtcStore.leftStream.resolution }}</div>
            </div>
            <div>
              <span class="text-gray-500">BITRATE</span>
              <div class="text-[#00F0FF]">{{ webrtcStore.connection.bitrate.toFixed(1) }} Mbps</div>
            </div>
            <div>
              <span class="text-gray-500">JITTER</span>
              <div :class="webrtcStore.connection.jitter > 5 ? 'text-[#FF3B3B]' : 'text-[#00F0FF]'">
                {{ webrtcStore.connection.jitter.toFixed(1) }}ms
              </div>
            </div>
            <div>
              <span class="text-gray-500">PACKETS LOST</span>
              <div :class="webrtcStore.connection.packetsLost > 20 ? 'text-[#FF3B3B]' : 'text-gray-300'">
                {{ webrtcStore.connection.packetsLost }}
              </div>
            </div>
            <div>
              <span class="text-gray-500">RTT</span>
              <div :class="webrtcStore.connection.rtt > 80 ? 'text-[#FF3B3B]' : 'text-[#00F0FF]'">
                {{ webrtcStore.connection.rtt.toFixed(0) }}ms
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#141A2A] border border-[#1E2A3A] rounded text-gray-400 text-[10px] font-mono hover:bg-[#1E2A3A] hover:text-gray-300 transition-colors"
            @click="$router.push('/device')"
          >
            <Settings class="w-3 h-3" />
            DEVICE CONFIG
          </button>
          <button
            v-if="!systemStore.robotArmed && !systemStore.emergencyStop && simulation.isRunning.value"
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded text-[#00F0FF] text-[10px] font-mono hover:bg-[#00F0FF]/20 transition-colors"
            @click="systemStore.armRobot()"
          >
            ARM ROBOT
          </button>
          <button
            v-else-if="systemStore.robotArmed"
            class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded text-[#FFB800] text-[10px] font-mono hover:bg-[#FFB800]/20 transition-colors"
            @click="systemStore.disarmRobot()"
          >
            DISARM
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
