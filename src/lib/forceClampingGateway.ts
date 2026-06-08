import type { Position3D } from '@/types/haptic'
import type { TissueType, TissueProfile } from '@/types/tissue'
import { TISSUE_PROFILES } from '@/types/tissue'

export type SafetyLevel = 'safe' | 'warning' | 'critical' | 'exceeded'

export interface ClampedForceOutput {
  clampedForce: Position3D
  clampedTorque: Position3D
  originalForce: Position3D
  originalTorque: Position3D
  forceMagnitude: number
  clampedForceMagnitude: number
  forceUtilization: number
  torqueUtilization: number
  maxUtilization: number
  safetyLevel: SafetyLevel
  wasClamped: boolean
  clampRatio: number
  tissueProfile: TissueProfile
}

export class ForceClampingGateway {
  private tissueType: TissueType = 'hepatic_parenchyma'
  private safetyOverride = false
  private clampingEventCount = 0
  private lastClampTime = 0

  setTissueType(type: TissueType): void {
    this.tissueType = type
  }

  getTissueType(): TissueType {
    return this.tissueType
  }

  setSafetyOverride(enabled: boolean): void {
    this.safetyOverride = enabled
  }

  getProfile(): TissueProfile {
    return TISSUE_PROFILES[this.tissueType]
  }

  process(force: Position3D, torque: Position3D): ClampedForceOutput {
    const profile = this.getProfile()

    const forceMag = Math.sqrt(force.x ** 2 + force.y ** 2 + force.z ** 2)
    const torqueMag = Math.sqrt(torque.x ** 2 + torque.y ** 2 + torque.z ** 2)

    const forceUtil = forceMag / profile.maxForceN
    const torqueUtil = torqueMag / profile.maxTorqueNm
    const maxUtil = Math.max(forceUtil, torqueUtil)

    let clampedForce: Position3D
    let clampedTorque: Position3D
    let clampedForceMag = forceMag
    let wasClamped = false
    let clampRatio = 1
    let safetyLevel: SafetyLevel = 'safe'

    if (maxUtil > profile.criticalThresholdPct) {
      safetyLevel = 'critical'
    } else if (maxUtil > profile.warningThresholdPct) {
      safetyLevel = 'warning'
    }

    if (forceUtil > 1 || torqueUtil > 1) {
      safetyLevel = 'exceeded'
      wasClamped = true
      this.clampingEventCount++
      this.lastClampTime = Date.now()

      if (!this.safetyOverride) {
        if (forceMag > profile.maxForceN && forceMag > 0.001) {
          const forceScale = profile.maxForceN / forceMag
          clampedForce = {
            x: force.x * forceScale,
            y: force.y * forceScale,
            z: force.z * forceScale,
          }
          clampedForceMag = profile.maxForceN
          clampRatio = Math.min(clampRatio, forceScale)
        } else {
          clampedForce = { ...force }
        }

        if (torqueMag > profile.maxTorqueNm && torqueMag > 0.001) {
          const torqueScale = profile.maxTorqueNm / torqueMag
          clampedTorque = {
            x: torque.x * torqueScale,
            y: torque.y * torqueScale,
            z: torque.z * torqueScale,
          }
          clampRatio = Math.min(clampRatio, torqueScale)
        } else {
          clampedTorque = { ...torque }
        }
      } else {
        clampedForce = { ...force }
        clampedTorque = { ...torque }
      }
    } else {
      clampedForce = { ...force }
      clampedTorque = { ...torque }
    }

    return {
      clampedForce,
      clampedTorque,
      originalForce: { ...force },
      originalTorque: { ...torque },
      forceMagnitude: forceMag,
      clampedForceMagnitude: clampedForceMag,
      forceUtilization: forceUtil,
      torqueUtilization: torqueUtil,
      maxUtilization: maxUtil,
      safetyLevel,
      wasClamped,
      clampRatio,
      tissueProfile: profile,
    }
  }

  getClampingEventCount(): number {
    return this.clampingEventCount
  }

  getLastClampTime(): number {
    return this.lastClampTime
  }

  isRecentlyClamped(withinMs = 2000): boolean {
    return this.lastClampTime > 0 && Date.now() - this.lastClampTime < withinMs
  }

  reset(): void {
    this.clampingEventCount = 0
    this.lastClampTime = 0
  }
}
