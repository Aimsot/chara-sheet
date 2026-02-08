import React, { memo, useCallback, useState } from 'react';

import { NumberInput } from '@/components/ui/NumberInput';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character, Skill } from '@/types/preciousdays/character';

// ▼ 1. SkillRow に style プロパティを追加
const SkillRow = memo(
  ({
    skill,
    index,
    isReadOnly,
    onUpdate,
    onRemove,
    style, // グリッドスタイルを受け取る
  }: {
    skill: Skill;
    index: number;
    isReadOnly?: boolean;
    onUpdate: (index: number, field: keyof Skill, value: any) => void;
    onRemove: (index: number) => void;
    style: React.CSSProperties;
  }) => {
    // ハンドラーの固定化
    const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, 'name', e.target.value);
      },
      [index, onUpdate]
    );

    const handleLevelChange = useCallback(
      (val: number) => {
        onUpdate(index, 'level', val);
      },
      [index, onUpdate]
    );

    const handleEffectChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onUpdate(index, 'effect', e.target.value);
      },
      [index, onUpdate]
    );

    const handleRemove = useCallback(() => {
      onRemove(index);
    }, [index, onRemove]);

    const isFixedSkill = skill.id === 's1';

    return (
      // ▼ ここで style (gridTemplateColumns等) を適用する
      <div className={tableStyles.row} style={{ ...style, alignItems: 'center' }}>
        {/* スキル名 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            <div className={formStyles.readOnlyField}>{skill.name}</div>
          ) : (
            <input
              className={formStyles.input}
              defaultValue={skill.name}
              inputMode='text'
              onBlur={handleNameChange}
              placeholder='スキル名'
              type='text'
            />
          )}
        </div>

        {/* レベル */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            <div className={formStyles.readOnlyField}>{skill.level}</div>
          ) : (
            <div className={formStyles.stepper}>
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

        {/* 効果 */}
        <div className={tableStyles.cell}>
          {isReadOnly ? (
            <div className={formStyles.readOnlyField}>{skill.effect}</div>
          ) : (
            <input
              className={formStyles.input}
              defaultValue={skill.effect}
              inputMode='text'
              onBlur={handleEffectChange}
              placeholder='効果'
              type='text'
            />
          )}
        </div>

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

    const skillGridStyle = {
      display: 'grid',
      gridTemplateColumns: isReadOnly ? '1fr 100px 2.5fr' : '1.5fr 100px 2.5fr 50px',
      gap: '12px',
      minWidth: '600px',
    };

    return (
      <section className={cardStyles.base}>
        <div className={cardStyles.accordionHeader} onClick={() => setIsOpen(!isOpen)}>
          <h2 className={cardStyles.title}>スキル</h2>
          <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={tableStyles.scrollContainer}>
            <div className={tableStyles.gridTable}>
              {/* ヘッダー行 */}
              <div className={tableStyles.headerRow} style={skillGridStyle}>
                <div className={tableStyles.labelCell}>スキル名</div>
                <div className={tableStyles.cell}>レベル</div>
                <div className={tableStyles.cell}>効果</div>
                {!isReadOnly && <div className={tableStyles.cell}>削除</div>}
              </div>

              {/* リスト表示部分 */}
              {skills.length === 0 ? (
                <div
                  className={tableStyles.row}
                  style={{ justifyContent: 'center', padding: '16px' }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>スキルがありません</span>
                </div>
              ) : (
                skills.map((skill, index) => (
                  // ▼ 修正箇所: 余計な div で囲まず、style を直接 SkillRow に渡す
                  <SkillRow
                    index={index}
                    isReadOnly={isReadOnly}
                    key={skill.id}
                    onRemove={handleSkillsRemove}
                    onUpdate={handleSkillsUpdate}
                    skill={skill}
                    style={skillGridStyle} // スタイルを渡す
                  />
                ))
              )}
            </div>
          </div>

          {!isReadOnly && (
            <div
              style={{
                padding: '16px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
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
