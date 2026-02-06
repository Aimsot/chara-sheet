'use client';

import React from 'react';

import { STYLE_DATA, StyleKey } from '@/constants/preciousdays';
import statusStyles from '@/styles/components/charaSheet/status.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import { Character } from '@/types/preciousdays/character';

import { NumberInput } from '../ui/NumberInput';

interface ResourceSectionProps {
  char: Character;
  isReadOnly?: boolean;
  handleResourceUpdate: (key: 'hp' | 'mp' | 'wp', val: number) => void;
  handleGLUpdate: (val: number) => void;
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
  const getGLDynamicStyle = (level: number) => {
    if (label !== 'GL') return {};

    // レベル(0-6)に応じたパーセンテージ計算
    // 0=10%, 6=90% くらいで混ぜると綺麗です
    const mixPercentage = 10 + level * 13;

    return {
      // 現在のアクセントカラー(--accent-color)と透明、または黒を混ぜる
      backgroundColor: `color-mix(in srgb, var(--accent-color), transparent ${
        100 - mixPercentage
      }%)`,
      borderColor:
        level >= 4
          ? `var(--accent-color)`
          : `color-mix(in srgb, var(--accent-color), transparent 70%)`,
      color: level >= 4 ? '#fff' : 'var(--text-primary)',
      boxShadow: level >= 6 ? `0 0 15px var(--accent-glow)` : 'none',
      transition: 'all 0.3s ease-out',
    };
  };
  return (
    <div
      className={`${statusStyles.resourceCard} ${isSimpleMode ? statusStyles.glCard : ''}`}
      style={getGLDynamicStyle(total)}
    >
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
            <span className={statusStyles.miniValueDisplay}>LEVEL</span>
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

const ResourceSection = ({
  char,
  isReadOnly,
  handleResourceUpdate,
  handleGLUpdate,
}: ResourceSectionProps) => {
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
          onChange={(val) => handleResourceUpdate('hp', val)}
          total={
            (char.style ? STYLE_DATA[char.style as StyleKey]?.hp.base || 0 : 0) +
            (char.hp.modifier || 0)
          }
        />

        {/* MP */}
        <ResourceCard
          base={char.style ? STYLE_DATA[char.style as StyleKey]?.mp.base || 0 : 0}
          isReadOnly={isReadOnly}
          label='MP'
          modifier={char.mp.modifier || 0}
          onChange={(val) => handleResourceUpdate('mp', val)}
          total={
            (char.style ? STYLE_DATA[char.style as StyleKey]?.mp.base || 0 : 0) +
            (char.mp.modifier || 0)
          }
        />

        {/* WP */}
        <ResourceCard
          base={wpBase}
          isReadOnly={isReadOnly}
          label='WP'
          modifier={char.wp.modifier || 0}
          onChange={(val) => handleResourceUpdate('wp', val)}
          total={wpBase + (char.wp.modifier || 0)}
        />

        {/* GL */}
        <ResourceCard
          isReadOnly={isReadOnly}
          isSimpleMode
          label='GL'
          onChange={handleGLUpdate}
          total={char.gl || 0}
        />
      </div>
    </section>
  );
};

export default ResourceSection;
