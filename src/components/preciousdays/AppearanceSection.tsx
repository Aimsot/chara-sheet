import { useState } from 'react';

import { APPEARANCE_DATA } from '@/constants/preciousdays';
import cardStyles from '@/styles/components/cards.module.scss';
import baseStyles from '@/styles/components/charaSheet/base.module.scss'; // 2カラム配置用
import formStyles from '@/styles/components/forms.module.scss';
import layoutStyles from '@/styles/components/layout.module.scss';
import { Character } from '@/types/preciousdays/character';

interface AppearanceProps {
  char: Character;
  isReadOnly: boolean;
}

export const AppearanceSection: React.FC<AppearanceProps> = ({ char, isReadOnly }) => {
  const [isOpen, setIsOpen] = useState(isReadOnly);

  return (
    <section className={cardStyles.base}>
      {/* アコーディオンヘッダー */}
      <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
        <h2 className={cardStyles.title}>キャラクターの外見</h2>
        <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
      </div>

      {/* アコーディオンコンテンツ */}
      <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
        <div className={layoutStyles.grid}>
          {APPEARANCE_DATA.map((item) => (
            <div className={`${layoutStyles.span6} ${formStyles.fieldGroup}`} key={item.k}>
              <label htmlFor={item.k}>{item.l}</label>

              {isReadOnly ? (
                /* 閲覧モード: 下線表示 */
                <div className={baseStyles.readOnlyField}>{char.appearance?.[item.k] || ''}</div>
              ) : (
                /* 編集モード: 元の defaultValue 形式を維持 */
                <input
                  className={formStyles.input}
                  defaultValue={char.appearance?.[item.k] ?? ''}
                  id={item.k}
                  name={item.k} // フォーム送信時にここが参照される
                  type='text'
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AppearanceSection;
