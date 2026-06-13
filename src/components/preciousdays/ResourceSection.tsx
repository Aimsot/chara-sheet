'use client';

import React, { memo, useCallback, useState } from 'react';
import { Tooltip } from 'react-tooltip';

import { STYLE_DATA, StyleKey } from '@/constants/preciousdays';
import statusStyles from '@/styles/components/charaSheet/status.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import { Character } from '@/types/preciousdays/character';
import { getGLCardStyle, getGLColor } from '@/utils/preciousdays/glColor';

import { NumberInput } from '../ui/NumberInput';

interface ResourceSectionProps {
  abilities: Character['abilities'];
  style: string;
  element: string;
  hp: Character['hp'];
  mp: Character['mp'];
  wp: Character['wp'];
  gl: number;
  experience?: number;
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
    increaseButtonId,
  }: {
    label: string;
    total: number;
    base?: number;
    modifier?: number;
    onChange: (val: number) => void;
    isSimpleMode?: boolean;
    isReadOnly?: boolean;
    increaseButtonId?: string;
  }) => {
    const isGL = label === 'GL';
    const glColor = isGL && total > 0 ? getGLColor(total) : undefined;

    return (
      <div
        className={`${statusStyles.resourceCard} ${isSimpleMode && total > 0 ? statusStyles.glCard : ''}`}
        style={glColor ? getGLCardStyle(total) : undefined}
      >
        <div className={statusStyles.cardHeader}>{label}</div>
        <div className={statusStyles.totalValue} style={glColor ? { color: glColor } : undefined}>
          {total}
        </div>

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
                <span style={{ ...(glColor ? { color: glColor } : {}), fontWeight: 'bold' }}>
                  {total}
                </span>
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
                  <span style={{ ...(glColor ? { color: glColor } : {}), fontWeight: 'bold' }}>
                    {total}
                  </span>
                  {' / 6'}
                </span>
                <button
                  aria-label='Increase'
                  id={increaseButtonId}
                  onClick={() => onChange(total + 1)}
                  type='button'
                >
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
  experience = 0,
  isReadOnly,
  handleResourceUpdate,
  handleGLUpdate,
}: ResourceSectionProps) => {
  const styleData = STYLE_DATA[style as StyleKey];
  const glLevel = gl || 0;
  const [expWarnOpen, setExpWarnOpen] = useState(false);

  const handleGLWithCheck = useCallback(
    (val: number) => {
      if (val > glLevel && val >= 2) {
        const required = (val - 1) * 10000;
        if (experience < required) {
          setExpWarnOpen(true);
          setTimeout(() => setExpWarnOpen(false), 3000);
        }
      }
      handleGLUpdate(val);
    },
    [glLevel, experience, handleGLUpdate]
  );

  // マイルストーン HP/MP 成長回数（3000exp 到達ごとに +1）
  const completedCycles = Math.max(0, glLevel - 1);
  const currentCycleExp = Math.max(0, experience - completedCycles * 10000);
  const hpMpMilestoneCount = completedCycles + (currentCycleExp >= 3000 ? 1 : 0);

  // HP/MP 基本値（スタイル基本値 + 成長率 × (GL + マイルストーン回数)）
  const hpBase =
    (styleData?.hp.base || 0) + (styleData?.hp.growth || 0) * (glLevel + hpMpMilestoneCount);
  const mpBase =
    (styleData?.mp.base || 0) + (styleData?.mp.growth || 0) * (glLevel + hpMpMilestoneCount);

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
          increaseButtonId='gl-increase-btn'
          isReadOnly={isReadOnly}
          isSimpleMode
          label='GL'
          onChange={handleGLWithCheck}
          total={gl || 0}
        />
        <Tooltip
          anchorSelect='#gl-increase-btn'
          content={`GL${glLevel}には累計${((glLevel - 1) * 10000).toLocaleString()}ptが必要です`}
          id='gl-exp-warn-tooltip'
          isOpen={expWarnOpen}
          place='top'
          style={{ zIndex: 9999 }}
          variant='error'
        />
      </div>
      {!isReadOnly && (
        <div className={formStyles.notes} style={{ marginTop: '6px' }}>
          <p>
            グレードアップと成長テーブルによる最大HP・最大MPの上昇は自動的に計算されます（詳細は{' '}
            <a
              href='#growth-table-section'
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('growth-table-section')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{ color: 'var(--accent-color)' }}
            >
              成長テーブル
            </a>{' '}
            を確認してください）。
          </p>
        </div>
      )}
    </section>
  );
};

export default ResourceSection;
