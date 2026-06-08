import React, { memo, useCallback, useMemo, useState } from 'react';
import { Tooltip } from 'react-tooltip';

import {
  ABILITY_DATA,
  ABILITY_KEYS,
  ELEMENT_DATA,
  ElementKey,
  SPECIES_DATA,
  SpeciesKey,
  STYLE_DATA,
} from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character } from '@/types/preciousdays/character';

import Loading from '../ui/Loading';
import { NumberInput } from '../ui/NumberInput';

interface AbilityTableProps {
  abilities: Character['abilities'];
  species: string;
  style: string;
  element: string;
  gl: number;
  updateAbilities: (updates: Partial<Character>) => void;
  isReadOnly?: boolean;
  handleAbilitiesBonusChange: (key: string, val: number, setError: any) => void;
  handleAbilitiesOtherModifierChange: (key: string, val: number) => void;
  handleAbilitiesGrowthChange: (key: string, val: number, setError: any) => void;
}

const EDITABLE_ROW_STYLE: React.CSSProperties = {
  backgroundColor: 'color-mix(in srgb, var(--accent-color), transparent 92%)',
};

const SECTION_DIVIDER_STYLE: React.CSSProperties = {
  padding: '3px 8px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  letterSpacing: '0.08em',
  color: 'var(--text-secondary)',
  backgroundColor: 'rgba(0,0,0,0.35)',
  borderTop: '2px solid var(--card-border)',
  borderBottom: '1px solid var(--card-border)',
};

const BonusCell = memo(
  ({
    abilityKey,
    value,
    isReadOnly,
    onUpdate,
    setErrorInfo,
  }: {
    abilityKey: string;
    value: number;
    isReadOnly?: boolean;
    onUpdate: (key: string, val: number, setError: any) => void;
    setErrorInfo: React.Dispatch<React.SetStateAction<{ key: string; message: string } | null>>;
  }) => {
    const handleChange = useCallback(
      (val: number) => onUpdate(abilityKey, val, setErrorInfo),
      [onUpdate, abilityKey, setErrorInfo]
    );
    return (
      <div
        className={tableStyles.cell}
        data-tooltip-id='bonus-error-tooltip'
        id={`bonus-${abilityKey}`}
      >
        {isReadOnly ? (
          value
        ) : (
          <div className={formStyles.stepper}>
            <button
              aria-label='Decrease Bonus'
              onClick={() => handleChange((value || 0) - 1)}
              type='button'
            >
              -
            </button>
            <NumberInput onChange={handleChange} value={value} />
            <button
              aria-label='Increase Bonus'
              onClick={() => handleChange((value || 0) + 1)}
              type='button'
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  }
);
BonusCell.displayName = 'BonusCell';

const OtherModCell = memo(
  ({
    abilityKey,
    value,
    isReadOnly,
    onUpdate,
  }: {
    abilityKey: string;
    value: number;
    isReadOnly?: boolean;
    onUpdate: (key: string, val: number) => void;
  }) => {
    const handleChange = useCallback(
      (val: number) => onUpdate(abilityKey, val),
      [onUpdate, abilityKey]
    );
    return (
      <div className={tableStyles.cell}>
        {isReadOnly ? (
          value
        ) : (
          <div className={formStyles.stepper}>
            <button
              aria-label='Decrease Modifier'
              onClick={() => handleChange((value || 0) - 1)}
              type='button'
            >
              -
            </button>
            <NumberInput onChange={handleChange} value={value} />
            <button
              aria-label='Increase Modifier'
              onClick={() => handleChange((value || 0) + 1)}
              type='button'
            >
              +
            </button>
          </div>
        )}
      </div>
    );
  }
);
OtherModCell.displayName = 'OtherModCell';

const GrowthCell = memo(
  ({
    abilityKey,
    value,
    isReadOnly,
    onUpdate,
    setErrorInfo,
  }: {
    abilityKey: string;
    value: number;
    isReadOnly?: boolean;
    onUpdate: (key: string, val: number, setError: any) => void;
    setErrorInfo: React.Dispatch<React.SetStateAction<{ key: string; message: string } | null>>;
  }) => {
    const handleChange = useCallback(
      (val: number) => onUpdate(abilityKey, val, setErrorInfo),
      [onUpdate, abilityKey, setErrorInfo]
    );
    return (
      <div
        className={tableStyles.cell}
        data-tooltip-id='growth-error-tooltip'
        id={`growth-${abilityKey}`}
      >
        {isReadOnly ? (
          value
        ) : (
          <div className={formStyles.stepper}>
            <button onClick={() => handleChange((value || 0) - 1)} type='button'>
              -
            </button>
            <NumberInput onChange={handleChange} value={value} />
            <button onClick={() => handleChange((value || 0) + 1)} type='button'>
              +
            </button>
          </div>
        )}
      </div>
    );
  }
);
GrowthCell.displayName = 'GrowthCell';

export const AbilitySection: React.FC<AbilityTableProps> = memo(
  ({
    abilities,
    species,
    style,
    element,
    gl,
    isReadOnly,
    handleAbilitiesBonusChange,
    handleAbilitiesOtherModifierChange,
    handleAbilitiesGrowthChange,
  }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [errorInfo, setErrorInfo] = useState<{ key: string; message: string } | null>(null);
    const [growthErrorInfo, setGrowthErrorInfo] = useState<{ key: string; message: string } | null>(
      null
    );

    const gridStyle = {
      '--table-cols': 6,
      '--table-label-width': '140px',
    } as React.CSSProperties;

    const totalBonus = useMemo(
      () => ABILITY_KEYS.reduce((sum, key) => sum + (abilities[key].bonus || 0), 0),
      [abilities]
    );

    const totalGrowth = useMemo(
      () => ABILITY_KEYS.reduce((sum, key) => sum + (abilities[key].growth || 0), 0),
      [abilities]
    );

    const maxGrowth = (gl || 0) * 3;

    return (
      <section className={cardStyles.base}>
        <div
          className={`${cardStyles.accordionHeader}${isReadOnly ? ` ${cardStyles.readOnly}` : ''}`}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
        >
          <h2 className={cardStyles.title}>能力値</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>
        {!abilities && !species ? (
          <Loading />
        ) : (
          <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
            <div className={tableStyles.scrollContainer}>
              <div
                className={`${tableStyles.gridTable} ${tableStyles.denseTable} ${tableStyles.zebraTable}`}
              >
                {/* ヘッダー */}
                <div className={tableStyles.headerRow} style={gridStyle}>
                  <div className={tableStyles.labelCell}>能力値</div>
                  {ABILITY_KEYS.map((key) => (
                    <div className={tableStyles.cell} key={key}>
                      {ABILITY_DATA[key].name}
                    </div>
                  ))}
                </div>

                {/* ③ セクション区切り: 基本値 */}
                <div style={SECTION_DIVIDER_STYLE}>基本値</div>

                {/* 種族基本値 */}
                <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                  <div className={tableStyles.labelCell}>種族基本値</div>
                  {ABILITY_KEYS.map((key) => {
                    const baseValue = (species as SpeciesKey)
                      ? SPECIES_DATA[species as SpeciesKey].abilities[key]
                      : 0;
                    return (
                      <div className={tableStyles.cell} key={key}>
                        {baseValue}
                      </div>
                    );
                  })}
                </div>

                {/* ① ボーナス（編集行） */}
                <div
                  className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
                  style={gridStyle}
                >
                  <div className={tableStyles.labelCell}>ボーナス({totalBonus}/5)</div>
                  {ABILITY_KEYS.map((key) => (
                    <BonusCell
                      abilityKey={key}
                      isReadOnly={isReadOnly}
                      key={key}
                      onUpdate={handleAbilitiesBonusChange}
                      setErrorInfo={setErrorInfo}
                      value={abilities[key].bonus || 0}
                    />
                  ))}
                </div>
                <Tooltip
                  anchorSelect={`#bonus-${errorInfo?.key}`}
                  content={errorInfo?.message}
                  id='bonus-error-tooltip'
                  isOpen={!!errorInfo}
                  place='bottom'
                  variant='error'
                />

                {/* ① 成長（編集行） */}
                <div
                  className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
                  style={gridStyle}
                >
                  <div className={tableStyles.labelCell}>
                    成長({totalGrowth}/{maxGrowth})
                  </div>
                  {ABILITY_KEYS.map((key) => (
                    <GrowthCell
                      abilityKey={key}
                      isReadOnly={isReadOnly}
                      key={key}
                      onUpdate={handleAbilitiesGrowthChange}
                      setErrorInfo={setGrowthErrorInfo}
                      value={abilities[key].growth || 0}
                    />
                  ))}
                </div>
                <Tooltip
                  anchorSelect={`#growth-${growthErrorInfo?.key}`}
                  content={growthErrorInfo?.message}
                  id='growth-error-tooltip'
                  isOpen={!!growthErrorInfo}
                  place='bottom'
                  variant='error'
                />

                {/* 能力基本値合計（計算行） */}
                <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                  <div className={tableStyles.labelCell}>基本値合計</div>
                  {ABILITY_KEYS.map((key) => {
                    const base = (species as SpeciesKey)
                      ? SPECIES_DATA[species as SpeciesKey].abilities[key]
                      : 0;
                    return (
                      <div className={tableStyles.cell} key={key}>
                        {base + (abilities[key].bonus || 0) + (abilities[key].growth || 0)}
                      </div>
                    );
                  })}
                </div>

                {/* 能力基本値÷3（計算行） */}
                <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                  <div className={tableStyles.labelCell}>基本値÷3</div>
                  {ABILITY_KEYS.map((key) => {
                    const base = (species as SpeciesKey)
                      ? SPECIES_DATA[species as SpeciesKey].abilities[key]
                      : 0;
                    return (
                      <div className={tableStyles.cell} key={key}>
                        {Math.floor(
                          (base + (abilities[key].bonus || 0) + (abilities[key].growth || 0)) / 3
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* ③ セクション区切り: 修正値 */}
                <div style={SECTION_DIVIDER_STYLE}>修正値</div>

                {/* スタイル修正（計算行） */}
                <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                  <div className={tableStyles.labelCell}>スタイル修正</div>
                  {ABILITY_KEYS.map((key) => (
                    <div className={tableStyles.cell} key={key}>
                      +{(STYLE_DATA[style as keyof typeof STYLE_DATA]?.bonuses as any)?.[key] || 0}
                    </div>
                  ))}
                </div>

                {/* 属性修正（計算行） */}
                <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                  <div className={tableStyles.labelCell}>属性修正</div>
                  {ABILITY_KEYS.map((key) => (
                    <div className={tableStyles.cell} key={key}>
                      +{(ELEMENT_DATA[element as ElementKey]?.bonuses as any)?.[key] || 0}
                    </div>
                  ))}
                </div>

                {/* ① その他修正（編集行・色付き） */}
                <div
                  className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
                  style={{ ...gridStyle, ...(isReadOnly ? {} : EDITABLE_ROW_STYLE) }}
                >
                  <div className={tableStyles.labelCell}>その他修正</div>
                  {ABILITY_KEYS.map((key) => (
                    <OtherModCell
                      abilityKey={key}
                      isReadOnly={isReadOnly}
                      key={key}
                      onUpdate={handleAbilitiesOtherModifierChange}
                      value={abilities[key].otherModifier || 0}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 合計値表示 */}
            <div className={`${tableStyles.scrollContainer} ${layoutStyles.mt2}`}>
              <div
                className={`${tableStyles.gridTable} ${tableStyles.denseTable} ${tableStyles.zebraTable}`}
              >
                <div className={tableStyles.headerRow} style={gridStyle}>
                  <div className={tableStyles.labelCell}>能力値</div>
                  {ABILITY_KEYS.map((key) => (
                    <div className={tableStyles.cell} key={key}>
                      {ABILITY_DATA[key].name}
                    </div>
                  ))}
                </div>
                <div
                  className={tableStyles.row}
                  style={{
                    ...gridStyle,
                    backgroundColor: 'var(--accent-dark)',
                    fontWeight: 'bold',
                  }}
                >
                  <div className={tableStyles.labelCell} style={{ color: '#fff' }}>
                    能力値合計
                  </div>
                  {ABILITY_KEYS.map((key) => (
                    <div
                      className={tableStyles.cell}
                      key={key}
                      style={{ fontSize: '0.75rem', color: '#fff' }}
                    >
                      {abilities[key].total}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 注釈 */}
            {!isReadOnly && (
              <div className={`${formStyles.notes} ${layoutStyles.mt3}`}>
                <p>
                  <strong>ボーナス点</strong>は合計で<strong>5点</strong>
                  まで割り振ることができます。
                </p>
                <p>
                  各項目の<strong>種族基本値 ＋ ボーナス</strong>の合計は<strong>12</strong>
                  が上限です。
                </p>
                <p>
                  <strong>成長</strong>はGLが1上がるごとに
                  <strong>3つの能力値をそれぞれ1点ずつ</strong>
                  上昇させます（合計GL×3点）。
                  1回の成長で同じ能力値に2点以上割り振ることはできません。
                </p>
                <p>
                  <strong>能力値合計</strong> ＝ (種族基本値 ＋ ボーナス ＋ 成長) ÷ 3 ＋
                  スタイル修正 ＋ 属性修正 ＋ その他修正
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    );
  }
);
AbilitySection.displayName = 'AbilitySection';
export default AbilitySection;
