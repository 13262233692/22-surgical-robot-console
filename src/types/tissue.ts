export type TissueType =
  | 'vessel_anastomosis'
  | 'cerebral_cortex'
  | 'cardiac_myocardium'
  | 'pulmonary_parenchyma'
  | 'hepatic_parenchyma'
  | 'intestinal_wall'
  | 'muscle_tissue'
  | 'bone'

export interface TissueProfile {
  id: TissueType
  label: string
  labelCn: string
  maxForceN: number
  maxTorqueNm: number
  warningThresholdPct: number
  criticalThresholdPct: number
  elasticityCoeff: number
  description: string
}

export const TISSUE_PROFILES: Record<TissueType, TissueProfile> = {
  vessel_anastomosis: {
    id: 'vessel_anastomosis',
    label: 'Vessel Anastomosis',
    labelCn: '血管吻合处',
    maxForceN: 2.0,
    maxTorqueNm: 0.5,
    warningThresholdPct: 0.6,
    criticalThresholdPct: 0.85,
    elasticityCoeff: 0.3,
    description: '极度脆弱——血管壁缝合处，拉伸张力极限仅2N',
  },
  cerebral_cortex: {
    id: 'cerebral_cortex',
    label: 'Cerebral Cortex',
    labelCn: '大脑皮层',
    maxForceN: 3.0,
    maxTorqueNm: 0.8,
    warningThresholdPct: 0.55,
    criticalThresholdPct: 0.8,
    elasticityCoeff: 0.2,
    description: '神经组织——不可再生，压迫即损伤',
  },
  cardiac_myocardium: {
    id: 'cardiac_myocardium',
    label: 'Cardiac Myocardium',
    labelCn: '心肌组织',
    maxForceN: 5.0,
    maxTorqueNm: 1.5,
    warningThresholdPct: 0.65,
    criticalThresholdPct: 0.85,
    elasticityCoeff: 0.5,
    description: '搏动组织——需避开心律周期施力',
  },
  pulmonary_parenchyma: {
    id: 'pulmonary_parenchyma',
    label: 'Pulmonary Parenchyma',
    labelCn: '肺实质',
    maxForceN: 4.0,
    maxTorqueNm: 1.0,
    warningThresholdPct: 0.6,
    criticalThresholdPct: 0.82,
    elasticityCoeff: 0.4,
    description: '含气囊腔——过度挤压导致不可逆损伤',
  },
  hepatic_parenchyma: {
    id: 'hepatic_parenchyma',
    label: 'Hepatic Parenchyma',
    labelCn: '肝实质',
    maxForceN: 8.0,
    maxTorqueNm: 2.0,
    warningThresholdPct: 0.65,
    criticalThresholdPct: 0.85,
    elasticityCoeff: 0.6,
    description: '富血供脏器——撕裂导致大出血',
  },
  intestinal_wall: {
    id: 'intestinal_wall',
    label: 'Intestinal Wall',
    labelCn: '肠壁',
    maxForceN: 6.0,
    maxTorqueNm: 1.5,
    warningThresholdPct: 0.6,
    criticalThresholdPct: 0.83,
    elasticityCoeff: 0.5,
    description: '薄壁空腔脏器——穿孔风险高',
  },
  muscle_tissue: {
    id: 'muscle_tissue',
    label: 'Muscle Tissue',
    labelCn: '肌肉组织',
    maxForceN: 15.0,
    maxTorqueNm: 4.0,
    warningThresholdPct: 0.7,
    criticalThresholdPct: 0.88,
    elasticityCoeff: 0.8,
    description: '弹性较高——仍需控制夹持力度',
  },
  bone: {
    id: 'bone',
    label: 'Bone',
    labelCn: '骨骼',
    maxForceN: 25.0,
    maxTorqueNm: 8.0,
    warningThresholdPct: 0.75,
    criticalThresholdPct: 0.9,
    elasticityCoeff: 1.0,
    description: '高硬度组织——可承受较大力矩',
  },
}

export const TISSUE_LIST: TissueType[] = [
  'vessel_anastomosis',
  'cerebral_cortex',
  'cardiac_myocardium',
  'pulmonary_parenchyma',
  'hepatic_parenchyma',
  'intestinal_wall',
  'muscle_tissue',
  'bone',
]
