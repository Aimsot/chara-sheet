import React, { memo, useCallback, useMemo, useState } from 'react';

import { NumberInput } from '@/components/ui/NumberInput';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character, Item } from '@/types/preciousdays/character';

import WeightSection from './WeightSection';

// ▼ 1. 行コンポーネントの切り出し
const ItemRow = memo(
  ({
    item,
    index,
    isReadOnly,
    onUpdate,
    onRemove,
    style, // 親から既存のグリッドスタイルを受け取る
  }: {
    item: Item;
    index: number;
    isReadOnly?: boolean;
    onUpdate: (index: number, field: keyof Item, value: any) => void;
    onRemove: (index: number) => void;
    style: React.CSSProperties;
  }) => {
    // --- テキスト入力の高速化 (State Mirroringパターン) ---
    const [prevName, setPrevName] = useState(item.name);
    const [prevNotes, setPrevNotes] = useState(item.notes);

    const [localName, setLocalName] = useState(item.name);
    const [localNotes, setLocalNotes] = useState(item.notes);

    // propsが変わった場合、レンダリング中にローカルstateを同期する
    if (item.name !== prevName) {
      setPrevName(item.name);
      setLocalName(item.name);
    }
    if (item.notes !== prevNotes) {
      setPrevNotes(item.notes);
      setLocalNotes(item.notes);
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalName(e.target.value);
    };
    const handleNameBlur = () => {
      if (localName !== item.name) {
        onUpdate(index, 'name', localName);
      }
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalNotes(e.target.value);
    };
    const handleNotesBlur = () => {
      if (localNotes !== item.notes) {
        onUpdate(index, 'notes', localNotes);
      }
    };

    // --- 数値入力のハンドラ (固定化) ---
    const handleWeightChange = useCallback(
      (val: number) => {
        onUpdate(index, 'weight', val);
      },
      [index, onUpdate]
    );

    const handleQuantityChange = useCallback(
      (val: number) => {
        onUpdate(index, 'quantity', val);
      },
      [index, onUpdate]
    );

    const handleRemove = useCallback(() => {
      onRemove(index);
    }, [index, onRemove]);

    return (
      <div className={tableStyles.row} style={{ ...style, alignItems: 'center' }}>
        {/* アイテム名 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            <div className={formStyles.readOnlyField}>{item.name}</div>
          ) : (
            <input
              className={formStyles.input}
              inputMode='text'
              onBlur={handleNameBlur}
              onChange={handleNameChange}
              placeholder='アイテム名'
              type='text'
              value={localName}
            />
          )}
        </div>

        {/* 重量 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            item.weight
          ) : (
            <div className={formStyles.stepper}>
              <button onClick={() => handleWeightChange((item.weight || 0) - 1)} type='button'>
                -
              </button>
              <NumberInput onChange={handleWeightChange} value={item.weight} />
              <button onClick={() => handleWeightChange((item.weight || 0) + 1)} type='button'>
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
            <div className={formStyles.stepper}>
              <button onClick={() => handleQuantityChange((item.quantity || 0) - 1)} type='button'>
                -
              </button>
              <NumberInput onChange={handleQuantityChange} value={item.quantity} />
              <button onClick={() => handleQuantityChange((item.quantity || 0) + 1)} type='button'>
                +
              </button>
            </div>
          )}
        </div>

        {/* 備考 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            <div className={formStyles.readOnlyField}>{item.notes}</div>
          ) : (
            <input
              className={formStyles.input}
              inputMode='text'
              onBlur={handleNotesBlur}
              onChange={handleNotesChange}
              placeholder='備考'
              type='text'
              value={localNotes}
            />
          )}
        </div>

        {/* 削除ボタン */}
        {!isReadOnly && (
          <div className={tableStyles.cell}>
            <button
              className={btnStyles.ghost}
              onClick={handleRemove}
              style={{ color: '#ff6b6b', padding: '4px' }}
              title='削除'
              type='button'
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  }
);
ItemRow.displayName = 'ItemRow';

interface ItemSectionProps {
  items: Character['items'];
  equipment: Character['equipment'];
  abilities: Character['abilities'];
  species: string;
  isReadOnly?: boolean;
  handleItemsAdd: () => void;
  handleItemsRemove: (index: number) => void;
  handleItemsUpdate: (index: number, field: keyof Item, value: any) => void;
}

export const ItemSection: React.FC<ItemSectionProps> = memo(
  ({
    items,
    equipment,
    abilities,
    species,
    isReadOnly,
    handleItemsAdd,
    handleItemsRemove,
    handleItemsUpdate,
  }) => {
    const [isOpen, setIsOpen] = useState(isReadOnly);

    // 合計重量の計算
    const totalItemWeight = useMemo(() => {
      return items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
    }, [items]);

    // ▼ スタイル定義 (元のまま維持)
    const itemGridStyle = {
      display: 'grid',
      gridTemplateColumns: isReadOnly ? '1.5fr 80px 80px 2fr' : '1.5fr 80px 80px 2fr 50px',
      gap: '12px',
      minWidth: '600px',
    };

    return (
      <section className={cardStyles.base}>
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={cardStyles.title}>所持品</h2>

          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={tableStyles.scrollContainer}>
            <WeightSection
              abilities={abilities}
              equipment={equipment}
              items={items}
              species={species}
            />
            <div className={tableStyles.gridTable}>
              {/* ヘッダー */}
              <div className={tableStyles.headerRow} style={itemGridStyle}>
                <div className={tableStyles.labelCell}>アイテム名</div>
                <div className={tableStyles.cell}>重量</div>
                <div className={tableStyles.cell}>個数</div>
                <div className={tableStyles.cell}>備考</div>
                {!isReadOnly && <div className={tableStyles.cell}>削除</div>}
              </div>

              {/* アイテムリスト (ItemRowを使用) */}
              {items.length === 0 ? (
                <div
                  className={tableStyles.row}
                  style={{ justifyContent: 'center', padding: '16px' }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>アイテムがありません</span>
                </div>
              ) : (
                items.map((item, index) => (
                  <ItemRow
                    index={index}
                    isReadOnly={isReadOnly}
                    item={item}
                    key={item.id}
                    onRemove={handleItemsRemove}
                    onUpdate={handleItemsUpdate}
                    style={itemGridStyle} // ここでスタイルを渡すことでレイアウトを維持
                  />
                ))
              )}

              {/* 合計行 */}
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
                  style={{
                    color: '#fff',
                    textAlign: 'right',
                    paddingRight: '1rem',
                  }}
                >
                  合計
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

          {!isReadOnly && (
            <div
              style={{
                padding: '16px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
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
  }
);
ItemSection.displayName = 'ItemSection';
export default ItemSection;
