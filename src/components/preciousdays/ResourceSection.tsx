'use client';

import React, { memo, useCallback } from 'react';

import { STYLE_DATA, StyleKey } from '@/constants/preciousdays';
import statusStyles from '@/styles/components/charaSheet/status.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import { Character } from '@/types/preciousdays/character';

import { NumberInput } from '../ui/NumberInput';

interface ResourceSectionProps {
  abilities: Character['abilities'];
  style: string;
  element: string;
  hp: Character['hp'];
  mp: Character['mp'];
  wp: Character['wp'];
  gl: number;
  isReadOnly?: boolean;
  handleResourceUpdate: (key: 'hp' | 'mp' | 'wp', val: number) => void;
  handleGLUpdate: (val: number) => void;
}

const ResourceCard = memo(
  ({
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
      const mixPercentage = 10 + level * 13;

      return {
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
            isReadOnly ? (
              <span
                style={{
                  fontSize: '0.75rem',
                  letterSpacing: '0.05em',
                  color: 'var(--text-secondary)',
                }}
              >
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{total}</span>
                {' / 6'}
              </span>
            ) : (
              <div
                className={statusStyles.miniStepper}
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <button aria-label='Decrease' onClick={() => onChange(total - 1)} type='button'>
                  -
                </button>
                <span
                  style={{
                    fontSize: '0.75rem',
                    letterSpacing: '0.05em',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{total}</span>
                  {' / 6'}
                </span>
                <button aria-label='Increase' onClick={() => onChange(total + 1)} type='button'>
                  +
                </button>
              </div>
            )
          ) : (
            <>
              <span>{base}</span>
              <span>+</span>
              <div className={statusStyles.miniStepper}>
                {!isReadOnly && (
                  <button
                    aria-label='Decrease'
                    onClick={() => onChange((modifier || 0) - 1)}
                    type='button'
                  >
                    -
                  </button>
                )}
                <NumberInput
                  className={statusStyles.miniInput}
                  onChange={onChange}
                  value={modifier || 0}
                />
                {!isReadOnly && (
                  <button
                    aria-label='Increase'
                    onClick={() => onChange((modifier || 0) + 1)}
                    type='button'
                  >
                    +
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }
);
ResourceCard.displayName = 'ResourceCard';

const ResourceSection = ({
  abilities,
  style,
  hp,
  mp,
  wp,
  gl,
  isReadOnly,
  handleResourceUpdate,
  handleGLUpdate,
}: ResourceSectionProps) => {
  const styleData = STYLE_DATA[style as StyleKey];
  const glLevel = gl || 0;

  // HP/MP 基本値（スタイル基本値 + 成長率×GL）
  const hpBase = (styleData?.hp.base || 0) + (styleData?.hp.growth || 0) * glLevel;
  const mpBase = (styleData?.mp.base || 0) + (styleData?.mp.growth || 0) * glLevel;

  // WPの基本値計算
  const wpBase = (abilities.passion?.total || 0) + (abilities.affection?.total || 0);

  const onHpChange = useCallback(
    (val: number) => handleResourceUpdate('hp', val),
    [handleResourceUpdate]
  );

  const onMpChange = useCallback(
    (val: number) => handleResourceUpdate('mp', val),
    [handleResourceUpdate]
  );

  const onWpChange = useCallback(
    (val: number) => handleResourceUpdate('wp', val),
    [handleResourceUpdate]
  );

  return (
    <section className={formStyles.panel}>
      <div className={statusStyles.resourceGrid}>
        {/* HP */}
        <ResourceCard
          base={hpBase}
          isReadOnly={isReadOnly}
          label='HP'
          modifier={hp.modifier || 0}
          onChange={onHpChange}
          total={hpBase + (hp.modifier || 0)}
        />

        {/* MP */}
        <ResourceCard
          base={mpBase}
          isReadOnly={isReadOnly}
          label='MP'
          modifier={mp.modifier || 0}
          onChange={onMpChange}
          total={mpBase + (mp.modifier || 0)}
        />

        {/* WP */}
        <ResourceCard
          base={wpBase}
          isReadOnly={isReadOnly}
          label='WP'
          modifier={wp.modifier || 0}
          onChange={onWpChange}
          total={wpBase + (wp.modifier || 0)}
        />

        {/* GL */}
        <ResourceCard
          isReadOnly={isReadOnly}
          isSimpleMode
          label='GL'
          onChange={handleGLUpdate}
          total={gl || 0}
        />
      </div>
      {!isReadOnly && (
        <div className={formStyles.notes} style={{ marginTop: '6px' }}>
          <p>グレードアップ時の最大HPと最大MPの上昇は自動的に計算されます</p>
        </div>
      )}
    </section>
  );
};

export default ResourceSection;
