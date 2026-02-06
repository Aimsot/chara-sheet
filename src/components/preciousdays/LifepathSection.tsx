import { memo, useState } from 'react';

import Loading from '@/components/ui/Loading';
import { LIFEPATH_DATA } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss'; // 2カラム配置用
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';

interface LifepathProps {
  char: Character;
  updateBaseField: (field: keyof Character, value: any) => void;
  isReadOnly?: boolean;
}

export const LifepathSection: React.FC<LifepathProps> = memo(
  ({ char, updateBaseField, isReadOnly }) => {
    const [isOpen, setIsOpen] = useState(isReadOnly);

    return (
      <section className={`${cardStyles.base} ${layoutStyles.span12}`}>
        {/* ヘッダー */}
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={cardStyles.title}>ライフパス</h2>
          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
        </div>

        {!char ? (
          <Loading />
        ) : (
          <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
            <div className={layoutStyles.grid}>
              {LIFEPATH_DATA.map((field) => (
                <div className={`${layoutStyles.span12} ${formStyles.fieldGroup}`} key={field.k}>
                  <label>{field.l}</label>

                  {isReadOnly ? (
                    /* 閲覧モード: 下線形式のテキスト */
                    <div className={baseStyles.readOnlyField}>{(char as any)[field.k] || ''}</div>
                  ) : (
                    /* 編集モード: 通常の入力欄 */
                    <input
                      className={formStyles.input}
                      defaultValue={char[field.k] ?? ''}
                      id={field.k}
                      name={field.k}
                      onBlur={(e) => updateBaseField(field.k, e.target.value)}
                      type='text'
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    );
  }
);
LifepathSection.displayName = 'LifepathSection';
export default LifepathSection;
