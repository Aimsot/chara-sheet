import React, { memo, useCallback, useState } from 'react';

import { EyeOff } from 'lucide-react';

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
    showExperience,
    onUpdate,
    onRemove,
  }: {
    memory: Memory;
    index: number;
    isReadOnly?: boolean;
    autoResize?: boolean;
    isLast: boolean;
    showExperience?: boolean;
    onUpdate: (index: number, field: keyof Memory, value: any) => void;
    onRemove: (index: number) => void;
  }) => {
    const [localDate, setLocalDate] = useState(memory.date);
    const [localContent, setLocalContent] = useState(memory.content);
    const [localPrize, setLocalPrize] = useState(memory.prize);
    const [localExp, setLocalExp] = useState(memory.experience ?? '');
    const [localSecretNote, setLocalSecretNote] = useState(memory.secretNote ?? '');

    const [prevDate, setPrevDate] = useState(memory.date);
    const [prevContent, setPrevContent] = useState(memory.content);
    const [prevPrize, setPrevPrize] = useState(memory.prize);
    const [prevExp, setPrevExp] = useState(memory.experience);
    const [prevSecretNote, setPrevSecretNote] = useState(memory.secretNote);

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
    if (memory.experience !== prevExp) {
      setPrevExp(memory.experience);
      setLocalExp(memory.experience ?? '');
    }
    if ((memory.secretNote ?? '') !== (prevSecretNote ?? '')) {
      setPrevSecretNote(memory.secretNote);
      setLocalSecretNote(memory.secretNote ?? '');
    }

    const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);

    return (
      <div
        className={`${tableStyles.row} ${
          isReadOnly
            ? showExperience !== false
              ? tableStyles.memoryViewGrid
              : tableStyles.memoryViewGridNoExp
            : showExperience !== false
              ? tableStyles.memoryEditGrid
              : tableStyles.memoryEditGridNoExp
        }`}
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

        {/* 経験点 */}
        {showExperience !== false && (
          <div className={tableStyles.cell} style={{ borderLeft: '1px solid var(--card-border)' }}>
            {isReadOnly ? (
              <span>{memory.experience ?? ''}</span>
            ) : (
              <input
                className={formStyles.input}
                inputMode='numeric'
                onChange={(e) => {
                  setLocalExp(e.target.value);
                  onUpdate(
                    index,
                    'experience',
                    e.target.value === '' ? undefined : Number(e.target.value)
                  );
                }}
                placeholder='0'
                style={{ textAlign: 'center' }}
                type='text'
                value={localExp}
              />
            )}
          </div>
        )}

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

        {/* 秘匿メモ行（編集時のみ・全列スパン） */}
        {!isReadOnly && (
          <div className={tableStyles.memorySecretRow}>
            <div className={formStyles.secretNoteContainer}>
              <div className={formStyles.secretNoteHeader}>
                <EyeOff className={formStyles.secretNoteIcon} size={12} />
                <span className={formStyles.secretNoteTitle}>秘匿メモ</span>
                <span className={formStyles.secretNoteSubtitle}>— 閲覧画面には表示されません</span>
              </div>
              <AutoResizeTextarea
                autoResize={autoResize}
                className={`${formStyles.textarea} ${formStyles.secretNoteTextarea}`}
                onChange={(e) => {
                  setLocalSecretNote(e.target.value);
                  onUpdate(index, 'secretNote', e.target.value);
                }}
                placeholder='秘匿メモ'
                rows={1}
                value={localSecretNote}
              />
            </div>
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
  showExperience?: boolean;
  handleMemoriesAdd: () => void;
  handleMemoriesRemove: (index: number) => void;
  handleMemoriesUpdate: (index: number, field: keyof Memory, value: any) => void;
}

export const MemorySection: React.FC<MemorySectionProps> = memo(
  ({
    memories,
    isReadOnly,
    autoResize,
    showExperience,
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
                className={`${tableStyles.headerRow} ${
                  isReadOnly
                    ? showExperience !== false
                      ? tableStyles.memoryViewGrid
                      : tableStyles.memoryViewGridNoExp
                    : showExperience !== false
                      ? tableStyles.memoryEditGrid
                      : tableStyles.memoryEditGridNoExp
                }`}
              >
                <div className={tableStyles.cell}>日付</div>
                <div className={tableStyles.cell}>メモリー</div>
                <div className={tableStyles.cell}>昇華</div>
                <div className={tableStyles.cell}>プライズ</div>
                {showExperience !== false && <div className={tableStyles.cell}>経験点</div>}
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
                  showExperience={showExperience}
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
