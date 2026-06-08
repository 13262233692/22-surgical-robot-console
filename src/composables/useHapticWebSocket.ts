import { onUnmounted } from 'vue'
import { useHapticStore } from '@/stores/haptic'
import { useSystemStore } from '@/stores/system'
import type { HapticInputFrame, ForceFeedbackFrame, FilteredForceFeedback, Position3D } from '@/types/haptic'
import { KalmanFilter6D, type ForceTorque6D } from '@/lib/kalmanFilter'
import { InterpolationBuffer, type BufferedFrame } from '@/lib/interpolationBuffer'
import { ForceClampingGateway } from '@/lib/forceClampingGateway'

export function useHapticWebSocket() {
  const hapticStore = useHapticStore()
  const systemStore = useSystemStore()
  let simulationInterval = 0
  let latencyInterval = 0
  let filterInterval = 0
  const sampleRate = 500
  const intervalMs = 1000 / sampleRate

  const kalmanFilter = new KalmanFilter6D(0.008, 0.15)
  const interpolationBuffer = new InterpolationBuffer(40, 60, 30)
  const clampingGateway = new ForceClampingGateway()

  let rawVarianceSum = 0
  let filteredVarianceSum = 0
  let varianceSampleCount = 0
  let lastRawForce: ForceTorque6D | null = null
  let lastFilteredForce: ForceTorque6D | null = null
  let predictedFrameCount = 0

  let burstLossActive = false
  let burstLossEndTime = 0

  function shouldDropPacket(): boolean {
    const sim = hapticStore.networkSim
    if (!sim.enabled) return false

    if (sim.burstLossEnabled && !burstLossActive) {
      if (Math.random() < sim.burstLossProbability) {
        burstLossActive = true
        burstLossEndTime = Date.now() + sim.burstLossDurationMs
        systemStore.addLog('warn', 'NETWORK', `突发丢包！持续 ${sim.burstLossDurationMs}ms`)
      }
    }

    if (burstLossActive) {
      if (Date.now() >= burstLossEndTime) {
        burstLossActive = false
      } else {
        return true
      }
    }

    return Math.random() < sim.packetLossRate
  }

  function applyNetworkLatency(): number {
    const sim = hapticStore.networkSim
    if (!sim.enabled) return 0
    const jitter = (Math.random() - 0.5) * 2 * sim.jitterMs
    return sim.baseLatencyMs + jitter
  }

  function processForceFeedback(frame: ForceFeedbackFrame): void {
    hapticStore.updateForceFeedback(frame)

    const raw6D: ForceTorque6D = {
      fx: frame.force.x,
      fy: frame.force.y,
      fz: frame.force.z,
      mx: frame.torque.x,
      my: frame.torque.y,
      mz: frame.torque.z,
    }

    const innovation = kalmanFilter.getInnovation(raw6D)

    const filtered6D = hapticStore.filterEnabled
      ? kalmanFilter.filter(raw6D, frame.timestamp)
      : raw6D

    const bufferedFrame: BufferedFrame = {
      timestamp: frame.timestamp,
      data: filtered6D,
      collisionDetected: frame.collisionDetected,
      collisionIntensity: frame.collisionIntensity,
      isInterpolated: false,
    }
    interpolationBuffer.push(bufferedFrame)

    if (lastRawForce && lastFilteredForce) {
      const rawKeys: (keyof ForceTorque6D)[] = ['fx', 'fy', 'fz', 'mx', 'my', 'mz']
      let rawDiffSq = 0
      let filtDiffSq = 0
      for (const k of rawKeys) {
        rawDiffSq += (raw6D[k] - lastRawForce[k]) ** 2
        filtDiffSq += (filtered6D[k] - lastFilteredForce[k]) ** 2
      }
      rawVarianceSum += rawDiffSq
      filteredVarianceSum += filtDiffSq
      varianceSampleCount++
    }
    lastRawForce = { ...raw6D }
    lastFilteredForce = { ...filtered6D }
  }

  function outputFilteredFrame(): void {
    if (!hapticStore.forceFeedback) return

    const now = Date.now()
    const output = interpolationBuffer.getOutput(now)

    if (!output) return

    const rawForce = hapticStore.forceFeedback.force
    const rawTorque = hapticStore.forceFeedback.torque

    let filteredForce: Position3D = { x: output.data.fx, y: output.data.fy, z: output.data.fz }
    let filteredTorque: Position3D = { x: output.data.mx, y: output.data.my, z: output.data.mz }

    if (hapticStore.tissueSafety.safetyEnabled) {
      clampingGateway.setTissueType(hapticStore.tissueSafety.currentTissueType as any)
      clampingGateway.setSafetyOverride(hapticStore.tissueSafety.safetyOverride)

      const clamped = clampingGateway.process(filteredForce, filteredTorque)
      filteredForce = clamped.clampedForce
      filteredTorque = clamped.clampedTorque

      hapticStore.updateTissueSafety({
        safetyLevel: clamped.safetyLevel,
        forceUtilization: clamped.forceUtilization,
        torqueUtilization: clamped.torqueUtilization,
        maxUtilization: clamped.maxUtilization,
        wasClamped: clamped.wasClamped,
        clampRatio: clamped.clampRatio,
        clampingEventCount: clampingGateway.getClampingEventCount(),
      })

      if (clamped.safetyLevel === 'exceeded' && clamped.wasClamped) {
        if (!hapticStore.tissueSafety.safetyOverride) {
          systemStore.addLog('critical', 'SAFETY', `⚠ 施力钳制触发！${clamped.tissueProfile.labelCn}极限${clamped.tissueProfile.maxForceN}N，当前力矩模长已归一化至安全阈值`)
        } else {
          systemStore.addLog('critical', 'SAFETY', `⚠ 力矩超限！${clamped.tissueProfile.labelCn}极限${clamped.tissueProfile.maxForceN}N，安全覆写已激活——力矩未钳制！`)
        }
      } else if (clamped.safetyLevel === 'critical') {
        systemStore.addLog('warn', 'SAFETY', `施力接近临界：${clamped.tissueProfile.labelCn}利用率 ${(clamped.maxUtilization * 100).toFixed(0)}%`)
      }
    } else {
      hapticStore.updateTissueSafety({
        safetyLevel: 'safe',
        forceUtilization: 0,
        torqueUtilization: 0,
        maxUtilization: 0,
        wasClamped: false,
      })
    }

    const filtered: FilteredForceFeedback = {
      timestamp: output.timestamp,
      filteredForce,
      filteredTorque,
      rawForce,
      rawTorque,
      collisionDetected: output.collisionDetected,
      collisionIntensity: output.collisionIntensity,
      isInterpolated: output.isInterpolated,
      innovation: hapticStore.filterStats.innovationMagnitude,
    }

    if (output.isInterpolated) {
      predictedFrameCount++
    }

    hapticStore.updateFilteredForceFeedback(filtered)
  }

  function updateFilterStats(): void {
    const stats = interpolationBuffer.getStats()
    let jitterReduction = 0
    if (varianceSampleCount > 10 && rawVarianceSum > 0) {
      const rawRms = Math.sqrt(rawVarianceSum / varianceSampleCount)
      const filtRms = Math.sqrt(filteredVarianceSum / varianceSampleCount)
      if (filtRms > 0.001) {
        jitterReduction = 10 * Math.log10(rawRms / filtRms)
      }
    }

    hapticStore.updateFilterStats({
      kalmanActive: hapticStore.filterEnabled,
      interpolationActive: hapticStore.filterEnabled,
      interpolationRate: stats.interpolationRate,
      bufferFillLevel: stats.bufferSize / 60,
      innovationMagnitude: hapticStore.forceFeedback
        ? kalmanFilter.getInnovation({
            fx: hapticStore.forceFeedback.force.x,
            fy: hapticStore.forceFeedback.force.y,
            fz: hapticStore.forceFeedback.force.z,
            mx: hapticStore.forceFeedback.torque.x,
            my: hapticStore.forceFeedback.torque.y,
            mz: hapticStore.forceFeedback.torque.z,
          })
        : 0,
      jitterReductionDb: Math.max(0, jitterReduction),
      predictedFrames: predictedFrameCount,
    })
  }

  function startSimulation() {
    hapticStore.setDeviceConnected(true)
    hapticStore.setCalibrated(true)
    hapticStore.setWsConnected(true)

    kalmanFilter.reset()
    interpolationBuffer.reset()
    clampingGateway.reset()
    rawVarianceSum = 0
    filteredVarianceSum = 0
    varianceSampleCount = 0
    lastRawForce = null
    lastFilteredForce = null
    predictedFrameCount = 0
    burstLossActive = false

    if (hapticStore.networkSim.enabled) {
      systemStore.addLog('warn', 'NETWORK', `弱网模拟已启用: ${hapticStore.networkSim.baseLatencyMs}ms延迟 / ${(hapticStore.networkSim.packetLossRate * 100).toFixed(0)}%丢包`)
    }
    if (hapticStore.filterEnabled) {
      systemStore.addLog('info', 'FILTER', '卡尔曼滤波 + 插值缓冲已激活')
    }
    systemStore.addLog('info', 'HAPTIC', '触觉手柄已连接，校准完成')
    systemStore.addLog('info', 'WEBSOCKET', `WebSocket已连接: ${hapticStore.wsUrl}`)

    const startTime = Date.now()
    let frameCount = 0

    simulationInterval = window.setInterval(() => {
      const t = Date.now() - startTime
      frameCount++

      const positionFrame: HapticInputFrame = {
        timestamp: Date.now(),
        position: {
          x: Math.sin(t * 0.002) * 120 + Math.sin(t * 0.005) * 30,
          y: Math.cos(t * 0.003) * 80 + Math.cos(t * 0.007) * 20,
          z: Math.sin(t * 0.001) * 50 + 200,
        },
        gripOpenness: (Math.sin(t * 0.004) * 0.5 + 0.5) * 100,
        quaternion: {
          w: Math.cos(t * 0.001),
          x: Math.sin(t * 0.001) * 0.3,
          y: Math.cos(t * 0.002) * 0.2,
          z: Math.sin(t * 0.002) * 0.1,
        },
      }
      hapticStore.updatePosition(positionFrame)

      if (frameCount % 5 === 0) {
        if (shouldDropPacket()) {
          return
        }

        const collisionDetected = Math.random() < 0.03
        const collisionIntensity = collisionDetected
          ? Math.random() * 0.8 + 0.2
          : 0

        const sim = hapticStore.networkSim
        let jitterNoise = { x: 0, y: 0, z: 0 }
        if (sim.enabled) {
          const jitterAmp = sim.jitterMs / 30 * 3
          jitterNoise = {
            x: (Math.random() - 0.5) * jitterAmp,
            y: (Math.random() - 0.5) * jitterAmp,
            z: (Math.random() - 0.5) * jitterAmp,
          }
        }

        const forceFrame: ForceFeedbackFrame = {
          timestamp: Date.now() + Math.round(applyNetworkLatency()),
          force: {
            x: Math.sin(t * 0.003) * 5 + (collisionDetected ? Math.random() * 20 : 0) + jitterNoise.x,
            y: Math.cos(t * 0.002) * 3 + (collisionDetected ? Math.random() * 15 : 0) + jitterNoise.y,
            z: Math.sin(t * 0.001) * 8 + (collisionDetected ? Math.random() * 25 : 0) + jitterNoise.z,
          },
          torque: {
            x: Math.sin(t * 0.004) * 2 + (collisionDetected ? Math.random() * 10 : 0),
            y: Math.cos(t * 0.003) * 1.5 + (collisionDetected ? Math.random() * 8 : 0),
            z: Math.sin(t * 0.002) * 1 + (collisionDetected ? Math.random() * 5 : 0),
          },
          collisionDetected,
          collisionIntensity,
        }
        processForceFeedback(forceFrame)

        if (collisionDetected) {
          systemStore.addLog('warn', 'FORCE', `碰撞检测！强度: ${(collisionIntensity * 100).toFixed(0)}%`)
        }
      }
    }, intervalMs)

    filterInterval = window.setInterval(() => {
      outputFilteredFrame()
      updateFilterStats()
    }, 10)

    latencyInterval = window.setInterval(() => {
      const sim = hapticStore.networkSim
      const lat = sim.enabled
        ? sim.baseLatencyMs + (Math.random() - 0.5) * sim.jitterMs
        : 2 + Math.random() * 3
      hapticStore.setLatency(lat)
      systemStore.updateLatency(
        systemStore.webrtcLatencyMs,
        hapticStore.latencyMs
      )
    }, 500)
  }

  function stopSimulation() {
    clearInterval(simulationInterval)
    clearInterval(latencyInterval)
    clearInterval(filterInterval)
    hapticStore.setWsConnected(false)
    hapticStore.setDeviceConnected(false)
    kalmanFilter.reset()
    interpolationBuffer.reset()
    clampingGateway.reset()
    systemStore.addLog('info', 'HAPTIC', '触觉手柄已断开')
    systemStore.addLog('info', 'WEBSOCKET', 'WebSocket已断开')
  }

  onUnmounted(() => {
    stopSimulation()
  })

  return {
    hapticStore,
    startSimulation,
    stopSimulation,
  }
}
