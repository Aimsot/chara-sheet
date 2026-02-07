/* AppearanceSection.tsx */
import React, { memo, useState } from 'react'; // memoを追加

import { APPEARANCE_DATA } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';

interface AppearanceProps {
  appearance: Character['appearance'];
  updateAppearance: (field: keyof Character['appearance'], value: string) => void;
  isReadOnly: boolean;
}

// React.memoでラップ
export const AppearanceSection: React.FC<AppearanceProps> = memo(
  ({ appearance, updateAppearance, isReadOnly }) => {
    const [isOpen, setIsOpen] = useState(isReadOnly);

    return (
      <section className={cardStyles.base}>
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={cardStyles.title}>キャラクターの外見</h2>
          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={layoutStyles.grid}>
            {APPEARANCE_DATA.map((item) => (
              <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`} key={item.k}>
                <label htmlFor={item.k}>{item.l}</label>

                {isReadOnly ? (
                  <div className={baseStyles.readOnlyField}>{appearance?.[item.k] || ''}</div>
                ) : (
                  <input
                    className={formStyles.input}
                    defaultValue={appearance?.[item.k] ?? ''}
                    onBlur={(e) => updateAppearance(item.k, e.target.value)}
                    type='text'
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);
AppearanceSection.displayName = 'AppearanceSection';
export default AppearanceSection;
