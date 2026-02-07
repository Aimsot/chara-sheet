export const SYSTEM_DATA = [
  { k: 'preciousdays', l: 'プレシャスデイズ' },
  //   { k: 'dbx3rd', l: 'ダブルクロス3rd' },
] as const;

export type SystemKey = (typeof SYSTEM_DATA)[number]['k'];
