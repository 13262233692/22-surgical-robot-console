import type { ForceTorque6D } from './kalmanFilter'

export interface BufferedFrame {
  timestamp: number
  data: ForceTorque6D
  collisionDetected: boolean
  collisionIntensity: number
  isInterpolated: boolean
}

export class InterpolationBuffer {
  private buffer: BufferedFrame[] = []
  private readonly maxBufferSize: number
  private readonly targetDelayMs: number
  private readonly maxInterpolationGapMs: number
  private packetCount = 0
  private interpolatedCount = 0

  constructor(
    targetDelayMs = 40,
    maxBufferSize = 60,
    maxInterpolationGapMs = 30
  ) {
    this.targetDelayMs = targetDelayMs
    this.maxBufferSize = maxBufferSize
    this.maxInterpolationGapMs = maxInterpolationGapMs
  }

  push(frame: BufferedFrame): void {
    this.buffer.push(frame)
    this.packetCount++
    if (this.buffer.length > this.maxBufferSize) {
      this.buffer.shift()
    }
  }

  getOutput(now: number): BufferedFrame | null {
    const targetTime = now - this.targetDelayMs

    if (this.buffer.length < 2) {
      return this.buffer.length === 1 ? this.buffer[0] : null
    }

    const older = this.findFrameBefore(targetTime)
    const newer = this.findFrameAfter(targetTime)

    if (!older && !newer) return null

    if (!older) return newer!

    if (!newer) {
      return this.createPredictedFrame(older, targetTime)
    }

    if (older.timestamp === newer.timestamp) return older

    const gap = newer.timestamp - older.timestamp
    if (gap > this.maxInterpolationGapMs * 2) {
      return newer.isInterpolated ? newer : { ...newer, isInterpolated: false }
    }

    const alpha = (targetTime - older.timestamp) / (newer.timestamp - older.timestamp)
    const clampedAlpha = Math.max(0, Math.min(1, alpha))

    return this.interpolate(older, newer, clampedAlpha, targetTime)
  }

  private findFrameBefore(time: number): BufferedFrame | null {
    for (let i = this.buffer.length - 1; i >= 0; i--) {
      if (this.buffer[i].timestamp <= time) return this.buffer[i]
    }
    return null
  }

  private findFrameAfter(time: number): BufferedFrame | null {
    for (let i = 0; i < this.buffer.length; i++) {
      if (this.buffer[i].timestamp >= time) return this.buffer[i]
    }
    return null
  }

  private interpolate(
    a: BufferedFrame,
    b: BufferedFrame,
    alpha: number,
    targetTime: number
  ): BufferedFrame {
    const keys: (keyof ForceTorque6D)[] = ['fx', 'fy', 'fz', 'mx', 'my', 'mz']
    const interpolatedData: ForceTorque6D = { fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0 }

    for (const key of keys) {
      const smoothAlpha = this.smoothstep(alpha)
      interpolatedData[key] = a.data[key] + smoothAlpha * (b.data[key] - a.data[key])
    }

    this.interpolatedCount++
    const collisionDetected = alpha > 0.5 ? b.collisionDetected : a.collisionDetected
    const collisionIntensity = a.collisionIntensity + alpha * (b.collisionIntensity - a.collisionIntensity)

    return {
      timestamp: targetTime,
      data: interpolatedData,
      collisionDetected,
      collisionIntensity,
      isInterpolated: true,
    }
  }

  private createPredictedFrame(last: BufferedFrame, targetTime: number): BufferedFrame {
    const dt = (targetTime - last.timestamp) / 1000
    const predicted: ForceTorque6D = { fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0 }

    if (this.buffer.length >= 2) {
      const prev = this.buffer[this.buffer.length - 2]
      const prevDt = (last.timestamp - prev.timestamp) / 1000
      if (prevDt > 0.001) {
        const keys: (keyof ForceTorque6D)[] = ['fx', 'fy', 'fz', 'mx', 'my', 'mz']
        for (const key of keys) {
          const velocity = (last.data[key] - prev.data[key]) / prevDt
          const decay = Math.exp(-dt * 8)
          predicted[key] = last.data[key] + velocity * dt * decay
        }
      } else {
        Object.assign(predicted, last.data)
      }
    } else {
      Object.assign(predicted, last.data)
    }

    this.interpolatedCount++
    return {
      timestamp: targetTime,
      data: predicted,
      collisionDetected: last.collisionDetected,
      collisionIntensity: last.collisionIntensity * Math.exp(-dt * 5),
      isInterpolated: true,
    }
  }

  private smoothstep(t: number): number {
    return t * t * (3 - 2 * t)
  }

  getStats(): { bufferSize: number; interpolationRate: number; isBuffering: boolean } {
    const total = this.packetCount + this.interpolatedCount
    return {
      bufferSize: this.buffer.length,
      interpolationRate: total > 0 ? this.interpolatedCount / total : 0,
      isBuffering: this.buffer.length < 2,
    }
  }

  getDelayMs(): number {
    return this.targetDelayMs
  }

  reset(): void {
    this.buffer = []
    this.packetCount = 0
    this.interpolatedCount = 0
  }
}
