import { useState } from 'react';

import Loading from '@/components/ui/Loading';
import { LIFEPATH_DATA } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss'; // 2カラム配置用
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';

interface LifepathProps {
  char: Character;
  setChar: React.Dispatch<React.SetStateAction<Character>>;
  isReadOnly?: boolean;
}

export const LifepathSection: React.FC<LifepathProps> = ({ char, setChar, isReadOnly }) => {
  const [isOpen, setIsOpen] = useState(isReadOnly);

  const handleFieldChange = (key: string, value: string) => {
    setChar((prev) => ({ ...prev, [key]: value }));
  };

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
                    id={field.k}
                    name={field.k}
                    onChange={(e) => handleFieldChange(field.k, e.target.value)}
                    type='text'
                    value={(char as any)[field.k] ?? ''}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default LifepathSection;
