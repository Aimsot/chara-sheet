import { memo, useMemo, useState } from 'react';

import { LIFEPATH_DATA } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss'; // 2カラム配置用
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';

interface LifepathProps {
  origin: string | undefined;
  secret: string | undefined;
  future: string | undefined;
  updateBaseField: (field: keyof Character, value: any) => void;
  isReadOnly?: boolean;
}

export const LifepathSection: React.FC<LifepathProps> = memo(
  ({ origin, secret, future, updateBaseField, isReadOnly }) => {
    const [isOpen, setIsOpen] = useState(isReadOnly);
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
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={cardStyles.title}>ライフパス</h2>
          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={layoutStyles.grid}>
            {LIFEPATH_DATA.map((field) => {
              const currentValue = lifepathValues[field.k as keyof typeof lifepathValues] || '';

              return (
                <div className={`${layoutStyles.span12} ${formStyles.fieldGroup}`} key={field.k}>
                  <label>{field.l}</label>

                  {isReadOnly ? (
                    <div className={baseStyles.readOnlyField}>{currentValue}</div>
                  ) : (
                    <input
                      className={formStyles.input}
                      defaultValue={currentValue}
                      inputMode='text'
                      onBlur={(e) => updateBaseField(field.k as keyof Character, e.target.value)}
                      type='text'
                    />
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
