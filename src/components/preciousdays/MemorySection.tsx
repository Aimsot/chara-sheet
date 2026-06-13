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
    const [local, setLocal] = useState({
      date: memory.date,
      content: memory.content,
      prize: memory.prize,
      exp: Number.isFinite(memory.experience) ? String(memory.experience) : '',
      secretNote: memory.secretNote ?? '',
    });
    const [prevMemory, setPrevMemory] = useState<Memory>(memory);

    if (prevMemory !== memory) {
      const next = { ...local };
      let hasChange = false;
      if (memory.date !== prevMemory.date) {
        next.date = memory.date;
        hasChange = true;
      }
      if (memory.content !== prevMemory.content) {
        next.content = memory.content;
        hasChange = true;
      }
      if (memory.prize !== prevMemory.prize) {
        next.prize = memory.prize;
        hasChange = true;
      }
      // NaN !== NaN が true になるため Number.isFinite で安全比較
      const expA = memory.experience;
      const expB = prevMemory.experience;
      if (expA !== expB && !(Number.isNaN(expA as number) && Number.isNaN(expB as number))) {
        next.exp = Number.isFinite(expA) ? String(expA) : '';
        hasChange = true;
      }
      if ((memory.secretNote ?? '') !== (prevMemory.secretNote ?? '')) {
        next.secretNote = memory.secretNote ?? '';
        hasChange = true;
      }
      setPrevMemory(memory);
      if (hasChange) setLocal(next);
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
                setLocal((l) => ({ ...l, date: e.target.value }));
                onUpdate(index, 'date', e.target.value);
              }}
              placeholder='日付'
              type='text'
              value={local.date}
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
                setLocal((l) => ({ ...l, content: e.target.value }));
                onUpdate(index, 'content', e.target.value);
              }}
              placeholder='メモリー'
              rows={1}
              value={local.content}
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
                setLocal((l) => ({ ...l, prize: e.target.value }));
                onUpdate(index, 'prize', e.target.value);
              }}
              placeholder='プライズ'
              type='text'
              value={local.prize}
            />
          )}
        </div>

        {/* 経験点 */}
        {showExperience !== false && (
          <div className={tableStyles.cell} style={{ borderLeft: '1px solid var(--card-border)' }}>
            {isReadOnly ? (
              <span>{Number.isFinite(memory.experience) ? memory.experience : ''}</span>
            ) : (
              <input
                className={formStyles.input}
                inputMode='numeric'
                onChange={(e) => {
                  setLocal((l) => ({ ...l, exp: e.target.value }));
                  if (e.target.value === '') {
                    onUpdate(index, 'experience', undefined);
                  } else {
                    const num = Number(e.target.value);
                    if (!Number.isNaN(num)) onUpdate(index, 'experience', num);
                    // NaN の場合は親 state を更新しない（入力途中を許容）
                  }
                }}
                placeholder='0'
                style={{ textAlign: 'center' }}
                type='text'
                value={local.exp}
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
                  setLocal((l) => ({ ...l, secretNote: e.target.value }));
                  onUpdate(index, 'secretNote', e.target.value);
                }}
                placeholder='秘匿メモ'
                rows={1}
                value={local.secretNote}
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
