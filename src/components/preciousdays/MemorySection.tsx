import React, { memo, useCallback, useState } from 'react';

import { EyeOff } from 'lucide-react';

import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character, Memory, SecretNoteMode } from '@/types/preciousdays/character';

// ||text|| 構文を持つテキストを描画するコンポーネント
function SpoilerText({
  text,
  revealedSet,
  onReveal,
}: {
  text: string;
  revealedSet: Set<number>;
  onReveal: (i: number) => void;
}) {
  const parts = text.split(/\|\|([^|]+)\|\|/);
  return (
    <>
      {parts.map((part, i) => {
        if (i % 2 === 0) {
          return <React.Fragment key={i}>{part}</React.Fragment>;
        }
        const spoilerIndex = Math.floor(i / 2);
        const isRevealed = revealedSet.has(spoilerIndex);
        return (
          <span
            key={i}
            onClick={() => !isRevealed && onReveal(spoilerIndex)}
            style={{
              backgroundColor: isRevealed ? 'rgba(128,128,128,0.2)' : 'var(--text-primary)',
              color: isRevealed ? 'inherit' : 'transparent',
              borderRadius: '3px',
              padding: '0 3px',
              cursor: isRevealed ? 'text' : 'pointer',
              userSelect: isRevealed ? 'auto' : 'none',
              transition: 'background-color 0.15s',
            }}
            title={isRevealed ? undefined : 'クリックして表示'}
          >
            {part}
          </span>
        );
      })}
    </>
  );
}

const SECRET_NOTE_MODE_LABELS: Record<string, string> = {
  public: '公開',
  private: '非公開',
  spoiler: 'ワンクッション',
};

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
      secretNoteMode: memory.secretNoteMode ?? 'private',
    });
    const [prevMemory, setPrevMemory] = useState<Memory>(memory);

    // 閲覧モード用: ||spoiler|| 展開状態
    const [revealedSpoilers, setRevealedSpoilers] = useState<Set<number>>(new Set());
    // 閲覧モード用: ワンクッション展開
    const [spoilerRevealed, setSpoilerRevealed] = useState(false);
    // 秘匿メモ内の ||spoiler|| 展開状態
    const [revealedSecretSpoilers, setRevealedSecretSpoilers] = useState<Set<number>>(new Set());

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
      if ((memory.secretNoteMode ?? 'private') !== (prevMemory.secretNoteMode ?? 'private')) {
        next.secretNoteMode = memory.secretNoteMode ?? 'private';
        hasChange = true;
      }
      setPrevMemory(memory);
      if (hasChange) setLocal(next);
    }

    const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);

    const revealSpoiler = useCallback((i: number) => {
      setRevealedSpoilers((prev) => {
        const next = new Set(prev);
        next.add(i);
        return next;
      });
    }, []);

    const revealSecretSpoiler = useCallback((i: number) => {
      setRevealedSecretSpoilers((prev) => {
        const next = new Set(prev);
        next.add(i);
        return next;
      });
    }, []);

    const mode = local.secretNoteMode as SecretNoteMode;
    const hasViewSubRow =
      isReadOnly &&
      !!memory.secretNote &&
      !!memory.secretNoteMode &&
      memory.secretNoteMode !== 'private';

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
            gridRow: hasViewSubRow ? 'span 2' : undefined,
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
              <SpoilerText
                onReveal={revealSpoiler}
                revealedSet={revealedSpoilers}
                text={memory.content}
              />
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

        {/* 秘匿メモ サブ行（閲覧モード・全列スパン） */}
        {isReadOnly &&
          memory.secretNote &&
          memory.secretNoteMode &&
          memory.secretNoteMode !== 'private' && (
            <>
              {/* 公開: 枠線付きボックスで表示 */}
              {memory.secretNoteMode === 'public' && (
                <div className={tableStyles.memoryPublicSubRow}>
                  <SpoilerText
                    onReveal={revealSecretSpoiler}
                    revealedSet={revealedSecretSpoilers}
                    text={memory.secretNote}
                  />
                </div>
              )}

              {/* ワンクッション */}
              {memory.secretNoteMode === 'spoiler' && (
                <div className={tableStyles.memoryViewSubRow}>
                  {!spoilerRevealed ? (
                    <button
                      onClick={() => setSpoilerRevealed(true)}
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--text-muted)',
                        background: 'none',
                        border: '1px solid var(--card-border)',
                        borderRadius: '4px',
                        padding: '3px 10px',
                        cursor: 'pointer',
                      }}
                      type='button'
                    >
                      クリックで表示 ⚠ ネタバレが含まれている場合があります
                    </button>
                  ) : (
                    <div className={tableStyles.textContent}>
                      <SpoilerText
                        onReveal={revealSecretSpoiler}
                        revealedSet={revealedSecretSpoilers}
                        text={memory.secretNote}
                      />
                    </div>
                  )}
                </div>
              )}
            </>
          )}

        {/* 秘匿メモ行（編集時のみ・全列スパン） */}
        {!isReadOnly && (
          <div className={tableStyles.memorySecretRow}>
            <div className={formStyles.secretNoteContainer}>
              <div className={formStyles.secretNoteHeader}>
                <EyeOff className={formStyles.secretNoteIcon} size={12} />
                <span className={formStyles.secretNoteTitle}>秘匿メモ</span>
                <select
                  onChange={(e) => {
                    const val = e.target.value as SecretNoteMode;
                    setLocal((l) => ({ ...l, secretNoteMode: val }));
                    onUpdate(index, 'secretNoteMode', val);
                  }}
                  style={{
                    fontSize: '0.72rem',
                    padding: '1px 4px',
                    borderRadius: '3px',
                    border: '1px solid var(--card-border)',
                    background: 'var(--card-bg)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    marginLeft: '4px',
                  }}
                  value={mode}
                >
                  {Object.entries(SECRET_NOTE_MODE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
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
