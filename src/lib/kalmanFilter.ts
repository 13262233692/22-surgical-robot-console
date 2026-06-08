export class KalmanFilter1D {
  private x: number
  private p: number
  private q: number
  private r: number

  constructor(processNoise = 0.01, measurementNoise = 0.1, initialState = 0) {
    this.x = initialState
    this.p = 1
    this.q = processNoise
    this.r = measurementNoise
  }

  predict(dt: number = 1): number {
    this.p = this.p + this.q * dt
    return this.x
  }

  update(measurement: number): number {
    const k = this.p / (this.p + this.r)
    this.x = this.x + k * (measurement - this.x)
    this.p = (1 - k) * this.p
    return this.x
  }

  getState(): number {
    return this.x
  }

  getVariance(): number {
    return this.p
  }

  reset(state = 0): void {
    this.x = state
    this.p = 1
  }
}

export interface ForceTorque6D {
  fx: number
  fy: number
  fz: number
  mx: number
  my: number
  mz: number
}

export class KalmanFilter6D {
  private filters: KalmanFilter1D[]
  private velocityFilters: KalmanFilter1D[]
  private lastState: ForceTorque6D
  private lastUpdateTime: number
  private initialized: boolean

  constructor(
    processNoise = 0.008,
    measurementNoise = 0.15
  ) {
    this.filters = Array.from({ length: 6 }, () => new KalmanFilter1D(processNoise, measurementNoise))
    this.velocityFilters = Array.from({ length: 6 }, () => new KalmanFilter1D(processNoise * 2, measurementNoise * 3))
    this.lastState = { fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0 }
    this.lastUpdateTime = 0
    this.initialized = false
  }

  private toVector(ft: ForceTorque6D): number[] {
    return [ft.fx, ft.fy, ft.fz, ft.mx, ft.my, ft.mz]
  }

  private fromVector(v: number[]): ForceTorque6D {
    return { fx: v[0], fy: v[1], fz: v[2], mx: v[3], my: v[4], mz: v[5] }
  }

  filter(raw: ForceTorque6D, timestamp: number): ForceTorque6D {
    const dt = this.lastUpdateTime > 0 ? (timestamp - this.lastUpdateTime) / 1000 : 0.01
    const dtClamped = Math.max(0.001, Math.min(dt, 0.1))
    const rawVec = this.toVector(raw)

    if (!this.initialized) {
      this.filters.forEach((f, i) => { f.reset(rawVec[i]); f.update(rawVec[i]) })
      this.velocityFilters.forEach(f => f.reset(0))
      this.lastState = { ...raw }
      this.lastUpdateTime = timestamp
      this.initialized = true
      return { ...raw }
    }

    this.filters.forEach(f => f.predict(dtClamped))
    this.velocityFilters.forEach(f => f.predict(dtClamped))

    const filteredVec: number[] = []
    for (let i = 0; i < 6; i++) {
      const prevVal = this.filters[i].getState()
      const velocity = (rawVec[i] - prevVal) / dtClamped
      const smoothedVelocity = this.velocityFilters[i].update(velocity)
      const positionEstimate = this.filters[i].update(rawVec[i])
      const blended = positionEstimate + smoothedVelocity * dtClamped * 0.15
      filteredVec.push(blended)
    }

    this.lastState = this.fromVector(filteredVec)
    this.lastUpdateTime = timestamp
    return this.lastState
  }

  predictForward(targetTime: number): ForceTorque6D {
    if (!this.initialized) return this.lastState
    const dt = (targetTime - this.lastUpdateTime) / 1000
    if (dt <= 0) return this.lastState

    const predicted: number[] = []
    for (let i = 0; i < 6; i++) {
      const velocity = this.velocityFilters[i].getState()
      const position = this.filters[i].getState()
      const dtClamped = Math.min(dt, 0.05)
      predicted.push(position + velocity * dtClamped)
    }
    return this.fromVector(predicted)
  }

  getInnovation(raw: ForceTorque6D): number {
    if (!this.initialized) return 0
    const rawVec = this.toVector(raw)
    const stateVec = this.toVector(this.lastState)
    let sumSq = 0
    for (let i = 0; i < 6; i++) {
      const diff = rawVec[i] - stateVec[i]
      sumSq += diff * diff
    }
    return Math.sqrt(sumSq)
  }

  reset(): void {
    this.filters.forEach(f => f.reset(0))
    this.velocityFilters.forEach(f => f.reset(0))
    this.lastState = { fx: 0, fy: 0, fz: 0, mx: 0, my: 0, mz: 0 }
    this.lastUpdateTime = 0
    this.initialized = false
  }
}
