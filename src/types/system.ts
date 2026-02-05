// 将来システムが増えたら、ここに追加するだけでOK
export const TRPG_SYSTEMS = {
  GENERAL: 'general',
  PRECIOUS_DAYS: 'preciousdays',
  // FUTURE_SYSTEM: 'future_system', // 追加例
} as const;

export type TRPGSystemType = (typeof TRPG_SYSTEMS)[keyof typeof TRPG_SYSTEMS];
