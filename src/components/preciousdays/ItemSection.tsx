import React, { useMemo, useState } from 'react';

import { NumberInput } from '@/components/ui/NumberInput';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character, Item } from '@/types/preciousdays/character';

interface ItemSectionProps {
  char: Character;
  isReadOnly?: boolean;
  handleItemsAdd: () => void;
  handleItemsRemove: (index: number) => void;
  handleItemsUpdate: (index: number, field: keyof Item, value: any) => void;
}

export const ItemSection: React.FC<ItemSectionProps> = ({
  char,
  isReadOnly,
  handleItemsAdd,
  handleItemsRemove,
  handleItemsUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(isReadOnly);

  // グリッド列の設定（編集時は削除ボタン用の列を追加）
  const itemGridStyle = {
    display: 'grid',
    gridTemplateColumns: isReadOnly ? '1.5fr 80px 80px 2fr' : '1.5fr 80px 80px 2fr 50px',
    gap: '12px',
    minWidth: '600px',
  };

  const totalItemWeight = useMemo(() => {
    return char.items.reduce((sum, item) => {
      const w = Number(item.weight) || 0;
      const q = Number(item.quantity) || 0;
      return sum + w * q;
    }, 0);
  }, [char.items]);

  return (
    <section className={cardStyles.base}>
      <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={cardStyles.title}>携帯品</h2>
        <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
      </div>

      <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
        <div className={tableStyles.scrollContainer}>
          <div className={`${tableStyles.gridTable} ${tableStyles.denseTable}`}>
            {/* ヘッダー行 */}
            <div className={tableStyles.headerRow} style={itemGridStyle}>
              <div className={tableStyles.cell}>名称</div>
              <div className={tableStyles.cell}>重量</div>
              <div className={tableStyles.cell}>個数</div>
              <div className={tableStyles.cell}>備考</div>
              {!isReadOnly && <div className={tableStyles.cell}></div>}
            </div>
            {/* リスト表示 */}
            {char.items.length === 0 ? (
              <div
                className={tableStyles.row}
                style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '24px',
                  color: 'var(--text-secondary)',
                  display: 'block',
                }}
              >
                携帯品がありません
              </div>
            ) : (
              char.items.map((item, index) => (
                <div
                  className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
                  key={item.id}
                  style={itemGridStyle}
                >
                  {/* 名称 */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.name || ''
                    ) : (
                      <input
                        className={formStyles.input}
                        defaultValue={item.name ?? ''}
                        onBlur={(e) => handleItemsUpdate(index, 'name', e.target.value)}
                        placeholder='アイテム名'
                        type='text'
                      />
                    )}
                  </div>

                  {/* 重量セル */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.weight
                    ) : (
                      <div className={formStyles.stepperSmall}>
                        {/* マイナスボタン */}
                        <button
                          onClick={() =>
                            handleItemsUpdate(index, 'weight', (Number(item.weight) || 0) - 1)
                          }
                          type='button'
                        >
                          -
                        </button>

                        {/* 数値入力 */}
                        <NumberInput
                          onChange={(val) => handleItemsUpdate(index, 'weight', val)}
                          value={item.weight}
                        />

                        {/* プラスボタン */}
                        <button
                          onClick={() =>
                            handleItemsUpdate(index, 'weight', (Number(item.weight) || 0) + 1)
                          }
                          type='button'
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                  {/* 個数 */}
                  <div className={tableStyles.cell}>
                    {isReadOnly ? (
                      item.quantity
                    ) : (
                      <div className={formStyles.stepperSmall}>
                        {/* マイナスボタン */}
                        <button
                          onClick={() =>
                            handleItemsUpdate(index, 'quantity', (Number(item.quantity) || 0) - 1)
                          }
                          type='button'
                        >
                          -
                        </button>

                        {/* 数値入力（stepperの中なので、className={formStyles.input} は指定しなくてOK） */}
                        <NumberInput
                          onChange={(val) => handleItemsUpdate(index, 'quantity', val)}
                          value={item.quantity}
                        />

                        {/* プラスボタン */}
                        <button
                          onClick={() =>
                            handleItemsUpdate(index, 'quantity', (Number(item.quantity) || 0) + 1)
                          }
                          type='button'
                        >
                          +
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
                        defaultValue={item.notes ?? ''}
                        onBlur={(e) => handleItemsUpdate(index, 'notes', e.target.value)}
                        placeholder='備考'
                      />
                    )}
                  </div>

                  {/* 削除ボタン */}
                  {!isReadOnly && (
                    <div className={tableStyles.cell} style={{ justifyContent: 'center' }}>
                      <button
                        className={btnStyles.ghost}
                        onClick={() => handleItemsRemove(index)}
                        style={{ color: '#ff6b6b', padding: '4px' }}
                        title='削除'
                        type='button'
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* 合計行（ダーク背景のアクセントスタイル） */}
            <div
              className={tableStyles.row}
              style={{
                ...itemGridStyle,
                backgroundColor: 'var(--accent-dark)',
                fontWeight: 'bold',
                color: '#fff',
              }}
            >
              <div
                className={tableStyles.labelCell}
                style={{ color: '#fff', textAlign: 'right', paddingRight: '1rem' }}
              >
                小計
              </div>
              <div className={tableStyles.cell} style={{ fontSize: '1.2rem' }}>
                {totalItemWeight}
              </div>
              <div className={tableStyles.cell}></div>
              <div className={tableStyles.cell}></div>
              {!isReadOnly && <div className={tableStyles.cell}></div>}
            </div>
          </div>
        </div>

        {/* 追加ボタン（閲覧時は非表示） */}
        {!isReadOnly && (
          <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
            <button
              className={btnStyles.outline}
              onClick={handleItemsAdd}
              style={{ minWidth: '240px' }}
              type='button'
            >
              ＋ アイテムを追加する
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ItemSection;
