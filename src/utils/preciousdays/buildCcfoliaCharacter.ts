import { ELEMENT_DATA, SPECIES_DATA, STYLE_DATA, STYLE_MAGIC_TYPE } from '@/constants/preciousdays';
import { Character } from '@/types/preciousdays/character';

export function buildCcfoliaCharacter(char: Character): string {
  const style = char.style;
  const styleData = STYLE_DATA[style as keyof typeof STYLE_DATA];
  const magicType = STYLE_MAGIC_TYPE[style] ?? '付与術式';

  const p = char.abilities.physical.total || 0;
  const i = char.abilities.intellect.total || 0;
  const m = char.abilities.mystic.total || 0;
  const a = char.abilities.agility.total || 0;
  const pa = char.abilities.passion.total || 0;
  const af = char.abilities.affection.total || 0;

  // HP/MP/WP（GLによる成長を含む）
  const glLevel = char.gl || 0;
  const hpBase = (styleData?.hp.base ?? 0) + (styleData?.hp.growth ?? 0) * glLevel;
  const mpBase = (styleData?.mp.base ?? 0) + (styleData?.mp.growth ?? 0) * glLevel;
  const wpBase = pa + af;
  const hpTotal = hpBase + (char.hp.modifier || 0);
  const mpTotal = mpBase + (char.mp.modifier || 0);
  const wpTotal = wpBase + (char.wp.modifier || 0);

  // 魔術値のベース
  let magicBase = 0;
  if (magicType === '付与術式') magicBase = p + a;
  else if (magicType === '詠唱術式') magicBase = i + pa;
  else if (magicType === '神性術式') magicBase = m + af;

  // 装備修正
  const slots = ['rHand', 'lHand', 'head', 'body', 'accessory', 'guardian'] as const;
  let magicEquipMod = 0;
  let defenseEquipMod = 0;
  let damageEquipMod = 0;
  slots.forEach((slot) => {
    const item = char.equipment?.[slot];
    if (!item) return;
    defenseEquipMod += Number(item.defenseMod) || 0;
    if (magicType === '付与術式') {
      magicEquipMod += Number(item.hitMod) || 0;
      damageEquipMod += Number(item.damage) || 0;
    }
  });

  const magicTotal = magicBase + magicEquipMod + (char.combatValues.magic.modifier || 0);
  const dodgeTotal = m + a + 7 + (char.combatValues.dodge.modifier || 0);
  const defenseTotal = p + defenseEquipMod + (char.combatValues.defense.modifier || 0);
  const damageModTotal = damageEquipMod + (char.combatValues.damage.modifier || 0);

  const speciesName = SPECIES_DATA[char.species as keyof typeof SPECIES_DATA]?.name ?? char.species;
  const styleName = styleData?.name ?? char.style;
  const elementName = ELEMENT_DATA[char.element as keyof typeof ELEMENT_DATA]?.name ?? char.element;

  const appearanceParts = [
    char.appearance.age ? `年齢: ${char.appearance.age}` : '',
    char.appearance.gender ? `性別: ${char.appearance.gender}` : '',
    char.appearance.height ? `身長: ${char.appearance.height}` : '',
    char.appearance.hairColor ? `髪の色: ${char.appearance.hairColor}` : '',
    char.appearance.eyeColor ? `瞳の色: ${char.appearance.eyeColor}` : '',
    char.appearance.skinColor ? `肌の色: ${char.appearance.skinColor}` : '',
  ].filter(Boolean);

  const appearancePaired = [];
  for (let idx = 0; idx < appearanceParts.length; idx += 2) {
    appearancePaired.push(
      appearanceParts[idx + 1]
        ? `${appearanceParts[idx]}　${appearanceParts[idx + 1]}`
        : appearanceParts[idx]
    );
  }

  const memo = [
    `${char.characterName || '名無し'}　PL：${char.playerName || ''}`,
    `種族: ${speciesName}　スタイル: ${styleName}`,
    `属性: ${elementName}　術式: ${magicType}`,
    char.masterName ? `師匠: ${char.masterName}` : '',
    appearancePaired.length > 0 ? `\n【外見】\n${appearancePaired.join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const commands = [
    `2d6+{体力} 体力判定`,
    `2d6+{知力} 知力判定`,
    `2d6+{神秘} 神秘判定`,
    `2d6+{俊敏} 俊敏判定`,
    `2d6+{情熱} 情熱判定`,
    `2d6+{優愛} 優愛判定`,
    `2d6+{魔術値} 魔術判定(${magicType})`,
    `2d6+{知力} エネミー識別`,
    `2d6+{知力} 鑑定`,
    `2d6+${damageModTotal} ダメージ`,
    ``,
    `{防御値} 防御値`,
    `{回避値} 回避値`,
    ...(char.skills.length > 0
      ? [
          ``,
          ...char.skills
            .filter((s) => s.name)
            .map((s) => {
              const meta = [s.timing, s.critical, s.judge, s.target, s.range, s.cost]
                .filter(Boolean)
                .join('/');
              return meta ? `【${s.name}】 ${meta}｜${s.effect}` : `【${s.name}】 ${s.effect}`;
            }),
        ]
      : []),
  ].join('\n');

  const payload = {
    kind: 'character',
    data: {
      name: char.characterName || '名無し',
      memo,
      status: [
        { label: 'HP', value: hpTotal, max: hpTotal },
        { label: 'MP', value: mpTotal, max: mpTotal },
        { label: 'WP', value: wpTotal, max: wpTotal },
        { label: 'GL', value: char.gl || 0, max: 6 },
      ],
      params: [
        { label: '体力', value: String(p) },
        { label: '知力', value: String(i) },
        { label: '神秘', value: String(m) },
        { label: '俊敏', value: String(a) },
        { label: '情熱', value: String(pa) },
        { label: '優愛', value: String(af) },
        { label: '魔術値', value: String(magicTotal) },
        { label: '回避値', value: String(dodgeTotal) },
        { label: '防御値', value: String(defenseTotal) },
      ],
      commands,
      iconUrl: null,
      ...(char.ccfoliaColor ? { color: char.ccfoliaColor } : {}),
    },
  };

  return JSON.stringify(payload);
}
