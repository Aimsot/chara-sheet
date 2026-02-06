import React, { memo, useMemo, useState } from 'react';

import { STYLE_MAGIC_TYPE } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
// tableStyles をインポートして AbilitySection と統一
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character } from '@/types/preciousdays/character';

import { NumberInput } from '../ui/NumberInput';

interface CombatSectionProps {
  char: Character;
  isReadOnly?: boolean;
  handleCombatModifierChange: (
    target: 'combatValues' | 'specialChecks',
    key: string,
    newValue: number
  ) => void;
}

export const CombatSection: React.FC<CombatSectionProps> = memo(
  ({ char, isReadOnly, handleCombatModifierChange }) => {
    const [isOpen, setIsOpen] = useState(isReadOnly);

    // --- デザイン用のグリッド設定 (AbilitySection の作法に合わせる) ---
    const combatGridStyle = {
      display: 'grid',
      gridTemplateColumns: '160px 1fr 1fr 1fr 1fr', // 5列構成
    };

    const specialGridStyle = {
      display: 'grid',
      gridTemplateColumns: '160px 1fr 1fr 1fr', // 4列構成
    };

    // --- 計算ロジック (ロジック維持) ---
    const stats = useMemo(() => {
      const p = char.abilities.physical.total || 0;
      const i = char.abilities.intellect.total || 0;
      const m = char.abilities.mystic.total || 0;
      const a = char.abilities.agility.total || 0;
      const pa = char.abilities.passion.total || 0;
      const af = char.abilities.affection.total || 0;

      const getEquipTotal = (key: keyof import('@/types/preciousdays/character').EquipmentItem) => {
        if (!char.equipment) return 0;
        return Object.values(char.equipment).reduce((sum, item) => {
          const val = Number(item[key]) || 0;
          return sum + val;
        }, 0);
      };

      const magicType = STYLE_MAGIC_TYPE[char.style] || '付与術式';

      let magicBase = 0;
      if (magicType === '付与術式') magicBase = p + a;
      else if (magicType === '詠唱術式') magicBase = i + pa;
      else if (magicType === '神性術式') magicBase = m + af;

      const equipDodge = getEquipTotal('dodgeMod');
      const dodgeBase = m + a + 7 + equipDodge;

      const equipDefense = getEquipTotal('defenseMod');
      const defenseBase = p + equipDefense;

      const loreBase = i;

      return {
        magic: { base: magicBase, label: magicType },
        dodge: { base: dodgeBase },
        defense: { base: defenseBase },
        lore: { base: loreBase },
      };
    }, [char.abilities, char.style, char.equipment]);

    // --- 装備品の修正値を計算するヘルパー関数 (ロジック維持) ---
    const calculateEquipBonus = (key: string): number => {
      let total = 0;
      const slots = ['rHand', 'lHand', 'head', 'body', 'accessory', 'guardian'] as const;

      slots.forEach((slot) => {
        const item = char.equipment[slot];
        if (!item) return;

        if (key === 'dodge') total += item.dodgeMod || 0;
        if (key === 'defense') total += item.defenseMod || 0;
        if (key === 'magic') total += item.hitMod || 0;
      });

      return total;
    };
    // --- 行レンダリング  ---
    const renderRow = (
      label: string,
      target: 'combatValues' | 'specialChecks',
      key: string,
      baseValue: number,
      diceText: string = '',
      isSpecial: boolean = false // 特殊判定かどうかで列数を制御
    ) => {
      const modifier = (char[target] as any)?.[key]?.modifier;
      const isInvalid = Number.isNaN(modifier);
      const equipMod = calculateEquipBonus(key);
      const total = baseValue + (isSpecial ? 0 : equipMod) + (isInvalid ? 0 : modifier);

      return (
        <div
          className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
          key={key}
          style={isSpecial ? specialGridStyle : combatGridStyle}
        >
          {/* 項目名ラベル */}
          <div className={tableStyles.labelCell}>{label}</div>

          {/* 1. 判定値 (能力値由来) */}
          <div className={tableStyles.cell}>{baseValue}</div>

          {/* 2. 装備修正値 (戦闘値セクションのみ表示) */}
          {!isSpecial && (
            <div className={tableStyles.cell}>
              <span style={{ color: equipMod !== 0 ? 'inherit' : 'var(--text-muted)' }}>
                {equipMod > 0 ? `+${equipMod}` : equipMod}
              </span>
            </div>
          )}

          {/* 3. その他修正 (Stepper) */}
          <div className={tableStyles.cell}>
            {isReadOnly ? (
              modifier
            ) : (
              <div className={formStyles.stepper}>
                <button
                  onClick={() =>
                    handleCombatModifierChange(target, key, (isInvalid ? 0 : modifier) - 1)
                  }
                  type='button'
                >
                  -
                </button>
                <NumberInput
                  onChange={(val) => handleCombatModifierChange(target, key, val)}
                  value={modifier}
                />
                <button
                  onClick={() =>
                    handleCombatModifierChange(target, key, (isInvalid ? 0 : modifier) + 1)
                  }
                  type='button'
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* 4. 合計値 */}
          <div className={`${tableStyles.cell} ${tableStyles.totalCell}`}>
            <span style={{ color: isInvalid ? '#ff4444' : 'inherit' }}>
              {isInvalid ? '?' : total}
            </span>
            {diceText && (
              <span
                className={tableStyles.subText}
                style={{ marginLeft: '4px', fontSize: '0.8rem', opacity: 0.7 }}
              >
                ({diceText})
              </span>
            )}
          </div>
        </div>
      );
    };

    const magicLabelText = useMemo(() => {
      return stats.magic?.label ?? '付与術式';
    }, [stats.magic]);

    return (
      <section className={cardStyles.base}>
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={cardStyles.title}>戦闘値・判定</h2>
          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          {/* セクション1: 戦闘値 (5列) */}
          <div className={tableStyles.scrollContainer}>
            <div className={tableStyles.gridTable}>
              <div className={tableStyles.headerRow} style={combatGridStyle}>
                <div className={tableStyles.labelCell}>戦闘値</div>
                <div className={tableStyles.cell}>判定</div>
                <div className={tableStyles.cell}>装備修正</div>
                <div className={tableStyles.cell}>修正</div>
                <div className={tableStyles.cell}>合計</div>
              </div>
              {renderRow(`魔術値: ${magicLabelText}`, 'combatValues', 'magic', stats.magic.base)}
              {renderRow('回避値', 'combatValues', 'dodge', stats.dodge.base)}
              {renderRow('防御値', 'combatValues', 'defense', stats.defense.base)}
            </div>
          </div>

          {/* セクション2: 特殊判定 (4列) */}
          <div className={`${tableStyles.scrollContainer} ${layoutStyles.mt4}`}>
            <div className={tableStyles.gridTable}>
              <div className={tableStyles.headerRow} style={specialGridStyle}>
                <div className={tableStyles.labelCell}>特殊な判定</div>
                <div className={tableStyles.cell}>判定</div>
                <div className={tableStyles.cell}>修正</div>
                <div className={tableStyles.cell}>合計</div>
              </div>
              {renderRow('エネミー識別', 'specialChecks', 'enemyLore', stats.lore.base, '', true)}
              {renderRow('鑑定', 'specialChecks', 'appraisal', stats.lore.base, '', true)}
            </div>
          </div>
        </div>
      </section>
    );
  }
);
CombatSection.displayName = 'CombatSection';
export default CombatSection;
