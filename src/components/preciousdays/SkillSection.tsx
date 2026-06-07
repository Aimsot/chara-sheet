import React, { memo, useCallback, useState } from 'react';

import { NumberInput } from '@/components/ui/NumberInput';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character, Skill } from '@/types/preciousdays/character';

const TEXT_COLUMNS: { field: keyof Skill; label: string; placeholder?: string }[] = [
  { field: 'timing', label: 'タイミング' },
  { field: 'critical', label: 'クリティカル' },
  { field: 'check', label: '判定' },
  { field: 'target', label: '対象' },
  { field: 'range', label: '射程' },
  { field: 'cost', label: 'コスト' },
  { field: 'effect', label: '効果' },
];

const SkillRow = memo(
  ({
    skill,
    index,
    isReadOnly,
    onUpdate,
    onRemove,
    style,
  }: {
    skill: Skill;
    index: number;
    isReadOnly?: boolean;
    onUpdate: (index: number, field: keyof Skill, value: any) => void;
    onRemove: (index: number) => void;
    style: React.CSSProperties;
  }) => {
    const handleLevelChange = useCallback(
      (val: number) => onUpdate(index, 'level', val),
      [index, onUpdate]
    );

    const handleRemove = useCallback(() => onRemove(index), [index, onRemove]);

    const isFixedSkill = skill.id === 's1';

    return (
      <div className={tableStyles.row} style={{ ...style, alignItems: 'center' }}>
        {/* スキル名 */}
        <div
          className={tableStyles.cell}
          style={{
            justifyContent: 'flex-start',
            paddingLeft: '6px',
            borderRight: '1px solid var(--card-border)',
          }}
        >
          {isReadOnly ? (
            <span>{skill.name}</span>
          ) : (
            <input
              className={formStyles.input}
              defaultValue={skill.name}
              onBlur={(e) => onUpdate(index, 'name', e.target.value)}
              placeholder='スキル名'
              type='text'
            />
          )}
        </div>

        {/* レベル */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            <span>{skill.level}</span>
          ) : (
            <div className={formStyles.stepperSmall}>
              <button onClick={() => handleLevelChange((skill.level || 0) - 1)} type='button'>
                -
              </button>
              <NumberInput onChange={handleLevelChange} value={skill.level} />
              <button onClick={() => handleLevelChange((skill.level || 0) + 1)} type='button'>
                +
              </button>
            </div>
          )}
        </div>

        {/* タイミング〜効果 */}
        {TEXT_COLUMNS.map(({ field, label }) => (
          <div className={tableStyles.cell} key={field} style={{ justifyContent: 'flex-start', paddingLeft: '4px' }}>
            {isReadOnly ? (
              <span>{(skill as any)[field] ?? ''}</span>
            ) : (
              <input
                className={formStyles.input}
                defaultValue={(skill as any)[field] ?? ''}
                onBlur={(e) => onUpdate(index, field, e.target.value)}
                placeholder={label}
                type='text'
              />
            )}
          </div>
        ))}

        {/* 削除ボタン */}
        {!isReadOnly && (
          <div className={tableStyles.cell}>
            <button
              className={btnStyles.ghost}
              disabled={isFixedSkill}
              onClick={handleRemove}
              style={{
                color: isFixedSkill ? 'var(--text-muted)' : '#ff6b6b',
                padding: '4px',
                cursor: isFixedSkill ? 'not-allowed' : 'pointer',
              }}
              title={isFixedSkill ? '削除不可' : '削除'}
              type='button'
            >
              ×
            </button>
          </div>
        )}
      </div>
    );
  }
);
SkillRow.displayName = 'SkillRow';

interface SkillSectionProps {
  skills: Character['skills'];
  isReadOnly?: boolean;
  handleSkillsAdd: () => void;
  handleSkillsRemove: (index: number) => void;
  handleSkillsUpdate: (index: number, field: keyof Skill, value: any) => void;
}

export const SkillSection: React.FC<SkillSectionProps> = memo(
  ({ skills, isReadOnly, handleSkillsAdd, handleSkillsRemove, handleSkillsUpdate }) => {
    const [isOpen, setIsOpen] = useState(true);

    // スキル名 + Lv + 7テキスト列 + 削除
    const skillGridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: isReadOnly
        ? '1.5fr 60px 1fr 1fr 1fr 1fr 1fr 1fr 2fr'
        : '1.5fr 80px 1fr 1fr 1fr 1fr 1fr 1fr 2fr 40px',
      gap: '8px',
      minWidth: '900px',
    };

    return (
      <section className={cardStyles.base}>
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={cardStyles.title}>スキル</h2>
          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={tableStyles.scrollContainer}>
            <div className={`${tableStyles.gridTable} ${tableStyles.denseTable}`}>
              {/* ヘッダー行 */}
              <div className={tableStyles.headerRow} style={skillGridStyle}>
                <div className={tableStyles.labelCell}>スキル名</div>
                <div className={tableStyles.cell}>レベル</div>
                {TEXT_COLUMNS.map(({ field, label }) => (
                  <div className={tableStyles.cell} key={field}>
                    {label}
                  </div>
                ))}
                {!isReadOnly && <div className={tableStyles.cell}>削除</div>}
              </div>

              {skills.length === 0 ? (
                <div
                  className={tableStyles.row}
                  style={{ justifyContent: 'center', padding: '16px' }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>スキルがありません</span>
                </div>
              ) : (
                skills.map((skill, index) => (
                  <SkillRow
                    index={index}
                    isReadOnly={isReadOnly}
                    key={skill.id}
                    onRemove={handleSkillsRemove}
                    onUpdate={handleSkillsUpdate}
                    skill={skill}
                    style={skillGridStyle}
                  />
                ))
              )}
            </div>
          </div>

          {!isReadOnly && (
            <div style={{ padding: '16px', display: 'flex', justifyContent: 'center' }}>
              <button
                className={btnStyles.outline}
                onClick={handleSkillsAdd}
                style={{ minWidth: '240px' }}
                type='button'
              >
                ＋ スキルを追加する
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }
);
SkillSection.displayName = 'SkillSection';
export default SkillSection;
