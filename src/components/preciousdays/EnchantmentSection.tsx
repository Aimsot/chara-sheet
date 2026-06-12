'use client';

import React, { memo, useCallback, useState } from 'react';

import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { ComboBox } from '@/components/ui/ComboBox';
import { NumberInput } from '@/components/ui/NumberInput';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Enchantment } from '@/types/preciousdays/character';

const CATEGORY_LABEL = '付与魔術';
const TIMING_OPTIONS = ['パッシブ', 'ダメージロールの直前', '命中判定の直前'];
const TIMING_SHORT: Record<string, string> = {
  ダメージロールの直前: 'DR直前',
  命中判定の直前: '命中直前',
};

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
    const [prevPage, setPrevPage] = useState(enchantment.page ?? '');
    const [localName, setLocalName] = useState(enchantment.name);
    const [localEffect, setLocalEffect] = useState(enchantment.effect);
    const [localPage, setLocalPage] = useState(enchantment.page ?? '');

    if (enchantment.name !== prevName) {
      setPrevName(enchantment.name);
      setLocalName(enchantment.name);
    }
    if (enchantment.effect !== prevEffect) {
      setPrevEffect(enchantment.effect);
      setLocalEffect(enchantment.effect);
    }
    if ((enchantment.page ?? '') !== prevPage) {
      setPrevPage(enchantment.page ?? '');
      setLocalPage(enchantment.page ?? '');
    }

    const handleGLChange = useCallback(
      (val: number) => onUpdate(index, 'gl', Math.max(0, Math.min(6, val))),
      [index, onUpdate]
    );

    if (isReadOnly) {
      const pageText = enchantment.page
        ? /^\d+$/.test(enchantment.page)
          ? `p.${enchantment.page}`
          : enchantment.page
        : '';
      return (
        <div
          className={`${tableStyles.row} ${tableStyles.enchantmentViewGrid}${enchantment.acquired === false ? ` ${tableStyles.unacquired}` : ''}`}
        >
          <div className={tableStyles.labelBlock}>
            <div className={tableStyles.labelCell}>
              <input
                checked={enchantment.acquired !== false}
                className={tableStyles.acquireCheck}
                disabled
                readOnly
                type='checkbox'
              />
            </div>
            <div className={tableStyles.labelCell}>{CATEGORY_LABEL}</div>
          </div>
          <div className={tableStyles.cell} style={{ justifyContent: 'center', gap: '6px' }}>
            <span>{enchantment.name}</span>
            {pageText && (
              <span style={{ fontSize: '0.65rem', color: 'rgba(160,160,160,0.45)', flexShrink: 0 }}>
                {pageText}
              </span>
            )}
          </div>
          <div className={tableStyles.cell}>{enchantment.gl ?? 0}</div>
          <div className={tableStyles.cell}>
            {(() => {
              const t = enchantment.timing ?? '';
              return t.includes('\n') ? (
                <span style={{ textAlign: 'center', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                  {t}
                </span>
              ) : (
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    width: '100%',
                    textAlign: 'center',
                  }}
                >
                  {TIMING_SHORT[t] ?? t}
                </span>
              );
            })()}
          </div>
          <div className={tableStyles.cell}>{enchantment.effect}</div>
        </div>
      );
    }

    return (
      <div
        className={`${tableStyles.row} ${tableStyles.enchantmentEditGrid}${enchantment.acquired === false ? ` ${tableStyles.unacquired}` : ''}`}
      >
        {/* 取得チェック + 種別（labelBlockで結合） */}
        <div className={tableStyles.labelBlock}>
          <div className={tableStyles.labelCell}>
            <input
              checked={enchantment.acquired !== false}
              className={tableStyles.acquireCheck}
              onChange={(e) => onUpdate(index, 'acquired', e.target.checked)}
              type='checkbox'
            />
          </div>
          <div className={tableStyles.labelCell}>{CATEGORY_LABEL}</div>
        </div>

        {/* 名称 */}
        <div className={tableStyles.cell}>
          <input
            className={formStyles.input}
            inputMode='text'
            onChange={(e) => {
              setLocalName(e.target.value);
              onUpdate(index, 'name', e.target.value);
            }}
            placeholder='名称'
            type='text'
            value={localName}
          />
        </div>

        {/* GL */}
        <div className={tableStyles.cell}>
          <div className={formStyles.stepperSmall}>
            <button
              disabled={(enchantment.gl ?? 0) <= 0}
              onClick={() => handleGLChange((enchantment.gl ?? 0) - 1)}
              type='button'
            >
              -
            </button>
            <NumberInput onChange={handleGLChange} value={enchantment.gl ?? 0} />
            <button
              disabled={(enchantment.gl ?? 0) >= 6}
              onClick={() => handleGLChange((enchantment.gl ?? 0) + 1)}
              type='button'
            >
              +
            </button>
          </div>
        </div>

        {/* タイミング */}
        <div className={tableStyles.cell}>
          <ComboBox
            className={formStyles.input}
            defaultValue={enchantment.timing ?? ''}
            onCommit={(val) => onUpdate(index, 'timing', val)}
            options={TIMING_OPTIONS}
            placeholder='タイミング'
          />
        </div>

        {/* 効果 */}
        <div className={tableStyles.cell}>
          <AutoResizeTextarea
            autoResize={autoResize}
            className={formStyles.textareaTable}
            onChange={(e) => {
              setLocalEffect(e.target.value);
              onUpdate(index, 'effect', e.target.value);
            }}
            placeholder='効果'
            rows={1}
            style={{ flex: 1 }}
            value={localEffect}
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
                className={`${tableStyles.headerRow} ${isReadOnly ? tableStyles.enchantmentViewGrid : tableStyles.enchantmentEditGrid}`}
              >
                <div className={tableStyles.labelBlock}>
                  <div className={tableStyles.labelCell}>取得</div>
                  <div className={tableStyles.labelCell}>種別</div>
                </div>
                <div className={tableStyles.cell}>名称</div>
                <div className={tableStyles.cell}>GL</div>
                <div className={tableStyles.cell}>タイミング</div>
                <div className={tableStyles.cell}>効果</div>
                {!isReadOnly && <div className={tableStyles.cell}>ページ</div>}
                {!isReadOnly && <div className={tableStyles.cell}>削除</div>}
              </div>

              {enchantments.map((enc, index) => (
                <EnchantmentRow
                  autoResize={autoResize}
                  canRemove={enchantments.length > 1}
                  enchantment={enc}
                  index={index}
                  isReadOnly={isReadOnly}
                  key={enc.id || String(index)}
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
