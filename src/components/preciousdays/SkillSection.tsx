'use client';
import React, { memo, useState } from 'react';

import { AutoResizeTextarea } from '@/components/ui/AutoResizeTextarea';
import { ComboBox } from '@/components/ui/ComboBox';
import { NumberInput } from '@/components/ui/NumberInput';
import btnStyles from '@/styles/components/buttons.module.scss';
import cardStyles from '@/styles/components/cards.module.scss';
import formStyles from '@/styles/components/forms.module.scss';
import tableStyles from '@/styles/components/tables.module.scss';
import { Character, Skill } from '@/types/preciousdays/character';

const TIMING_FULL: Record<string, string> = {
  パッシブ: 'パッシブ',
  メジャー: 'メジャーアクション',
  マイナー: 'マイナーアクション',
  セットアップ: 'セットアッププロセス',
  命中判定の直後: '命中判定の直後',
  ダメージロールの直前: 'ダメージロールの直前',
  ダメージロールの直後: 'ダメージロールの直後',
};

function expandTiming(value: string): string[] {
  return value.split('／').map((p) => TIMING_FULL[p.trim()] ?? p.trim());
}

const TIMING_OPTIONS = [
  'パッシブ',
  'パッシブ／メジャー',
  'セットアップ',
  'セットアップ／マイナー',
  'メジャー',
  'マイナー',
  '命中判定の直後',
  'ダメージロールの直前',
  'ダメージロールの直後',
];
const RANGE_OPTIONS = ['―', '至近', '近', '中', '遠'];
const JUDGE_OPTIONS = ['―', '自動成功', '魔術値', '体力', '知力', '神秘', '俊敏', '情熱', '優愛'];
const CRITICAL_OPTIONS = ['なし', 'ダイスロール増加'];
const CATEGORY_OPTIONS = ['魔術', '種族', '種族／魔術', '一般'];
const TARGET_OPTIONS = ['自身', '単体', '範囲'];

const MAIN_COLS: { field: keyof Skill; label: string }[] = [
  { field: 'timing', label: 'タイミング' },
  { field: 'judge', label: '判定' },
  { field: 'target', label: '対象' },
  { field: 'range', label: '射程' },
  { field: 'cost', label: 'コスト' },
  { field: 'critical', label: 'クリティカル' },
];

// ============================================================
// 閲覧用: 1行 + ホバー時に効果サブ行
// ============================================================
const SkillReadonlyRow = memo(
  ({
    skill,
    rowIndex: _rowIndex,
    autoResize,
  }: {
    skill: Skill;
    rowIndex: number;
    autoResize?: boolean;
  }) => {
    const hasEffect = !!skill.effect;

    return (
      <div className={`${tableStyles.row} ${tableStyles.skillReadonlyGrid}`}>
        {/* 分類: 効果表示時は2行分スパン */}
        <div
          className={tableStyles.cell}
          style={{
            gridColumn: '1',
            gridRow: hasEffect ? '1 / 3' : '1',
            alignSelf: 'stretch',
            minHeight: '32px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            borderRight: '1px solid var(--card-border)',
          }}
        >
          {skill.category ?? ''}
        </div>

        {/* スキル名 */}
        <div
          className={tableStyles.cell}
          style={{
            gridColumn: '2',
            gridRow: '1',
            minHeight: '32px',
            justifyContent: 'center',
            fontWeight: 'bold',
          }}
        >
          {skill.name}
        </div>

        {/* GL */}
        <div
          className={tableStyles.cell}
          style={{ gridColumn: '3', gridRow: '1', minHeight: '32px' }}
        >
          {skill.level}
        </div>

        {/* タイミング〜クリティカル */}
        {MAIN_COLS.map(({ field }, i) => (
          <div
            className={tableStyles.cell}
            key={field}
            style={{
              gridColumn: String(i + 4),
              gridRow: '1',
              minHeight: '32px',
              justifyContent: 'center',
            }}
          >
            {field === 'timing' ? (
              <span style={{ textAlign: 'center', lineHeight: 1.5 }}>
                {expandTiming((skill as any)[field] ?? '').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </span>
            ) : (
              <span>{(skill as any)[field] ?? ''}</span>
            )}
          </div>
        ))}

        {/* 効果+ページ: 分類列を除く全列にまたがる */}
        {hasEffect && (
          <div className={tableStyles.subRow} style={{ gridColumn: '2 / -1', gridRow: '2' }}>
            <div
              className={tableStyles.textContent}
              style={{
                paddingLeft: '12px',
                maxHeight: autoResize ? undefined : '4.5em',
                overflowY: autoResize ? undefined : 'auto',
              }}
            >
              {skill.effect}
            </div>
            {skill.page && (
              <div className={tableStyles.pageRef}>
                {/^\d+$/.test(skill.page) ? `p.${skill.page}` : skill.page}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);
SkillReadonlyRow.displayName = 'SkillReadonlyRow';

// ============================================================
// 編集用: 2段行レイアウト
// ============================================================
const SkillEditRow = memo(
  ({
    skill,
    index,
    autoResize,
    onUpdate,
    onRemove,
  }: {
    skill: Skill;
    index: number;
    autoResize?: boolean;
    onUpdate: (index: number, field: keyof Skill, value: any) => void;
    onRemove: (index: number) => void;
  }) => {
    const isFixed = skill.id === 's1';

    const [prevSkillName, setPrevSkillName] = React.useState(skill.name ?? '');
    const [localSkillName, setLocalSkillName] = React.useState(skill.name ?? '');
    const [prevEffect, setPrevEffect] = React.useState(skill.effect ?? '');
    const [localEffect, setLocalEffect] = React.useState(skill.effect ?? '');
    const [prevPage, setPrevPage] = React.useState(skill.page ?? '');
    const [localPage, setLocalPage] = React.useState(skill.page ?? '');

    if ((skill.name ?? '') !== prevSkillName) {
      setPrevSkillName(skill.name ?? '');
      setLocalSkillName(skill.name ?? '');
    }
    if ((skill.effect ?? '') !== prevEffect) {
      setPrevEffect(skill.effect ?? '');
      setLocalEffect(skill.effect ?? '');
    }
    if ((skill.page ?? '') !== prevPage) {
      setPrevPage(skill.page ?? '');
      setLocalPage(skill.page ?? '');
    }

    return (
      <div className={`${tableStyles.row} ${tableStyles.blockRow}`}>
        {/* メイン行 */}
        <div className={tableStyles.skillEditGrid}>
          {/* スキル名 */}
          <div
            className={tableStyles.cell}
            style={{ justifyContent: 'flex-start', padding: '0 8px' }}
          >
            <input
              className={formStyles.inputSmall}
              onChange={(e) => {
                setLocalSkillName(e.target.value);
                onUpdate(index, 'name', e.target.value);
              }}
              placeholder='スキル名'
              type='text'
              value={localSkillName}
            />
          </div>

          {/* GL */}
          <div className={tableStyles.cell}>
            <div className={formStyles.stepperSmall}>
              <button
                onClick={() => onUpdate(index, 'level', (skill.level || 0) - 1)}
                type='button'
              >
                -
              </button>
              <NumberInput onChange={(v) => onUpdate(index, 'level', v)} value={skill.level} />
              <button
                onClick={() => onUpdate(index, 'level', (skill.level || 0) + 1)}
                type='button'
              >
                +
              </button>
            </div>
          </div>

          {/* タイミング〜コスト */}
          {MAIN_COLS.map(({ field, label }) => (
            <div className={tableStyles.cell} key={field}>
              {field === 'timing' ? (
                <ComboBox
                  className={formStyles.input}
                  defaultValue={(skill as any)[field] ?? ''}
                  onCommit={(val) => onUpdate(index, field, val)}
                  options={TIMING_OPTIONS}
                  placeholder={label}
                />
              ) : field === 'range' ? (
                <ComboBox
                  className={formStyles.input}
                  defaultValue={(skill as any)[field] ?? ''}
                  onCommit={(val) => onUpdate(index, field, val)}
                  options={RANGE_OPTIONS}
                  placeholder={label}
                />
              ) : field === 'critical' ? (
                <ComboBox
                  className={formStyles.input}
                  defaultValue={(skill as any)[field] ?? ''}
                  onCommit={(val) => onUpdate(index, field, val)}
                  options={CRITICAL_OPTIONS}
                  placeholder={label}
                />
              ) : field === 'judge' ? (
                <ComboBox
                  className={formStyles.input}
                  defaultValue={(skill as any)[field] ?? ''}
                  onCommit={(val) => onUpdate(index, field, val)}
                  options={JUDGE_OPTIONS}
                  placeholder={label}
                />
              ) : field === 'target' ? (
                <ComboBox
                  className={formStyles.input}
                  defaultValue={(skill as any)[field] ?? ''}
                  onCommit={(val) => onUpdate(index, field, val)}
                  options={TARGET_OPTIONS}
                  placeholder={label}
                />
              ) : (
                <input
                  className={formStyles.inputSmall}
                  onChange={(e) => onUpdate(index, field, e.target.value)}
                  placeholder={label}
                  type='text'
                  value={(skill as any)[field] ?? ''}
                />
              )}
            </div>
          ))}

          {/* 削除ボタン */}
          <div className={tableStyles.cell}>
            <button
              className={btnStyles.ghost}
              disabled={isFixed}
              onClick={() => onRemove(index)}
              style={{
                color: isFixed ? 'var(--text-muted)' : '#ff6b6b',
                padding: '4px',
                cursor: isFixed ? 'not-allowed' : 'pointer',
              }}
              title={isFixed ? '削除不可' : '削除'}
              type='button'
            >
              ×
            </button>
          </div>
        </div>

        {/* 2行目: 分類 + 効果 + ページ */}
        <div className={`${tableStyles.subRow} ${tableStyles.subRowCompact}`}>
          <div className={tableStyles.fieldRowShrink}>
            <span className={tableStyles.fieldLabel}>分類</span>
            <div className={tableStyles.slotLabelCol}>
              <ComboBox
                className={formStyles.inputSmall}
                defaultValue={skill.category ?? ''}
                onCommit={(val) => onUpdate(index, 'category', val)}
                options={CATEGORY_OPTIONS}
                placeholder='分類'
              />
            </div>
          </div>

          <div className={tableStyles.fieldRowFlex}>
            <span className={tableStyles.fieldLabel}>効果</span>
            <AutoResizeTextarea
              autoResize={autoResize}
              className={formStyles.textareaTable}
              onChange={(e) => {
                setLocalEffect(e.target.value);
                onUpdate(index, 'effect', e.target.value);
              }}
              rows={1}
              style={{ flex: 1 }}
              value={localEffect}
            />
          </div>

          <div className={tableStyles.fieldRowShrink}>
            <span className={tableStyles.fieldLabel}>ページ</span>
            <div style={{ width: '60px' }}>
              <input
                className={formStyles.inputSmall}
                onChange={(e) => {
                  setLocalPage(e.target.value);
                  onUpdate(index, 'page', e.target.value);
                }}
                placeholder='p.'
                type='text'
                value={localPage}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
SkillEditRow.displayName = 'SkillEditRow';

// ============================================================
// セクション本体
// ============================================================
interface SkillSectionProps {
  skills: Character['skills'];
  isReadOnly?: boolean;
  autoResize?: boolean;
  handleSkillsAdd: () => void;
  handleSkillsRemove: (index: number) => void;
  handleSkillsUpdate: (index: number, field: keyof Skill, value: any) => void;
}

export const SkillSection: React.FC<SkillSectionProps> = memo(
  ({ skills, isReadOnly, autoResize, handleSkillsAdd, handleSkillsRemove, handleSkillsUpdate }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
      <section className={cardStyles.base}>
        <div
          className={`${cardStyles.accordionHeader}${isReadOnly ? ` ${cardStyles.readOnly}` : ''}`}
          onClick={isReadOnly ? undefined : () => setIsOpen(!isOpen)}
        >
          <h2 className={cardStyles.title}>スキル</h2>
          {!isReadOnly && (
            <span className={`${cardStyles.icon} ${!isOpen ? cardStyles.closed : ''}`}></span>
          )}
        </div>

        <div className={`${cardStyles.accordionContent} ${!isOpen ? cardStyles.closed : ''}`}>
          <div className={tableStyles.scrollContainer}>
            <div
              className={`${tableStyles.gridTable} ${tableStyles.denseTable} ${tableStyles.zebraTable}`}
              style={{ minWidth: '760px' }}
            >
              {/* ヘッダー行 */}
              {isReadOnly ? (
                <div className={`${tableStyles.headerRow} ${tableStyles.skillReadonlyGrid}`}>
                  <div className={tableStyles.labelCell}>分類</div>
                  <div className={tableStyles.cell}>スキル名</div>
                  <div className={tableStyles.cell}>GL</div>
                  {MAIN_COLS.map(({ label }) => (
                    <div className={tableStyles.cell} key={label}>
                      {label}
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`${tableStyles.headerRow} ${tableStyles.skillEditGrid}`}>
                  <div className={tableStyles.labelCell}>スキル名</div>
                  <div className={tableStyles.cell}>GL</div>
                  {MAIN_COLS.map(({ label }) => (
                    <div className={tableStyles.cell} key={label}>
                      {label}
                    </div>
                  ))}
                  <div className={tableStyles.cell}>削除</div>
                </div>
              )}

              {/* スキル行 */}
              {skills.length === 0 ? (
                <div className={`${tableStyles.row} ${tableStyles.emptyRow}`}>
                  <span style={{ color: 'var(--text-muted)' }}>スキルがありません</span>
                </div>
              ) : isReadOnly ? (
                skills.map((skill, index) => (
                  <SkillReadonlyRow
                    autoResize={autoResize}
                    key={skill.id}
                    rowIndex={index}
                    skill={skill}
                  />
                ))
              ) : (
                skills.map((skill, index) => (
                  <SkillEditRow
                    autoResize={autoResize}
                    index={index}
                    key={skill.id}
                    onRemove={handleSkillsRemove}
                    onUpdate={handleSkillsUpdate}
                    skill={skill}
                  />
                ))
              )}
            </div>
          </div>

          {!isReadOnly && (
            <div className={tableStyles.buttonContainer}>
              <button
                className={btnStyles.outline}
                onClick={handleSkillsAdd}
                style={{ fontSize: '0.85rem', padding: '6px 24px' }}
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
