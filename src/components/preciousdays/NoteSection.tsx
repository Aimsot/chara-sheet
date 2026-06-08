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
          className={cardStyles.accordionHeader}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
          style={isReadOnly ? { cursor: 'default' } : undefined}
        >
          <h2 className={cardStyles.title}>メモ</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>
        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          {isReadOnly ? (
            <div
              style={{
                minHeight: '120px',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.7,
                fontSize: '0.75rem',
                color: note ? 'inherit' : 'var(--text-muted)',
              }}
            >
              {note}
            </div>
          ) : (
            <>
              <AutoResizeTextarea
                autoResize={autoResize}
                className={formStyles.textarea}
                onChange={(e) => updateNote(e.target.value)}
                rows={6}
                style={{ width: '100%', resize: 'vertical' }}
                value={note}
              />

              {/* 秘匿メモ（編集時のみ表示） */}
              <div
                style={{
                  marginTop: '14px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid rgba(124, 0, 0, 0.6)',
                  boxShadow: '0 0 20px rgba(124, 0, 0, 0.25), inset 0 0 30px rgba(124, 0, 0, 0.08)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '7px 12px',
                    background:
                      'linear-gradient(90deg, rgba(124, 0, 0, 0.35) 0%, rgba(124, 0, 0, 0.15) 100%)',
                    borderBottom: '1px solid rgba(124, 0, 0, 0.5)',
                  }}
                >
                  <EyeOff size={13} style={{ color: 'rgba(255, 180, 180, 1)', flexShrink: 0 }} />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      color: '#fff',
                      textShadow: '0 0 10px rgba(124, 0, 0, 0.7)',
                    }}
                  >
                    秘匿メモ
                  </span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color: 'rgba(255, 180, 180, 0.75)',
                      marginLeft: '2px',
                    }}
                  >
                    — 閲覧画面には表示されません
                  </span>
                </div>
                <AutoResizeTextarea
                  autoResize={autoResize}
                  className={formStyles.textarea}
                  onChange={(e) => updateSecretNote(e.target.value)}
                  rows={4}
                  style={{
                    width: '100%',
                    resize: 'vertical',
                    border: 'none',
                    borderRadius: 0,
                    background:
                      'linear-gradient(180deg, rgba(124, 0, 0, 0.12) 0%, rgba(124, 0, 0, 0.06) 100%)',
                    color: 'rgba(255, 220, 220, 0.95)',
                  }}
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
