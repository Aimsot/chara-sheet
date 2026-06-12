/* AppearanceSection.tsx */
import React, { memo, useState } from 'react'; // memoを追加

import { APPEARANCE_DATA } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';
import { scrambleText } from '@/utils/preciousdays/scrambleText';

type AppearanceSpoilerKey =
  | 'age'
  | 'gender'
  | 'height'
  | 'weight'
  | 'hairColor'
  | 'eyeColor'
  | 'skinColor';
const SPOILER_ELIGIBLE: AppearanceSpoilerKey[] = [
  'age',
  'gender',
  'height',
  'weight',
  'hairColor',
  'eyeColor',
  'skinColor',
];

interface AppearanceProps {
  appearance: Character['appearance'];
  updateAppearance: (field: keyof Character['appearance'], value: string) => void;
  isReadOnly: boolean;
  defaultOpen?: boolean;
  isMaster?: boolean;
  appearanceSpoilers?: {
    age?: boolean;
    gender?: boolean;
    height?: boolean;
    weight?: boolean;
    hairColor?: boolean;
    eyeColor?: boolean;
    skinColor?: boolean;
  };
  onSpoilerChange?: (field: AppearanceSpoilerKey, value: boolean) => void;
}

// React.memoでラップ
export const AppearanceSection: React.FC<AppearanceProps> = memo(
  ({
    appearance,
    updateAppearance,
    isReadOnly,
    defaultOpen,
    isMaster,
    appearanceSpoilers,
    onSpoilerChange,
  }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen ?? isReadOnly);

    return (
      <section className={cardStyles.base}>
        <div
          className={`${cardStyles.accordionHeader}${isReadOnly ? ` ${cardStyles.readOnly}` : ''}`}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
        >
          <h2 className={cardStyles.title}>キャラクターの外見</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={layoutStyles.grid}>
            {APPEARANCE_DATA.map((item) => {
              const spoilerKey = SPOILER_ELIGIBLE.includes(item.k as AppearanceSpoilerKey)
                ? (item.k as AppearanceSpoilerKey)
                : null;
              const isSpoiler = isMaster && !!spoilerKey && !!appearanceSpoilers?.[spoilerKey];

              return (
                <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`} key={item.k}>
                  <label htmlFor={item.k}>{item.l}</label>

                  {isReadOnly ? (
                    isSpoiler ? (
                      <div
                        className={`${baseStyles.readOnlyField} ${formStyles.fieldOverflowAuto}`}
                      >
                        <span className={baseStyles.spoiler} title='師匠によって秘匿されています'>
                          {scrambleText(appearance?.[item.k] || '')}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={`${baseStyles.readOnlyField} ${formStyles.fieldOverflowAuto}`}
                      >
                        {appearance?.[item.k] || ''}
                      </div>
                    )
                  ) : (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input
                        className={formStyles.input}
                        inputMode='text'
                        onChange={(e) => updateAppearance(item.k, e.target.value)}
                        style={{ flex: 1 }}
                        type='text'
                        value={appearance?.[item.k] ?? ''}
                      />
                      {isMaster && spoilerKey && (
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
                            checked={appearanceSpoilers?.[spoilerKey] ?? false}
                            onChange={(e) => onSpoilerChange?.(spoilerKey, e.target.checked)}
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
AppearanceSection.displayName = 'AppearanceSection';
export default AppearanceSection;
