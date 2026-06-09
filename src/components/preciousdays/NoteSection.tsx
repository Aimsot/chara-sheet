import React, { memo, useState } from 'react';

import { EyeOff } from 'lucide-react';

import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';

interface NoteSectionProps {
  note: string;
  secretNote: string;
  isReadOnly?: boolean;
  autoResize?: boolean;
  updateNote: (value: string) => void;
  updateSecretNote: (value: string) => void;
}

export const NoteSection: React.FC<NoteSectionProps> = memo(
  ({ note, secretNote, isReadOnly, autoResize, updateNote, updateSecretNote }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <section className={cardStyles.base}>
        <div
          className={`${cardStyles.accordionHeader}${isReadOnly ? ` ${cardStyles.readOnly}` : ''}`}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
        >
          <h2 className={cardStyles.title}>メモ</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>
        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          {isReadOnly ? (
            <div
              className={formStyles.noteReadonly}
              style={{
                maxHeight: autoResize ? undefined : '120px',
                overflowY: autoResize ? undefined : 'auto',
                color: note ? 'inherit' : 'var(--text-muted)',
              }}
            >
              {note || 'なし'}
            </div>
          ) : (
            <>
              <AutoResizeTextarea
                autoResize={autoResize}
                className={formStyles.textarea}
                onChange={(e) => updateNote(e.target.value)}
                rows={6}
                value={note}
              />

              {/* 秘匿メモ（編集時のみ表示） */}
              <div className={formStyles.secretNoteContainer}>
                <div className={formStyles.secretNoteHeader}>
                  <EyeOff className={formStyles.secretNoteIcon} size={13} />
                  <span className={formStyles.secretNoteTitle}>秘匿メモ</span>
                  <span className={formStyles.secretNoteSubtitle}>
                    — 閲覧画面には表示されません
                  </span>
                </div>
                <AutoResizeTextarea
                  autoResize={autoResize}
                  className={`${formStyles.textarea} ${formStyles.secretNoteTextarea}`}
                  onChange={(e) => updateSecretNote(e.target.value)}
                  rows={4}
                  value={secretNote}
                />
              </div>
            </>
          )}
        </div>
      </section>
    );
  }
);
NoteSection.displayName = 'NoteSection';
export default NoteSection;
