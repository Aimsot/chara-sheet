import { AbilityScore } from '@/types/preciousdays/character';
export const ABILITY_KEYS = [
  'physical',
  'intellect',
  'mystic',
  'agility',
  'passion',
  'affection',
] as const;
export const ABILITY_DATA = {
  physical: { name: '体力' },
  intellect: { name: '知力' },
  mystic: { name: '神秘' },
  agility: { name: '俊敏' },
  passion: { name: '情熱' },
  affection: { name: '優愛' },
} as const;

export const SPECIES_DATA = {
  human: {
    name: '人間（ヒューミー）',
    abilities: {
      physical: 8,
      intellect: 7,
      mystic: 7,
      agility: 8,
      passion: 10,
      affection: 10,
    },
    description: '平均的でバランスの取れた種族。',
  },
  elf: {
    name: '仙族（エルフ）',
    abilities: {
      physical: 7,
      intellect: 12,
      mystic: 7,
      agility: 8,
      passion: 8,
      affection: 8,
    },
    description: '知力と神秘に優れ、魔法適性が高い。',
  },
  angel: {
    name: '天使（エンジェル）',
    abilities: {
      physical: 8,
      intellect: 10,
      mystic: 10,
      agility: 8,
      passion: 7,
      affection: 7,
    },
    description: '頑強な肉体と情熱的な魂を持つ。',
  },
  therian: {
    name: '獣族（セリアン）',
    abilities: {
      physical: 10,
      intellect: 5,
      mystic: 5,
      agility: 12,
      passion: 9,
      affection: 9,
    },
    description: '俊敏な動きと野生の直感を持つ。',
  },
} as const;

export const STYLE_DATA = {
  enchanter: {
    name: 'エンチャンター',
    bonuses: { physical: 1, agility: 1, affection: 1 },
    hp: {
      base: 30,
      growth: 7,
    },
    mp: { base: 15, growth: 4 },
    wp: { base: 0, growth: 0 },
  },
  caster: {
    name: 'キャスター',
    bonuses: { intellect: 1, passion: 1, affection: 1 },
    hp: {
      base: 28,
      growth: 5,
    },
    mp: { base: 17, growth: 6 },
    wp: { base: 0, growth: 0 },
  },
  shooter: {
    name: 'シューター',
    bonuses: { intellect: 1, agility: 1, affection: 1 },
    hp: {
      base: 30,
      growth: 7,
    },
    mp: { base: 15, growth: 4 },
    wp: { base: 0, growth: 0 },
  },
  shapeshifter: {
    name: 'シェイプシフター',
    bonuses: { physical: 1, mystic: 1, agility: 1 },
    hp: {
      base: 30,
      growth: 7,
    },
    mp: { base: 15, growth: 4 },
    wp: { base: 0, growth: 0 },
  },
  sacrifa: {
    name: 'セイクリファー',
    bonuses: { intellect: 1, mystic: 1, passion: 1 },
    hp: {
      base: 28,
      growth: 5,
    },
    mp: { base: 17, growth: 6 },
    wp: { base: 0, growth: 0 },
  },
  mystic: {
    name: 'ミスティック',
    bonuses: { physical: 1, mystic: 1, passion: 1 },
    hp: {
      base: 29,
      growth: 4,
    },
    mp: { base: 16, growth: 7 },
    wp: { base: 0, growth: 0 },
  },
} as const;

export const ELEMENT_DATA = {
  earth: { name: '地', bonuses: { physical: 1 } },
  water: { name: '水', bonuses: { mystic: 1 } },
  fire: { name: '火', bonuses: { intellect: 1 } },
  wind: { name: '風', bonuses: { agility: 1 } },
  light: { name: '光', bonuses: { affection: 1 } },
  dark: { name: '闇', bonuses: { passion: 1 } },
} as const;

export const APPEARANCE_DATA = [
  { k: 'age', l: '年齢' },
  { k: 'gender', l: '性別' },
  { k: 'height', l: '身長' },
  { k: 'hairColor', l: '髪の色' },
  { k: 'eyeColor', l: '瞳の色' },
  { k: 'skinColor', l: '肌の色' },
] as const;

export const LIFEPATH_DATA = [
  { k: 'origin', l: '出自' },
  { k: 'secret', l: '秘密' },
  { k: 'future', l: '未来' },
] as const;

export const STYLE_MAGIC_TYPE: Record<string, '付与術式' | '詠唱術式' | '神性術式'> = {
  // 付与術式
  enchanter: '付与術式', // エンチャンター
  shapeshifter: '付与術式', // シェイプシフター

  // 詠唱術式
  caster: '詠唱術式', // キャスター
  shooter: '詠唱術式', // シューター

  // 神性術式
  sacrifa: '神性術式', // セイクリファー
  mystic: '神性術式', // ミスティック
};

export type AppearanceKey = (typeof APPEARANCE_DATA)[number]['k'];
export type SpeciesKey = keyof typeof SPECIES_DATA;
export type StyleKey = keyof typeof STYLE_DATA;
export type LifepathKey = (typeof LIFEPATH_DATA)[number]['k'];
export type ElementKey = keyof typeof ELEMENT_DATA;
export type StyleMagicKey = keyof typeof STYLE_MAGIC_TYPE;

export const getInitialAbilities = (sKey: SpeciesKey, tKey: StyleKey) => {
  const baseMap = SPECIES_DATA[sKey].abilities;
  const bonusMap = STYLE_DATA[tKey].bonuses;

  const result: any = {};

  ABILITY_KEYS.forEach((key) => {
    const base = baseMap[key];
    const bonus = (bonusMap as any)[key] || 0;
    const total = base + bonus;

    result[key] = {
      base,
      bonus,
      total,
      adjusted: Math.floor(total / 3),
    };
  });

  return result as Record<(typeof ABILITY_KEYS)[number], AbilityScore>;
};
