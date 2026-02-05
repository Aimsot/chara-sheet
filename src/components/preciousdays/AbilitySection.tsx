import React, { useMemo, useState } from 'react';
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
  char: Character;
  updateAbilities: (updates: Partial<Character>) => void;
  isReadOnly?: boolean;
}

export const AbilitySection: React.FC<AbilityTableProps> = ({
  char,
  updateAbilities,
  isReadOnly,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [errorInfo, setErrorInfo] = useState<{ key: string; message: string } | null>(null);

  const gridStyle = {
    '--table-cols': 6,
    '--table-label-width': '140px',
  } as React.CSSProperties;

  // --- ハンドラー ---

  // ボーナス割り振り
  const handleBonusChange = (key: string, val: number) => {
    const abilityKey = key as keyof typeof char.abilities;
    const safeVal = Number.isNaN(val) ? NaN : Math.max(0, val);

    // バリデーション (NaNの場合は計算できないのでチェックをスキップまたは0扱い)
    const checkVal = Number.isNaN(safeVal) ? 0 : safeVal;
    const speciesKey = (char.species || 'human') as SpeciesKey;
    const base = SPECIES_DATA[speciesKey]?.abilities[abilityKey] || 0;

    const otherBonusTotal = Object.entries(char.abilities).reduce((acc, [k, v]) => {
      return k === abilityKey ? acc : acc + (v.bonus || 0);
    }, 0);

    if (base + checkVal > 12) {
      setErrorInfo({
        key,
        message: `「${ABILITY_DATA[abilityKey].name}基本値 + ボーナス」は12が上限です`,
      });
    } else if (otherBonusTotal + checkVal > 5) {
      setErrorInfo({ key, message: 'ボーナスの合計は5点までです' });
    } else {
      setErrorInfo(null);
    }

    const updatedAbilities = {
      ...char.abilities,
      [abilityKey]: { ...char.abilities[abilityKey], bonus: safeVal },
    };
    updateAbilities({ abilities: updatedAbilities });
  };

  // その他修正割り振り
  const handleOtherModifierChange = (key: string, val: number) => {
    const abilityKey = key as keyof typeof char.abilities;
    // その他修正はマイナス(ペナルティ)も許可するため Math.max(0) は外す
    const safeVal = val;

    const updatedAbilities = {
      ...char.abilities,
      [abilityKey]: { ...char.abilities[abilityKey], otherModifier: safeVal },
    };
    updateAbilities({ abilities: updatedAbilities });
  };

  const totalBonus = useMemo(
    () => ABILITY_KEYS.reduce((sum, key) => sum + (char.abilities[key].bonus || 0), 0),
    [char.abilities]
  );

  return (
    <section className={cardStyles.base}>
      <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={cardStyles.title}>能力値</h2>
        <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
      </div>
      {!char ? (
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
                  const speciesKey = char.species as SpeciesKey;
                  const baseValue = speciesKey ? SPECIES_DATA[speciesKey].abilities[key] : 0;
                  return (
                    <div className={tableStyles.cell} key={key}>
                      {baseValue}
                    </div>
                  );
                })}
              </div>

              {/* 3. ボーナス入力 (NumberInput使用) */}
              <div
                className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
                style={gridStyle}
              >
                <div className={tableStyles.labelCell}>ボーナス({totalBonus}/5)</div>
                {ABILITY_KEYS.map((key) => (
                  <div
                    className={tableStyles.cell}
                    data-tooltip-id='bonus-error-tooltip'
                    id={`bonus-${key}`}
                    key={key}
                  >
                    {isReadOnly ? (
                      char.abilities[key].bonus
                    ) : (
                      <div className={formStyles.stepper}>
                        {/* マイナスボタン */}
                        <button
                          onClick={() =>
                            handleBonusChange(key, (char.abilities[key].bonus || 0) - 1)
                          }
                          type='button'
                        >
                          -
                        </button>

                        {/* 数値入力コンポーネント */}
                        <NumberInput
                          onChange={(val) => handleBonusChange(key, val)}
                          value={char.abilities[key].bonus}
                        />

                        {/* プラスボタン */}
                        <button
                          onClick={() =>
                            handleBonusChange(key, (char.abilities[key].bonus || 0) + 1)
                          }
                          type='button'
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
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

              {/* 4. 基本値÷3 (計算) */}
              <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                <div className={tableStyles.labelCell}>能力基本値÷3</div>
                {ABILITY_KEYS.map((key) => {
                  const speciesKey = char.species as SpeciesKey;
                  const baseValue = speciesKey ? SPECIES_DATA[speciesKey].abilities[key] : 0;
                  const bonusValue = char.abilities[key].bonus || 0; // NaNなら0扱い
                  const dividedValue = Math.floor((baseValue + bonusValue) / 3);
                  return (
                    <div className={tableStyles.cell} key={key}>
                      {dividedValue}
                    </div>
                  );
                })}
              </div>

              {/* 5. スタイル修正 */}
              <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                <div className={tableStyles.labelCell}>
                  <div className={layoutStyles.flexColumn}>
                    <span>スタイル</span>
                    {isReadOnly ? (
                      <span>{STYLE_DATA[char.style as StyleKey]?.name || char.style}</span>
                    ) : (
                      <select
                        className={formStyles.select}
                        onChange={(e) => updateAbilities({ style: e.target.value as StyleKey })}
                        style={{ fontSize: '0.8rem', height: '28px', padding: '0 4px' }}
                        value={char.style}
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
                    +
                    {(STYLE_DATA[char.style as keyof typeof STYLE_DATA]?.bonuses as any)?.[key] ||
                      0}
                  </div>
                ))}
              </div>

              {/* 6. 属性修正 */}
              <div className={`${tableStyles.row} ${tableStyles.readonly}`} style={gridStyle}>
                <div className={tableStyles.labelCell}>
                  <div className={layoutStyles.flexColumn}>
                    <span>属性</span>
                    {isReadOnly ? (
                      <span>{ELEMENT_DATA[char.element as ElementKey]?.name || char.element}</span>
                    ) : (
                      <select
                        className={formStyles.select}
                        onChange={(e) => updateAbilities({ element: e.target.value as ElementKey })}
                        style={{ fontSize: '0.8rem', height: '28px', padding: '0 4px' }}
                        value={char.element}
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
                    +{(ELEMENT_DATA[char.element as ElementKey]?.bonuses as any)?.[key] || 0}
                  </div>
                ))}
              </div>

              {/* 7. その他修正 (NumberInput使用) */}
              <div
                className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
                style={gridStyle}
              >
                <div className={tableStyles.labelCell}>その他修正</div>
                {ABILITY_KEYS.map((key) => (
                  <div className={tableStyles.cell} key={key}>
                    {isReadOnly ? (
                      char.abilities[key].otherModifier
                    ) : (
                      <div className={formStyles.stepper}>
                        <button
                          onClick={() =>
                            handleOtherModifierChange(
                              key,
                              (char.abilities[key].otherModifier || 0) - 1
                            )
                          }
                          type='button'
                        >
                          -
                        </button>
                        <NumberInput
                          onChange={(val) => handleOtherModifierChange(key, val)}
                          value={char.abilities[key].otherModifier}
                        />

                        <button
                          onClick={() =>
                            handleOtherModifierChange(
                              key,
                              (char.abilities[key].otherModifier || 0) + 1
                            )
                          }
                          type='button'
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
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
                style={{ ...gridStyle, backgroundColor: 'var(--accent-dark)', fontWeight: 'bold' }}
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
                    {char.abilities[key].total}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 注釈 */}
          <div className={`${formStyles.notes} ${layoutStyles.mt3}`}>
            <p>
              <strong>ボーナス点</strong>は合計で<strong>5点</strong>まで割り振ることができます。
            </p>
            <p>
              各項目の<strong>種族基本値 ＋ ボーナス</strong>の合計は<strong>12</strong>が上限です。
            </p>
            <p>
              <strong>能力値合計</strong> ＝ (種族基本値 ＋ ボーナス) ÷ 3 ＋ スタイル修正 ＋
              属性修正 ＋ その他修正
            </p>
          </div>
        </div>
      )}
    </section>
  );
};

export default AbilitySection;
