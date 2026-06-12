import { memo, useMemo, useState } from 'react';

import { LIFEPATH_DATA } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';
import { scrambleText } from '@/utils/preciousdays/scrambleText';

type SpoilerKey = 'origin' | 'secret' | 'future';

interface LifepathProps {
  origin: string | undefined;
  secret: string | undefined;
  future: string | undefined;
  updateBaseField: (field: keyof Character, value: any) => void;
  isReadOnly?: boolean;
  defaultOpen?: boolean;
  isMaster?: boolean;
  lifepathSpoilers?: { origin?: boolean; secret?: boolean; future?: boolean };
  onSpoilerChange?: (field: SpoilerKey, value: boolean) => void;
}

export const LifepathSection: React.FC<LifepathProps> = memo(
  ({
    origin,
    secret,
    future,
    updateBaseField,
    isReadOnly,
    defaultOpen,
    isMaster,
    lifepathSpoilers,
    onSpoilerChange,
  }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen ?? isReadOnly);
    const lifepathValues = useMemo(
      () => ({
        origin,
        secret,
        future,
      }),
      [origin, secret, future]
    );
    return (
      <section className={`${cardStyles.base} ${layoutStyles.span12}`}>
        {/* ヘッダー */}
        <div
          className={`${cardStyles.accordionHeader}${isReadOnly ? ` ${cardStyles.readOnly}` : ''}`}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
        >
          <h2 className={cardStyles.title}>ライフパス</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={layoutStyles.grid}>
            {LIFEPATH_DATA.map((field) => {
              const currentValue = lifepathValues[field.k as keyof typeof lifepathValues] || '';
              const label = isMaster && field.k === 'future' ? '未来（もしくは現在）' : field.l;
              const spoilerValue = lifepathSpoilers?.[field.k as SpoilerKey];
              // 秘密フィールドは未設定の場合も師匠ならデフォルトで秘匿
              const isSpoiler = isMaster && (spoilerValue ?? field.k === 'secret');

              return (
                <div className={`${layoutStyles.span12} ${formStyles.fieldGroup}`} key={field.k}>
                  <label>{label}</label>

                  {isReadOnly ? (
                    isSpoiler ? (
                      <div
                        className={`${baseStyles.readOnlyField} ${formStyles.fieldOverflowAuto}`}
                      >
                        <span className={baseStyles.spoiler} title='師匠によって秘匿されています'>
                          {scrambleText(currentValue)}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`${baseStyles.readOnlyField} ${formStyles.fieldOverflowAuto}`}
                      >
                        {currentValue}
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        className={formStyles.input}
                        inputMode='text'
                        onChange={(e) =>
                          updateBaseField(field.k as keyof Character, e.target.value)
                        }
                        style={{ flex: 1 }}
                        type='text'
                        value={currentValue}
                      />
                      {isMaster && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            flexShrink: 0,
                          }}
                        >
                          <span
                            style={{
                              fontSize: '0.65rem',
                              color: 'var(--text-secondary)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            秘匿
                          </span>
                          <input
                            checked={spoilerValue ?? field.k === 'secret'}
                            onChange={(e) =>
                              onSpoilerChange?.(field.k as SpoilerKey, e.target.checked)
                            }
                            type='checkbox'
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }
);
LifepathSection.displayName = 'LifepathSection';
export default LifepathSection;
