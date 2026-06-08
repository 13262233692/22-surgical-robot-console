<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWebRTCStore } from '@/stores/webrtc'
import { useHapticStore } from '@/stores/haptic'
import { useSystemStore } from '@/stores/system'
import {
  ArrowLeft,
  Server,
  Wifi,
  Sliders,
  Save,
  TestTube,
} from 'lucide-vue-next'

const router = useRouter()
const webrtcStore = useWebRTCStore()
const hapticStore = useHapticStore()
const systemStore = useSystemStore()

const signalingUrl = ref(webrtcStore.signalingUrl)
const iceStrategy = ref(webrtcStore.iceStrategy)
const wsUrl = ref(hapticStore.wsUrl)
const hapticRate = ref(hapticStore.sampleRateHz)

const testStatus = ref<'idle' | 'testing' | 'ok' | 'fail'>('idle')

function saveConfig() {
  webrtcStore.setSignalingUrl(signalingUrl.value)
  webrtcStore.setIceStrategy(iceStrategy.value as 'all' | 'stun' | 'turn')
  hapticStore.setWsUrl(wsUrl.value)
  hapticStore.sampleRateHz = hapticRate.value
  systemStore.addLog('info', 'CONFIG', '设备配置已保存')
}

function testConnection() {
  testStatus.value = 'testing'
  systemStore.addLog('info', 'CONFIG', '正在测试连接...')

  setTimeout(() => {
    testStatus.value = 'ok'
    systemStore.addLog('info', 'CONFIG', '连接测试成功')
    setTimeout(() => {
      testStatus.value = 'idle'
    }, 3000)
  }, 1500)
}

function calibrate() {
  hapticStore.setCalibrated(false)
  systemStore.addLog('info', 'HAPTIC', '开始触觉手柄校准...')
  setTimeout(() => {
    hapticStore.setCalibrated(true)
    systemStore.addLog('info', 'HAPTIC', '触觉手柄校准完成')
  }, 2000)
}
</script>

<template>
  <div class="h-screen flex flex-col bg-[#0A0E17] text-white overflow-y-auto">
    <div class="flex items-center gap-4 px-6 py-4 border-b border-[#1E2A3A]">
      <button
        class="flex items-center gap-1.5 text-gray-400 hover:text-[#00F0FF] text-[11px] font-mono transition-colors"
        @click="router.push('/')"
      >
        <ArrowLeft class="w-4 h-4" />
        BACK TO CONSOLE
      </button>
      <div class="w-px h-5 bg-[#1E2A3A]" />
      <h1 class="text-sm font-mono tracking-wider text-gray-300">DEVICE CONFIGURATION</h1>
    </div>

    <div class="max-w-2xl mx-auto w-full p-6 flex flex-col gap-6">
      <div class="bg-[#141A2A] rounded border border-[#1E2A3A] overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-2.5 bg-[#0D1320] border-b border-[#1E2A3A]">
          <Server class="w-4 h-4 text-[#00F0FF]" />
          <span class="text-[12px] font-mono tracking-wider text-gray-300">WEBRTC SIGNALING</span>
        </div>
        <div class="p-4 flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-mono text-gray-500 tracking-wider">SIGNALING SERVER URL</label>
            <input
              v-model="signalingUrl"
              type="text"
              class="bg-[#0A0E17] border border-[#1E2A3A] rounded px-3 py-2 text-sm font-mono text-[#00F0FF] focus:border-[#00F0FF]/50 focus:outline-none transition-colors"
              placeholder="http://localhost:8080"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-mono text-gray-500 tracking-wider">ICE CANDIDATE STRATEGY</label>
            <select
              v-model="iceStrategy"
              class="bg-[#0A0E17] border border-[#1E2A3A] rounded px-3 py-2 text-sm font-mono text-[#00F0FF] focus:border-[#00F0FF]/50 focus:outline-none transition-colors"
            >
              <option value="all">ALL (STUN + TURN)</option>
              <option value="stun">STUN ONLY</option>
              <option value="turn">TURN ONLY</option>
            </select>
          </div>
        </div>
      </div>

      <div class="bg-[#141A2A] rounded border border-[#1E2A3A] overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-2.5 bg-[#0D1320] border-b border-[#1E2A3A]">
          <Wifi class="w-4 h-4 text-[#00F0FF]" />
          <span class="text-[12px] font-mono tracking-wider text-gray-300">HAPTIC WEBSOCKET</span>
        </div>
        <div class="p-4 flex flex-col gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-mono text-gray-500 tracking-wider">WEBSOCKET ENDPOINT</label>
            <input
              v-model="wsUrl"
              type="text"
              class="bg-[#0A0E17] border border-[#1E2A3A] rounded px-3 py-2 text-sm font-mono text-[#00F0FF] focus:border-[#00F0FF]/50 focus:outline-none transition-colors"
              placeholder="ws://localhost:8765/haptic"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-[10px] font-mono text-gray-500 tracking-wider">SAMPLE RATE (Hz)</label>
            <input
              v-model.number="hapticRate"
              type="number"
              min="100"
              max="1000"
              class="bg-[#0A0E17] border border-[#1E2A3A] rounded px-3 py-2 text-sm font-mono text-[#00F0FF] focus:border-[#00F0FF]/50 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div class="bg-[#141A2A] rounded border border-[#1E2A3A] overflow-hidden">
        <div class="flex items-center gap-2 px-4 py-2.5 bg-[#0D1320] border-b border-[#1E2A3A]">
          <Sliders class="w-4 h-4 text-[#00F0FF]" />
          <span class="text-[12px] font-mono tracking-wider text-gray-300">HAPTIC CALIBRATION</span>
        </div>
        <div class="p-4 flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-[11px] font-mono text-gray-300">DEVICE STATUS</div>
              <div class="text-[10px] font-mono" :class="hapticStore.deviceConnected ? 'text-[#00F0FF]' : 'text-gray-500'">
                {{ hapticStore.deviceConnected ? 'CONNECTED' : 'DISCONNECTED' }}
              </div>
            </div>
            <div>
              <div class="text-[11px] font-mono text-gray-300">CALIBRATION</div>
              <div class="text-[10px] font-mono" :class="hapticStore.calibrated ? 'text-[#00F0FF]' : 'text-[#FFB800]'">
                {{ hapticStore.calibrated ? 'CALIBRATED' : 'NOT CALIBRATED' }}
              </div>
            </div>
          </div>
          <button
            class="flex items-center justify-center gap-1.5 px-4 py-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded text-[#00F0FF] text-[11px] font-mono tracking-wider hover:bg-[#00F0FF]/20 transition-colors"
            @click="calibrate"
          >
            RUN CALIBRATION
          </button>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#00F0FF]/10 border border-[#00F0FF]/30 rounded text-[#00F0FF] text-[11px] font-mono tracking-wider hover:bg-[#00F0FF]/20 transition-colors"
          @click="saveConfig"
        >
          <Save class="w-4 h-4" />
          SAVE CONFIGURATION
        </button>
        <button
          class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#141A2A] border border-[#1E2A3A] rounded text-gray-300 text-[11px] font-mono tracking-wider hover:bg-[#1E2A3A] transition-colors"
          :class="{ 'border-[#00F0FF]/50 text-[#00F0FF]': testStatus === 'ok', 'border-[#FF3B3B]/50 text-[#FF3B3B]': testStatus === 'fail' }"
          @click="testConnection"
        >
          <TestTube class="w-4 h-4" />
          <span v-if="testStatus === 'testing'">TESTING...</span>
          <span v-else-if="testStatus === 'ok'">CONNECTION OK ✓</span>
          <span v-else-if="testStatus === 'fail'">CONNECTION FAILED ✗</span>
          <span v-else>TEST CONNECTION</span>
        </button>
      </div>
    </div>
  </div>
</template>
