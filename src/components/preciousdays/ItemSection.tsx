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
    autoResize,
    onUpdate,
    onRemove,
    style, // 親から既存のグリッドスタイルを受け取る
  }: {
    item: Item;
    index: number;
    isReadOnly?: boolean;
    autoResize?: boolean;
    onUpdate: (index: number, field: keyof Item, value: any) => void;
    onRemove: (index: number) => void;
    style: React.CSSProperties;
  }) => {
    // --- テキスト入力の高速化 (State Mirroringパターン) ---
    const [prevName, setPrevName] = useState(item.name);
    const [prevNotes, setPrevNotes] = useState(item.notes);
    const [prevPage, setPrevPage] = useState(item.page || '');

    const [localName, setLocalName] = useState(item.name);
    const [localNotes, setLocalNotes] = useState(item.notes);
    const [localPage, setLocalPage] = useState(item.page || '');

    // propsが変わった場合、レンダリング中にローカルstateを同期する
    if (item.name !== prevName) {
      setPrevName(item.name);
      setLocalName(item.name);
    }
    if (item.notes !== prevNotes) {
      setPrevNotes(item.notes);
      setLocalNotes(item.notes);
    }
    if ((item.page || '') !== prevPage) {
      setPrevPage(item.page || '');
      setLocalPage(item.page || '');
    }

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalName(e.target.value);
      onUpdate(index, 'name', e.target.value);
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalNotes(e.target.value);
      onUpdate(index, 'notes', e.target.value);
    };

    const handlePageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalPage(e.target.value);
      onUpdate(index, 'page', e.target.value);
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

    // 閲覧モード: 装備品・スキルと同じ2行レイアウト
    if (isReadOnly) {
      const showSub = !!item.notes || !!item.page;
      const pageText = item.page ? (/^\d+$/.test(item.page) ? `p.${item.page}` : item.page) : '';
      return (
        <div
          className={tableStyles.row}
          style={{ display: 'block', borderBottom: '1px solid var(--card-border)' }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0,200px) 80px 80px',
              gap: '12px',
              alignItems: 'center',
              padding: '8px 0',
            }}
          >
            <div className={tableStyles.cell} style={{ paddingLeft: '6px' }}>
              {item.name}
            </div>
            <div className={tableStyles.cell}>{item.weight}</div>
            <div className={tableStyles.cell}>{item.quantity}</div>
          </div>
          {showSub && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '3px 8px 5px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.75rem',
              }}
            >
              {item.notes && (
                <div
                  style={{
                    flex: 1,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    lineHeight: 1.6,
                    color: '#fff',
                    maxHeight: autoResize ? undefined : '4.5em',
                    overflowY: autoResize ? undefined : 'auto',
                  }}
                >
                  {item.notes}
                </div>
              )}
              {item.page && (
                <div
                  style={{
                    flexShrink: 0,
                    fontSize: '0.7rem',
                    color: 'var(--text-secondary)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {pageText}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    // 編集モード
    return (
      <div
        className={tableStyles.row}
        style={{
          ...style,
          alignItems: 'center',
          paddingTop: '8px',
          paddingBottom: '8px',
        }}
      >
        {/* アイテム名 */}
        <div className={tableStyles.cell} style={{ paddingLeft: '6px', paddingRight: '6px' }}>
          <input
            className={formStyles.input}
            inputMode='text'
            onChange={handleNameChange}
            placeholder='アイテム名'
            style={{ padding: '0 10px' }}
            type='text'
            value={localName}
          />
        </div>

        {/* 重量 */}
        <div className={tableStyles.cell}>
          <div className={formStyles.stepperSmall}>
            <button onClick={() => handleWeightChange((item.weight || 0) - 1)} type='button'>
              -
            </button>
            <NumberInput onChange={handleWeightChange} value={item.weight} />
            <button onClick={() => handleWeightChange((item.weight || 0) + 1)} type='button'>
              +
            </button>
          </div>
        </div>

        {/* 個数 */}
        <div className={tableStyles.cell}>
          <div className={formStyles.stepperSmall}>
            <button onClick={() => handleQuantityChange((item.quantity || 0) - 1)} type='button'>
              -
            </button>
            <NumberInput onChange={handleQuantityChange} value={item.quantity} />
            <button onClick={() => handleQuantityChange((item.quantity || 0) + 1)} type='button'>
              +
            </button>
          </div>
        </div>

        {/* 効果 */}
        <div className={tableStyles.cell}>
          <input
            className={formStyles.input}
            inputMode='text'
            onChange={handleNotesChange}
            placeholder='効果'
            type='text'
            value={localNotes}
          />
        </div>

        {/* ページ */}
        <div className={tableStyles.cell}>
          <input
            className={formStyles.input}
            inputMode='text'
            onChange={handlePageChange}
            placeholder='p.'
            type='text'
            value={localPage}
          />
        </div>

        {/* 削除ボタン */}
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
  autoResize?: boolean;
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
    autoResize,
    handleItemsAdd,
    handleItemsRemove,
    handleItemsUpdate,
  }) => {
    const [isOpen, setIsOpen] = useState(true);

    // 合計重量の計算
    const totalItemWeight = useMemo(() => {
      return items.reduce((sum, item) => sum + item.weight * item.quantity, 0);
    }, [items]);

    const itemEditGridStyle = {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 200px) 80px 80px 2fr 60px 50px',
      gap: '12px',
      minWidth: '660px',
    };
    const itemViewGridStyle = {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 200px) 80px 80px',
      gap: '12px',
      minWidth: '360px',
    };
    const itemGridStyle = isReadOnly ? itemViewGridStyle : itemEditGridStyle;

    return (
      <section className={cardStyles.base}>
        <div
          className={`${cardStyles.accordionHeader}${isReadOnly ? ` ${cardStyles.readOnly}` : ''}`}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
        >
          <h2 className={cardStyles.title}>所持品</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={tableStyles.scrollContainer}>
            <WeightSection
              abilities={abilities}
              equipment={equipment}
              items={items}
              species={species}
            />
            <div
              className={`${tableStyles.gridTable} ${tableStyles.denseTable} ${tableStyles.zebraTable}`}
            >
              {/* ヘッダー */}
              <div className={tableStyles.headerRow} style={itemGridStyle}>
                <div className={tableStyles.labelCell}>アイテム名</div>
                <div className={tableStyles.cell}>重量</div>
                <div className={tableStyles.cell}>個数</div>
                {!isReadOnly && <div className={tableStyles.cell}>効果</div>}
                {!isReadOnly && <div className={tableStyles.cell}>ページ</div>}
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
                    autoResize={autoResize}
                    index={index}
                    isReadOnly={isReadOnly}
                    item={item}
                    key={item.id}
                    onRemove={handleItemsRemove}
                    onUpdate={handleItemsUpdate}
                    style={itemEditGridStyle}
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
                  style={{ color: '#fff', textAlign: 'right', paddingRight: '1rem' }}
                >
                  合計
                </div>
                <div className={tableStyles.cell}>{totalItemWeight}</div>
                <div className={tableStyles.cell}></div>
                {!isReadOnly && <div className={tableStyles.cell}></div>}
                {!isReadOnly && <div className={tableStyles.cell}></div>}
                {!isReadOnly && <div className={tableStyles.cell}></div>}
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div
              style={{
                padding: '24px 8px 8px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <button
                className={btnStyles.outline}
                onClick={handleItemsAdd}
                style={{ fontSize: '0.85rem', padding: '6px 24px' }}
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
