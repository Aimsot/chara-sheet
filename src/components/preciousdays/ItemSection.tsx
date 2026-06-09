import React, { memo, useCallback, useMemo, useState } from 'react';

import { ComboBox } from '@/components/ui/ComboBox';
import { NumberInput } from '@/components/ui/NumberInput';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character, Item } from '@/types/preciousdays/character';

import WeightSection from './WeightSection';

const ITEM_CATEGORY_OPTIONS = ['道具', '消耗品'];

const ItemRow = memo(
  ({
    item,
    index,
    isReadOnly,
    autoResize,
    onUpdate,
    onRemove,
  }: {
    item: Item;
    index: number;
    isReadOnly?: boolean;
    autoResize?: boolean;
    onUpdate: (index: number, field: keyof Item, value: any) => void;
    onRemove: (index: number) => void;
  }) => {
    const [prevName, setPrevName] = useState(item.name);
    const [prevNotes, setPrevNotes] = useState(item.notes);
    const [prevPage, setPrevPage] = useState(item.page || '');

    const [localName, setLocalName] = useState(item.name);
    const [localNotes, setLocalNotes] = useState(item.notes);
    const [localPage, setLocalPage] = useState(item.page || '');

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

    const handleWeightChange = useCallback(
      (val: number) => onUpdate(index, 'weight', val),
      [index, onUpdate]
    );
    const handleQuantityChange = useCallback(
      (val: number) => onUpdate(index, 'quantity', val),
      [index, onUpdate]
    );
    const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);

    // 閲覧モード: 装備品と同じ外枠+内側グリッドパターン
    if (isReadOnly) {
      const showSub = !!item.notes || !!item.page;
      const pageText = item.page ? (/^\d+$/.test(item.page) ? `p.${item.page}` : item.page) : '';
      return (
        <div className={`${tableStyles.row} ${tableStyles.itemRowGrid}`}>
          <div className={tableStyles.labelCell} style={{ alignSelf: 'stretch' }}>
            {item.category ?? ''}
          </div>
          <div className={tableStyles.flexColumn}>
            <div className={tableStyles.itemViewGrid} style={{ alignItems: 'center' }}>
              <div className={tableStyles.cell} style={{ justifyContent: 'flex-start' }}>
                {item.name}
              </div>
              <div className={tableStyles.cell}>{item.weight}</div>
              <div className={tableStyles.cell}>{item.quantity}</div>
            </div>
            {showSub && (
              <div className={tableStyles.subRow} style={{ paddingLeft: '12px' }}>
                {item.notes && (
                  <div
                    className={tableStyles.textContent}
                    style={{
                      maxHeight: autoResize ? undefined : '4.5em',
                      overflowY: autoResize ? undefined : 'auto',
                    }}
                  >
                    {item.notes}
                  </div>
                )}
                {item.page && <div className={tableStyles.pageRef}>{pageText}</div>}
              </div>
            )}
          </div>
        </div>
      );
    }

    // 編集モード
    return (
      <div
        className={`${tableStyles.row} ${tableStyles.itemEditGrid}`}
        style={{ alignItems: 'center', paddingTop: '8px', paddingBottom: '8px' }}
      >
        {/* 種別 */}
        <div className={tableStyles.cell} style={{ padding: '0 4px' }}>
          <ComboBox
            className={formStyles.inputSmall}
            defaultValue={item.category ?? ''}
            onCommit={(val) => onUpdate(index, 'category', val)}
            options={ITEM_CATEGORY_OPTIONS}
            placeholder='種別'
          />
        </div>

        {/* アイテム名 */}
        <div className={tableStyles.cell} style={{ paddingLeft: '6px', paddingRight: '6px' }}>
          <input
            className={formStyles.input}
            inputMode='text'
            onChange={(e) => {
              setLocalName(e.target.value);
              onUpdate(index, 'name', e.target.value);
            }}
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
            onChange={(e) => {
              setLocalNotes(e.target.value);
              onUpdate(index, 'notes', e.target.value);
            }}
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
            onChange={(e) => {
              setLocalPage(e.target.value);
              onUpdate(index, 'page', e.target.value);
            }}
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

    const totalItemWeight = useMemo(
      () => items.reduce((sum, item) => sum + item.weight * item.quantity, 0),
      [items]
    );

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
              style={isReadOnly ? undefined : { minWidth: '760px' }}
            >
              {/* ヘッダー */}
              {isReadOnly ? (
                <div className={`${tableStyles.headerRow} ${tableStyles.itemViewHeaderGrid}`}>
                  <div className={tableStyles.labelCell}>種別</div>
                  <div className={tableStyles.cell}>アイテム名</div>
                  <div className={tableStyles.cell}>重量</div>
                  <div className={tableStyles.cell}>個数</div>
                </div>
              ) : (
                <div className={`${tableStyles.headerRow} ${tableStyles.itemEditGrid}`}>
                  <div className={tableStyles.labelCell}>種別</div>
                  <div className={tableStyles.cell}>アイテム名</div>
                  <div className={tableStyles.cell}>重量</div>
                  <div className={tableStyles.cell}>個数</div>
                  <div className={tableStyles.cell}>効果</div>
                  <div className={tableStyles.cell}>ページ</div>
                  <div className={tableStyles.cell}>削除</div>
                </div>
              )}

              {items.length === 0 ? (
                <div className={`${tableStyles.row} ${tableStyles.emptyRow}`}>
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
                  />
                ))
              )}

              {/* 合計行 */}
              {isReadOnly ? (
                <div
                  className={`${tableStyles.row} ${tableStyles.itemViewHeaderGrid} ${tableStyles.totalRow}`}
                >
                  <div className={tableStyles.labelCell}>合計</div>
                  <div className={tableStyles.cell}></div>
                  <div className={tableStyles.cell}>{totalItemWeight}</div>
                  <div className={tableStyles.cell}></div>
                </div>
              ) : (
                <div
                  className={`${tableStyles.row} ${tableStyles.itemEditGrid} ${tableStyles.totalRow}`}
                >
                  <div className={tableStyles.labelCell}>合計</div>
                  <div className={tableStyles.cell}></div>
                  <div className={tableStyles.cell}>{totalItemWeight}</div>
                  <div className={tableStyles.cell}></div>
                  <div className={tableStyles.cell}></div>
                  <div className={tableStyles.cell}></div>
                  <div className={tableStyles.cell}></div>
                </div>
              )}
            </div>
          </div>

          {!isReadOnly && (
            <div className={tableStyles.buttonContainer}>
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
