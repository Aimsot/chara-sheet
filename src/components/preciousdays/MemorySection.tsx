import React, { memo, useCallback, useState } from 'react';

import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character, Memory } from '@/types/preciousdays/character';

const MemoryRow = memo(
  ({
    memory,
    index,
    isReadOnly,
    autoResize,
    isLast,
    onUpdate,
    onRemove,
  }: {
    memory: Memory;
    index: number;
    isReadOnly?: boolean;
    autoResize?: boolean;
    isLast: boolean;
    onUpdate: (index: number, field: keyof Memory, value: any) => void;
    onRemove: (index: number) => void;
  }) => {
    const [localDate, setLocalDate] = useState(memory.date);
    const [localContent, setLocalContent] = useState(memory.content);
    const [localPrize, setLocalPrize] = useState(memory.prize);

    const [prevDate, setPrevDate] = useState(memory.date);
    const [prevContent, setPrevContent] = useState(memory.content);
    const [prevPrize, setPrevPrize] = useState(memory.prize);

    if (memory.date !== prevDate) {
      setPrevDate(memory.date);
      setLocalDate(memory.date);
    }
    if (memory.content !== prevContent) {
      setPrevContent(memory.content);
      setLocalContent(memory.content);
    }
    if (memory.prize !== prevPrize) {
      setPrevPrize(memory.prize);
      setLocalPrize(memory.prize);
    }

    const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);

    return (
      <div
        className={`${tableStyles.row} ${isReadOnly ? tableStyles.memoryViewGrid : tableStyles.memoryEditGrid}`}
        style={{ alignItems: 'center', minHeight: '40px' }}
      >
        {/* 日付 */}
        <div
          className={tableStyles.cell}
          style={{
            justifyContent: isReadOnly ? 'center' : 'flex-start',
            paddingLeft: isReadOnly ? '0' : '4px',
          }}
        >
          {isReadOnly ? (
            <span>{memory.date}</span>
          ) : (
            <input
              className={formStyles.input}
              onChange={(e) => {
                setLocalDate(e.target.value);
                onUpdate(index, 'date', e.target.value);
              }}
              placeholder='日付'
              type='text'
              value={localDate}
            />
          )}
        </div>

        {/* メモリー内容 */}
        <div
          className={tableStyles.cell}
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '4px',
            borderLeft: '1px solid var(--card-border)',
          }}
        >
          {isReadOnly ? (
            <div
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                maxHeight: autoResize ? undefined : '4.5em',
                overflowY: autoResize ? undefined : 'auto',
              }}
            >
              {memory.content}
            </div>
          ) : (
            <AutoResizeTextarea
              autoResize={autoResize}
              className={formStyles.textareaTable}
              onChange={(e) => {
                setLocalContent(e.target.value);
                onUpdate(index, 'content', e.target.value);
              }}
              placeholder='メモリー'
              rows={1}
              value={localContent}
            />
          )}
        </div>

        {/* 昇華チェック */}
        <div className={tableStyles.cell} style={{ borderLeft: '1px solid var(--card-border)' }}>
          <input
            checked={memory.sublimated}
            disabled={isReadOnly}
            onChange={(e) => onUpdate(index, 'sublimated', e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: isReadOnly ? 'default' : 'pointer' }}
            type='checkbox'
          />
        </div>

        {/* プライズ */}
        <div
          className={tableStyles.cell}
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '4px',
            borderLeft: '1px solid var(--card-border)',
          }}
        >
          {isReadOnly ? (
            <span>{memory.prize}</span>
          ) : (
            <input
              className={formStyles.input}
              onChange={(e) => {
                setLocalPrize(e.target.value);
                onUpdate(index, 'prize', e.target.value);
              }}
              placeholder='プライズ'
              type='text'
              value={localPrize}
            />
          )}
        </div>

        {/* 削除ボタン（編集時のみ） */}
        {!isReadOnly && (
          <div className={tableStyles.cell}>
            <button
              className={btnStyles.ghost}
              disabled={isLast}
              onClick={handleRemove}
              style={{
                color: isLast ? 'var(--text-muted)' : '#ff6b6b',
                padding: '4px',
                cursor: isLast ? 'not-allowed' : 'pointer',
              }}
              title={isLast ? '削除不可' : '削除'}
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
MemoryRow.displayName = 'MemoryRow';

interface MemorySectionProps {
  memories: Character['memories'];
  isReadOnly?: boolean;
  autoResize?: boolean;
  handleMemoriesAdd: () => void;
  handleMemoriesRemove: (index: number) => void;
  handleMemoriesUpdate: (index: number, field: keyof Memory, value: any) => void;
}

export const MemorySection: React.FC<MemorySectionProps> = memo(
  ({
    memories,
    isReadOnly,
    autoResize,
    handleMemoriesAdd,
    handleMemoriesRemove,
    handleMemoriesUpdate,
  }) => {
    const [isOpen, setIsOpen] = useState(true);
    const safeMemories = memories || [];

    return (
      <section className={cardStyles.base}>
        <div
          className={`${cardStyles.accordionHeader}${isReadOnly ? ` ${cardStyles.readOnly}` : ''}`}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
        >
          <h2 className={cardStyles.title}>メモリー</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={tableStyles.scrollContainer}>
            <div
              className={`${tableStyles.gridTable} ${tableStyles.denseTable} ${tableStyles.zebraTable}`}
            >
              {/* ヘッダー */}
              <div
                className={`${tableStyles.headerRow} ${isReadOnly ? tableStyles.memoryViewGrid : tableStyles.memoryEditGrid}`}
              >
                <div className={tableStyles.cell}>日付</div>
                <div className={tableStyles.cell}>メモリー</div>
                <div className={tableStyles.cell}>昇華</div>
                <div className={tableStyles.cell}>プライズ</div>
                {!isReadOnly && <div className={tableStyles.cell}></div>}
              </div>

              {safeMemories.map((memory, index) => (
                <MemoryRow
                  autoResize={autoResize}
                  index={index}
                  isLast={safeMemories.length === 1}
                  isReadOnly={isReadOnly}
                  key={memory.id}
                  memory={memory}
                  onRemove={handleMemoriesRemove}
                  onUpdate={handleMemoriesUpdate}
                />
              ))}
            </div>
          </div>

          {!isReadOnly && (
            <div style={{ padding: '24px 8px 8px', display: 'flex', justifyContent: 'center' }}>
              <button
                className={btnStyles.outline}
                onClick={handleMemoriesAdd}
                style={{ fontSize: '0.85rem', padding: '6px 24px' }}
                type='button'
              >
                ＋ メモリーを追加する
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }
);
MemorySection.displayName = 'MemorySection';
export default MemorySection;
