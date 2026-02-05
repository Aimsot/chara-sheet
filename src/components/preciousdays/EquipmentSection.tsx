import React, { useMemo, useState } from 'react';

import { NumberInput } from '@/components/ui/NumberInput';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss'; // tableStylesへ統一
import { Character, EquipmentItem } from '@/types/preciousdays/character';

interface EquipmentSectionProps {
  char: Character;
  setChar: React.Dispatch<React.SetStateAction<Character>>;
  isReadOnly?: boolean;
}

const SLOTS: { key: keyof Character['equipment']; label: string }[] = [
  { key: 'rHand', label: '右手' },
  { key: 'lHand', label: '左手' },
  { key: 'head', label: '頭部' },
  { key: 'body', label: '胴部' },
  { key: 'accessory', label: '補助防具' },
  { key: 'guardian', label: '守護魔術' },
];

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  char,
  setChar,
  isReadOnly,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  // 9列の装備用グリッド設定（最小幅を設定してスクロールを有効化）
  const equipGridStyle = {
    display: 'grid',
    gridTemplateColumns: '80px 1.5fr 110px 110px 70px 100px 110px 110px 2fr',
    columnGap: '12px',
    minWidth: '1200px',
  };

  const updateItem = (
    slotKey: keyof Character['equipment'],
    field: keyof EquipmentItem,
    value: any
  ) => {
    setChar((prev) => ({
      ...prev,
      equipment: {
        ...prev.equipment,
        [slotKey]: {
          ...prev.equipment[slotKey],
          [field]: value,
        },
      },
    }));
  };

  const totals = useMemo(() => {
    const initial = { weight: 0, hitMod: 0, dodgeMod: 0, defenseMod: 0, magicDefense: 0 };
    if (!char.equipment) return initial;

    return Object.values(char.equipment).reduce(
      (acc, item) => ({
        weight: acc.weight + (Number(item.weight) || 0),
        hitMod: acc.hitMod + (Number(item.hitMod) || 0),
        dodgeMod: acc.dodgeMod + (Number(item.dodgeMod) || 0),
        defenseMod: acc.defenseMod + (Number(item.defenseMod) || 0),
        magicDefense: acc.magicDefense + (Number(item.magicDefense) || 0),
      }),
      initial
    );
  }, [char.equipment]);

  return (
    <section className={cardStyles.base}>
      <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={cardStyles.title}>装備品</h2>
        <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
      </div>

      <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
        <div className={tableStyles.scrollContainer}>
          <div
            className={`${tableStyles.gridTable} ${tableStyles.denseTable}`}
            style={{ minWidth: equipGridStyle.minWidth }}
          >
            {/* ヘッダー行 */}
            <div className={tableStyles.headerRow} style={equipGridStyle}>
              <div className={tableStyles.labelCell}>部位</div>
              <div className={tableStyles.cell}>名称</div>
              <div className={tableStyles.cell}>重量</div>
              <div className={tableStyles.cell}>命中</div>
              <div className={tableStyles.cell}>ダメージ</div>
              <div className={tableStyles.cell}>射程</div>
              <div className={tableStyles.cell}>回避</div>
              <div className={tableStyles.cell}>防御</div>
              <div className={tableStyles.cell}>備考</div>
            </div>
            {/* 各装備行 */}
            {SLOTS.map(({ key, label }) => {
              const item = char.equipment[key];
              return (
                <div
                  className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
                  key={key}
                  style={equipGridStyle}
                >
                  <div className={tableStyles.labelCell}>{label}</div>

                  {/* 名称 */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.name || ''
                    ) : (
                      <input
                        className={formStyles.input}
                        onChange={(e) => updateItem(key, 'name', e.target.value)}
                        placeholder={`${label}なし`}
                        type='text'
                        value={item.name}
                      />
                    )}
                  </div>

                  {/* 重量 */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.weight
                    ) : (
                      <div className={formStyles.stepperSmall}>
                        <button
                          onClick={() => updateItem(key, 'weight', (Number(item.weight) || 0) - 1)}
                          type='button'
                        >
                          -{' '}
                        </button>
                        <NumberInput
                          onChange={(v) => updateItem(key, 'weight', v)}
                          value={item.weight}
                        />
                        <button
                          onClick={() => updateItem(key, 'weight', (Number(item.weight) || 0) + 1)}
                          type='button'
                        >
                          +{' '}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 命中 */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.hitMod
                    ) : (
                      <div className={formStyles.stepperSmall}>
                        <button
                          onClick={() => updateItem(key, 'hitMod', (Number(item.hitMod) || 0) - 1)}
                          type='button'
                        >
                          -{' '}
                        </button>
                        <NumberInput
                          onChange={(v) => updateItem(key, 'hitMod', v)}
                          value={item.hitMod}
                        />
                        <button
                          onClick={() => updateItem(key, 'hitMod', (Number(item.hitMod) || 0) + 1)}
                          type='button'
                        >
                          +{' '}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ダメージ */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.damage
                    ) : (
                      <input
                        className={formStyles.input}
                        onChange={(e) => updateItem(key, 'damage', e.target.value)}
                        type='text'
                        value={item.damage}
                      />
                    )}
                  </div>

                  {/* 射程 */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.range || ''
                    ) : (
                      <select
                        className={formStyles.select}
                        onChange={(e) => updateItem(key, 'range', e.target.value)}
                        value={item.range}
                      >
                        <option value=''>ー</option>
                        <option value='至近'>至近</option>
                        <option value='近'>近</option>
                        <option value='中'>中</option>
                      </select>
                    )}
                  </div>

                  {/* 回避 */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.dodgeMod
                    ) : (
                      <div className={formStyles.stepperSmall}>
                        <button
                          onClick={() =>
                            updateItem(key, 'dodgeMod', (Number(item.dodgeMod) || 0) - 1)
                          }
                          type='button'
                        >
                          -{' '}
                        </button>
                        <NumberInput
                          onChange={(v) => updateItem(key, 'dodgeMod', v)}
                          value={item.dodgeMod}
                        />
                        <button
                          onClick={() =>
                            updateItem(key, 'dodgeMod', (Number(item.dodgeMod) || 0) + 1)
                          }
                          type='button'
                        >
                          +{' '}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 防御 */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.defenseMod
                    ) : (
                      <div className={formStyles.stepperSmall}>
                        <button
                          onClick={() =>
                            updateItem(key, 'defenseMod', (Number(item.defenseMod) || 0) - 1)
                          }
                          type='button'
                        >
                          -{' '}
                        </button>
                        <NumberInput
                          onChange={(v) => updateItem(key, 'defenseMod', v)}
                          value={item.defenseMod}
                        />
                        <button
                          onClick={() =>
                            updateItem(key, 'defenseMod', (Number(item.defenseMod) || 0) + 1)
                          }
                          type='button'
                        >
                          +{' '}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 備考 */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.notes || ''
                    ) : (
                      <textarea
                        className={formStyles.textareaTable}
                        onChange={(e) => updateItem(key, 'notes', e.target.value)}
                        placeholder='備考'
                        value={item.notes}
                      />
                    )}
                  </div>
                </div>
              );
            })}
            {/* 合計行（AbilitySectionの合計行スタイルを適用） */}
            <div
              className={tableStyles.row}
              style={{
                ...equipGridStyle,
                backgroundColor: 'var(--accent-dark)',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              <div className={tableStyles.labelCell} style={{ color: '#fff' }}>
                合計
              </div>
              <div className={tableStyles.cell}></div>
              <div className={tableStyles.cell}>{totals.weight}</div>
              <div className={tableStyles.cell}>{totals.hitMod}</div>
              <div className={tableStyles.cell}></div>
              <div className={tableStyles.cell}></div>
              <div className={tableStyles.cell}>{totals.dodgeMod}</div>
              <div className={tableStyles.cell}>{totals.defenseMod}</div>
              <div className={tableStyles.cell}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EquipmentSection;
