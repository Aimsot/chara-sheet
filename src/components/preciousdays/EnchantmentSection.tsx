'use client';

import React, { memo, useCallback, useState } from 'react';

import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { NumberInput } from '@/components/ui/NumberInput';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Enchantment } from '@/types/preciousdays/character';

const CATEGORY_LABEL = '付与魔術';

const EnchantmentRow = memo(
  ({
    enchantment,
    index,
    isReadOnly,
    autoResize,
    canRemove,
    onUpdate,
    onRemove,
  }: {
    enchantment: Enchantment;
    index: number;
    isReadOnly?: boolean;
    autoResize?: boolean;
    canRemove: boolean;
    onUpdate: (index: number, field: keyof Enchantment, value: any) => void;
    onRemove: (index: number) => void;
  }) => {
    const [prevName, setPrevName] = useState(enchantment.name);
    const [prevEffect, setPrevEffect] = useState(enchantment.effect);
    const [localName, setLocalName] = useState(enchantment.name);
    const [localEffect, setLocalEffect] = useState(enchantment.effect);

    if (enchantment.name !== prevName) {
      setPrevName(enchantment.name);
      setLocalName(enchantment.name);
    }
    if (enchantment.effect !== prevEffect) {
      setPrevEffect(enchantment.effect);
      setLocalEffect(enchantment.effect);
    }

    const handleGLChange = useCallback(
      (val: number) => onUpdate(index, 'gl', val),
      [index, onUpdate]
    );

    if (isReadOnly) {
      return (
        <div className={`${tableStyles.row} ${tableStyles.enchantmentViewGrid}`}>
          <div className={tableStyles.labelCell}>{CATEGORY_LABEL}</div>
          <div
            className={tableStyles.cell}
            style={{ justifyContent: 'flex-start', paddingLeft: '8px' }}
          >
            {enchantment.name}
          </div>
          <div className={tableStyles.cell}>{enchantment.gl || '—'}</div>
          <div
            className={tableStyles.cell}
            style={{
              justifyContent: 'flex-start',
              paddingLeft: '8px',
              whiteSpace: 'pre-wrap',
              overflow: 'hidden',
              maxHeight: autoResize ? undefined : '4.5em',
              overflowY: autoResize ? undefined : 'auto',
            }}
          >
            {enchantment.effect}
          </div>
        </div>
      );
    }

    return (
      <div
        className={`${tableStyles.row} ${tableStyles.enchantmentEditGrid}`}
        style={{ alignItems: 'center', paddingTop: '6px', paddingBottom: '6px' }}
      >
        {/* 種別（固定） */}
        <div
          className={tableStyles.cell}
          style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', justifyContent: 'center' }}
        >
          {CATEGORY_LABEL}
        </div>

        {/* 名前 */}
        <div className={tableStyles.cell} style={{ paddingLeft: '6px', paddingRight: '6px' }}>
          <input
            className={formStyles.input}
            inputMode='text'
            onChange={(e) => {
              setLocalName(e.target.value);
              onUpdate(index, 'name', e.target.value);
            }}
            placeholder='術式名'
            style={{ padding: '0 10px' }}
            type='text'
            value={localName}
          />
        </div>

        {/* GL */}
        <div className={tableStyles.cell}>
          <div className={formStyles.stepperSmall}>
            <button onClick={() => handleGLChange((enchantment.gl || 0) - 1)} type='button'>
              -
            </button>
            <NumberInput onChange={handleGLChange} value={enchantment.gl || 0} />
            <button onClick={() => handleGLChange((enchantment.gl || 0) + 1)} type='button'>
              +
            </button>
          </div>
        </div>

        {/* 効果 */}
        <div className={tableStyles.cell} style={{ padding: '0 6px' }}>
          <AutoResizeTextarea
            autoResize={autoResize}
            className={formStyles.input}
            onChange={(e) => {
              setLocalEffect(e.target.value);
              onUpdate(index, 'effect', e.target.value);
            }}
            placeholder='効果'
            value={localEffect}
          />
        </div>

        {/* 削除 */}
        <div className={tableStyles.cell}>
          <button
            className={btnStyles.ghost}
            disabled={!canRemove}
            onClick={() => onRemove(index)}
            style={{
              color: canRemove ? '#ff6b6b' : 'var(--text-muted)',
              padding: '4px',
              cursor: canRemove ? 'pointer' : 'not-allowed',
            }}
            title={canRemove ? '削除' : '削除不可'}
            type='button'
          >
            ×
          </button>
        </div>
      </div>
    );
  }
);
EnchantmentRow.displayName = 'EnchantmentRow';

interface EnchantmentSectionProps {
  enchantments: Enchantment[];
  isReadOnly?: boolean;
  autoResize?: boolean;
  handleEnchantmentsAdd: () => void;
  handleEnchantmentsRemove: (index: number) => void;
  handleEnchantmentsUpdate: (index: number, field: keyof Enchantment, value: any) => void;
}

const EnchantmentSection: React.FC<EnchantmentSectionProps> = memo(
  ({
    enchantments,
    isReadOnly,
    autoResize,
    handleEnchantmentsAdd,
    handleEnchantmentsRemove,
    handleEnchantmentsUpdate,
  }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <section className={cardStyles.base}>
        <div
          className={`${cardStyles.accordionHeader}${isReadOnly ? ` ${cardStyles.readOnly}` : ''}`}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
        >
          <h2 className={cardStyles.title}>付与魔術</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={tableStyles.scrollContainer}>
            <div
              className={`${tableStyles.gridTable} ${tableStyles.denseTable} ${tableStyles.zebraTable}`}
            >
              <div
                className={`${tableStyles.headerRow} ${tableStyles.enchantmentViewGrid}`}
                style={isReadOnly ? undefined : { gridTemplateColumns: '60px 1fr 80px 2fr 32px' }}
              >
                <div className={tableStyles.labelCell}>種別</div>
                <div className={tableStyles.cell}>術式名</div>
                <div className={tableStyles.cell}>GL</div>
                <div className={tableStyles.cell}>効果</div>
                {!isReadOnly && <div className={tableStyles.cell}>削除</div>}
              </div>

              {enchantments.map((enc, index) => (
                <EnchantmentRow
                  autoResize={autoResize}
                  canRemove={enchantments.length > 1}
                  enchantment={enc}
                  index={index}
                  isReadOnly={isReadOnly}
                  key={enc.id}
                  onRemove={handleEnchantmentsRemove}
                  onUpdate={handleEnchantmentsUpdate}
                />
              ))}
            </div>
          </div>

          {!isReadOnly && (
            <div className={tableStyles.buttonContainer}>
              <button
                className={btnStyles.outline}
                onClick={handleEnchantmentsAdd}
                style={{ fontSize: '0.85rem', padding: '6px 24px' }}
                type='button'
              >
                ＋ 付与魔術を追加する
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }
);

EnchantmentSection.displayName = 'EnchantmentSection';
export default EnchantmentSection;
