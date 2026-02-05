'use client';

import React from 'react';

import { STYLE_DATA, StyleKey } from '@/constants/preciousdays';
import statusStyles from '@/styles/components/charaSheet/status.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import { Character } from '@/types/preciousdays/character';

import { NumberInput } from '../ui/NumberInput';

interface ResourceSectionProps {
  char: Character;
  setChar: React.Dispatch<React.SetStateAction<Character>>;
  isReadOnly?: boolean;
}

// --- 子コンポーネントの定義 (内部で自分自身を呼ばないように修正) ---
const ResourceCard = ({
  label,
  total,
  base,
  modifier,
  onChange,
  isSimpleMode = false,
  isReadOnly,
}: {
  label: string;
  total: number;
  base?: number;
  modifier?: number;
  onChange: (val: number) => void;
  isSimpleMode?: boolean;
  isReadOnly?: boolean;
}) => {
  return (
    <div className={`${statusStyles.resourceCard} ${isSimpleMode ? statusStyles.glCard : ''}`}>
      <div className={statusStyles.cardHeader}>{label}</div>
      <div className={statusStyles.totalValue}>{total}</div>

      <div className={statusStyles.calcRow}>
        {isSimpleMode ? (
          <div className={statusStyles.miniStepper}>
            {!isReadOnly && (
              <button onClick={() => onChange(total - 1)} type='button'>
                -
              </button>
            )}
            <span className={statusStyles.miniValueDisplay}>RANK</span>
            {!isReadOnly && (
              <button onClick={() => onChange(total + 1)} type='button'>
                +
              </button>
            )}
          </div>
        ) : (
          <>
            <span>{base}</span>
            <span>+</span>
            <div className={statusStyles.miniStepper}>
              {!isReadOnly && (
                <button onClick={() => onChange((modifier || 0) - 1)} type='button'>
                  -
                </button>
              )}
              <NumberInput
                className={statusStyles.miniInput}
                onChange={onChange}
                value={modifier || 0}
              />
              {!isReadOnly && (
                <button onClick={() => onChange((modifier || 0) + 1)} type='button'>
                  +
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ResourceSection = ({ char, setChar, isReadOnly }: ResourceSectionProps) => {
  // HP/MP/WP の更新ハンドラ
  const updateModifier = (key: 'hp' | 'mp' | 'wp', val: number) => {
    setChar((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        modifier: val,
      },
    }));
  };

  // GL (Grade Level) の更新ハンドラ
  const updateGL = (val: number) => {
    if (val < 0) return;
    setChar((prev) => ({
      ...prev,
      gl: val,
    }));
  };

  // WPの基本値計算
  const wpBase = (char.abilities.passion?.total || 0) + (char.abilities.affection?.total || 0);

  // --- メインの表示部分 ---
  return (
    <section className={formStyles.panel}>
      <div className={statusStyles.resourceGrid}>
        {/* HP */}
        <ResourceCard
          base={char.style ? STYLE_DATA[char.style as StyleKey]?.hp.base || 0 : 0}
          isReadOnly={isReadOnly}
          label='HP'
          modifier={char.hp.modifier || 0}
          onChange={(val) => updateModifier('hp', val)}
          total={
            (char.style ? STYLE_DATA[char.style as StyleKey]?.hp.base || 0 : 0) +
            (char.hp.modifier || 0)
          }
        />

        {/* MP */}
        <ResourceCard
          base={char.style ? STYLE_DATA[char.style as StyleKey]?.mp.base || 0 : 0}
          label='MP'
          modifier={char.mp.modifier || 0}
          onChange={(val) => updateModifier('mp', val)}
          total={
            (char.style ? STYLE_DATA[char.style as StyleKey]?.mp.base || 0 : 0) +
            (char.mp.modifier || 0)
          }
        />

        {/* WP */}
        <ResourceCard
          base={wpBase}
          label='WP'
          modifier={char.wp.modifier || 0}
          onChange={(val) => updateModifier('wp', val)}
          total={wpBase + (char.wp.modifier || 0)}
        />

        {/* GL */}
        <ResourceCard isSimpleMode label='GL' onChange={updateGL} total={char.gl || 0} />
      </div>
    </section>
  );
};

export default ResourceSection;
