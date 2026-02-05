export interface Character {
  system: string;
  id: string; // キャラクターシートのID
  password?: string; // 保存用パスワード
  image?: string; // 画像データ(Base64)

  // --- 基本情報 ---
  playerName?: string; // プレイヤー名
  characterName?: string; // キャラクター名
  masterName?: string; // 師匠

  hp: { modifier: number };
  mp: { modifier: number };
  wp: { modifier: number };
  gl: number;
  // --- プロフィール ---
  experience?: number; // 経験点
  species: string; // 種族名
  style: string; // スタイル名
  element: string; // 属性

  // --- 外見項目 ---
  appearance: {
    age?: string;
    gender?: string;
    height?: string;
    weight?: string;
    hairColor?: string;
    eyeColor?: string;
    skinColor?: string;
  };

  // --- 能力値（基本値 + ボーナス + その他） ---
  abilities: {
    physical: AbilityScore; // 体力
    intellect: AbilityScore; // 知力
    mystic: AbilityScore; // 神秘
    agility: AbilityScore; // 俊敏
    passion: AbilityScore; // 情熱
    affection: AbilityScore; // 優愛
  };

  // --- ライフパス ---
  origin?: string; // 出自
  secret?: string; // 秘密
  future?: string; // 未来

  // --- スキル ---
  skills: Skill[];

  // --- ★新規追加: 戦闘値・特殊判定 ---
  combatValues: {
    magic: CombatValue; // 魔術値
    dodge: CombatValue; // 回避値
    defense: CombatValue; // 防御値
  };

  specialChecks: {
    enemyLore: CombatValue; // エネミー識別
    appraisal: CombatValue; // 鑑定
  };

  // --- ★変更: 装備品 (配列ではなく部位ごとのオブジェクトに変更) ---
  equipment: {
    rHand: EquipmentItem; // 右手
    lHand: EquipmentItem; // 左手
    head: EquipmentItem; // 頭部
    body: EquipmentItem; // 胴部
    accessory: EquipmentItem; // 補助防具
    guardian: EquipmentItem; // 守護魔術
  };

  // --- ★新規追加: 携帯品 ---
  items: Item[];

  // 総重量（計算用）
  totalWeight?: number;
}

// ==========================================
// 補助的な型定義
// ==========================================

// 能力値の内訳
export interface AbilityScore {
  bonus: number; // 成長やボーナス
  otherModifier: number; // その他修正
  total: number; // 合計値
}

// 戦闘値・判定値の構造
export interface CombatValue {
  modifier: number; // 装備やスキルによる修正値
}

// スキル
export interface Skill {
  id: string;
  name: string;
  level: number;
  effect: string;
}

// 装備品の1アイテム（武器・防具兼用）
export interface EquipmentItem {
  name: string;
  weight: number;
  hitMod: number; // 命中修正
  damage: string; // ダメージ (例: "2D+7")
  range: string; // 射程
  dodgeMod: number; // 回避修正
  defenseMod: number; // 防御修正
  magicDefense: number; // もし魔防があれば
  notes: string; // 備考
}

// 携帯品
export interface Item {
  id: string;
  name: string;
  weight: number;
  quantity: number; // 個数
  notes: string;
  isEquipped?: boolean; // チェックボックス用（もし必要なら）
}
