import React, { memo, useCallback, useMemo, useState } from 'react';

import { STYLE_MAGIC_TYPE } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character } from '@/types/preciousdays/character';

import { NumberInput } from '../ui/NumberInput';

interface CombatRowProps {
  label: string;
  target: 'combatValues' | 'specialChecks';
  dataKey: string;
  baseValue: number;
  modifier: number;
  equipMod?: number;
  isSpecial?: boolean;
  diceText?: string;
  isReadOnly?: boolean;
  onUpdate: (target: 'combatValues' | 'specialChecks', key: string, newValue: number) => void;
  gridStyle: React.CSSProperties;
}

const CombatRow: React.FC<CombatRowProps> = memo(
  ({
    label,
    target,
    dataKey,
    baseValue,
    modifier,
    equipMod = 0,
    isSpecial = false,
    diceText = '',
    isReadOnly,
    onUpdate,
    gridStyle,
  }) => {
    const handleChange = useCallback(
      (val: number) => {
        onUpdate(target, dataKey, val);
      },
      [onUpdate, target, dataKey]
    );

    const isInvalid = Number.isNaN(modifier);
    const total = baseValue + (isSpecial ? 0 : equipMod) + (isInvalid ? 0 : modifier);

    return (
      <div
        className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
        style={gridStyle}
      >
        <div className={tableStyles.labelCell}>{label}</div>
        <div className={tableStyles.cell}>{baseValue}</div>

        {!isSpecial && (
          <div className={tableStyles.cell}>
            <span style={{ color: equipMod !== 0 ? 'inherit' : 'var(--text-muted)' }}>
              {equipMod > 0 ? `+${equipMod}` : equipMod}
            </span>
          </div>
        )}

        <div className={tableStyles.cell}>
          {isReadOnly ? (
            modifier
          ) : (
            <div className={formStyles.stepper}>
              <button onClick={() => handleChange((isInvalid ? 0 : modifier) - 1)} type='button'>
                -
              </button>
              {/* ▼ 安定した handleChange を渡す */}
              <NumberInput onChange={handleChange} value={modifier} />
              <button onClick={() => handleChange((isInvalid ? 0 : modifier) + 1)} type='button'>
                +
              </button>
            </div>
          )}
        </div>

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
  }
);
CombatRow.displayName = 'CombatRow';

interface CombatSectionProps {
  combatValues: Character['combatValues'];
  specialChecks: Character['specialChecks'];
  abilities: Character['abilities'];
  equipment: Character['equipment'];
  style: string;
  isReadOnly?: boolean;
  handleCombatModifierChange: (
    target: 'combatValues' | 'specialChecks',
    key: string,
    newValue: number
  ) => void;
}

export const CombatSection: React.FC<CombatSectionProps> = memo(
  ({
    combatValues,
    specialChecks,
    abilities,
    equipment,
    style,
    isReadOnly,
    handleCombatModifierChange,
  }) => {
    const [isOpen, setIsOpen] = useState(isReadOnly);

    // グリッド設定
    const combatGridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: '160px 1fr 1fr 1fr 1fr',
    };
    const specialGridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: '160px 1fr 1fr 1fr',
    };
    const damageGridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: '160px 1fr',
    };

    // 計算ロジック
    const stats = useMemo(() => {
      const p = abilities.physical.total || 0;
      const i = abilities.intellect.total || 0;
      const m = abilities.mystic.total || 0;
      const a = abilities.agility.total || 0;
      const pa = abilities.passion.total || 0;
      const af = abilities.affection.total || 0;

      const magicType = STYLE_MAGIC_TYPE[style] || '付与術式';

      let magicBase = 0;
      if (magicType === '付与術式') magicBase = p + a;
      else if (magicType === '詠唱術式') magicBase = i + pa;
      else if (magicType === '神性術式') magicBase = m + af;

      return {
        magic: { base: magicBase, label: magicType },
        dodge: { base: m + a + 7 },
        defense: { base: p },
        lore: { base: i },
      };
    }, [abilities, style]);

    const calculateEquipBonus = useCallback(
      (key: string): number => {
        let total = 0;
        const slots = ['rHand', 'lHand', 'head', 'body', 'accessory', 'guardian'] as const;
        const magicType = STYLE_MAGIC_TYPE[style] || '付与術式';

        slots.forEach((slot) => {
          const item = equipment?.[slot];
          if (!item) return;

          if (key === 'dodge') total += Number(item.dodgeMod) || 0;
          if (key === 'defense') total += Number(item.defenseMod) || 0;

          if (magicType === '付与術式') {
            if (key === 'magic') total += Number(item.hitMod) || 0;
            if (key === 'damage') total += Number(item.damage) || 0;
          }
        });
        return total;
      },
      [equipment, style]
    );

    const damageTotal = useMemo(() => {
      const equip = calculateEquipBonus('damage');
      const mod = combatValues?.damage?.modifier || 0;
      return 0 + equip + mod;
    }, [calculateEquipBonus, combatValues?.damage?.modifier]);

    const magicLabelText = stats.magic?.label ?? '付与術式';

    return (
      <section className={cardStyles.base}>
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={cardStyles.title}>戦闘値・判定</h2>
          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          {/* 戦闘値 */}
          <div className={tableStyles.scrollContainer}>
            <div className={tableStyles.gridTable}>
              <div className={tableStyles.headerRow} style={combatGridStyle}>
                <div className={tableStyles.labelCell}>戦闘値</div>
                <div className={tableStyles.cell}>判定</div>
                <div className={tableStyles.cell}>装備修正</div>
                <div className={tableStyles.cell}>修正</div>
                <div className={tableStyles.cell}>合計</div>
              </div>

              <CombatRow
                baseValue={stats.magic.base}
                dataKey='magic'
                equipMod={calculateEquipBonus('magic')}
                gridStyle={combatGridStyle}
                isReadOnly={isReadOnly}
                label={`魔術値: ${magicLabelText}`}
                modifier={(combatValues as any)?.magic?.modifier ?? 0}
                onUpdate={handleCombatModifierChange}
                target='combatValues'
              />
              <CombatRow
                baseValue={stats.dodge.base}
                dataKey='dodge'
                equipMod={calculateEquipBonus('dodge')}
                gridStyle={combatGridStyle}
                isReadOnly={isReadOnly}
                label='回避値'
                modifier={(combatValues as any)?.dodge?.modifier ?? 0}
                onUpdate={handleCombatModifierChange}
                target='combatValues'
              />
              <CombatRow
                baseValue={stats.defense.base}
                dataKey='defense'
                equipMod={calculateEquipBonus('defense')}
                gridStyle={combatGridStyle}
                isReadOnly={isReadOnly}
                label='防御値'
                modifier={(combatValues as any)?.defense?.modifier ?? 0}
                onUpdate={handleCombatModifierChange}
                target='combatValues'
              />
            </div>
          </div>

          {/* ダメージ行  */}
          <div
            className={`${tableStyles.scrollContainer} ${layoutStyles.mt4}`}
            style={{ margin: '12px 0' }}
          >
            <div className={tableStyles.gridTable} style={damageGridStyle}>
              <div
                className={tableStyles.labelCell}
                style={{
                  backgroundColor: '#000',
                  color: 'var(--text-secondary)',
                  textAlign: 'center',
                }}
              >
                ダメージ
              </div>
              <div
                className={tableStyles.cell}
                style={{ fontSize: '1.25rem', fontWeight: 'bold', paddingLeft: '16px' }}
              >
                2D + {damageTotal}
              </div>
            </div>
          </div>

          {/* 特殊判定 */}
          <div className={`${tableStyles.scrollContainer} ${layoutStyles.mt4}`}>
            <div className={tableStyles.gridTable}>
              <div className={tableStyles.headerRow} style={specialGridStyle}>
                <div className={tableStyles.labelCell}>特殊な判定</div>
                <div className={tableStyles.cell}>判定</div>
                <div className={tableStyles.cell}>修正</div>
                <div className={tableStyles.cell}>合計</div>
              </div>

              <CombatRow
                baseValue={stats.lore.base}
                dataKey='enemyLore'
                gridStyle={specialGridStyle}
                isReadOnly={isReadOnly}
                isSpecial={true}
                label='エネミー識別'
                modifier={(specialChecks as any)?.enemyLore?.modifier ?? 0}
                onUpdate={handleCombatModifierChange}
                target='specialChecks'
              />
              <CombatRow
                baseValue={stats.lore.base}
                dataKey='appraisal'
                gridStyle={specialGridStyle}
                isReadOnly={isReadOnly}
                isSpecial={true}
                label='鑑定'
                modifier={(specialChecks as any)?.appraisal?.modifier ?? 0}
                onUpdate={handleCombatModifierChange}
                target='specialChecks'
              />
            </div>
          </div>

          <div className={formStyles.notes}>
            <p>
              魔術値の装備修正は<strong>付与術式専用</strong>です。その他の術式では
              <strong>加算されません</strong>
            </p>
            <p>
              ダメージの装備修正は<strong>付与術式専用</strong>です。その他の術式では
              <strong>加算されません</strong>
            </p>
          </div>
        </div>
      </section>
    );
  }
);
CombatSection.displayName = 'CombatSection';
export default CombatSection;
