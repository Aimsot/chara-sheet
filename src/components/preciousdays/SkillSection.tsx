import React, { memo, useState } from 'react';

import { NumberInput } from '@/components/ui/NumberInput';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss'; // tableStylesへ統一
import { Character, Skill } from '@/types/preciousdays/character';

interface SkillSectionProps {
  char: Character;
  isReadOnly?: boolean;
  handleSkillsAdd: () => void;
  handleSkillsRemove: (index: number) => void;
  handleSkillsUpdate: (index: number, field: keyof Skill, value: any) => void;
}

export const SkillSection: React.FC<SkillSectionProps> = memo(
  ({ char, isReadOnly, handleSkillsAdd, handleSkillsRemove, handleSkillsUpdate }) => {
    const [isOpen, setIsOpen] = useState(isReadOnly);

    // グリッド列の設定（編集時は削除ボタン用の列を追加）
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
            <div
              className={`${tableStyles.gridTable} ${tableStyles.denseTable}`}
              style={{ minWidth: skillGridStyle.minWidth }}
            >
              {/* ヘッダー */}
              <div className={tableStyles.headerRow} style={skillGridStyle}>
                <div className={tableStyles.cell}>スキル名</div>
                <div className={tableStyles.cell}>GL</div>
                <div className={tableStyles.cell}>効果</div>
                {!isReadOnly && <div className={tableStyles.cell}></div>}
              </div>

              {/* スキル一覧 */}
              {char.skills.length === 0 ? (
                <div
                  className={tableStyles.row}
                  style={{
                    justifyContent: 'center',
                    padding: '2rem',
                    color: 'var(--text-secondary)',
                  }}
                >
                  スキルが登録されていません
                </div>
              ) : (
                char.skills.map((skill, index) => (
                  <div
                    className={`${tableStyles.row} ${isReadOnly ? tableStyles.readonly : ''}`}
                    key={skill.id}
                    style={skillGridStyle}
                  >
                    {/* スキル名 */}
                    <div className={tableStyles.cell}>
                      {isReadOnly ? (
                        skill.name || ''
                      ) : (
                        <input
                          className={formStyles.input}
                          defaultValue={skill.name} // value ではなく defaultValue
                          onBlur={(e) => handleSkillsUpdate(index, 'name', e.target.value)}
                          placeholder='スキル名'
                          type='text'
                        />
                      )}
                    </div>

                    {/* レベル (GL) */}
                    <div className={tableStyles.cell}>
                      {isReadOnly ? (
                        skill.level
                      ) : (
                        <div className={formStyles.stepperSmall}>
                          {/* マイナスボタン */}
                          <button
                            onClick={() =>
                              handleSkillsUpdate(index, 'level', (Number(skill.level) || 0) - 1)
                            }
                            type='button'
                          >
                            -
                          </button>

                          {/* 数値入力（stepper内なので className は不要） */}
                          <NumberInput
                            onChange={(val) => handleSkillsUpdate(index, 'level', val)}
                            value={skill.level}
                          />

                          {/* プラスボタン */}
                          <button
                            onClick={() =>
                              handleSkillsUpdate(index, 'level', (Number(skill.level) || 0) + 1)
                            }
                            type='button'
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    {/* 効果 */}
                    <div className={tableStyles.cell}>
                      {isReadOnly ? (
                        skill.effect || ''
                      ) : (
                        <input
                          className={formStyles.input}
                          defaultValue={skill.effect}
                          onBlur={(e) => handleSkillsUpdate(index, 'effect', e.target.value)}
                          placeholder='効果を入力'
                          type='text'
                        />
                      )}
                    </div>

                    {/* 削除ボタン */}
                    {!isReadOnly && (
                      <div className={tableStyles.cell}>
                        <button
                          className={btnStyles.ghost}
                          onClick={() => handleSkillsRemove(index)}
                          style={{
                            color: skill.id === 's1' ? 'var(--text-muted)' : '#ff6b6b',
                            padding: '4px',
                            cursor: skill.id === 's1' ? 'not-allowed' : 'pointer',
                          }}
                          title={skill.id === 's1' ? '削除不可' : '削除'}
                          type='button'
                        >
                          ×
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 追加ボタン（閲覧時は非表示） */}
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
