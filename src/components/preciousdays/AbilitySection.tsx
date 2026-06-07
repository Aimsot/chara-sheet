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
  StyleKey,
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

// ▼ 1. ボーナス入力セルを独立コンポーネント化 (memo化)
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
    // ハンドラを固定化
    const handleChange = useCallback(
      (val: number) => {
        onUpdate(abilityKey, val, setErrorInfo);
      },
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

// ▼ 2. その他修正セルを独立コンポーネント化 (memo化)
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
    // ハンドラを固定化
    const handleChange = useCallback(
      (val: number) => {
        onUpdate(abilityKey, val);
      },
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

// ▼ 3. 成長セルを独立コンポーネント化
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
    updateAbilities,
    isReadOnly,
    handleAbilitiesBonusChange,
    handleAbilitiesOtherModifierChange,
    handleAbilitiesGrowthChange,
  }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [errorInfo, setErrorInfo] = useState<{
      key: string;
      message: string;
    } | null>(null);
    const [growthErrorInfo, setGrowthErrorInfo] = useState<{
      key: string;
      message: string;
    } | null>(null);

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
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={cardStyles.title}>能力値</h2>
          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
        </div>
        {!abilities && !species ? (
          <Loading />
        ) : (
          <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
            <div className={tableStyles.scrollContainer}>
              <div className={tableStyles.gridTable}>
                {/* 1. ヘッダー */}
                <div className={tableStyles.headerRow} style={gridStyle}>
                  <div className={tableStyles.labelCell}>能力値(基本値)</div>
                  {ABILITY_KEYS.map((key) => (
                    <div className={tableStyles.cell} key={key}>
                      {ABILITY_DATA[key].name}
                    </div>
                  ))}
                </div>

                {/* 2. 種族基本値 */}
                <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                  <div className={tableStyles.labelCell}>種族基本値</div>
                  {ABILITY_KEYS.map((key) => {
                    const speciesKey = species as SpeciesKey;
                    const baseValue = speciesKey ? SPECIES_DATA[speciesKey].abilities[key] : 0;
                    return (
                      <div className={tableStyles.cell} key={key}>
                        {baseValue}
                      </div>
                    );
                  })}
                </div>

                {/* 3. ボーナス入力 (最適化済み) */}
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

                {/* 4. 成長 */}
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

                {/* 5. 能力基本値合計 (計算) */}
                <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                  <div className={tableStyles.labelCell}>能力基本値合計</div>
                  {ABILITY_KEYS.map((key) => {
                    const speciesKey = species as SpeciesKey;
                    const baseValue = speciesKey ? SPECIES_DATA[speciesKey].abilities[key] : 0;
                    const bonusValue = abilities[key].bonus || 0;
                    const growthValue = abilities[key].growth || 0;
                    return (
                      <div className={tableStyles.cell} key={key}>
                        {baseValue + bonusValue + growthValue}
                      </div>
                    );
                  })}
                </div>

                {/* 6. 基本値÷3 (計算) */}
                <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                  <div className={tableStyles.labelCell}>能力基本値÷3</div>
                  {ABILITY_KEYS.map((key) => {
                    const speciesKey = species as SpeciesKey;
                    const baseValue = speciesKey ? SPECIES_DATA[speciesKey].abilities[key] : 0;
                    const bonusValue = abilities[key].bonus || 0;
                    const growthValue = abilities[key].growth || 0;
                    return (
                      <div className={tableStyles.cell} key={key}>
                        {Math.floor((baseValue + bonusValue + growthValue) / 3)}
                      </div>
                    );
                  })}
                </div>

                {/* 6. スタイル修正 */}
                <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                  <div className={tableStyles.labelCell}>
                    <div className={layoutStyles.flexColumn}>
                      <span>スタイル</span>
                      {isReadOnly ? (
                        <span>{STYLE_DATA[style as StyleKey]?.name || style}</span>
                      ) : (
                        <select
                          className={formStyles.select}
                          onChange={(e) => updateAbilities({ style: e.target.value as StyleKey })}
                          style={{
                            fontSize: '0.8rem',
                            height: '28px',
                            padding: '0 4px',
                          }}
                          value={style}
                        >
                          {Object.entries(STYLE_DATA).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  {ABILITY_KEYS.map((key) => (
                    <div className={tableStyles.cell} key={key}>
                      +{(STYLE_DATA[style as keyof typeof STYLE_DATA]?.bonuses as any)?.[key] || 0}
                    </div>
                  ))}
                </div>

                {/* 7. 属性修正 */}
                <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                  <div className={tableStyles.labelCell}>
                    <div className={layoutStyles.flexColumn}>
                      <span>属性</span>
                      {isReadOnly ? (
                        <span>{ELEMENT_DATA[element as ElementKey]?.name || element}</span>
                      ) : (
                        <select
                          className={formStyles.select}
                          onChange={(e) =>
                            updateAbilities({
                              element: e.target.value as ElementKey,
                            })
                          }
                          style={{
                            fontSize: '0.8rem',
                            height: '28px',
                            padding: '0 4px',
                          }}
                          value={element}
                        >
                          {Object.entries(ELEMENT_DATA).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                  {ABILITY_KEYS.map((key) => (
                    <div className={tableStyles.cell} key={key}>
                      +{(ELEMENT_DATA[element as ElementKey]?.bonuses as any)?.[key] || 0}
                    </div>
                  ))}
                </div>

                {/* 8. その他修正 (最適化済み) */}
                <div
                  className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
                  style={gridStyle}
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
              <div className={tableStyles.gridTable}>
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
                      style={{ fontSize: '1.2rem', color: '#fff' }}
                    >
                      {/* 合計値は親コンポーネント(EditForm)で計算されたものを表示 */}
                      {abilities[key].total}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 注釈 */}
            <div className={`${formStyles.notes} ${layoutStyles.mt3}`}>
              <p>
                <strong>ボーナス点</strong>は合計で<strong>5点</strong>
                まで割り振ることができます。
              </p>
              <p>
                各項目の<strong>種族基本値 ＋ ボーナス</strong>の合計は
                <strong>12</strong>
                が上限です。
              </p>
              <p>
                <strong>成長</strong>はGLが1上がるごとに<strong>3点</strong>
                まで割り振ることができます（合計GL×3点）。
              </p>
              <p>
                <strong>能力値合計</strong> ＝ (種族基本値 ＋ ボーナス) ÷ 3 ＋ スタイル修正 ＋
                属性修正 ＋ 成長 ＋ その他修正
              </p>
            </div>
          </div>
        )}
      </section>
    );
  }
);
AbilitySection.displayName = 'AbilitySection';
export default AbilitySection;
