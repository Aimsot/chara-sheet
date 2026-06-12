import { ELEMENT_DATA, SPECIES_DATA, STYLE_DATA, STYLE_MAGIC_TYPE } from '@/constants/preciousdays';
import { Character } from '@/types/preciousdays/character';

const isKatakanaOnly = (str: string) => /^[ァ-ヶーｦ-ﾟ・\u3000\s]+$/.test(str);
const wrapName = (name: string) => (isKatakanaOnly(name) ? `《${name}》` : name);

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

  const sp = char.profileSpoilers ?? {};
  const as_ = char.appearanceSpoilers ?? {};
  const ls = char.lifepathSpoilers ?? {};

  const speciesName = SPECIES_DATA[char.species as keyof typeof SPECIES_DATA]?.name ?? char.species;
  const styleName = styleData?.name ?? char.style;
  const elementName = ELEMENT_DATA[char.element as keyof typeof ELEMENT_DATA]?.name ?? char.element;

  const profileLine = [
    !sp.species ? `種族：${speciesName}` : '',
    !sp.style ? `スタイル：${styleName}` : '',
    !sp.element ? `属性：${elementName}` : '',
  ]
    .filter(Boolean)
    .join('　');

  const ap = char.appearance ?? {};
  const agePart = !as_.age && ap.age ? `年齢：${ap.age}` : '';
  const genderPart = !as_.gender && ap.gender ? `性別：${ap.gender}` : '';
  const heightPart = !as_.height && ap.height ? `身長：${ap.height}` : '';
  const hairPart = !as_.hairColor && ap.hairColor ? `髪の色：${ap.hairColor}` : '';
  const appearanceLines = [
    [agePart, genderPart].filter(Boolean).join('　'),
    [heightPart, hairPart].filter(Boolean).join('　'),
    !as_.eyeColor && ap.eyeColor ? `瞳の色：${ap.eyeColor}` : '',
    !as_.skinColor && ap.skinColor ? `肌の色：${ap.skinColor}` : '',
  ].filter(Boolean);

  const lifepathLines = [
    !ls.origin && char.origin ? `出自：${char.origin}` : '',
    !ls.secret && char.secret ? `秘密：${char.secret}` : '',
    !ls.future && char.future ? `未来：${char.future}` : '',
  ].filter(Boolean);

  const memoHeader = [
    `${char.characterName || '名無し'}　PL：${char.playerName || ''}`,
    char.characterType === 'master'
      ? char.discipleName
        ? `弟子：${char.discipleName}`
        : ''
      : char.masterName
        ? `師匠：${char.masterName}`
        : '',
    profileLine,
  ].filter(Boolean);

  const memo = [
    ...memoHeader,
    ...(appearanceLines.length > 0 ? ['', '【外見】', ...appearanceLines] : []),
    ...(lifepathLines.length > 0 ? ['', '【ライフパス】', ...lifepathLines] : []),
  ].join('\n');

  const isMaster = char.characterType === 'master';

  const commands = isMaster
    ? ''
    : [
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
        ...(() => {
          const acquiredSkills = char.skills.filter((s) => s.name && s.acquired !== false);
          return acquiredSkills.length > 0
            ? [
                ``,
                `【スキル】`,
                ...acquiredSkills.map((s) => {
                  const lines = [
                    wrapName(s.name),
                    `分類：${s.category || ''}　GL：${s.level ?? 0}`,
                    s.timing ? `タイミング：${s.timing}` : '',
                    s.judge || s.target ? `判定：${s.judge || ''}　対象：${s.target || ''}` : '',
                    s.range || s.cost ? `射程：${s.range || '―'}　コスト：${s.cost || '0'}` : '',
                    s.effect ? `効果：${s.effect}` : '',
                    s.critical ? `クリティカル：${s.critical}` : '',
                  ].filter(Boolean);
                  return lines.join('\\n');
                }),
              ]
            : [];
        })(),
        ...(() => {
          const acquiredEnchantments = (char.enchantments ?? []).filter(
            (e) => e.name && e.acquired !== false
          );
          return acquiredEnchantments.length > 0
            ? [
                ``,
                `【付与魔術】`,
                ...acquiredEnchantments.map((e) => {
                  const lines = [
                    wrapName(e.name),
                    `GL：${e.gl ?? 0}${e.timing ? `　タイミング：${e.timing}` : ''}`,
                    e.effect ? `効果：${e.effect}` : '',
                  ].filter(Boolean);
                  return lines.join('\\n');
                }),
              ]
            : [];
        })(),
      ].join('\n');

  const payload = {
    kind: 'character',
    data: {
      name: char.characterName || '名無し',
      memo,
      status: isMaster
        ? []
        : [
            { label: 'HP', value: hpTotal, max: hpTotal },
            { label: 'MP', value: mpTotal, max: mpTotal },
            { label: 'WP', value: wpTotal, max: wpTotal },
            { label: 'GL', value: char.gl || 0, max: 6 },
          ],
      params: isMaster
        ? []
        : [
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
